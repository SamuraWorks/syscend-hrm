<?php

namespace Modules\Employee\app\Models;

use App\Models\Department;
use App\Models\EmployeeSalary;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'employee_id', 'first_name', 'last_name', 'email', 'phone',
        'dob', 'gender', 'nationality', 'address', 'city', 'state', 'country', 'postal_code',
        'department_id', 'position_id', 'reporting_manager_id', 'date_of_joining',
        'contract_type', 'employment_status', 'salary',
    ];

    protected $casts = [
        'dob' => 'date',
        'date_of_joining' => 'date',
        'salary' => 'decimal:2',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function reportingManager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reporting_manager_id');
    }

    public function directReports(): HasMany
    {
        return $this->hasMany(Employee::class, 'reporting_manager_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(EmploymentHistory::class)->orderByDesc('changed_at');
    }

    public function salaries(): HasMany
    {
        return $this->hasMany(EmployeeSalary::class)->orderByDesc('effective_date');
    }

    public function latestSalary()
    {
        return $this->hasOne(EmployeeSalary::class)->latestOfMany('effective_date');
    }

    protected static function booted(): void
    {
        static::updating(function (Employee $employee) {
            $trackFields = [
                'department_id', 'position_id', 'employment_status',
                'contract_type', 'salary', 'reporting_manager_id',
            ];

            foreach ($trackFields as $field) {
                if ($employee->isDirty($field)) {
                    EmploymentHistory::create([
                        'employee_id' => $employee->id,
                        'field_name' => $field,
                        'old_value' => $employee->getOriginal($field),
                        'new_value' => $employee->getAttribute($field),
                        'changed_by' => auth()->id(),
                    ]);
                }
            }
        });
    }
}
