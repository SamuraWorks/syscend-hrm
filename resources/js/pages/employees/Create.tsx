import { router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import EmployeeForm from '@/components/employees/EmployeeForm';

interface Props {
    departments: { id: number; name: string }[];
    positions:   { id: number; name: string; department_id: number }[];
    managers:    { id: number; first_name: string; last_name: string; employee_id: string }[];
}

export default function EmployeeCreate({ departments, positions, managers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '', last_name: '', email: '', phone: '', dob: '',
        gender: '', nationality: '', address: '', city: '', state: '',
        country: '', postal_code: '', department_id: '', position_id: '',
        reporting_manager_id: '', date_of_joining: '', contract_type: 'Permanent',
        employment_status: 'Active', salary: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/employees');
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center gap-3">
                    <Link href="/employees" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={15} /> Back to Employees
                    </Link>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Employee</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Fill in the details to create a new employee record.</p>
                </div>
                <EmployeeForm
                    data={data as any}
                    errors={errors as any}
                    processing={processing}
                    setData={setData as any}
                    onSubmit={submit}
                    onCancel={() => router.visit('/employees')}
                    departments={departments}
                    positions={positions}
                    managers={managers}
                    submitLabel="Create Employee"
                />
            </div>
        </AppLayout>
    );
}
