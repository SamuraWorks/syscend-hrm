import { router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import DepartmentForm from '@/components/organization/DepartmentForm';

interface Props {
    department: { id: number; name: string; description: string | null; parent_id: number | null; head_id: number | null; cost_center: string | null };
    parents:    { id: number; name: string }[];
    managers:   { id: number; first_name: string; last_name: string; employee_id: string }[];
}

export default function DepartmentEdit({ department, parents, managers }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name:        department.name,
        description: department.description ?? '',
        parent_id:   String(department.parent_id ?? ''),
        head_id:     String(department.head_id ?? ''),
        cost_center: department.cost_center ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put(`/departments/${department.id}`);
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-5">
                <Link href={`/departments/${department.id}`} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={15} /> Back to {department.name}
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit — {department.name}</h1>
                </div>
                <DepartmentForm
                    data={data as any}
                    errors={errors as any}
                    processing={processing}
                    setData={setData as any}
                    onSubmit={submit}
                    onCancel={() => router.visit(`/departments/${department.id}`)}
                    parents={parents}
                    managers={managers}
                    submitLabel="Save Changes"
                />
            </div>
        </AppLayout>
    );
}
