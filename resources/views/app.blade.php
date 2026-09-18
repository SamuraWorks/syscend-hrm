<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Syscend-HRM') }}</title>

        @php
            $brandColor = \Modules\SystemAdmin\app\Models\SystemSetting::get('primary_color', '#2563eb');
            $r = hexdec(substr($brandColor, 1, 2));
            $g = hexdec(substr($brandColor, 3, 2));
            $b = hexdec(substr($brandColor, 5, 2));
        @endphp

        <style>
            :root {
                --brand: {{ $brandColor }};
                --brand-rgb: {{ $r }}, {{ $g }}, {{ $b }};
            }
        </style>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
        <script>
            document.documentElement.classList.add('light');
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
