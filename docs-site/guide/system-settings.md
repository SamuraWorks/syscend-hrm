# System Settings

The System Settings panel is the central control hub for Syscend-HRM. It is accessible via **Admin Panel → Settings** or directly at `/admin/settings`. Only users with the **Admin** role can access this panel.

---

## Overview

The settings panel is divided into clearly labelled tabs. Each tab groups related configuration options. Changes take effect immediately upon saving; some settings (such as mail configuration) can be tested directly from the panel.

---

## General Tab

The General tab controls the visual identity and basic information of the application.

### Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Application Name** | Displayed in the browser title bar and navigation header | `Syscend-HRM` |
| **Application Logo** | Header logo (PNG or SVG, max 2 MB) | `logo.svg` |
| **Favicon** | Browser tab icon (ICO or PNG, 32×32 recommended) | `favicon.ico` |
| **Footer Text** | Text in the bottom footer of every page | `© 2026 Syscend` |
| **Login Background** | Full-screen background image on login page | `login-bg.jpg` |

### How to Update the Logo

1. Navigate to **Settings → General**
2. Click **Browse** or **Choose File** next to the Logo field
3. Select your image file (SVG recommended for crisp rendering at all sizes)
4. Click **Save Settings**
5. Clear your browser cache to see the updated logo immediately

---

## Email (SMTP) Tab

Configure the outgoing mail server used for all system-generated emails including password resets, leave notifications, payslip delivery, and system alerts.

### Fields

| Field | Description |
|-------|-------------|
| **Mail Driver** | Transport driver (`smtp`, `mailgun`, `ses`, `log`) |
| **Mail Host** | SMTP server hostname |
| **Mail Port** | SMTP port (typically 587 for TLS, 465 for SSL, 25 for unencrypted) |
| **Encryption** | `tls`, `ssl`, or `none` |
| **Mail Username** | SMTP authentication username |
| **Mail Password** | SMTP authentication password |
| **From Address** | The `From:` email address recipients see |
| **From Name** | The `From:` display name recipients see |

### Test Email

After saving your SMTP configuration, click **Send Test Email** and enter any valid email address. If delivery succeeds, you will see a green confirmation banner. If it fails, check the error message and review your credentials.

---

## SMS Tab

SMS notifications are used for leave approval alerts, onboarding messages, and optional OTP verification.

### Fields

| Field | Description |
|-------|-------------|
| **Enable SMS** | Toggle SMS functionality on or off |
| **SMS Provider** | Currently supports: `Twilio` |
| **Account SID** | Twilio Account SID (`ACxxxxxxx`) |
| **Auth Token** | Twilio Auth Token |
| **From Number** | Twilio sender phone number in E.164 format (`+15551234567`) |

### Test SMS

Enter a phone number in the test field and click **Send Test SMS**. Successful sends will be logged in **Audit Log → SMS**.

---

## Finance Tab

Financial settings affect payroll calculations, payslip formatting, and financial reports.

### Fields

| Field | Description |
|-------|-------------|
| **Currency Code** | ISO 4217 code (e.g., `SLL`, `USD`, `GBP`, `BDT`) |
| **Currency Symbol** | Display symbol (e.g., `$`, `£`, `৳`) |
| **Symbol Position** | `Before` (e.g., `Le 1,000` or `After` (e.g., `1,000 Le`) |
| **Decimal Places** | Number of decimal digits (typically `2`) |
| **Decimal Separator** | `.` (period) for most locales, `,` (comma) for European locales |
| **Thousands Separator** | `,` (comma) for most locales, `.` (period) for European locales |
| **Financial Year Start Month** | Month when the fiscal year begins (1–12) |
| **Financial Year Start Day** | Day of the month (usually `1`) |

---

## Date & Time Tab

| Field | Description | Options |
|-------|-------------|---------|
| **Timezone** | Application timezone | Any valid PHP timezone (e.g., `UTC`, `Asia/Dhaka`) |
| **Date Format** | Date display format | `Y-m-d`, `d/m/Y`, `m/d/Y`, `d-m-Y` |
| **Time Format** | Time display format | `H:i` (24h), `h:i A` (12h) |
| **Week Starts On** | First day of the week in calendars | `Monday`, `Sunday`, `Saturday` |

---

## Appearance Tab

| Field | Description |
|-------|-------------|
| **Primary Colour** | Main brand colour used for buttons and accents (hex code) |
| **Sidebar Style** | `Light` or `Dark` sidebar variant |
| **Default Language** | Application locale (e.g., `en`, `fr`, `ar`) |

---

## Module Settings

Some modules expose their own sub-settings within the Settings panel:

| Module | Setting Location |
|--------|-----------------|
| **Leave** | `/admin/settings/leave` — Configure leave reset date |
| **Payroll** | `/admin/settings/payroll` — Default payroll cycle day |
| **Attendance** | `/admin/settings/attendance` — Late threshold (minutes) |
| **Performance** | `/admin/settings/performance` — Rating labels and thresholds |

---

## Saving and Applying Changes

After editing any tab:

1. Click **Save Settings** (bottom of the tab)
2. A success toast notification confirms the save
3. For settings that affect cached values (timezone, date format), run:

```bash
php artisan config:clear
php artisan cache:clear
```

Or use the **Clear Cache** button in the General tab.
