import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="flex min-h-screen">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-950">
                    {/* Background pattern */}
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

                    {/* Decorative circles */}
                    <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-emerald-800/30" />
                    <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-800/20" />
                    <div className="absolute top-1/3 right-10 h-40 w-40 rounded-full bg-emerald-700/20" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                        <div>
                            <h1 className="text-4xl font-bold text-white">ICB TAX</h1>
                            <p className="mt-2 text-emerald-300 text-lg">Business Management System</p>
                        </div>

                        <div className="max-w-md">
                            <h2 className="text-3xl font-bold text-white leading-tight">
                                Streamline your business operations with confidence
                            </h2>
                            <p className="mt-4 text-emerald-200 text-base leading-relaxed">
                                Manage tasks, track employee performance, handle client services, and stay on top of compliance — all in one place.
                            </p>

                            <div className="mt-10 grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-800/50 backdrop-blur">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-300">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="mt-2 text-sm text-emerald-200">Task Management</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-800/50 backdrop-blur">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-300">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                    </div>
                                    <p className="mt-2 text-sm text-emerald-200">Analytics</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-emerald-800/50 backdrop-blur">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-emerald-300">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                        </svg>
                                    </div>
                                    <p className="mt-2 text-sm text-emerald-200">Client Portal</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-emerald-400/60">
                            &copy; {new Date().getFullYear()} ICB TAX. All rights reserved.
                        </p>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="flex w-full items-center justify-center bg-gray-50 px-6 lg:w-1/2">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="mb-8 lg:hidden">
                            <h1 className="text-2xl font-bold text-emerald-950">ICB TAX</h1>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                            <p className="mt-2 text-sm text-gray-500">Sign in to your account to continue</p>
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
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1.5" />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative mt-1.5">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        className="block w-full rounded-xl border-gray-300 pl-11 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-1.5" />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                                    />
                                    <span className="ms-2 text-sm text-gray-600">Remember me</span>
                                </label>

                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
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
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
