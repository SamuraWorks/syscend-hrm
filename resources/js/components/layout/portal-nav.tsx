import {
    BarChart3,
    BookOpen,
    Boxes,
    Briefcase,
    Building2,
    CalendarDays,
    ClipboardList,
    Clock,
    CreditCard,
    FileText,
    FolderOpen,
    KeyRound,
    LayoutDashboard,
    Settings,
    Shield,
    Star,
    Store,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    permission: string | null;
}

export interface NavSection {
    group: string;
    items: NavItem[];
}

export type PortalKey = 'employee' | 'manager' | 'hr' | 'recruiter' | 'finance' | 'admin' | 'ops';

// ─── Role → portal resolver ───────────────────────────────────────────────────

const ROLE_SLUG: Record<string, PortalKey> = {
    'Admin':          'admin',
    'HR Manager':     'hr',
    'Manager':        'manager',
    'Employee':       'employee',
    'Recruiter':      'recruiter',
    'Finance':        'finance',
    'Syscend Admin':  'ops',
};

const PORTAL_ROLES: Record<PortalKey, string[]> = {
    employee:  ['Employee'],
    manager:   ['Manager'],
    hr:        ['HR Manager'],
    recruiter: ['Recruiter'],
    finance:   ['Finance'],
    admin:     ['Admin'],
    ops:       ['Syscend Admin'],
};

export function resolvePortal(roles: string[]): PortalKey {
    for (const role of roles) {
        if (ROLE_SLUG[role]) return ROLE_SLUG[role];
    }
    return 'employee';
}

export function portalMatchesUser(portalSlug: string, roles: string[]): boolean {
    const expected = resolvePortal(roles);
    return portalSlug === expected;
}

export function portalLabel(portal: PortalKey): string {
    const labels: Record<PortalKey, string> = {
        employee:  'Employee Portal',
        manager:   'Manager Portal',
        hr:        'HR Portal',
        recruiter: 'Recruiter Portal',
        finance:   'Finance Portal',
        admin:     'Admin Portal',
        ops:       'Ops Portal',
    };
    return labels[portal] ?? 'Portal';
}

// ─── Per-portal nav configs ───────────────────────────────────────────────────

const EMPLOYEE_NAV: NavSection[] = [
    {
        group: 'My Portal',
        items: [
            { label: 'My Dashboard',    href: '/portal',             icon: LayoutDashboard, permission: null },
        ],
    },
    {
        group: 'Syscend',
        items: [
            { label: 'Sales Workspace', href: '/syscend',            icon: Store,        permission: 'syscend.access' },
        ],
    },
    {
        group: 'My Time',
        items: [
            { label: 'My Attendance',   href: '/attendance',         icon: Clock,        permission: null },
            { label: 'My Leaves',       href: '/leaves',             icon: CalendarDays, permission: null },
            { label: 'Holidays',        href: '/holidays',           icon: CalendarDays, permission: null },
        ],
    },
    {
        group: 'My Info',
        items: [
            { label: 'My Payslips',     href: '/my/payslips',        icon: Wallet,       permission: null },
            { label: 'My Documents',    href: '/my/documents',       icon: FolderOpen,   permission: null },
            { label: 'Profile',         href: '/profile',            icon: Users,        permission: null },
        ],
    },
    {
        group: 'Talent',
        items: [
            { label: 'Performance',     href: '/performance',        icon: Star,         permission: null },
            { label: 'Training',        href: '/training',           icon: BookOpen,     permission: null },
        ],
    },
];

const MANAGER_NAV: NavSection[] = [
    {
        group: 'Manager Portal',
        items: [
            { label: 'Dashboard',       href: '/portal',             icon: LayoutDashboard, permission: null },
        ],
    },
    {
        group: 'People',
        items: [
            { label: 'My Team',         href: '/employees',          icon: Users,        permission: 'employees.view' },
            { label: 'Departments',     href: '/departments',        icon: Building2,    permission: 'departments.view' },
        ],
    },
    {
        group: 'Time & Leave',
        items: [
            { label: 'Attendance',      href: '/attendance',         icon: Clock,        permission: 'attendance.view' },
            { label: 'Leave Management',href: '/leaves',             icon: CalendarDays, permission: 'leaves.view' },
            { label: 'Holidays',        href: '/holidays',           icon: CalendarDays, permission: 'attendance.view' },
        ],
    },
    {
        group: 'Talent',
        items: [
            { label: 'Performance',     href: '/performance',        icon: Star,         permission: 'performance.view' },
            { label: 'Training',        href: '/training',           icon: BookOpen,     permission: 'training.view' },
        ],
    },
    {
        group: 'Insights',
        items: [
            { label: 'Reports',         href: '/reports',            icon: BarChart3,    permission: 'reports.view' },
        ],
    },
];

const HR_NAV: NavSection[] = [
    {
        group: 'HR Portal',
        items: [
            { label: 'Dashboard',       href: '/portal',             icon: LayoutDashboard, permission: null },
        ],
    },
    {
        group: 'People',
        items: [
            { label: 'Employees',       href: '/employees',          icon: Users,        permission: 'employees.view' },
            { label: 'Departments',     href: '/departments',        icon: Building2,    permission: 'departments.view' },
            { label: 'Positions',       href: '/positions',          icon: Briefcase,    permission: 'departments.view' },
        ],
    },
    {
        group: 'Time & Leave',
        items: [
            { label: 'Attendance',      href: '/attendance',         icon: Clock,        permission: 'attendance.view' },
            { label: 'Leave Management',href: '/leaves',             icon: CalendarDays, permission: 'leaves.view' },
            { label: 'Holidays',        href: '/holidays',           icon: CalendarDays, permission: 'attendance.view' },
        ],
    },
    {
        group: 'Talent',
        items: [
            { label: 'Recruitment',     href: '/recruitment',        icon: Briefcase,    permission: 'recruitment.view' },
            { label: 'Performance',     href: '/performance',        icon: Star,         permission: 'performance.view' },
            { label: 'Training',        href: '/training',           icon: BookOpen,     permission: 'training.view' },
        ],
    },
    {
        group: 'Finance',
        items: [
            { label: 'Payroll',         href: '/payroll',            icon: CreditCard,   permission: 'payroll.view' },
        ],
    },
    {
        group: 'System',
        items: [
            { label: 'Documents',       href: '/documents',          icon: FileText,     permission: 'documents.view' },
            { label: 'Reports',         href: '/reports',            icon: BarChart3,    permission: 'reports.view' },
        ],
    },
    {
        group: 'Administration',
        items: [
            { label: 'Settings',        href: '/admin/settings',     icon: Settings,     permission: 'admin.settings' },
            { label: 'Users',           href: '/admin/users',        icon: Users,        permission: 'admin.users' },
            { label: 'Roles & Permissions', href: '/admin/roles',    icon: Shield,       permission: 'admin.roles' },
            { label: 'Audit Log',       href: '/admin/audit-log',    icon: BarChart3,    permission: 'admin.audit-logs' },
        ],
    },
];

const RECRUITER_NAV: NavSection[] = [
    {
        group: 'Recruiter Portal',
        items: [
            { label: 'Dashboard',       href: '/portal',             icon: LayoutDashboard, permission: null },
        ],
    },
    {
        group: 'Recruitment',
        items: [
            { label: 'Job Postings',    href: '/recruitment',        icon: Briefcase,    permission: 'recruitment.view' },
        ],
    },
    {
        group: 'Insights',
        items: [
            { label: 'Reports',         href: '/reports',            icon: BarChart3,    permission: 'reports.view' },
        ],
    },
];

const FINANCE_NAV: NavSection[] = [
    {
        group: 'Finance Portal',
        items: [
            { label: 'Dashboard',       href: '/portal',             icon: LayoutDashboard, permission: null },
        ],
    },
    {
        group: 'Finance',
        items: [
            { label: 'Payroll Runs',       href: '/payroll',            icon: CreditCard,   permission: 'payroll.view' },
            { label: 'Salary Components',  href: '/payroll/components', icon: Wallet,       permission: 'payroll.view' },
            { label: 'Structures',         href: '/payroll/structures', icon: Wallet,       permission: 'payroll.view' },
            { label: 'Employee Salaries',  href: '/payroll/salaries',   icon: Users,        permission: 'payroll.view' },
        ],
    },
    {
        group: 'My Info',
        items: [
            { label: 'My Payslips',     href: '/my/payslips',        icon: Wallet,       permission: null },
            { label: 'Profile',         href: '/profile',            icon: Users,        permission: null },
        ],
    },
    {
        group: 'Insights',
        items: [
            { label: 'Reports',         href: '/reports',            icon: BarChart3,    permission: 'reports.view' },
        ],
    },
];

const ADMIN_NAV: NavSection[] = [
    {
        group: 'Main',
        items: [
            { label: 'Dashboard',       href: '/portal',             icon: LayoutDashboard, permission: null },
        ],
    },
    {
        group: 'People',
        items: [
            { label: 'Employees',       href: '/employees',          icon: Users,        permission: 'employees.view' },
            { label: 'Departments',     href: '/departments',        icon: Building2,    permission: 'departments.view' },
            { label: 'Positions',       href: '/positions',          icon: Briefcase,    permission: 'departments.view' },
        ],
    },
    {
        group: 'Time & Leave',
        items: [
            { label: 'Attendance',      href: '/attendance',         icon: Clock,        permission: 'attendance.view' },
            { label: 'Leave Management',href: '/leaves',             icon: CalendarDays, permission: 'leaves.view' },
            { label: 'Holidays',        href: '/holidays',           icon: CalendarDays, permission: 'attendance.view' },
        ],
    },
    {
        group: 'Talent',
        items: [
            { label: 'Recruitment',     href: '/recruitment',        icon: Briefcase,    permission: 'recruitment.view' },
            { label: 'Performance',     href: '/performance',        icon: Star,         permission: 'performance.view' },
            { label: 'Training',        href: '/training',           icon: BookOpen,     permission: 'training.view' },
        ],
    },
    {
        group: 'Finance',
        items: [
            { label: 'Payroll',         href: '/payroll',            icon: CreditCard,   permission: 'payroll.view' },
        ],
    },
    {
        group: 'System',
        items: [
            { label: 'Documents',       href: '/documents',          icon: FileText,     permission: 'documents.view' },
            { label: 'Reports',         href: '/reports',            icon: BarChart3,    permission: 'reports.view' },
        ],
    },
    {
        group: 'Administration',
        items: [
            { label: 'Settings',        href: '/admin/settings',     icon: Settings,     permission: 'admin.settings' },
            { label: 'Users',           href: '/admin/users',        icon: Users,        permission: 'admin.users' },
            { label: 'Roles & Permissions', href: '/admin/roles',    icon: Shield,       permission: 'admin.roles' },
            { label: 'Audit Log',       href: '/admin/audit-log',    icon: BarChart3,    permission: 'admin.audit-logs' },
        ],
    },
];

const OPS_NAV: NavSection[] = [
    {
        group: 'Operations',
        items: [
            { label: 'Dashboard',       href: '/syscend',            icon: LayoutDashboard, permission: null },
            { label: 'Requests',        href: '/syscend/requests',   icon: ClipboardList,    permission: null },
            { label: 'Payments',        href: '/syscend/payments',   icon: CreditCard,       permission: null },
        ],
    },
    {
        group: 'Customers',
        items: [
            { label: 'Organizations',   href: '/syscend/organizations', icon: Building2,     permission: null },
            { label: 'Users',           href: '/syscend/users',      icon: UserCog,          permission: null },
        ],
    },
    {
        group: 'Deliveries',
        items: [
            { label: 'Licenses',        href: '/syscend/licenses',   icon: KeyRound,         permission: null },
            { label: 'Deployments',     href: '/syscend/deployments', icon: Boxes,           permission: null },
            { label: 'Products',        href: '/syscend/products',   icon: Store,            permission: null },
        ],
    },
    {
        group: 'Administration',
        items: [
            { label: 'Settings',        href: '/syscend/settings',   icon: Settings,         permission: null },
        ],
    },
];

export const PORTAL_NAV: Record<PortalKey, NavSection[]> = {
    employee:  EMPLOYEE_NAV,
    manager:   MANAGER_NAV,
    hr:        HR_NAV,
    recruiter: RECRUITER_NAV,
    finance:   FINANCE_NAV,
    admin:     ADMIN_NAV,
    ops:       OPS_NAV,
};
