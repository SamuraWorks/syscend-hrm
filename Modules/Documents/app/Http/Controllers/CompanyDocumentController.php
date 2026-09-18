<?php

namespace Modules\Documents\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Modules\Documents\app\Models\CompanyDocument;
use Modules\Documents\app\Models\DocumentAcknowledgement;
use Modules\Documents\app\Models\EmployeeDocument;

class CompanyDocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $employee = Employee::where('user_id', $user->id)->first();

        $query = CompanyDocument::with('uploader:id,name')
            ->withCount('acknowledgements')
            ->orderByDesc('created_at');

        $documents = $query->get()->map(function ($doc) use ($employee) {
            $acknowledged = $employee
                ? DocumentAcknowledgement::where('document_id', $doc->id)
                    ->where('employee_id', $employee->id)->exists()
                : false;

            return [
                'id' => $doc->id,
                'title' => $doc->title,
                'category' => $doc->category,
                'description' => $doc->description,
                'file_name' => $doc->file_name,
                'file_size' => $doc->file_size,
                'visibility' => $doc->visibility,
                'expiry_date' => $doc->expiry_date?->format('d M Y'),
                'is_expired' => $doc->isExpired(),
                'status' => $doc->status,
                'uploaded_by' => $doc->uploader?->name,
                'acknowledgements_count' => $doc->acknowledgements_count,
                'acknowledged' => $acknowledged,
                'created_at' => $doc->created_at->format('d M Y'),
            ];
        });

        $stats = [
            'total' => CompanyDocument::where('status', 'active')->count(),
            'expiring' => CompanyDocument::where('status', 'active')
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<=', now()->addDays(30))
                ->where('expiry_date', '>=', now())
                ->count(),
            'expired' => CompanyDocument::where('status', 'active')
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<', now())
                ->count(),
            'employee_docs' => EmployeeDocument::count(),
        ];

        $categories = CompanyDocument::select('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('documents/Index', compact('documents', 'stats', 'categories'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'visibility' => 'required|in:all,hr_only,managers',
            'expiry_date' => 'nullable|date',
            'file' => 'required|file|max:20480', // 20 MB
        ]);

        $file = $request->file('file');
        $path = $file->store('company-documents', 'local');

        CompanyDocument::create([
            'title' => $data['title'],
            'category' => $data['category'],
            'description' => $data['description'] ?? null,
            'visibility' => $data['visibility'],
            'expiry_date' => $data['expiry_date'] ?? null,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'status' => 'active',
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Document uploaded.');
    }

    public function update(Request $request, CompanyDocument $document)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'visibility' => 'required|in:all,hr_only,managers',
            'expiry_date' => 'nullable|date',
            'status' => 'required|in:active,archived',
        ]);

        $document->update($data);

        return back()->with('success', 'Document updated.');
    }

    public function destroy(CompanyDocument $document)
    {
        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }

    public function download(CompanyDocument $document)
    {
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function acknowledge(Request $request, CompanyDocument $document)
    {
        $employee = Employee::where('user_id', $request->user()->id)->firstOrFail();

        DocumentAcknowledgement::firstOrCreate(
            ['document_id' => $document->id, 'employee_id' => $employee->id],
            ['acknowledged_at' => now()]
        );

        return back()->with('success', 'Document acknowledged.');
    }
}
