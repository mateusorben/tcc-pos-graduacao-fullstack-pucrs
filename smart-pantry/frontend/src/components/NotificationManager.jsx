
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell } from 'lucide-react';

export default function NotificationManager() {
    // Safe check for Notification API (iOS/Safari might not have it in all contexts)
    const [permission, setPermission] = useState(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission;
        }
        return 'denied'; // Default to denied if not supported
    });

    useEffect(() => {
        if (permission === 'granted') {
            registerServiceWorker();
        }
    }, [permission]);

    async function registerServiceWorker() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const register = await navigator.serviceWorker.register('/sw.js');

                const subscription = await register.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: await getPublicKey()
                });

                await api.post('/subscribe', subscription);
                console.log('Push Registered!');
            } catch (err) {
                console.error('Service Worker Error:', err);
            }
        }
    }

    async function getPublicKey() {
        const { data } = await api.get('/vapid-public-key');
        return urlBase64ToUint8Array(data.publicKey);
    }

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    async function requestPermission() {
        if (!('Notification' in window)) {
            alert('Este navegador não suporta notificações.');
            return;
        }
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
        } catch (error) {
            console.error('Erro ao solicitar permissão de notificação:', error);
        }
    }

    if (permission === 'granted') return null; // Already subscribed

    return (
        <button
            onClick={requestPermission}
            className="fixed bottom-24 right-8 bg-zinc-800 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
            title="Ativar Notificações"
        >
            <Bell size={24} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
        </button>
    );
}
