<?php

namespace Tests\Feature;

use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\PayslipLine;
use App\Models\SalaryStructure;
use App\Models\User;
use Database\Factories\EmployeeFactory;
use Database\Factories\EmployeeSalaryFactory;
use Database\Factories\PayrollRunFactory;
use Database\Factories\SalaryComponentFactory;
use Database\Factories\SalaryStructureFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollCalculationTest extends TestCase
{
    use RefreshDatabase;

    private const YEAR = 2026;

    private const MONTH = 3;

    private function payrollUser(): User
    {
        return $this->makeUser('payroll@test.com', 'Finance');
    }

    private function structureWithComponents(array $components): SalaryStructure
    {
        $structure = SalaryStructureFactory::new()->create();

        foreach ($components as $component) {
            $structure->components()->attach($component);
        }

        return $structure;
    }

    private function monthStart(): string
    {
        return sprintf('%s-%s-01', self::YEAR, str_pad((string) self::MONTH, 2, '0', STR_PAD_LEFT));
    }

    public function test_payslip_math_mixes_fixed_and_percentage_of_basic(): void
    {
        $employee = EmployeeFactory::new()->create();

        $structure = $this->structureWithComponents([
            SalaryComponentFactory::new()->earning()->fixed(1000)->create(),
            SalaryComponentFactory::new()->deduction()->fixed(200)->create(),
            SalaryComponentFactory::new()->tax()->percentOfBasic(10)->create(),
        ]);

        EmployeeSalaryFactory::new()->create([
            'employee_id' => $employee->id,
            'salary_structure_id' => $structure->id,
            'basic_salary' => 5000,
            'effective_date' => $this->monthStart(),
        ]);

        $response = $this->actingAs($this->payrollUser())->post('/payroll/runs', [
            'month' => self::MONTH,
            'year' => self::YEAR,
        ]);

        $run = PayrollRun::firstOrFail();
        $response->assertRedirect(route('payroll.runs.show', $run));

        $this->assertDatabaseHas('payslips', [
            'payroll_run_id' => $run->id,
            'employee_id' => $employee->id,
            'basic_salary' => 5000,
            'gross_salary' => 6000,
            'total_earnings' => 1000,
            'total_deductions' => 200,
            'tax_amount' => 500,
            'net_salary' => 5300,
            'working_days' => 31,
            'paid_days' => 31,
            'status' => 'pending',
        ]);

        $this->assertSame([
            'earning' => 1000.0,
            'deduction' => 200.0,
            'tax' => 500.0,
        ], collect(Payslip::firstOrFail()->lines()->get()->groupBy('component_type'))
            ->map(fn ($lines) => (float) $lines->sum('amount'))->all());

        $this->assertDatabaseHas('payroll_runs', [
            'id' => $run->id,
            'total_employees' => 1,
            'total_gross' => 6000,
            'total_deductions' => 700,
            'total_net' => 5300,
        ]);
    }

    public function test_percentage_of_gross_components_are_applied_after_earnings(): void
    {
        $employee = EmployeeFactory::new()->create();

        $structure = $this->structureWithComponents([
            SalaryComponentFactory::new()->earning()->fixed(1000)->create(),
            SalaryComponentFactory::new()->tax()->percentOfGross(5)->create(),
        ]);

        EmployeeSalaryFactory::new()->create([
            'employee_id' => $employee->id,
            'salary_structure_id' => $structure->id,
            'basic_salary' => 5000,
            'effective_date' => $this->monthStart(),
        ]);

        $this->actingAs($this->payrollUser())->post('/payroll/runs', [
            'month' => self::MONTH,
            'year' => self::YEAR,
        ]);

        $payslip = Payslip::firstOrFail();

        $this->assertSame('6000.00', $payslip->gross_salary);
        $this->assertSame(300.0, (float) $payslip->tax_amount);
        $this->assertSame('5700.00', $payslip->net_salary);
    }

    public function test_latest_salary_assignment_wins_and_generates_single_payslip(): void
    {
        $employee = EmployeeFactory::new()->create();

        $structure = SalaryStructureFactory::new()->create();

        EmployeeSalaryFactory::new()->create([
            'employee_id' => $employee->id,
            'salary_structure_id' => $structure->id,
            'basic_salary' => 4000,
            'effective_date' => '2026-01-01',
        ]);

        EmployeeSalaryFactory::new()->create([
            'employee_id' => $employee->id,
            'salary_structure_id' => $structure->id,
            'basic_salary' => 6000,
            'effective_date' => '2026-03-01',
        ]);

        $this->actingAs($this->payrollUser())->post('/payroll/runs', [
            'month' => self::MONTH,
            'year' => self::YEAR,
        ]);

        $run = PayrollRun::firstOrFail();

        $this->assertSame(1, Payslip::where('payroll_run_id', $run->id)->count());
        $this->assertDatabaseHas('payslips', [
            'payroll_run_id' => $run->id,
            'basic_salary' => 6000,
        ]);
    }

    public function test_inactive_employees_are_excluded_from_the_run(): void
    {
        $employee = EmployeeFactory::new()->inactive()->create();

        $structure = SalaryStructureFactory::new()->create();

        EmployeeSalaryFactory::new()->create([
            'employee_id' => $employee->id,
            'salary_structure_id' => $structure->id,
            'basic_salary' => 5000,
            'effective_date' => $this->monthStart(),
        ]);

        $this->actingAs($this->payrollUser())->post('/payroll/runs', [
            'month' => self::MONTH,
            'year' => self::YEAR,
        ]);

        $run = PayrollRun::firstOrFail();

        $this->assertSame(0, Payslip::where('payroll_run_id', $run->id)->count());
        $this->assertDatabaseHas('payroll_runs', ['id' => $run->id, 'total_employees' => 0]);
    }

    public function test_duplicate_run_for_the_same_month_is_rejected(): void
    {
        PayrollRunFactory::new()->create(['month' => self::MONTH, 'year' => self::YEAR]);

        $this->actingAs($this->payrollUser())
            ->from('/payroll')
            ->post('/payroll/runs', ['month' => self::MONTH, 'year' => self::YEAR])
            ->assertSessionHasErrors('month');

        $this->assertSame(1, PayrollRun::count());
    }

    public function test_api_payroll_process_endpoint_runs_payroll_and_returns_json(): void
    {
        $employee = EmployeeFactory::new()->create();

        $structure = SalaryStructureFactory::new()->create();
        $structure->components()->attach(SalaryComponentFactory::new()->earning()->fixed(500)->create());

        EmployeeSalaryFactory::new()->create([
            'employee_id' => $employee->id,
            'salary_structure_id' => $structure->id,
            'basic_salary' => 5000,
            'effective_date' => $this->monthStart(),
        ]);

        $user = $this->payrollUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/payroll/run', ['month' => self::MONTH, 'year' => self::YEAR])
            ->assertOk()
            ->assertJsonPath('run.total_employees', 1)
            ->assertJsonPath('run.total_gross', '5500.00')
            ->assertJsonPath('run.total_net', '5500.00');

        $this->assertSame(1, Payslip::count());
        $this->assertSame(1, PayslipLine::count());
    }

    public function test_api_payroll_process_duplicate_returns_422(): void
    {
        PayrollRunFactory::new()->create(['month' => self::MONTH, 'year' => self::YEAR]);

        $user = $this->payrollUser();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/payroll/run', ['month' => self::MONTH, 'year' => self::YEAR])
            ->assertStatus(422);
    }
}
