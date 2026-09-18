import { Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Download, Printer } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
    name: string;
    amount: number;
}

interface PayslipData {
    id: number;
    period: string;
    employee_name: string;
    employee_code: string;
    department: string | null;
    position: string | null;
    email: string;
    joining_date: string | null;
    basic_salary: number;
    gross_salary: number;
    total_earnings: number;
    total_deductions: number;
    tax_amount: number;
    net_salary: number;
    working_days: number;
    paid_days: number;
    status: string;
    paid_at: string | null;
    earnings: LineItem[];
    deductions: LineItem[];
    taxes: LineItem[];
}

interface RunInfo {
    id: number;
    title: string;
    month: number;
    year: number;
    status: string;
}

interface Props {
    run: RunInfo;
    payslip: PayslipData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: number): string {
    return 'Le ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PayslipShow({ run, payslip }: Props) {
    const handlePrint = () => window.print();

    const handleDownloadPdf = () => {
        window.print();
    };

    return (
        <AppLayout>
            {/* Print styles — injected via style tag */}
            <style>{`
                @media print {
                    /* Hide everything outside the payslip area */
                    body > * { visibility: hidden; }
                    #payslip-printable, #payslip-printable * { visibility: visible; }
                    #payslip-printable {
                        position: fixed;
                        inset: 0;
                        width: 100%;
                        padding: 32px;
                        background: white;
                        z-index: 9999;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="space-y-4 p-6">
                {/* Toolbar — hidden on print */}
                <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/payroll/runs/${run.id}`} className="flex items-center gap-1.5">
                                <ArrowLeft size={14} />
                                Back to {run.title}
                            </Link>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="flex items-center gap-1.5"
                        >
                            <Printer size={14} />
                            Print
                        </Button>
                        <Button
                            size="sm"
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleDownloadPdf}
                        >
                            <Download size={14} />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Payslip content — this is what prints */}
                <div
                    id="payslip-printable"
                    className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Syscend-HRM
                                </p>
                                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Salary Slip
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {payslip.period}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Pay Period
                            </p>
                            {payslip.paid_at && (
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                    Paid on {payslip.paid_at}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-1.5">
                            <h3 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Employee
                            </h3>
                            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                {payslip.employee_name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                ID: {payslip.employee_code}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {payslip.email}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                Details
                            </h3>
                            {payslip.department && (
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="text-slate-400 dark:text-slate-500">Dept:</span>{' '}
                                    {payslip.department}
                                </p>
                            )}
                            {payslip.position && (
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="text-slate-400 dark:text-slate-500">Position:</span>{' '}
                                    {payslip.position}
                                </p>
                            )}
                            {payslip.joining_date && (
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    <span className="text-slate-400 dark:text-slate-500">Joined:</span>{' '}
                                    {payslip.joining_date}
                                </p>
                            )}
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <span className="text-slate-400 dark:text-slate-500">Working Days:</span>{' '}
                                {payslip.paid_days} / {payslip.working_days}
                            </p>
                        </div>
                    </div>

                    {/* Earnings + Deductions side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800">
                        {/* Earnings */}
                        <div className="px-4 sm:px-8 py-5">
                            <h3 className="mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Earnings
                            </h3>
                            <div className="overflow-x-auto"><table className="w-full text-sm">
                                <tbody>
                                    {/* Basic salary row */}
                                    <tr>
                                        <td className="py-1.5 text-slate-600 dark:text-slate-400">
                                            Basic Salary
                                        </td>
                                        <td className="py-1.5 text-right font-medium text-slate-800 dark:text-slate-200">
                                            {fmt(payslip.basic_salary)}
                                        </td>
                                    </tr>
                                    {payslip.earnings.map((e, i) => (
                                        <tr key={i}>
                                            <td className="py-1.5 text-slate-600 dark:text-slate-400">
                                                {e.name}
                                            </td>
                                            <td className="py-1.5 text-right font-medium text-slate-800 dark:text-slate-200">
                                                {fmt(e.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="pt-2.5 font-semibold text-slate-800 dark:text-slate-200">
                                            Gross Salary
                                        </td>
                                        <td className="pt-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                                            {fmt(payslip.gross_salary)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table></div>
                        </div>

                        {/* Deductions + Taxes */}
                        <div className="px-4 sm:px-8 py-5">
                            <h3 className="mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Deductions
                            </h3>
                            <div className="overflow-x-auto"><table className="w-full text-sm">
                                <tbody>
                                    {payslip.deductions.length === 0 && payslip.taxes.length === 0 && (
                                        <tr>
                                            <td className="py-1.5 text-slate-400 dark:text-slate-500 italic" colSpan={2}>
                                                No deductions
                                            </td>
                                        </tr>
                                    )}
                                    {payslip.deductions.map((d, i) => (
                                        <tr key={i}>
                                            <td className="py-1.5 text-slate-600 dark:text-slate-400">
                                                {d.name}
                                            </td>
                                            <td className="py-1.5 text-right font-medium text-red-600 dark:text-red-400">
                                                -{fmt(d.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                    {payslip.taxes.map((t, i) => (
                                        <tr key={`tax-${i}`}>
                                            <td className="py-1.5 text-slate-600 dark:text-slate-400">
                                                {t.name}
                                            </td>
                                            <td className="py-1.5 text-right font-medium text-orange-600 dark:text-orange-400">
                                                -{fmt(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="pt-2.5 font-semibold text-slate-800 dark:text-slate-200">
                                            Total Deductions
                                        </td>
                                        <td className="pt-2.5 text-right font-bold text-red-600 dark:text-red-400">
                                            -{fmt(payslip.total_deductions + payslip.tax_amount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table></div>
                        </div>
                    </div>

                    {/* Net Pay Summary */}
                    <div className="flex items-center justify-between rounded-b-2xl bg-blue-600 px-8 py-5">
                        <div>
                            <p className="text-sm font-medium text-blue-100">Net Pay</p>
                            <p className="mt-0.5 text-xs text-blue-200">
                                For the period of {payslip.period}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-white">{fmt(payslip.net_salary)}</p>
                            <p className="mt-0.5 text-xs text-blue-200 capitalize">
                                Status: {payslip.status}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p className="no-print text-center text-xs text-slate-400 dark:text-slate-500">
                    This is a computer-generated payslip and does not require a signature.
                </p>
            </div>
        </AppLayout>
    );
}
