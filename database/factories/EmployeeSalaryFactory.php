<?php

namespace Database\Factories;

use App\Models\EmployeeSalary;
use Database\Factories\SalaryStructureFactory as StructureFactory;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeSalaryFactory extends Factory
{
    protected $model = EmployeeSalary::class;

    public function definition(): array
    {
        return [
            'employee_id' => EmployeeFactory::new(),
            'salary_structure_id' => StructureFactory::new(),
            'basic_salary' => 5000,
            'effective_date' => now()->startOfMonth(),
            'notes' => null,
        ];
    }
}
