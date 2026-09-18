<?php

namespace App\Services;

use Carbon\Carbon;

class LicenseService
{
    private const SHORT_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    /**
     * Generate an HMAC-signed license key for an organisation.
     *
     * Format: HOLDER|YYYY-MM-DD|SIGNATURE-BLOCK
     * Signature is an HMAC-SHA256 over (holder + expiry) using APP_KEY.
     */
    public function generate(string $holder, string $expiry): string
    {
        $payload = strtoupper(trim($holder)).'|'.$expiry;
        $sig = $this->sign($payload);

        $parts = [];
        foreach ([$payload, $sig] as $chunk) {
            $parts[] = $this->toShortCode($chunk);
        }

        return implode('-', $parts);
    }

    /**
     * Validate a license key against the configured holder.
     *
     * @return array{valid: bool, holder: string, expires_at: string|null, days_remaining: int|null, error: string|null}
     */
    public function status(): array
    {
        $enabled = config('license.enabled', false);
        $holder = trim((string) config('license.holder'));
        $key = trim((string) config('license.key'));

        // Licencing disabled — always valid.
        if (! $enabled) {
            return [
                'valid' => true,
                'enabled' => false,
                'holder' => $holder,
                'expires_at' => null,
                'days_remaining' => null,
                'error' => null,
            ];
        }

        if ($holder === '' || $key === '') {
            return [
                'valid' => false,
                'enabled' => true,
                'holder' => $holder,
                'expires_at' => null,
                'days_remaining' => null,
                'error' => 'License key or organisation name is not configured.',
            ];
        }

        $decoded = $this->decode($key);
        if ($decoded === null) {
            return [
                'valid' => false,
                'enabled' => true,
                'holder' => $holder,
                'expires_at' => null,
                'days_remaining' => null,
                'error' => 'License key format is invalid.',
            ];
        }

        [$keyHolder, $expiresAt] = $decoded;

        if ($keyHolder !== strtoupper($holder)) {
            return [
                'valid' => false,
                'enabled' => true,
                'holder' => $holder,
                'expires_at' => $expiresAt,
                'days_remaining' => 0,
                'error' => 'License key does not match this organisation.',
            ];
        }

        $expiryDate = Carbon::parse($expiresAt)->startOfDay();
        $daysLeft = max(0, (int) Carbon::now()->startOfDay()->diffInDays($expiryDate, false));
        $expired = Carbon::now()->startOfDay()->gt($expiryDate);

        return [
            'valid' => ! $expired,
            'enabled' => true,
            'holder' => $holder,
            'expires_at' => $expiresAt,
            'days_remaining' => $daysLeft,
            'error' => $expired ? 'License has expired.' : null,
        ];
    }

    /**
     * Sign a payload using the application key.
     */
    private function sign(string $payload): string
    {
        $secret = (string) config('app.key');

        return hash_hmac('sha256', $payload, $secret);
    }

    /**
     * Encode a hex string into a short, human-friendly code.
     */
    private function toShortCode(string $hex): string
    {
        if (strlen($hex) % 2 !== 0) {
            $hex = '0'.$hex;
        }

        $packed = '';
        for ($i = 0; $i < strlen($hex); $i += 2) {
            $packed .= chr(hexdec(substr($hex, $i, 2)));
        }

        $out = '';
        $value = 0;
        $bits = 0;
        foreach (str_split($packed) as $byte) {
            $value = ($value << 8) | ord($byte);
            $bits += 8;
            while ($bits >= 5) {
                $out .= self::SHORT_CODE_ALPHABET[($value >> ($bits - 5)) & 31];
                $bits -= 5;
            }
        }
        if ($bits > 0) {
            $out .= self::SHORT_CODE_ALPHABET[($value << (5 - $bits)) & 31];
        }

        return $out;
    }

    /**
     * Decode a short code block back to raw bytes.
     */
    private function fromShortCode(string $code): string
    {
        $code = strtoupper(trim($code));
        $value = 0;
        $bits = 0;
        $out = '';
        foreach (str_split($code) as $char) {
            $pos = strpos(self::SHORT_CODE_ALPHABET, $char);
            if ($pos === false) {
                continue;
            }
            $value = ($value << 5) | $pos;
            $bits += 5;
            if ($bits >= 8) {
                $out .= chr(($value >> ($bits - 8)) & 0xFF);
                $bits -= 8;
            }
        }

        return $out;
    }

    /**
     * Decode a full license key back into [holder, expires_at] or null.
     */
    private function decode(string $key): ?array
    {
        $parts = explode('-', trim($key));
        if (count($parts) !== 2) {
            return null;
        }

        $payloadBytes = $this->fromShortCode($parts[0]);
        $sigBytes = $this->fromShortCode($parts[1]);

        $payload = $payloadBytes;
        $sig = strtoupper(bin2hex($sigBytes));

        $expected = strtoupper($this->sign($payload));
        if (! hash_equals($expected, $sig)) {
            return null;
        }

        $segments = explode('|', $payload);
        if (count($segments) !== 2) {
            return null;
        }

        [$holder, $expiresAt] = $segments;

        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $expiresAt)) {
            return null;
        }

        return [strtoupper(trim($holder)), $expiresAt];
    }
}
