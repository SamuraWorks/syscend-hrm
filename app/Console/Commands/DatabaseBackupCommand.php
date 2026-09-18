<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PDO;

class DatabaseBackupCommand extends Command
{
    protected $signature = 'db:backup {--keep=7 : number of backups to retain}';

    protected $description = 'Dump the MySQL database to storage/app/backups and prune old dumps.';

    public function handle(): int
    {
        $connection = DB::connection()->getConfig();

        if (! in_array($connection['driver'], ['mysql', 'mariadb'], true)) {
            $this->error('db:backup only supports mysql/mariadb connections.');

            return self::FAILURE;
        }

        $dir = storage_path('app/backups');
        File::ensureDirectoryExists($dir);

        $filename = sprintf('backup-%s-%s.sql', $connection['database'], now()->format('Y-m-d-His'));
        $path = rtrim($dir, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$filename;

        $dumped = $this->mysqldump($connection, $path);

        if (! $dumped) {
            $this->warn('mysqldump not available — falling back to a PHP/PDO dump (restore-safe, no stored routines/triggers).');
            $dumped = $this->pdoDump($connection, $path);
        }

        if (! $dumped) {
            $this->error('Backup failed. Install mysqldump or check the database connection.');

            return self::FAILURE;
        }

        // Prune old backups, keep the newest N.
        $keep = max(1, (int) $this->option('keep'));
        collect(File::glob($dir.DIRECTORY_SEPARATOR.'backup-*.sql'))
            ->sortDesc()
            ->slice($keep)
            ->each(fn (string $file) => File::delete($file));

        $this->info("Backup written: {$path}");

        return self::SUCCESS;
    }

    private function mysqldump(array $connection, string $path): bool
    {
        $command = sprintf(
            'mysqldump --host=%s --port=%s --user=%s %s %s --single-transaction --routines --triggers',
            escapeshellarg($connection['host'] ?? '127.0.0.1'),
            escapeshellarg($connection['port'] ?? '3306'),
            escapeshellarg($connection['username'] ?? ''),
            $connection['password'] ? '--password='.escapeshellarg((string) $connection['password']) : '',
            escapeshellarg((string) $connection['database'])
        );

        exec($command.' > '.escapeshellarg($path).' 2>&1', $output, $code);

        return $code === 0;
    }

    /**
     * Portable fallback dump: SHOW CREATE TABLE + chunked INSERTs via PDO.
     * Matches the table structure only (no stored routines/triggers), which is
     * sufficient for restoring application data on a fresh deployment.
     */
    private function pdoDump(array $connection, string $path): bool
    {
        try {
            $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                $connection['host'] ?? '127.0.0.1',
                $connection['port'] ?? '3306',
                $connection['database']
            );

            $pdo = new PDO($dsn, $connection['username'] ?? '', (string) $connection['password']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            $out = [];
            $out[] = '-- Syscend-HRM PHP/PDO fallback dump';
            $out[] = '-- Generated: '.now()->toDateTimeString();
            $out[] = 'SET FOREIGN_KEY_CHECKS=0;';
            $out[] = 'SET NAMES utf8mb4;';
            $out[] = '';

            foreach ($pdo->query('SHOW TABLES') as $row) {
                $table = array_values($row)[0];

                $create = $pdo->query("SHOW CREATE TABLE `{$table}`")->fetch();
                $ddl = null;

                foreach ((array) $create as $key => $value) {
                    if (str_starts_with((string) $key, 'Create')) {
                        $ddl = $value;
                        break;
                    }
                }

                if ($ddl) {
                    $out[] = 'DROP TABLE IF EXISTS `'.$table.'`;';
                    $out[] = $ddl.';';
                    $out[] = '';
                }

                $total = (int) $pdo->query("SELECT COUNT(*) FROM `{$table}`")->fetchColumn();
                $offset = 0;
                $chunk = 500;

                while ($offset < $total) {
                    $rows = $pdo->query("SELECT * FROM `{$table}` LIMIT {$chunk} OFFSET {$offset}")->fetchAll(PDO::FETCH_ASSOC);

                    if (! $rows) {
                        break;
                    }

                    $columns = array_map(fn ($col) => '`'.$col.'`', array_keys($rows[0]));
                    $inserts = array_map(
                        fn ($row) => '('.implode(',', array_map(
                            fn ($value) => $value === null ? 'NULL' : $pdo->quote((string) $value),
                            array_values($row)
                        )).')',
                        $rows
                    );

                    $out[] = 'INSERT INTO `'.$table.'` ('.implode(',', $columns).') VALUES';
                    $out[] = implode(",\n", $inserts).';';
                    $out[] = '';

                    $offset += $chunk;
                }
            }

            $out[] = 'SET FOREIGN_KEY_CHECKS=1;';

            return File::put($path, implode(PHP_EOL, $out)) !== false;
        } catch (\Throwable $e) {
            $this->error('PDO dump error: '.$e->getMessage());

            return false;
        }
    }
}
