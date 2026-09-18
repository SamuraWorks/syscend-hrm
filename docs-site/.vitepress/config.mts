import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Syscend-HRM',
  description: 'Open-source Enterprise HR Management System',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Modules', link: '/modules/employees' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'GitHub', link: 'https://github.com/syscend/syscend-hrm' },
    ],

    // Single flat sidebar — all sections always visible
    sidebar: [
      {
        text: 'Getting Started',
        collapsed: false,
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Configuration', link: '/guide/configuration' },
          { text: 'Demo Accounts', link: '/guide/demo-accounts' },
        ],
      },
      {
        text: 'HR Modules',
        collapsed: false,
        items: [
          { text: 'Employee Management', link: '/modules/employees' },
          { text: 'Organizational Structure', link: '/modules/organization' },
          { text: 'Attendance & Shifts', link: '/modules/attendance' },
          { text: 'Leave Management', link: '/modules/leave' },
          { text: 'Payroll & Compensation', link: '/modules/payroll' },
          { text: 'Recruitment & ATS', link: '/modules/recruitment' },
          { text: 'Performance Management', link: '/modules/performance' },
          { text: 'Training & Development', link: '/modules/training' },
          { text: 'Documents & Compliance', link: '/modules/documents' },
          { text: 'Reports & Analytics', link: '/modules/reports' },
          { text: 'System Administration', link: '/modules/system-administration' },
        ],
      },
      {
        text: 'Administration',
        collapsed: false,
        items: [
          { text: 'System Settings', link: '/guide/system-settings' },
          { text: 'User Management', link: '/guide/user-management' },
          { text: 'Roles & Permissions', link: '/guide/roles-permissions' },
          { text: 'Audit Log', link: '/guide/audit-log' },
        ],
      },
      {
        text: 'API Reference',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/api/overview' },
          { text: 'Authentication', link: '/api/authentication' },
          { text: 'Employees', link: '/api/employees' },
          { text: 'Departments & Positions', link: '/api/departments' },
          { text: 'Attendance', link: '/api/attendance' },
          { text: 'Leave', link: '/api/leave' },
          { text: 'Payroll', link: '/api/payroll' },
          { text: 'Performance', link: '/api/performance' },
          { text: 'Training', link: '/api/training' },
          { text: 'Reports', link: '/api/reports' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/syscend/syscend-hrm' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Syscend',
    },
    search: {
      provider: 'local',
    },
  },
})
