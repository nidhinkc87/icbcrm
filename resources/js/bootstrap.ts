import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo + Reverb for real-time broadcasting
 * Only initialize when Reverb is configured to avoid crashing the app
 */
if (import.meta.env.VITE_REVERB_APP_KEY) {
    import('pusher-js').then((Pusher) => {
        window.Pusher = Pusher.default;
        import('laravel-echo').then((EchoModule) => {
            window.Echo = new EchoModule.default({
                broadcaster: 'reverb',
                key: import.meta.env.VITE_REVERB_APP_KEY,
                wsHost: import.meta.env.VITE_REVERB_HOST,
                wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
                wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
                forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
                enabledTransports: ['ws', 'wss'],
            });
        });
    });
}
