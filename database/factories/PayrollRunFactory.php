<?php

namespace Database\Factories;

use App\Models\PayrollRun;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayrollRunFactory extends Factory
{
    protected $model = PayrollRun::class;

    public function definition(): array
    {
        return [
            'month' => now()->month,
            'year' => now()->year,
            'title' => now()->format('F Y').' Payroll',
            'status' => 'draft',
            'total_employees' => 0,
            'total_gross' => 0,
            'total_deductions' => 0,
            'total_net' => 0,
        ];
    }
}
