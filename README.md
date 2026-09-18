# Syscend-HRM

**Open-source Enterprise HR Management System** built with Laravel.

[![License](https://img.shields.io/packagist/l/laravel/framework)](https://opensource.org/licenses/MIT)

## Links

- **Live Demo:** [https://syscend-hrm.syscend.com/](https://syscend-hrm.syscend.com/)
- **Documentation:** [https://syscend-hrm-docs.vercel.app/](https://syscend-hrm-docs.vercel.app/)

## Features

- Employee Management
- Attendance & Shifts
- Leave Management
- Payroll & Compensation
- Recruitment & ATS
- Performance Management
- Training & Development
- Documents & Compliance
- Reports & Analytics
- Roles & Permissions

## Requirements

- PHP 8.1+
- Composer
- MySQL / MariaDB
- Node.js & NPM

## Installation

```bash
git clone https://github.com/syscend/syscend-hrm.git
cd syscend-hrm

composer install
cp .env.example .env
php artisan key:generate

# Configure your database in .env, then:
php artisan migrate --seed
npm install && npm run build
php artisan serve
```

For full setup instructions, see the [documentation](https://syscend-hrm-docs.vercel.app/guide/installation).

## License

Syscend-HRM is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
