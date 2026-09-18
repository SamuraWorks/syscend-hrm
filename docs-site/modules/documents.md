# Documents & Compliance

The Documents module provides a centralised repository for all company and employee documents. It covers policy publishing, contract storage, compliance document distribution with acknowledgement tracking, and personal employee file management.

---

## Overview

Navigate to **HR Panel → Documents** or `/documents`. The module is split into two tracks:

| Track | URL | Description |
|-------|-----|-------------|
| **Company Documents** | `/documents/company` | Policies, procedures, SOPs, templates |
| **Employee Documents** | `/documents/employee` | Personal files tied to individual employees |

---

## Company Documents

Company documents are files that apply to the organisation as a whole or to defined groups of employees. Examples include:

- Employee Handbook
- Code of Conduct
- GDPR / Privacy Policy
- Health & Safety Manual
- IT Acceptable Use Policy
- Standard Operating Procedures (SOPs)
- Employment Contract Templates

### Uploading a Company Document

1. Navigate to **Documents → Company**
2. Click **Upload Document**
3. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Document Title** | Yes | Full descriptive name |
| **Category** | Yes | Policy / Contract / SOP / Handbook / Template / Other |
| **File** | Yes | PDF, DOCX, XLSX, PNG (max 20 MB) |
| **Version** | No | Version number (e.g., `v2.1`) |
| **Effective Date** | No | When this document comes into effect |
| **Expiry Date** | No | When this version expires (triggers a reminder) |
| **Visibility** | Yes | All Employees / Specific Departments / Admin Only |
| **Requires Acknowledgement** | No | If enabled, employees must confirm they have read it |
| **Description** | No | Brief summary of the document's purpose |

4. Click **Upload**

### Document Categories

| Category | Examples |
|----------|---------|
| **Policy** | Leave Policy, Expense Policy, Remote Work Policy |
| **Contract** | Employment Agreement Template, NDA Template |
| **SOP** | Onboarding Process, Performance Review Process |
| **Handbook** | Employee Handbook, Manager's Guide |
| **Template** | Offer Letter Template, Warning Letter Template |
| **Certificate** | ISO Certification, Business License |
| **Other** | Miscellaneous documents |

---

## Document Acknowledgement Tracking

When **Requires Acknowledgement** is enabled for a document, each employee who has visibility of the document must confirm they have read and understood it.

### How Acknowledgement Works

1. After uploading the document with acknowledgement required, HR selects the **target employees** or departments
2. Each targeted employee receives an email notification with a link to the document
3. The employee:
   - Logs in
   - Navigates to **My Documents → Pending Acknowledgements**
   - Reads the document
   - Clicks **I Acknowledge** and optionally adds a comment
4. The acknowledgement is recorded with timestamp and the employee's IP address

### Tracking Acknowledgement Status

HR can view the acknowledgement progress at any time:

1. Open the company document
2. Click the **Acknowledgements** tab
3. The table shows:

| Column | Description |
|--------|-------------|
| Employee | Name and department |
| Status | Pending / Acknowledged |
| Acknowledged At | Date and time of acknowledgement |
| Comment | Optional employee comment |

4. Filter by status to see who is still pending
5. Click **Send Reminder** to email pending employees

### Exporting Acknowledgement Records

Click **Export CSV** on the Acknowledgements tab to download the complete record for compliance audit purposes.

---

## Employee Documents

Employee documents are personal files stored against individual employee records — contracts, ID proofs, academic certificates, background check results, etc.

### Viewing Employee Documents

From any employee's profile, click the **Documents** tab. All files associated with that employee are listed here.

### Uploading an Employee Document

HR staff can upload documents to any employee's record:

1. Open the employee profile
2. Click the **Documents** tab
3. Click **Upload Document**
4. Fill in:

| Field | Required | Description |
|-------|----------|-------------|
| **Document Title** | Yes | Descriptive label |
| **Category** | Yes | Contract / ID Proof / Certificate / Medical / Other |
| **File** | Yes | PDF, JPG, PNG, DOCX (max 10 MB) |
| **Expiry Date** | No | For time-sensitive documents (passport, visa) |
| **Notes** | No | Internal notes |

5. Click **Upload**

### Employee Self-Upload

Employees can upload their own documents via **My Profile → My Documents → Upload**. HR must approve the upload before it is visible to other staff.

### Document Categories for Employee Files

| Category | Examples |
|----------|---------|
| **Contract** | Signed employment contract, amendments |
| **ID Proof** | Passport copy, national ID, driving licence |
| **Certificate** | Degree certificates, professional certifications |
| **Medical** | Medical examination reports (stored securely) |
| **Warning Letter** | Formal warnings on record |
| **Performance Review** | Signed appraisal forms |
| **Tax Document** | Tax forms, declarations |
| **Other** | Any miscellaneous employee file |

---

## Document Expiry Reminders

For documents with an **Expiry Date** set, Syscend-HRM sends automatic reminder emails:

- **30 days** before expiry: HR and the employee are notified
- **7 days** before expiry: Second reminder
- **On expiry date**: Final alert

This is particularly useful for:
- Work visas and permits
- Professional certifications requiring renewal
- Periodic medical check-ups

Configure reminder timing in **Settings → Documents → Expiry Reminder Days**.

---

## Downloading Documents

Any authorised user can download documents they have access to:

- Click **Download** next to any document in the list
- The file downloads directly to the browser

Documents are stored in `storage/app/private/documents/` and are served through Laravel's secure file controller — they are not publicly accessible via direct URL.

::: warning Security
Employee documents containing personally identifiable information (PII) are served through authenticated routes only. Direct URL guessing is not possible. For GDPR compliance, restrict access to employee documents to HR staff and the employee themselves.
:::

---

## Bulk Document Distribution

To distribute a document to many employees at once:

1. Upload the company document
2. Set **Visibility** to `All Employees` or select specific departments
3. Enable **Requires Acknowledgement** if needed
4. The document is immediately visible to all targeted employees in their **My Documents** portal

For a targeted distribution to a custom list of employees:

1. Upload the document with Visibility = `Admin Only`
2. Open the document
3. Click **Assign to Employees**
4. Search and select individual employees
5. Click **Assign**
