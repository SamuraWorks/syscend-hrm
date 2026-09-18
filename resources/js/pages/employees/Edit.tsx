import { router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import EmployeeForm from '@/components/employees/EmployeeForm';

interface Employee {
    id: number;
    employee_id: string;
    first_name: string; last_name: string; email: string; phone: string | null;
    dob: string | null; gender: string | null; nationality: string | null;
    address: string | null; city: string | null; state: string | null;
    country: string | null; postal_code: string | null;
    department_id: number | null; position_id: number | null;
    reporting_manager_id: number | null; date_of_joining: string | null;
    contract_type: string; employment_status: string; salary: string | null;
}

interface Props {
    employee:    Employee;
    departments: { id: number; name: string }[];
    positions:   { id: number; name: string; department_id: number }[];
    managers:    { id: number; first_name: string; last_name: string; employee_id: string }[];
}

export default function EmployeeEdit({ employee, departments, positions, managers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: employee.first_name, last_name: employee.last_name,
        email: employee.email, phone: employee.phone ?? '',
        dob: employee.dob ?? '', gender: employee.gender ?? '',
        nationality: employee.nationality ?? '', address: employee.address ?? '',
        city: employee.city ?? '', state: employee.state ?? '',
        country: employee.country ?? '', postal_code: employee.postal_code ?? '',
        department_id: String(employee.department_id ?? ''),
        position_id: String(employee.position_id ?? ''),
        reporting_manager_id: String(employee.reporting_manager_id ?? ''),
        date_of_joining: employee.date_of_joining ?? '',
        contract_type: employee.contract_type,
        employment_status: employee.employment_status,
        salary: employee.salary ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/employees/${employee.id}`);
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-5">
                <Link href={`/employees/${employee.id}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={15} /> Back to {employee.first_name} {employee.last_name}
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Edit — {employee.first_name} {employee.last_name}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Employee ID: {employee.employee_id}</p>
                </div>
                <EmployeeForm
                    data={data as any}
                    errors={errors as any}
                    processing={processing}
                    setData={setData as any}
                    onSubmit={submit}
                    onCancel={() => router.visit(`/employees/${employee.id}`)}
                    departments={departments}
                    positions={positions}
                    managers={managers}
                    submitLabel="Save Changes"
                />
            </div>
        </AppLayout>
    );
}
