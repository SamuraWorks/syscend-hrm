/**
 * Syscend's own brand, used on the public marketing website and the demo
 * workspace. This is deliberately decoupled from the per-install `app_settings`
 * branding, which only reflects the organization that actually purchased and
 * owns an installation.
 */
export const SYS_BRAND = {
    name: 'Syscend-HRM',
    tagline: 'The HR platform bought once, owned forever',
    logoPath: 'branding/syscend-logo.webp',
    primaryColor: '#2563eb',
    location: 'Freetown, Sierra Leone',
    email: 'sales@syscendhrm.test',
    copyright: (year: number = new Date().getFullYear()) => `© ${year} Syscend-HRM. All rights reserved.`,
};