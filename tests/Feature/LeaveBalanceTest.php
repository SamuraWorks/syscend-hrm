<?php

namespace Tests\Feature;

use App\Models\LeaveRequest;
use App\Models\User;
use Database\Factories\EmployeeFactory;
use Database\Factories\LeaveTypeFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaveBalanceTest extends TestCase
{
    use RefreshDatabase;

    private const START = '2026-01-05'; // Monday

    private const END = '2026-01-09'; // Friday

    private function employeeUser(): User
    {
        return $this->makeUser('staff@test.com', 'Employee');
    }

    private function manager(): User
    {
        return $this->makeUser('mgr@test.com', 'HR Manager');
    }

    private function apply(User $employeeUser, array $overrides = [], array $typeOverrides = [])
    {
        $employee = EmployeeFactory::new()->create(['user_id' => $employeeUser->id]);
        $type = LeaveTypeFactory::new()->create($typeOverrides);

        $this->actingAs($employeeUser)->from('/leaves')->post('/leaves', array_merge([
            'leave_type_id' => $type->id,
            'start_date' => self::START,
            'end_date' => self::END,
            'is_half_day' => false,
            'reason' => 'Annual leave',
        ], $overrides));

        $leave = LeaveRequest::latest('id')->first();

        return (object) ['employee' => $employee, 'type' => $type, 'leave' => $leave];
    }

    public function test_applying_leave_creates_balance_and_increments_pending(): void
    {
        $ctx = $this->apply($this->employeeUser());

        $this->assertNotNull($ctx->leave);
        $this->assertSame(5.0, (float) $ctx->leave->days);
        $this->assertSame('pending', $ctx->leave->status);

        $this->assertDatabaseHas('leave_balances', [
            'employee_id' => $ctx->employee->id,
            'leave_type_id' => $ctx->type->id,
            'year' => 2026,
            'entitled' => 15,
            'pending' => 5,
            'used' => 0,
        ]);
    }

    public function test_weekends_are_not_counted_as_leave_days(): void
    {
        $ctx = $this->apply($this->employeeUser(), [
            'start_date' => '2026-01-09',
            'end_date' => '2026-01-12',
        ]); // Friday + weekend + Monday

        $this->assertSame(2.0, (float) $ctx->leave->days);
    }

    public function test_half_day_requests_count_as_half_a_day(): void
    {
        $ctx = $this->apply($this->employeeUser(), [
            'is_half_day' => true,
            'half_day_period' => 'morning',
        ]);

        $this->assertSame(0.5, (float) $ctx->leave->days);
    }

    public function test_insufficient_balance_rejects_the_request(): void
    {
        $employeeUser = $this->employeeUser();
        EmployeeFactory::new()->create(['user_id' => $employeeUser->id]);
        $type = LeaveTypeFactory::new()->create(['days_allowed' => 2]);

        $this->actingAs($employeeUser)->from('/leaves')->post('/leaves', [
            'leave_type_id' => $type->id,
            'start_date' => self::START,
            'end_date' => self::END,
            'is_half_day' => false,
            'reason' => 'Too much leave',
        ])->assertSessionHasErrors('leave_type_id');

        $this->assertSame(0, LeaveRequest::count());
    }

    public function test_approve_moves_pending_to_used(): void
    {
        $ctx = $this->apply($this->employeeUser());
        $manager = $this->manager();

        $this->actingAs($manager)
            ->from('/leaves')
            ->post("/leaves/{$ctx->leave->id}/approve")
            ->assertSessionMissing('errors');

        $this->assertDatabaseHas('leave_balances', [
            'employee_id' => $ctx->employee->id,
            'leave_type_id' => $ctx->type->id,
            'pending' => 0,
            'used' => 5,
        ]);

        $this->assertDatabaseHas('leave_requests', [
            'id' => $ctx->leave->id,
            'status' => 'approved',
            'approved_by' => $manager->id,
        ]);
    }

    public function test_reject_returns_pending_to_zero_without_using_days(): void
    {
        $ctx = $this->apply($this->employeeUser());
        $manager = $this->manager();

        $this->actingAs($manager)
            ->from('/leaves')
            ->post("/leaves/{$ctx->leave->id}/reject");

        $this->assertDatabaseHas('leave_balances', [
            'employee_id' => $ctx->employee->id,
            'leave_type_id' => $ctx->type->id,
            'pending' => 0,
            'used' => 0,
        ]);

        $this->assertDatabaseHas('leave_requests', [
            'id' => $ctx->leave->id,
            'status' => 'rejected',
        ]);
    }

    public function test_cancelling_an_approved_request_returns_used_days(): void
    {
        $employeeUser = $this->employeeUser();
        $ctx = $this->apply($employeeUser);

        $this->actingAs($this->manager())->from('/leaves')->post("/leaves/{$ctx->leave->id}/approve");
        $this->actingAs($employeeUser)->from('/leaves')->post("/leaves/{$ctx->leave->id}/cancel");

        $this->assertDatabaseHas('leave_balances', [
            'employee_id' => $ctx->employee->id,
            'leave_type_id' => $ctx->type->id,
            'pending' => 0,
            'used' => 0,
        ]);
    }
}
