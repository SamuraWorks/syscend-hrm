import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Department { id: number; name: string }
interface Position   { id: number; name: string; department_id: number }
interface Manager    { id: number; first_name: string; last_name: string; employee_id: string }

interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    nationality: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    department_id: string;
    position_id: string;
    reporting_manager_id: string;
    date_of_joining: string;
    contract_type: string;
    employment_status: string;
    salary: string;
    [key: string]: string;
}

interface Props {
    data: FormData;
    errors: Partial<Record<keyof FormData, string>>;
    processing: boolean;
    setData: (key: string, value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    departments: Department[];
    positions: Position[];
    managers: Manager[];
    submitLabel?: string;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-700">{label}</Label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function Select({ value, onChange, children, className = '' }: {
    value: string;
    onChange: (v: string) => void;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full border border-slate-200 rounded-lg px-3 h-9 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${className}`}
        >
            {children}
        </select>
    );
}

export default function EmployeeForm({
    data, errors, processing, setData, onSubmit, onCancel,
    departments, positions, managers, submitLabel = 'Save Employee',
}: Props) {

    const filteredPositions = data.department_id
        ? positions.filter((p) => String(p.department_id) === String(data.department_id))
        : positions;

    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">

            {/* Personal Information */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First Name *" error={errors.first_name}>
                        <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} placeholder="John" />
                    </Field>
                    <Field label="Last Name *" error={errors.last_name}>
                        <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="Doe" />
                    </Field>
                    <Field label="Email Address *" error={errors.email}>
                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="john.doe@company.com" />
                    </Field>
                    <Field label="Phone" error={errors.phone}>
                        <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="+1 234 567 8900" />
                    </Field>
                    <Field label="Date of Birth" error={errors.dob}>
                        <Input type="date" value={data.dob} onChange={(e) => setData('dob', e.target.value)} />
                    </Field>
                    <Field label="Gender" error={errors.gender}>
                        <Select value={data.gender} onChange={(v) => setData('gender', v)}>
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </Select>
                    </Field>
                    <Field label="Nationality" error={errors.nationality}>
                        <Input value={data.nationality} onChange={(e) => setData('nationality', e.target.value)} placeholder="e.g. American" />
                    </Field>
                </CardContent>
            </Card>

            {/* Address */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900">Address</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Street Address" error={errors.address} >
                        <Input value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="123 Main St" className="sm:col-span-2" />
                    </Field>
                    <Field label="City" error={errors.city}>
                        <Input value={data.city} onChange={(e) => setData('city', e.target.value)} placeholder="New York" />
                    </Field>
                    <Field label="State / Province" error={errors.state}>
                        <Input value={data.state} onChange={(e) => setData('state', e.target.value)} placeholder="NY" />
                    </Field>
                    <Field label="Country" error={errors.country}>
                        <Input value={data.country} onChange={(e) => setData('country', e.target.value)} placeholder="United States" />
                    </Field>
                    <Field label="Postal Code" error={errors.postal_code}>
                        <Input value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} placeholder="10001" />
                    </Field>
                </CardContent>
            </Card>

            {/* Employment Details */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900">Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Department" error={errors.department_id}>
                        <Select value={data.department_id} onChange={(v) => { setData('department_id', v); setData('position_id', ''); }}>
                            <option value="">Select department</option>
                            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                    </Field>
                    <Field label="Position" error={errors.position_id}>
                        <Select value={data.position_id} onChange={(v) => setData('position_id', v)}>
                            <option value="">Select position</option>
                            {filteredPositions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </Field>
                    <Field label="Reporting Manager" error={errors.reporting_manager_id}>
                        <Select value={data.reporting_manager_id} onChange={(v) => setData('reporting_manager_id', v)}>
                            <option value="">No manager</option>
                            {managers.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.first_name} {m.last_name} ({m.employee_id})
                                </option>
                            ))}
                        </Select>
                    </Field>
                    <Field label="Date of Joining" error={errors.date_of_joining}>
                        <Input type="date" value={data.date_of_joining} onChange={(e) => setData('date_of_joining', e.target.value)} />
                    </Field>
                    <Field label="Contract Type *" error={errors.contract_type}>
                        <Select value={data.contract_type} onChange={(v) => setData('contract_type', v)}>
                            <option value="Permanent">Permanent</option>
                            <option value="Contract">Contract</option>
                            <option value="Temporary">Temporary</option>
                        </Select>
                    </Field>
                    <Field label="Employment Status *" error={errors.employment_status}>
                        <Select value={data.employment_status} onChange={(v) => setData('employment_status', v)}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Terminated">Terminated</option>
                        </Select>
                    </Field>
                    <Field label="Salary" error={errors.salary}>
                        <Input type="number" value={data.salary} onChange={(e) => setData('salary', e.target.value)} placeholder="0.00" min="0" step="0.01" />
                    </Field>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-500">
                    {processing && <Loader2 size={14} className="mr-2 animate-spin" />}
                    {submitLabel}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
    );
}
