<?php

namespace App\Providers;

use App\Mail\Transport\ZeptoMailApiTransport;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Psr\Log\LoggerInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Mail::extend('zeptomail', function () {
            return new ZeptoMailApiTransport(
                key: config('services.zeptomail.key'),
                logger: app(LoggerInterface::class),
            );
        });
    }
}
