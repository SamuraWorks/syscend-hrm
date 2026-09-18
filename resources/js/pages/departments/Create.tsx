import { router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

import AppLayout from '@/components/layout/AppLayout';
import DepartmentForm from '@/components/organization/DepartmentForm';

interface Props {
    parents:  { id: number; name: string }[];
    managers: { id: number; first_name: string; last_name: string; employee_id: string }[];
}

export default function DepartmentCreate({ parents, managers }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '', description: '', parent_id: '', head_id: '', cost_center: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/departments');
    }

    return (
        <AppLayout>
            <div className="max-w-2xl mx-auto space-y-5">
                <Link href="/departments" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={15} /> Back to Departments
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Department</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Create a new department in the organization.</p>
                </div>
                <DepartmentForm
                    data={data as any}
                    errors={errors as any}
                    processing={processing}
                    setData={setData as any}
                    onSubmit={submit}
                    onCancel={() => router.visit('/departments')}
                    parents={parents}
                    managers={managers}
                    submitLabel="Create Department"
                />
            </div>
        </AppLayout>
    );
}
