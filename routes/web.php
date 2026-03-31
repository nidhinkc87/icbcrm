<?php

use App\Http\Controllers\Admin\EmployeePerformanceController;
use App\Http\Controllers\Admin\ExpiryRuleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Tasks\TaskAttachmentController;
use App\Http\Controllers\Tasks\TaskCommentController;
use App\Http\Controllers\Tasks\TaskController;
use App\Http\Controllers\Tasks\TaskDelayReasonController;
use App\Http\Controllers\Tasks\TaskQueryController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
});

// Admin routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class)->except(['show']);
    Route::resource('permissions', PermissionController::class)->only(['index', 'create', 'store', 'destroy']);
    Route::resource('services', ServiceController::class)->except(['show']);
    Route::get('services/{service}/submissions', [ServiceController::class, 'submissions'])->name('services.submissions');
    Route::get('services/{service}/submissions/{submission}', [ServiceController::class, 'showSubmission'])->name('services.submissions.show');
    Route::get('performance', [EmployeePerformanceController::class, 'index'])->name('performance.index');
    Route::get('performance/{user}', [EmployeePerformanceController::class, 'show'])->name('performance.show');
    Route::resource('expiry-rules', ExpiryRuleController::class)->except(['show']);
});

// Task routes (accessible by auth users — permission gates in controllers)
Route::middleware(['auth', 'verified'])->prefix('tasks')->name('tasks.')->group(function () {
    Route::get('/', [TaskController::class, 'index'])->name('index');
    Route::get('/calendar', [TaskController::class, 'calendar'])->name('calendar');
    Route::get('/calendar/data', [TaskController::class, 'calendarData'])->name('calendar.data');
    Route::get('/create', [TaskController::class, 'create'])->name('create');
    Route::post('/', [TaskController::class, 'store'])->name('store');
    Route::get('/{task}', [TaskController::class, 'show'])->name('show');
    Route::get('/{task}/edit', [TaskController::class, 'edit'])->name('edit');
    Route::put('/{task}', [TaskController::class, 'update'])->name('update');
    Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
    Route::patch('/{task}/status', [TaskController::class, 'updateStatus'])->name('update-status');
    Route::get('/{task}/complete', [TaskController::class, 'complete'])->name('complete');
    Route::post('/{task}/complete', [TaskController::class, 'submitCompletion'])->name('submit-completion');
    Route::post('/{task}/save-draft', [TaskController::class, 'saveDraft'])->name('save-draft');

    Route::post('/{task}/collaborators', [TaskController::class, 'addCollaborator'])->name('collaborators.add');
    Route::delete('/{task}/collaborators/{collaborator}', [TaskController::class, 'removeCollaborator'])->name('collaborators.remove');
    Route::patch('/{task}/collaborators/{collaborator}/toggle-work', [TaskController::class, 'toggleCollaboratorWork'])->name('collaborators.toggle-work');

    Route::post('/{task}/attachments', [TaskAttachmentController::class, 'store'])->name('attachments.store');
    Route::delete('/{task}/attachments/{attachment}', [TaskAttachmentController::class, 'destroy'])->name('attachments.destroy');

    Route::post('/{task}/comments', [TaskCommentController::class, 'store'])->name('comments.store');
    Route::delete('/{task}/comments/{comment}', [TaskCommentController::class, 'destroy'])->name('comments.destroy');

    Route::post('/{task}/delay-reasons', [TaskDelayReasonController::class, 'store'])->name('delay-reasons.store');
    Route::patch('/{task}/delay-reasons/{delayReason}/review', [TaskDelayReasonController::class, 'review'])->name('delay-reasons.review');

    Route::post('/{task}/queries', [TaskQueryController::class, 'store'])->name('queries.store');
    Route::get('/{task}/queries/{query}', [TaskQueryController::class, 'show'])->name('queries.show');
    Route::post('/{task}/queries/{query}/respond', [TaskQueryController::class, 'respond'])->name('queries.respond');
    Route::patch('/{task}/queries/{query}/close', [TaskQueryController::class, 'close'])->name('queries.close');
    Route::patch('/{task}/queries/{query}/reopen', [TaskQueryController::class, 'reopen'])->name('queries.reopen');
});

require __DIR__.'/auth.php';
