<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeSalary;
use App\Models\Holiday;
use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\PayrollRun;
use App\Models\PerformanceCycle;
use App\Models\PerformanceGoal;
use App\Models\PerformanceRating;
use App\Models\PerformanceReview;
use App\Models\PerformanceReviewItem;
use App\Models\Position;
use App\Models\SalaryComponent;
use App\Models\SalaryStructure;
use App\Models\Shift;
use App\Models\User;
use App\Services\PayrollService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Modules\Documents\app\Models\CompanyDocument;
use Modules\Documents\app\Models\DocumentAcknowledgement;
use Modules\SystemAdmin\app\Models\AuditLog;
use Modules\SystemAdmin\app\Models\SystemSetting;
use Modules\Training\app\Models\TrainingCourse;
use Modules\Training\app\Models\TrainingEnrollment;
use Modules\Training\app\Models\TrainingSession;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDepartments();
        $this->seedPositions();
        $this->seedEmployees();
        $this->linkDemoUsers();
        $this->seedShifts();
        $this->seedHolidays();
        $this->seedAttendance();
        $this->seedLeaveTypes();
        $this->seedLeaveRequests();
        $this->seedRecruitment();
        $this->seedPayroll();
        $this->seedPerformance();
        $this->seedTraining();
        $this->seedDocuments();
        $this->seedSystemAdmin();
    }

    private function seedDepartments(): void
    {
        $departments = [
            ['name' => 'Engineering',       'description' => 'Software development and infrastructure'],
            ['name' => 'Human Resources',   'description' => 'People operations and talent management'],
            ['name' => 'Finance',           'description' => 'Accounting, budgeting, and financial planning'],
            ['name' => 'Marketing',         'description' => 'Brand, growth, and communications'],
            ['name' => 'Sales',             'description' => 'Revenue generation and client relationships'],
            ['name' => 'Product',           'description' => 'Product strategy and roadmap'],
            ['name' => 'Customer Support',  'description' => 'Client success and technical support'],
            ['name' => 'Operations',        'description' => 'Business operations and process management'],
        ];

        foreach ($departments as $data) {
            Department::firstOrCreate(['name' => $data['name']], $data);
        }
    }

    private function seedPositions(): void
    {
        $map = [
            'Engineering' => ['Software Engineer', 'Senior Software Engineer', 'Engineering Manager', 'DevOps Engineer', 'QA Engineer'],
            'Human Resources' => ['HR Manager', 'HR Specialist', 'Recruiter', 'Payroll Specialist'],
            'Finance' => ['Finance Manager', 'Accountant', 'Financial Analyst'],
            'Marketing' => ['Marketing Manager', 'Content Specialist', 'SEO Analyst', 'Graphic Designer'],
            'Sales' => ['Sales Manager', 'Sales Executive', 'Account Manager'],
            'Product' => ['Product Manager', 'Product Designer', 'Business Analyst'],
            'Customer Support' => ['Support Manager', 'Support Specialist'],
            'Operations' => ['Operations Manager', 'Operations Analyst'],
        ];

        foreach ($map as $deptName => $positions) {
            $dept = Department::where('name', $deptName)->first();
            if (! $dept) {
                continue;
            }

            foreach ($positions as $title) {
                Position::firstOrCreate(
                    ['name' => $title, 'department_id' => $dept->id],
                    ['name' => $title, 'department_id' => $dept->id, 'description' => null]
                );
            }
        }
    }

    private function seedEmployees(): void
    {
        $employees = [
            [
                'first_name' => 'James',        'last_name' => 'Wilson',
                'email' => 'james.wilson@syscendhrm.test',
                'department' => 'Engineering',  'position' => 'Engineering Manager',
                'status' => 'Active',        'contract' => 'Permanent',
                'salary' => 95000,           'joining' => '2021-03-15',
                'gender' => 'Male',          'phone' => '+1-555-0101',
            ],
            [
                'first_name' => 'Sarah',        'last_name' => 'Chen',
                'email' => 'sarah.chen@syscendhrm.test',
                'department' => 'Engineering',  'position' => 'Senior Software Engineer',
                'status' => 'Active',        'contract' => 'Permanent',
                'salary' => 82000,           'joining' => '2022-01-10',
                'gender' => 'Female',        'phone' => '+1-555-0102',
            ],
            [
                'first_name' => 'Michael',      'last_name' => 'Torres',
                'email' => 'michael.torres@syscendhrm.test',
                'department' => 'Engineering',  'position' => 'Software Engineer',
                'status' => 'Active',        'contract' => 'Permanent',
                'salary' => 68000,           'joining' => '2023-06-01',
                'gender' => 'Male',          'phone' => '+1-555-0103',
            ],
            [
                'first_name' => 'Emily',        'last_name' => 'Davis',
                'email' => 'emily.davis@syscendhrm.test',
                'department' => 'Human Resources', 'position' => 'HR Manager',
                'status' => 'Active',           'contract' => 'Permanent',
                'salary' => 72000,              'joining' => '2020-09-20',
                'gender' => 'Female',           'phone' => '+1-555-0104',
            ],
            [
                'first_name' => 'David',        'last_name' => 'Kim',
                'email' => 'david.kim@syscendhrm.test',
                'department' => 'Finance',      'position' => 'Finance Manager',
                'status' => 'Active',        'contract' => 'Permanent',
                'salary' => 88000,           'joining' => '2019-11-05',
                'gender' => 'Male',          'phone' => '+1-555-0105',
            ],
            [
                'first_name' => 'Jessica',      'last_name' => 'Patel',
                'email' => 'jessica.patel@syscendhrm.test',
                'department' => 'Marketing',    'position' => 'Marketing Manager',
                'status' => 'Active',        'contract' => 'Permanent',
                'salary' => 75000,           'joining' => '2021-07-12',
                'gender' => 'Female',        'phone' => '+1-555-0106',
            ],
            [
                'first_name' => 'Robert',       'last_name' => 'Johnson',
                'email' => 'robert.johnson@syscendhrm.test',
                'department' => 'Sales',         'position' => 'Sales Manager',
                'status' => 'Active',         'contract' => 'Permanent',
                'salary' => 78000,            'joining' => '2020-04-18',
                'gender' => 'Male',           'phone' => '+1-555-0107',
            ],
            [
                'first_name' => 'Amanda',       'last_name' => 'Brown',
                'email' => 'amanda.brown@syscendhrm.test',
                'department' => 'Product',      'position' => 'Product Manager',
                'status' => 'Active',        'contract' => 'Permanent',
                'salary' => 90000,           'joining' => '2022-02-28',
                'gender' => 'Female',        'phone' => '+1-555-0108',
            ],
            [
                'first_name' => 'Kevin',        'last_name' => 'Lee',
                'email' => 'kevin.lee@syscendhrm.test',
                'department' => 'Engineering',  'position' => 'DevOps Engineer',
                'status' => 'Active',        'contract' => 'Permanent',
                'salary' => 76000,           'joining' => '2022-08-15',
                'gender' => 'Male',          'phone' => '+1-555-0109',
            ],
            [
                'first_name' => 'Sophia',       'last_name' => 'Martinez',
                'email' => 'sophia.martinez@syscendhrm.test',
                'department' => 'Customer Support', 'position' => 'Support Manager',
                'status' => 'Active',            'contract' => 'Permanent',
                'salary' => 62000,               'joining' => '2021-05-03',
                'gender' => 'Female',            'phone' => '+1-555-0110',
            ],
            [
                'first_name' => 'Daniel',       'last_name' => 'Taylor',
                'email' => 'daniel.taylor@syscendhrm.test',
                'department' => 'Finance',      'position' => 'Accountant',
                'status' => 'On Leave',      'contract' => 'Permanent',
                'salary' => 58000,           'joining' => '2020-12-01',
                'gender' => 'Male',          'phone' => '+1-555-0111',
            ],
            [
                'first_name' => 'Rachel',       'last_name' => 'White',
                'email' => 'rachel.white@syscendhrm.test',
                'department' => 'Marketing',    'position' => 'Content Specialist',
                'status' => 'Active',        'contract' => 'Contract',
                'salary' => 52000,           'joining' => '2023-01-09',
                'gender' => 'Female',        'phone' => '+1-555-0112',
            ],
            [
                'first_name' => 'Thomas',       'last_name' => 'Anderson',
                'email' => 'thomas.anderson@syscendhrm.test',
                'department' => 'Operations',   'position' => 'Operations Manager',
                'status' => 'Active',         'contract' => 'Permanent',
                'salary' => 80000,            'joining' => '2019-06-17',
                'gender' => 'Male',           'phone' => '+1-555-0113',
            ],
            [
                'first_name' => 'Laura',        'last_name' => 'Garcia',
                'email' => 'laura.garcia@syscendhrm.test',
                'department' => 'Human Resources', 'position' => 'Recruiter',
                'status' => 'Active',           'contract' => 'Permanent',
                'salary' => 55000,              'joining' => '2022-10-24',
                'gender' => 'Female',           'phone' => '+1-555-0114',
            ],
            [
                'first_name' => 'Andrew',       'last_name' => 'Scott',
                'email' => 'andrew.scott@syscendhrm.test',
                'department' => 'Engineering',  'position' => 'QA Engineer',
                'status' => 'Inactive',      'contract' => 'Contract',
                'salary' => 60000,           'joining' => '2021-11-30',
                'gender' => 'Male',          'phone' => '+1-555-0115',
            ],
        ];

        $counter = Employee::withTrashed()->count();

        foreach ($employees as $data) {
            if (Employee::where('email', $data['email'])->exists()) {
                continue;
            }

            $dept = Department::where('name', $data['department'])->first();
            $position = Position::where('name', $data['position'])->first();

            $counter++;
            Employee::create([
                'employee_id' => 'EMP-'.str_pad($counter, 3, '0', STR_PAD_LEFT),
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'gender' => $data['gender'],
                'department_id' => $dept?->id,
                'position_id' => $position?->id,
                'date_of_joining' => $data['joining'],
                'contract_type' => $data['contract'],
                'employment_status' => $data['status'],
                'salary' => $data['salary'],
            ]);
        }
    }

    private function linkDemoUsers(): void
    {
        // Every non-admin account is a worker: attach each demo login to its
        // matching employee record so they are paid / supervised like everyone.
        // Super admins (demo Admin + Syscend Admin) are not employees.
        $links = [
            'hr@syscendhrm.test' => 'emily.davis@syscendhrm.test',
            'manager@syscendhrm.test' => 'james.wilson@syscendhrm.test',
            'employee@syscendhrm.test' => 'michael.torres@syscendhrm.test',
            'recruiter@syscendhrm.test' => 'laura.garcia@syscendhrm.test',
            'finance@syscendhrm.test' => 'david.kim@syscendhrm.test',
        ];

        foreach ($links as $login => $employeeEmail) {
            $user = User::where('email', $login)->first();
            $emp = Employee::where('email', $employeeEmail)->first();

            if ($user && $emp) {
                $emp->update(['user_id' => $user->id]);
            }
        }
    }

    private function seedShifts(): void
    {
        $shifts = [
            ['name' => 'Morning Shift',   'start_time' => '08:00', 'end_time' => '16:00', 'break_minutes' => 30, 'color' => '#f59e0b', 'is_active' => true],
            ['name' => 'General Shift',   'start_time' => '09:00', 'end_time' => '17:00', 'break_minutes' => 60, 'color' => '#3b82f6', 'is_active' => true],
            ['name' => 'Evening Shift',   'start_time' => '14:00', 'end_time' => '22:00', 'break_minutes' => 30, 'color' => '#8b5cf6', 'is_active' => true],
            ['name' => 'Night Shift',     'start_time' => '22:00', 'end_time' => '06:00', 'break_minutes' => 30, 'color' => '#64748b', 'is_active' => true],
            ['name' => 'Flexible Shift',  'start_time' => '10:00', 'end_time' => '18:00', 'break_minutes' => 45, 'color' => '#10b981', 'is_active' => true],
        ];

        foreach ($shifts as $shift) {
            Shift::firstOrCreate(['name' => $shift['name']], $shift);
        }
    }

    private function seedHolidays(): void
    {
        $holidays = [
            ['name' => "New Year's Day",        'date' => '2026-01-01', 'is_recurring' => true,  'type' => 'public',     'description' => 'Start of the new calendar year'],
            ['name' => 'Martin Luther King Day', 'date' => '2026-01-19', 'is_recurring' => true,  'type' => 'public',     'description' => null],
            ['name' => 'Presidents Day',         'date' => '2026-02-16', 'is_recurring' => true,  'type' => 'public',     'description' => null],
            ['name' => 'Memorial Day',           'date' => '2026-05-25', 'is_recurring' => true,  'type' => 'public',     'description' => null],
            ['name' => 'Independence Day',       'date' => '2026-07-04', 'is_recurring' => true,  'type' => 'public',     'description' => 'US Independence Day'],
            ['name' => 'Labor Day',              'date' => '2026-09-07', 'is_recurring' => true,  'type' => 'public',     'description' => null],
            ['name' => 'Thanksgiving Day',       'date' => '2026-11-26', 'is_recurring' => true,  'type' => 'public',     'description' => null],
            ['name' => 'Christmas Day',          'date' => '2026-12-25', 'is_recurring' => true,  'type' => 'public',     'description' => 'Christmas holiday'],
            ['name' => 'Company Foundation Day', 'date' => '2026-03-15', 'is_recurring' => true,  'type' => 'optional',   'description' => 'Annual company celebration'],
            ['name' => 'Team Offsite Day',       'date' => '2026-06-12', 'is_recurring' => false, 'type' => 'restricted', 'description' => 'Annual company offsite'],
        ];

        foreach ($holidays as $h) {
            Holiday::firstOrCreate(['name' => $h['name'], 'date' => $h['date']], $h);
        }
    }

    private function seedAttendance(): void
    {
        $employees = Employee::where('employment_status', 'Active')->take(5)->get();
        $shift = Shift::where('name', 'General Shift')->first();

        if ($employees->isEmpty()) {
            return;
        }

        // Seed last 10 working days
        $statuses = ['present', 'present', 'present', 'present', 'late', 'present', 'present', 'absent', 'present', 'present'];
        $day = now()->startOfDay();
        $seeded = 0;
        $daysBack = 0;

        while ($seeded < 10) {
            $date = $day->copy()->subDays($daysBack);
            $daysBack++;

            // Skip weekends
            if (in_array($date->dayOfWeek, [0, 6])) {
                continue;
            }

            foreach ($employees as $emp) {
                $status = $statuses[$seeded % count($statuses)];
                $checkIn = $status === 'absent' ? null : ($status === 'late' ? '09:45' : '09:00');
                $checkOut = $status === 'absent' ? null : '17:00';
                $worked = ($checkIn && $checkOut) ? (int) ((strtotime($checkOut) - strtotime($checkIn)) / 60) : null;

                Attendance::firstOrCreate(
                    ['employee_id' => $emp->id, 'date' => $date->toDateString()],
                    [
                        'shift_id' => $shift?->id,
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'worked_minutes' => $worked,
                        'status' => $status,
                    ]
                );
            }
            $seeded++;
        }
    }

    private function seedRecruitment(): void
    {
        $eng = Department::where('name', 'Engineering')->first();
        $hr = Department::where('name', 'Human Resources')->first();
        $mkt = Department::where('name', 'Marketing')->first();

        $jobs = [
            ['title' => 'Senior Software Engineer', 'department_id' => $eng?->id, 'type' => 'full_time', 'work_mode' => 'hybrid',  'location' => 'New York, NY', 'salary_min' => 90000, 'salary_max' => 130000, 'status' => 'published', 'description' => 'We are looking for a Senior Software Engineer to join our growing engineering team. You will design and build scalable backend services.', 'requirements' => '5+ years of experience\nProficiency in PHP/Laravel or Node.js\nStrong SQL skills', 'deadline' => now()->addDays(30)->format('Y-m-d')],
            ['title' => 'Product Designer',          'department_id' => $eng?->id, 'type' => 'full_time', 'work_mode' => 'remote',   'location' => 'Remote',       'salary_min' => 70000, 'salary_max' => 100000, 'status' => 'published', 'description' => 'Join us as a Product Designer to create beautiful and intuitive user experiences for our HRM platform.', 'requirements' => '3+ years of product design\nProficiency in Figma\nPortfolio required', 'deadline' => now()->addDays(20)->format('Y-m-d')],
            ['title' => 'HR Specialist',             'department_id' => $hr?->id,  'type' => 'full_time', 'work_mode' => 'onsite',   'location' => 'Austin, TX',   'salary_min' => 50000, 'salary_max' => 70000,  'status' => 'published', 'description' => 'We need an HR Specialist to support our people operations, onboarding, and employee relations.', 'requirements' => '2+ years in HR\nKnowledge of labor laws\nExcellent communication', 'deadline' => now()->addDays(15)->format('Y-m-d')],
            ['title' => 'Marketing Manager',         'department_id' => $mkt?->id, 'type' => 'full_time', 'work_mode' => 'hybrid',   'location' => 'Chicago, IL',  'salary_min' => 80000, 'salary_max' => 110000, 'status' => 'draft',     'description' => 'Lead our marketing team and drive brand growth across digital channels.', 'requirements' => '5+ years marketing experience\nStrong analytical skills', 'deadline' => null],
            ['title' => 'DevOps Engineer',           'department_id' => $eng?->id, 'type' => 'contract',  'work_mode' => 'remote',   'location' => 'Remote',       'salary_min' => 85000, 'salary_max' => 115000, 'status' => 'closed',    'description' => 'Contract role for DevOps Engineer to help us migrate our infrastructure to Kubernetes.', 'requirements' => 'Kubernetes, Docker, CI/CD\nAWS or GCP experience', 'deadline' => now()->subDays(5)->format('Y-m-d')],
        ];

        $applicantPool = [
            ['first_name' => 'Alice',   'last_name' => 'Chen',      'email' => 'alice.chen@example.com',      'current_title' => 'Software Engineer',      'experience_years' => 6, 'stage' => 'shortlisted'],
            ['first_name' => 'Bob',     'last_name' => 'Martinez',  'email' => 'bob.martinez@example.com',    'current_title' => 'Full Stack Developer',    'experience_years' => 4, 'stage' => 'interviewed'],
            ['first_name' => 'Carol',   'last_name' => 'Smith',     'email' => 'carol.smith@example.com',     'current_title' => 'Backend Engineer',        'experience_years' => 7, 'stage' => 'offered'],
            ['first_name' => 'David',   'last_name' => 'Lee',       'email' => 'david.lee@example.com',       'current_title' => 'Junior Developer',        'experience_years' => 2, 'stage' => 'new'],
            ['first_name' => 'Emma',    'last_name' => 'Johnson',   'email' => 'emma.johnson@example.com',    'current_title' => 'UX Designer',             'experience_years' => 5, 'stage' => 'shortlisted'],
            ['first_name' => 'Frank',   'last_name' => 'Wilson',    'email' => 'frank.wilson@example.com',    'current_title' => 'Product Designer',        'experience_years' => 3, 'stage' => 'new'],
            ['first_name' => 'Grace',   'last_name' => 'Taylor',    'email' => 'grace.taylor@example.com',    'current_title' => 'HR Coordinator',          'experience_years' => 3, 'stage' => 'interviewed'],
            ['first_name' => 'Henry',   'last_name' => 'Brown',     'email' => 'henry.brown@example.com',     'current_title' => 'HR Generalist',           'experience_years' => 4, 'stage' => 'hired'],
        ];

        foreach ($jobs as $jobData) {
            if (JobPosting::where('title', $jobData['title'])->exists()) {
                continue;
            }
            $job = JobPosting::create($jobData);

            // Attach 2-3 applicants to first 3 published jobs
            if (in_array($job->status, ['published'])) {
                $subset = array_splice($applicantPool, 0, 2);
                foreach ($subset as $applicant) {
                    JobApplication::create(array_merge($applicant, ['job_posting_id' => $job->id, 'phone' => '+1-555-'.rand(1000, 9999)]));
                }
            }
        }
    }

    private function seedLeaveTypes(): void
    {
        $types = [
            ['name' => 'Annual Leave',     'code' => 'AL',  'days_allowed' => 21, 'is_paid' => true,  'is_carry_forward' => true,  'max_carry_forward' => 5,  'allow_half_day' => true,  'color' => '#3b82f6'],
            ['name' => 'Sick Leave',       'code' => 'SL',  'days_allowed' => 14, 'is_paid' => true,  'is_carry_forward' => false, 'max_carry_forward' => 0,  'allow_half_day' => true,  'color' => '#ef4444'],
            ['name' => 'Casual Leave',     'code' => 'CL',  'days_allowed' => 7,  'is_paid' => true,  'is_carry_forward' => false, 'max_carry_forward' => 0,  'allow_half_day' => true,  'color' => '#f59e0b'],
            ['name' => 'Maternity Leave',  'code' => 'ML',  'days_allowed' => 90, 'is_paid' => true,  'is_carry_forward' => false, 'max_carry_forward' => 0,  'allow_half_day' => false, 'color' => '#ec4899'],
            ['name' => 'Paternity Leave',  'code' => 'PL',  'days_allowed' => 14, 'is_paid' => true,  'is_carry_forward' => false, 'max_carry_forward' => 0,  'allow_half_day' => false, 'color' => '#8b5cf6'],
            ['name' => 'Unpaid Leave',     'code' => 'UL',  'days_allowed' => 30, 'is_paid' => false, 'is_carry_forward' => false, 'max_carry_forward' => 0,  'allow_half_day' => true,  'color' => '#64748b'],
        ];

        foreach ($types as $t) {
            LeaveType::firstOrCreate(['code' => $t['code']], array_merge($t, ['is_active' => true]));
        }
    }

    private function seedLeaveRequests(): void
    {
        $employees = Employee::where('employment_status', 'Active')->take(8)->get();
        $annualLeave = LeaveType::where('code', 'AL')->first();
        $sickLeave = LeaveType::where('code', 'SL')->first();
        $casualLeave = LeaveType::where('code', 'CL')->first();

        if ($employees->isEmpty() || ! $annualLeave) {
            return;
        }

        $year = now()->year;

        $samples = [
            ['type' => $annualLeave, 'start' => "{$year}-01-06", 'end' => "{$year}-01-10", 'status' => 'approved', 'reason' => 'Family vacation'],
            ['type' => $sickLeave,   'start' => "{$year}-02-03", 'end' => "{$year}-02-04", 'status' => 'approved', 'reason' => 'Flu and fever'],
            ['type' => $casualLeave, 'start' => "{$year}-03-14", 'end' => "{$year}-03-14", 'status' => 'approved', 'reason' => 'Personal errand'],
            ['type' => $annualLeave, 'start' => "{$year}-04-07", 'end' => "{$year}-04-11", 'status' => 'pending',  'reason' => 'Spring break travel'],
            ['type' => $sickLeave,   'start' => "{$year}-03-28", 'end' => "{$year}-03-28", 'status' => 'rejected', 'reason' => 'Not feeling well'],
            ['type' => $casualLeave, 'start' => "{$year}-05-02", 'end' => "{$year}-05-02", 'status' => 'pending',  'reason' => 'Appointment'],
        ];

        foreach ($employees->take(6) as $idx => $emp) {
            $sample = $samples[$idx] ?? $samples[0];
            if (! $sample['type']) {
                continue;
            }

            $existing = LeaveRequest::where('employee_id', $emp->id)
                ->where('leave_type_id', $sample['type']->id)
                ->where('start_date', $sample['start'])
                ->exists();

            if ($existing) {
                continue;
            }

            $start = new \DateTime($sample['start']);
            $end = new \DateTime($sample['end']);
            $days = 0;
            $s = clone $start;
            while ($s <= $end) {
                if (! in_array($s->format('N'), ['6', '7'])) {
                    $days++;
                }
                $s->modify('+1 day');
            }

            $leave = LeaveRequest::create([
                'employee_id' => $emp->id,
                'leave_type_id' => $sample['type']->id,
                'start_date' => $sample['start'],
                'end_date' => $sample['end'],
                'days' => $days,
                'is_half_day' => false,
                'reason' => $sample['reason'],
                'status' => $sample['status'],
                'actioned_at' => $sample['status'] !== 'pending' ? now() : null,
            ]);

            // Update balance
            $balance = LeaveBalance::firstOrCreate(
                ['employee_id' => $emp->id, 'leave_type_id' => $sample['type']->id, 'year' => $year],
                ['entitled' => $sample['type']->days_allowed, 'used' => 0, 'pending' => 0, 'carried_forward' => 0]
            );

            if ($sample['status'] === 'approved') {
                $balance->increment('used', $days);
            } elseif ($sample['status'] === 'pending') {
                $balance->increment('pending', $days);
            }
        }
    }

    private function seedPayroll(): void
    {
        // ── 1. Salary Components ──────────────────────────────────────────────

        $componentDefs = [
            ['name' => 'Basic Salary',        'code' => 'basic',      'type' => 'earning',   'calculation_type' => 'fixed',              'value' => 0,    'is_taxable' => true,  'description' => 'Base monthly salary'],
            ['name' => 'Housing Allowance',   'code' => 'hra',        'type' => 'earning',   'calculation_type' => 'percentage_of_basic', 'value' => 20,   'is_taxable' => false, 'description' => 'Housing allowance — 20% of basic'],
            ['name' => 'Transport Allowance', 'code' => 'transport',  'type' => 'earning',   'calculation_type' => 'fixed',              'value' => 300,  'is_taxable' => false, 'description' => 'Fixed monthly transport allowance'],
            ['name' => 'Medical Allowance',   'code' => 'medical',    'type' => 'earning',   'calculation_type' => 'fixed',              'value' => 200,  'is_taxable' => false, 'description' => 'Fixed monthly medical allowance'],
            ['name' => 'Performance Bonus',   'code' => 'perf_bonus', 'type' => 'earning',   'calculation_type' => 'percentage_of_basic', 'value' => 10,   'is_taxable' => true,  'description' => 'Performance bonus — 10% of basic'],
            ['name' => 'Provident Fund',      'code' => 'pf',         'type' => 'deduction', 'calculation_type' => 'percentage_of_basic', 'value' => 5,    'is_taxable' => false, 'description' => 'Employee PF contribution — 5% of basic'],
            ['name' => 'Health Insurance',    'code' => 'health_ins', 'type' => 'deduction', 'calculation_type' => 'fixed',              'value' => 150,  'is_taxable' => false, 'description' => 'Monthly health insurance premium'],
            ['name' => 'Loan Deduction',      'code' => 'loan',       'type' => 'deduction', 'calculation_type' => 'fixed',              'value' => 500,  'is_taxable' => false, 'description' => 'Monthly loan repayment instalment'],
            ['name' => 'Income Tax',          'code' => 'income_tax', 'type' => 'tax',       'calculation_type' => 'percentage_of_gross', 'value' => 10,   'is_taxable' => false, 'description' => 'Federal income tax — 10% of gross'],
            ['name' => 'Social Security',     'code' => 'social_sec', 'type' => 'tax',       'calculation_type' => 'percentage_of_basic', 'value' => 2.5,  'is_taxable' => false, 'description' => 'Social security — 2.5% of basic'],
        ];

        $comp = [];
        foreach ($componentDefs as $def) {
            $comp[$def['code']] = SalaryComponent::firstOrCreate(
                ['code' => $def['code']],
                array_merge($def, ['is_active' => true]),
            );
        }

        // ── 2. Salary Structures ──────────────────────────────────────────────

        $structureDefs = [
            [
                'name' => 'Standard Package', 'code' => 'standard',
                'description' => 'Default package for most employees',
                'components' => ['basic' => null, 'hra' => null, 'transport' => null, 'health_ins' => null, 'pf' => null, 'income_tax' => null, 'social_sec' => null],
            ],
            [
                'name' => 'Senior Package', 'code' => 'senior',
                'description' => 'Enhanced package for senior staff with performance bonus',
                'components' => ['basic' => null, 'hra' => null, 'transport' => null, 'medical' => null, 'perf_bonus' => null, 'pf' => null, 'health_ins' => null, 'income_tax' => null, 'social_sec' => null],
            ],
            [
                'name' => 'Executive Package', 'code' => 'executive',
                'description' => 'Full package for managers and executives',
                'components' => [
                    'basic' => null, 'hra' => ['override_value' => 30], 'transport' => ['override_value' => 500],
                    'medical' => null, 'perf_bonus' => ['override_value' => 15],
                    'pf' => null, 'health_ins' => ['override_value' => 250],
                    'income_tax' => ['override_value' => 12], 'social_sec' => null,
                ],
            ],
            [
                'name' => 'Contractor Package', 'code' => 'contractor',
                'description' => 'Minimal package for contractors',
                'components' => ['basic' => null, 'income_tax' => null],
            ],
        ];

        $structs = [];
        foreach ($structureDefs as $def) {
            $structure = SalaryStructure::firstOrCreate(
                ['code' => $def['code']],
                ['name' => $def['name'], 'description' => $def['description'], 'is_active' => true],
            );
            $sync = [];
            foreach ($def['components'] as $code => $pivot) {
                if (isset($comp[$code])) {
                    $sync[$comp[$code]->id] = ['override_value' => $pivot['override_value'] ?? null];
                }
            }
            $structure->components()->sync($sync);
            $structs[$def['code']] = $structure;
        }

        // ── 3. Assign Salaries to Employees ───────────────────────────────────

        $positionMap = [
            'Engineering Manager' => [round(95000 / 12, 2), 'executive'],
            'Senior Software Engineer' => [round(82000 / 12, 2), 'senior'],
            'Software Engineer' => [round(68000 / 12, 2), 'standard'],
            'DevOps Engineer' => [round(75000 / 12, 2), 'standard'],
            'QA Engineer' => [round(62000 / 12, 2), 'standard'],
            'HR Manager' => [round(72000 / 12, 2), 'executive'],
            'HR Specialist' => [round(55000 / 12, 2), 'standard'],
            'Recruiter' => [round(52000 / 12, 2), 'standard'],
            'Payroll Specialist' => [round(58000 / 12, 2), 'standard'],
            'Finance Manager' => [round(85000 / 12, 2), 'executive'],
            'Accountant' => [round(62000 / 12, 2), 'standard'],
            'Financial Analyst' => [round(68000 / 12, 2), 'senior'],
            'Marketing Manager' => [round(80000 / 12, 2), 'executive'],
            'Content Specialist' => [round(55000 / 12, 2), 'standard'],
            'SEO Analyst' => [round(52000 / 12, 2), 'standard'],
            'Graphic Designer' => [round(54000 / 12, 2), 'standard'],
            'Sales Manager' => [round(88000 / 12, 2), 'executive'],
            'Sales Executive' => [round(58000 / 12, 2), 'senior'],
            'Account Manager' => [round(65000 / 12, 2), 'senior'],
            'Product Manager' => [round(90000 / 12, 2), 'executive'],
            'Product Designer' => [round(72000 / 12, 2), 'senior'],
            'Business Analyst' => [round(65000 / 12, 2), 'standard'],
            'Support Manager' => [round(68000 / 12, 2), 'executive'],
            'Support Specialist' => [round(48000 / 12, 2), 'standard'],
            'Operations Manager' => [round(75000 / 12, 2), 'executive'],
            'Operations Analyst' => [round(58000 / 12, 2), 'standard'],
        ];

        Employee::with('position')->where('employment_status', 'Active')->each(function ($employee) use ($positionMap, $structs) {
            if (EmployeeSalary::where('employee_id', $employee->id)->exists()) {
                return;
            }
            $positionName = $employee->position?->name ?? '';
            [$basic, $structCode] = $positionMap[$positionName] ?? [round(50000 / 12, 2), 'standard'];
            EmployeeSalary::create([
                'employee_id' => $employee->id,
                'salary_structure_id' => ($structs[$structCode] ?? $structs['standard'])->id,
                'basic_salary' => $basic,
                'effective_date' => $employee->date_of_joining ?? '2024-01-01',
                'notes' => 'Initial salary assignment',
            ]);
        });

        // ── 4. Two Payroll Runs ───────────────────────────────────────────────

        $service = app(PayrollService::class);

        $runs = [
            ['month' => now()->subMonths(2)->month, 'year' => now()->subMonths(2)->year, 'status' => 'paid'],
            ['month' => now()->subMonth()->month,   'year' => now()->subMonth()->year,   'status' => 'approved'],
        ];

        foreach ($runs as $runDef) {
            if (PayrollRun::where('month', $runDef['month'])->where('year', $runDef['year'])->exists()) {
                continue;
            }

            $run = PayrollRun::create([
                'month' => $runDef['month'],
                'year' => $runDef['year'],
                'title' => Carbon::create($runDef['year'], $runDef['month'])->format('F Y').' Payroll',
                'status' => 'draft',
                'run_by' => 1,
            ]);

            $service->generate($run);

            if (in_array($runDef['status'], ['approved', 'paid'])) {
                $run->update(['status' => 'approved', 'approved_by' => 1]);
            }
            if ($runDef['status'] === 'paid') {
                $run->update(['status' => 'paid']);
                $run->payslips()->update(['status' => 'paid', 'paid_at' => Carbon::create($runDef['year'], $runDef['month'])->endOfMonth()]);
            }
        }
    }

    private function seedDocuments(): void
    {
        $adminUser = User::first();
        $employees = Employee::where('employment_status', 'Active')->get();

        $docs = [
            ['title' => 'Employee Handbook 2026',          'category' => 'Policy',     'visibility' => 'all',      'expiry_date' => null,                      'description' => 'Complete guide to company policies and procedures.'],
            ['title' => 'Code of Conduct',                  'category' => 'Policy',     'visibility' => 'all',      'expiry_date' => null,                      'description' => 'Expected standards of behaviour for all employees.'],
            ['title' => 'Data Protection Policy (GDPR)',    'category' => 'Compliance', 'visibility' => 'all',      'expiry_date' => now()->addYear()->format('Y-m-d'), 'description' => 'How we collect, use and protect personal data.'],
            ['title' => 'Health & Safety Policy',           'category' => 'Compliance', 'visibility' => 'all',      'expiry_date' => now()->addMonths(6)->format('Y-m-d'), 'description' => 'Workplace health and safety procedures.'],
            ['title' => 'Remote Work Policy',               'category' => 'Policy',     'visibility' => 'all',      'expiry_date' => null,                      'description' => 'Guidelines for remote and hybrid work arrangements.'],
            ['title' => 'IT Security Policy',               'category' => 'Compliance', 'visibility' => 'managers', 'expiry_date' => now()->subDays(10)->format('Y-m-d'), 'description' => 'IT security standards and requirements.'],
            ['title' => 'Standard Employment Contract',     'category' => 'Contract',   'visibility' => 'hr_only',  'expiry_date' => null,                      'description' => 'Template employment contract for full-time staff.'],
            ['title' => 'Annual Leave Request Form',        'category' => 'Form',       'visibility' => 'all',      'expiry_date' => null,                      'description' => 'Form to request annual leave.'],
        ];

        foreach ($docs as $def) {
            // Create a dummy file for demo purposes
            $fileName = \Str::slug($def['title']).'.pdf';
            $filePath = 'company-documents/'.$fileName;
            if (! \Storage::disk('local')->exists($filePath)) {
                \Storage::disk('local')->put($filePath, '%PDF-1.4 Demo document: '.$def['title']);
            }

            $doc = CompanyDocument::firstOrCreate(
                ['title' => $def['title']],
                [
                    'category' => $def['category'],
                    'description' => $def['description'],
                    'visibility' => $def['visibility'],
                    'expiry_date' => $def['expiry_date'],
                    'file_path' => $filePath,
                    'file_name' => $fileName,
                    'mime_type' => 'application/pdf',
                    'file_size' => rand(50000, 500000),
                    'status' => 'active',
                    'uploaded_by' => $adminUser->id,
                ]
            );

            // Random employees acknowledge the "all" visibility docs
            if ($def['visibility'] === 'all') {
                $subset = $employees->random(min(rand(3, $employees->count()), $employees->count()));
                foreach ($subset as $employee) {
                    DocumentAcknowledgement::firstOrCreate(
                        ['document_id' => $doc->id, 'employee_id' => $employee->id],
                        ['acknowledged_at' => now()->subDays(rand(1, 30))]
                    );
                }
            }
        }
    }

    private function seedTraining(): void
    {
        $adminUser = User::first();

        $courseDefs = [
            ['title' => 'Microsoft Excel Advanced',          'category' => 'Technical',   'delivery_mode' => 'online',     'duration_hours' => 8,  'provider' => 'Udemy',     'cost' => 29.99],
            ['title' => 'Effective Communication Skills',    'category' => 'Soft Skills', 'delivery_mode' => 'in_person',  'duration_hours' => 16, 'provider' => 'Internal',  'cost' => 0],
            ['title' => 'Workplace Safety & Compliance',     'category' => 'Compliance',  'delivery_mode' => 'online',     'duration_hours' => 4,  'provider' => 'Internal',  'cost' => 0],
            ['title' => 'Leadership Fundamentals',           'category' => 'Leadership',  'delivery_mode' => 'hybrid',     'duration_hours' => 24, 'provider' => 'Coursera',  'cost' => 99.00],
            ['title' => 'Project Management Basics',         'category' => 'Technical',   'delivery_mode' => 'online',     'duration_hours' => 12, 'provider' => 'LinkedIn',  'cost' => 49.99],
        ];

        $employees = Employee::where('employment_status', 'Active')->get();

        foreach ($courseDefs as $def) {
            $course = TrainingCourse::firstOrCreate(
                ['title' => $def['title']],
                [
                    ...$def,
                    'status' => 'active',
                    'created_by' => $adminUser->id,
                ]
            );

            // Create 1-2 sessions per course
            $sessions = [
                [
                    'title' => $course->title.' — Batch 1',
                    'start_date' => now()->subMonths(2)->startOfMonth(),
                    'end_date' => now()->subMonths(2)->startOfMonth()->addDays(3),
                    'location' => $def['delivery_mode'] === 'in_person' ? 'Training Room A' : 'Zoom',
                    'max_participants' => 20,
                    'status' => 'completed',
                ],
                [
                    'title' => $course->title.' — Batch 2',
                    'start_date' => now()->addMonth()->startOfMonth(),
                    'end_date' => now()->addMonth()->startOfMonth()->addDays(3),
                    'location' => $def['delivery_mode'] === 'in_person' ? 'Training Room B' : 'MS Teams',
                    'max_participants' => 20,
                    'status' => 'scheduled',
                ],
            ];

            foreach ($sessions as $sessDef) {
                $session = TrainingSession::firstOrCreate(
                    ['course_id' => $course->id, 'title' => $sessDef['title']],
                    [
                        ...$sessDef,
                        'created_by' => $adminUser->id,
                    ]
                );

                // Enroll a random subset of employees
                $subset = $employees->random(min(rand(3, 6), $employees->count()));
                foreach ($subset as $employee) {
                    $isCompleted = $sessDef['status'] === 'completed';
                    TrainingEnrollment::firstOrCreate(
                        ['session_id' => $session->id, 'employee_id' => $employee->id],
                        [
                            'status' => $isCompleted ? (rand(0, 10) > 1 ? 'completed' : 'failed') : 'enrolled',
                            'score' => $isCompleted ? rand(60, 100) : null,
                            'feedback' => $isCompleted ? 'Very informative session.' : null,
                            'completed_at' => $isCompleted ? $sessDef['end_date'] : null,
                        ]
                    );
                }
            }
        }
    }

    private function seedPerformance(): void
    {
        $adminUser = User::first();

        $criteria = [
            'Job Knowledge',
            'Quality of Work',
            'Productivity',
            'Communication',
            'Teamwork',
            'Initiative',
            'Attendance & Punctuality',
        ];

        $cycleDefs = [
            [
                'name' => 'Q1 2026 Appraisal',
                'start_date' => '2026-01-01',
                'end_date' => '2026-03-31',
                'status' => 'closed',
            ],
            [
                'name' => 'Q2 2026 Appraisal',
                'start_date' => '2026-04-01',
                'end_date' => '2026-06-30',
                'status' => 'active',
            ],
        ];

        $employees = Employee::where('employment_status', 'Active')->take(6)->get();

        foreach ($cycleDefs as $cycleDef) {
            $cycle = PerformanceCycle::firstOrCreate(
                ['name' => $cycleDef['name']],
                [
                    'start_date' => $cycleDef['start_date'],
                    'end_date' => $cycleDef['end_date'],
                    'status' => $cycleDef['status'],
                    'created_by' => $adminUser->id,
                ]
            );

            foreach ($employees as $employee) {
                // Goals
                $goalTitles = [
                    'Improve response time for customer queries',
                    'Complete cross-functional training',
                    'Achieve quarterly KPI targets',
                ];
                foreach ($goalTitles as $i => $title) {
                    PerformanceGoal::firstOrCreate(
                        ['employee_id' => $employee->id, 'cycle_id' => $cycle->id, 'title' => $title],
                        [
                            'description' => null,
                            'weight' => [40, 30, 30][$i],
                            'progress' => $cycleDef['status'] === 'closed' ? rand(70, 100) : rand(20, 60),
                            'status' => $cycleDef['status'] === 'closed' ? 'completed' : 'active',
                            'due_date' => $cycleDef['end_date'],
                        ]
                    );
                }

                // Self review
                $selfReview = PerformanceReview::firstOrCreate(
                    ['employee_id' => $employee->id, 'cycle_id' => $cycle->id, 'type' => 'self'],
                    [
                        'reviewer_id' => $employee->id,
                        'status' => 'submitted',
                        'overall_comments' => 'I have met most of my objectives and contributed positively to the team.',
                        'submitted_at' => now()->subDays(rand(5, 15)),
                    ]
                );
                if ($selfReview->items()->count() === 0) {
                    foreach ($criteria as $criterion) {
                        PerformanceReviewItem::create([
                            'review_id' => $selfReview->id,
                            'criteria' => $criterion,
                            'rating' => rand(3, 5),
                            'comments' => null,
                        ]);
                    }
                }

                // Manager review
                $managerReview = PerformanceReview::firstOrCreate(
                    ['employee_id' => $employee->id, 'cycle_id' => $cycle->id, 'type' => 'manager'],
                    [
                        'reviewer_id' => $employee->id, // using same as simplification
                        'status' => 'submitted',
                        'overall_comments' => 'Employee demonstrates consistent effort and a collaborative attitude.',
                        'submitted_at' => now()->subDays(rand(1, 5)),
                    ]
                );
                if ($managerReview->items()->count() === 0) {
                    foreach ($criteria as $criterion) {
                        PerformanceReviewItem::create([
                            'review_id' => $managerReview->id,
                            'criteria' => $criterion,
                            'rating' => rand(3, 5),
                            'comments' => null,
                        ]);
                    }
                }

                // Final rating (for closed cycle only)
                if ($cycleDef['status'] === 'closed') {
                    $selfScore = round($selfReview->items()->avg('rating'), 2);
                    $managerScore = round($managerReview->items()->avg('rating'), 2);
                    $finalScore = round(($selfScore + $managerScore) / 2, 2);

                    PerformanceRating::firstOrCreate(
                        ['employee_id' => $employee->id, 'cycle_id' => $cycle->id],
                        [
                            'self_score' => $selfScore,
                            'manager_score' => $managerScore,
                            'final_score' => $finalScore,
                            'rating_label' => PerformanceRating::labelFromScore($finalScore),
                            'finalised_by' => $adminUser->id,
                            'finalised_at' => now()->subDays(2),
                        ]
                    );

                    // Mark manager review as finalised
                    $managerReview->update(['status' => 'finalised']);
                }
            }
        }
    }

    private function seedSystemAdmin(): void
    {
        // ── Default system settings ───────────────────────────────────────────
        $defaults = [
            'org_name' => 'Syscend-HRM',
            'org_email' => 'hr@syscendhrm.test',
            'org_phone' => '+1 555 000 1234',
            'org_address' => '123 Innovation Drive, San Francisco, CA 94105, USA',
            'financial_year_start' => '1',
            'timezone' => 'UTC',
            'date_format' => 'Y-m-d',
            'currency' => 'SLL',
            'currency_symbol' => 'Le',
            'app_name' => 'Syscend-HRM',
            'primary_color' => '#2563eb',
            'footer_copyright' => '© '.date('Y').' Syscend-HRM. All rights reserved.',
            'logo_path' => 'branding/syscend-logo.webp',
            'favicon_path' => 'branding/syscend-logo.webp',
            'commerce_sales_email' => 'syscend@gmail.com',
            'commerce_sales_phone' => '+23279630777',
        ];

        foreach ($defaults as $key => $value) {
            SystemSetting::firstOrCreate(['key' => $key], ['value' => $value]);
        }

        // ── Sample audit log entries ──────────────────────────────────────────
        // Skip if already seeded
        if (AuditLog::count() > 0) {
            return;
        }

        $users = User::take(5)->get();
        if ($users->isEmpty()) {
            return;
        }

        $sampleEntries = [
            ['action' => 'created',        'module' => 'Users',       'description' => 'Created user John Smith (john@example.com)'],
            ['action' => 'updated',        'module' => 'Settings',    'description' => 'System settings were updated.'],
            ['action' => 'created',        'module' => 'Roles',       'description' => 'Created role: Finance Analyst'],
            ['action' => 'updated',        'module' => 'Roles',       'description' => 'Updated permissions for role: HR Manager'],
            ['action' => 'created',        'module' => 'Employees',   'description' => 'Created employee record: Sarah Connor'],
            ['action' => 'updated',        'module' => 'Employees',   'description' => 'Updated employee details: Alice Johnson'],
            ['action' => 'deleted',        'module' => 'Documents',   'description' => 'Deleted document: Old Policy v1'],
            ['action' => 'activated',      'module' => 'Users',       'description' => 'User admin@syscendhrm.test was activated'],
            ['action' => 'deactivated',    'module' => 'Users',       'description' => 'User old.user@example.com was deactivated'],
            ['action' => 'password_reset', 'module' => 'Users',       'description' => 'Password reset for user Bob Davis'],
            ['action' => 'created',        'module' => 'Payroll',     'description' => 'Payroll run created for March 2026'],
            ['action' => 'updated',        'module' => 'Payroll',     'description' => 'Payroll run approved for March 2026'],
            ['action' => 'created',        'module' => 'Recruitment', 'description' => 'Job posting created: Senior Software Engineer'],
            ['action' => 'updated',        'module' => 'Recruitment', 'description' => 'Job application status updated to shortlisted'],
            ['action' => 'created',        'module' => 'Leave',       'description' => 'Leave request approved for Alice Johnson'],
            ['action' => 'updated',        'module' => 'Leave',       'description' => 'Leave balance updated for Q2 2026'],
            ['action' => 'created',        'module' => 'Training',    'description' => 'Training course created: Advanced Excel'],
            ['action' => 'updated',        'module' => 'Training',    'description' => 'Training enrollment status updated'],
            ['action' => 'created',        'module' => 'Performance', 'description' => 'Performance cycle started: Q2 2026'],
            ['action' => 'updated',        'module' => 'Performance', 'description' => 'Performance review finalised for Sarah Connor'],
            ['action' => 'exported',       'module' => 'Reports',     'description' => 'Payroll report exported for March 2026'],
            ['action' => 'exported',       'module' => 'Reports',     'description' => 'Employee headcount report exported'],
            ['action' => 'created',        'module' => 'Documents',   'description' => 'Company document uploaded: Health & Safety Policy 2026'],
            ['action' => 'updated',        'module' => 'Employees',   'description' => 'Employee promoted: Bob Davis → Senior Engineer'],
            ['action' => 'created',        'module' => 'Attendance',  'description' => 'Attendance record imported for March 2026'],
            ['action' => 'updated',        'module' => 'Settings',    'description' => 'Financial year start month updated to January'],
            ['action' => 'deleted',        'module' => 'Roles',       'description' => 'Deleted role: Temp Contractor'],
            ['action' => 'created',        'module' => 'Users',       'description' => 'Created user recruiter@syscendhrm.test'],
            ['action' => 'updated',        'module' => 'Payroll',     'description' => 'Salary structure updated for Engineering department'],
            ['action' => 'exported',       'module' => 'Audit Log',   'description' => 'Audit log exported for Q1 2026'],
        ];

        $ips = ['127.0.0.1', '192.168.1.10', '10.0.0.5', '172.16.0.1'];

        foreach ($sampleEntries as $idx => $entry) {
            $user = $users[$idx % $users->count()];
            $daysAgo = rand(0, 90);
            $hoursAgo = rand(0, 23);

            AuditLog::create([
                'user_id' => $user->id,
                'user_name' => $user->name,
                'action' => $entry['action'],
                'module' => $entry['module'],
                'description' => $entry['description'],
                'ip_address' => $ips[array_rand($ips)],
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'created_at' => now()->subDays($daysAgo)->subHours($hoursAgo),
                'updated_at' => now()->subDays($daysAgo)->subHours($hoursAgo),
            ]);
        }
    }
}
