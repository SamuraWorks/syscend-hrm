# Installation

This guide walks you through installing Syscend-HRM on a Linux/macOS server or local development machine. The process takes approximately 10–15 minutes.

---

## Requirements

Before you begin, ensure your environment meets the following requirements:

| Requirement | Minimum Version |
|-------------|----------------|
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 20+ |
| npm | 9+ |
| MySQL | 8.0+ |
| Git | 2.x |

**Required PHP Extensions:**
- `pdo_mysql`
- `mbstring`
- `openssl`
- `tokenizer`
- `xml`
- `ctype`
- `json`
- `bcmath`
- `fileinfo`
- `gd` (for image processing)
- `zip`

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/syscend/syscend-hrm.git
cd syscendhrm
```

---

## Step 2: Install PHP Dependencies

```bash
composer install --optimize-autoloader --no-dev
```

For local development, omit the `--no-dev` flag to include development tools:

```bash
composer install
```

---

## Step 3: Create Environment File

```bash
cp .env.example .env
```

---

## Step 4: Generate Application Key

```bash
php artisan key:generate
```

This writes a unique `APP_KEY` into your `.env` file. Never share this key.

---

## Step 5: Configure the Environment File

Open `.env` in your editor and set the values below:

```ini
APP_NAME=Syscend-HRM
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=http://your-domain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=syscendhrm
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_user
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@syscendhrm.com
MAIL_FROM_NAME="${APP_NAME}"
```

::: tip Local Development
For local development, set `APP_ENV=local` and `APP_DEBUG=true`. Never enable debug mode in production — it exposes sensitive application data.
:::

---

## Step 6: Create the Database

Log into MySQL and create the database:

```sql
CREATE DATABASE syscendhrm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Step 7: Run Database Migrations

```bash
php artisan migrate
```

This creates all the required tables across all active modules.

---

## Step 8: Seed Demo Data

To populate the system with realistic demo employees, departments, payroll data, and more:

```bash
php artisan db:seed --class=DemoDataSeeder
```

::: warning
The demo seeder creates sample employees, departments, payroll records, leave requests, training courses, and performance cycles. Run this only on fresh installations — it is not designed to be re-run on a database with existing data.
:::

---

## Step 9: Install Frontend Dependencies and Build Assets

```bash
npm install
npm run build
```

For development with hot module replacement:

```bash
npm run dev
```

---

## Step 10: Create Storage Symlink

```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`, making uploaded files publicly accessible.

---

## Step 11: Set Directory Permissions

```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

Replace `www-data` with your web server's user if different (e.g., `nginx`, `apache`).

---

## Step 12: Configure the Web Server

### Nginx (Recommended)

Create a new server block in `/etc/nginx/sites-available/syscendhrm`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/syscendhrm/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site and reload Nginx:

```bash
ln -s /etc/nginx/sites-available/syscendhrm /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Apache

Create or edit your virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/syscendhrm/public

    <Directory /var/www/syscendhrm/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/syscendhrm_error.log
    CustomLog ${APACHE_LOG_DIR}/syscendhrm_access.log combined
</VirtualHost>
```

Enable mod_rewrite and the site:

```bash
a2enmod rewrite
a2ensite syscendhrm
systemctl reload apache2
```

---

## Step 13: Set Up the Queue Worker (Optional but Recommended)

Syscend-HRM uses Laravel queues for sending emails and background tasks. Run the worker:

```bash
php artisan queue:work --sleep=3 --tries=3
```

For production, use **Supervisor** to keep the worker alive:

```ini
[program:syscendhrm-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/syscendhrm/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/syscendhrm/storage/logs/worker.log
stopwaitsecs=3600
```

---

## Verify Your Installation

Visit `http://your-domain.com` in your browser. You should see the Syscend-HRM login page.

Log in using the default admin account:

- **Email:** `admin@syscendhrm.test`
- **Password:** `Admin@1234`

::: danger Change the Default Password
Immediately change the admin password after your first login. The default credentials are publicly documented and must not be used in production.
:::

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| 500 Server Error | Check `storage/logs/laravel.log` for details |
| Permission denied | Run `chmod -R 775 storage bootstrap/cache` |
| Blank page | Ensure `APP_DEBUG=true` temporarily to see the error |
| Assets not loading | Run `npm run build` again; check `public/build` exists |
| Migrations fail | Verify DB credentials in `.env`; ensure MySQL is running |
| Storage images broken | Run `php artisan storage:link` |

::: tip Clear All Caches After Config Changes
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```
:::
