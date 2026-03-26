import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />

            <div className="flex min-h-screen">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-950">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                    <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-emerald-800/30" />
                    <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-800/20" />
                    <div className="absolute top-1/3 right-10 h-40 w-40 rounded-full bg-emerald-700/20" />

                    <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                        <div>
                            <h1 className="text-4xl font-bold text-white">ICB TAX</h1>
                            <p className="mt-2 text-emerald-300 text-lg">Business Management System</p>
                        </div>

                        <div className="max-w-md">
                            <h2 className="text-3xl font-bold text-white leading-tight">
                                Don't worry, we've got you covered
                            </h2>
                            <p className="mt-4 text-emerald-200 text-base leading-relaxed">
                                Enter your email address and we'll send you a link to reset your password. You'll be back in no time.
                            </p>
                        </div>

                        <p className="text-sm text-emerald-400/60">
                            &copy; {new Date().getFullYear()} ICB TAX. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="flex w-full items-center justify-center bg-gray-50 px-6 lg:w-1/2">
                    <div className="w-full max-w-md">
                        <div className="mb-8 lg:hidden">
                            <h1 className="text-2xl font-bold text-emerald-950">ICB TAX</h1>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your email address and we'll send you a password reset link.
                            </p>
                        </div>

                        {status && (
                            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3">
                                <p className="text-sm font-medium text-green-700">{status}</p>
                            </div>
                        )}

                        <form onSubmit={submit} className="mt-8 space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        className="block w-full rounded-xl border-gray-300 pl-11 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Enter your email"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1.5" />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href={route('login')}
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
