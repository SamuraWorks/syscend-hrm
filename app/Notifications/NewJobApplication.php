<?php

namespace App\Notifications;

use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewJobApplication extends Notification
{
    use Queueable;

    public function __construct(
        public readonly JobPosting $job,
        public readonly JobApplication $application,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Application Received',
            'message' => "{$this->application->first_name} {$this->application->last_name} applied for {$this->job->title}",
            'applicant_name' => "{$this->application->first_name} {$this->application->last_name}",
            'applicant_email' => $this->application->email,
            'job_id' => $this->job->id,
            'job_title' => $this->job->title,
            'url' => "/recruitment/{$this->job->id}",
        ];
    }
}
