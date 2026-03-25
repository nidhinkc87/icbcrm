<?php

use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Tasks\TaskAttachmentController;
use App\Http\Controllers\Tasks\TaskCommentController;
use App\Http\Controllers\Tasks\TaskController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class)->except(['show']);
    Route::resource('permissions', PermissionController::class)->only(['index', 'create', 'store', 'destroy']);
    Route::resource('services', ServiceController::class)->except(['show']);
    Route::get('services/{service}/submissions', [ServiceController::class, 'submissions'])->name('services.submissions');
    Route::get('services/{service}/submissions/{submission}', [ServiceController::class, 'showSubmission'])->name('services.submissions.show');
});

// Task routes (accessible by auth users — permission gates in controllers)
Route::middleware(['auth', 'verified'])->prefix('tasks')->name('tasks.')->group(function () {
    Route::get('/', [TaskController::class, 'index'])->name('index');
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
});

require __DIR__.'/auth.php';
