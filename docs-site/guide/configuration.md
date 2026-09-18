# Configuration

Syscend-HRM provides a comprehensive admin settings panel accessible at `/admin/settings`. This panel lets you configure everything from branding and email to SMS, currency, and financial year — without touching any code.

---

## Accessing System Settings

Navigate to **Admin Panel → Settings** in the sidebar, or go directly to `/admin/settings`. You must be logged in with the **Admin** role.

The settings panel is organised into the following tabs:

| Tab | Purpose |
|-----|---------|
| **General** | App name, logo, favicon, footer text |
| **Email (SMTP)** | Outgoing email configuration |
| **SMS** | SMS gateway setup (Twilio) |
| **Finance** | Financial year, currency, number format |
| **Date & Time** | Timezone, date format, week start day |
| **Appearance** | Theme colour, login page background |

---

## General / Appearance Settings

The **General** tab controls branding elements visible across the entire application.

| Field | Description |
|-------|-------------|
| **Application Name** | Displayed in the browser tab and top navigation |
| **Logo** | Uploaded image shown in the header (SVG or PNG, max 2 MB) |
| **Favicon** | Browser tab icon (ICO or PNG, 32×32 px recommended) |
| **Footer Text** | Text displayed in the application footer |
| **Login Page Background** | Image shown on the authentication screens |

**Steps to update the logo:**

1. Go to **Settings → General**
2. Click **Choose File** next to the Logo field
3. Select an SVG or PNG file (recommended size: 200×60 px)
4. Click **Save Settings**
5. Hard-refresh your browser (Ctrl+Shift+R / Cmd+Shift+R)

---

## SMTP Email Setup

Syscend-HRM uses Laravel's mail system. Configure SMTP credentials in the **Email** tab so the system can send password resets, leave notifications, payslips, and other automated emails.

### Gmail SMTP

::: warning Gmail App Passwords
Gmail requires an App Password if 2-Factor Authentication is enabled. Do not use your Google account password directly.
:::

1. Go to your [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Generate an **App Password** (select "Mail" and "Other device")
4. Enter the following in **Settings → Email**:

| Field | Value |
|-------|-------|
| Mail Host | `smtp.gmail.com` |
| Mail Port | `587` |
| Encryption | `tls` |
| Mail Username | `your.email@gmail.com` |
| Mail Password | Your 16-character App Password |
| From Address | `your.email@gmail.com` |
| From Name | `Syscend-HRM` |

### Mailgun SMTP

| Field | Value |
|-------|-------|
| Mail Host | `smtp.mailgun.org` |
| Mail Port | `587` |
| Encryption | `tls` |
| Mail Username | `postmaster@mg.your-domain.com` |
| Mail Password | Your Mailgun SMTP password |
| From Address | `noreply@your-domain.com` |

### Mailtrap (Development / Testing)

Mailtrap is ideal for development — it captures all outgoing emails without actually delivering them.

1. Create a free account at [mailtrap.io](https://mailtrap.io)
2. Go to **Inboxes → SMTP Settings**
3. Copy the credentials into **Settings → Email**:

| Field | Value |
|-------|-------|
| Mail Host | `smtp.mailtrap.io` |
| Mail Port | `2525` |
| Encryption | `tls` |
| Mail Username | Your Mailtrap username |
| Mail Password | Your Mailtrap password |

After saving, use the **Send Test Email** button to verify the connection.

---

## SMS Setup (Twilio)

Syscend-HRM integrates with Twilio for SMS notifications (e.g., leave approval alerts, OTPs).

### Prerequisites

1. Create a [Twilio](https://www.twilio.com) account
2. Purchase a phone number with SMS capability
3. Note your **Account SID**, **Auth Token**, and **Phone Number**

### Configuration Steps

1. Go to **Settings → SMS**
2. Toggle **Enable SMS** to on
3. Fill in the Twilio credentials:

| Field | Value |
|-------|-------|
| SMS Provider | Twilio |
| Account SID | Your Twilio Account SID (starts with `AC`) |
| Auth Token | Your Twilio Auth Token |
| From Number | Your Twilio phone number (e.g., `+15551234567`) |

4. Click **Save**
5. Enter a test phone number and click **Send Test SMS**

::: tip
SMS credits are consumed from your Twilio balance. Monitor usage in the Twilio dashboard to avoid running out of balance.
:::

---

## Financial Year Configuration

The financial year setting affects payroll runs, leave balance resets, and report date ranges.

1. Go to **Settings → Finance**
2. Set the **Financial Year Start Month** (e.g., `January` for a Jan–Dec year, or `April` for an Apr–Mar year)
3. Set the **Financial Year Start Day** (usually `1`)
4. Click **Save**

::: warning
Changing the financial year after payroll runs have been processed can cause discrepancies in historical reports. Set this before processing any payroll.
:::

---

## Timezone and Date Format

| Field | Recommended Values |
|-------|-------------------|
| **Timezone** | `UTC`, `Asia/Dhaka`, `America/New_York`, etc. |
| **Date Format** | `Y-m-d`, `d/m/Y`, `m/d/Y` |
| **Time Format** | `H:i` (24-hour) or `h:i A` (12-hour) |
| **Week Starts On** | `Monday` or `Sunday` |

1. Go to **Settings → Date & Time**
2. Select your timezone from the dropdown
3. Choose a date format (a preview shows the current date in the selected format)
4. Save changes

::: tip
Use the same timezone in your PHP `php.ini` (`date.timezone`) and your server OS to avoid date drift issues.
:::

---

## Currency Settings

| Field | Description |
|-------|-------------|
| **Currency Code** | ISO 4217 code (e.g., `SLL`, `USD`, `BDT`, `GBP`) |
| **Currency Symbol** | Symbol displayed in the UI (e.g., `$`, `৳`, `£`) |
| **Symbol Position** | Before or after the amount |
| **Decimal Separator** | `.` (period) or `,` (comma) |
| **Thousands Separator** | `,` (comma) or `.` (period) |
| **Decimal Places** | Usually `2` |

These settings affect salary displays, payslips, and all financial reports.

---

## Caching Configuration

After making changes to system settings, clear Laravel's cache to apply them immediately:

```bash
php artisan config:clear
php artisan cache:clear
```

Or use the **Clear Cache** button available in **Settings → General** (Admin panel).
