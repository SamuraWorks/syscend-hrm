<?php

namespace Modules\Documents\app\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Modules\Documents\app\Models\EmployeeDocument;

class EmployeeDocumentController extends Controller
{
    public function store(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'expiry_date' => 'nullable|date',
            'file' => 'required|file|max:20480',
        ]);

        $file = $request->file('file');
        $path = $file->store("employee-documents/{$employee->id}", 'local');

        EmployeeDocument::create([
            'employee_id' => $employee->id,
            'title' => $data['title'],
            'category' => $data['category'],
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

    public function destroy(EmployeeDocument $document)
    {
        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }

    public function download(EmployeeDocument $document)
    {
        abort_unless(Storage::disk('local')->exists($document->file_path), 404);

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }
}
