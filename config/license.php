<?php

return [
    /*
    |--------------------------------------------------------------------------
    | License Configuration
    |--------------------------------------------------------------------------
    |
    | Each installation is licensed to a single organisation. The licence key
    | is an HMAC-signed token encoding the licensee name and expiry date, so a
    | key cannot be transferred to another organisation silently.
    |
    | Environment variables:
    |   LICENSE_ENABLED   - toggle licence enforcement (true/false)
    |   LICENSE_HOLDER    - the organisation name this install is licensed to
    |   LICENSE_KEY       - the signed licence key
    |
    */
    'enabled' => env('LICENSE_ENABLED', false),
    'holder' => env('LICENSE_HOLDER', ''),
    'key' => env('LICENSE_KEY', ''),
];
