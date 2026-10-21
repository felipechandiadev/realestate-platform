'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@realestate/ui';
import { useNotification } from '@/providers/NotificationContext';
import { getPushPublicKey, removeBrowserPushSubscription, saveBrowserPushSubscription } from '../actions/push.action';

type BrowserPushSubscription = { endpoint: string; keys: { p256dh: string; auth: string } };

function decodeVapidKey(value: string): Uint8Array {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function serializeSubscription(subscription: PushSubscription): BrowserPushSubscription | null {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  return p256dh && auth ? { endpoint: subscription.endpoint, keys: { p256dh, auth } } : null;
}

export default function NotificationPreferences() {
  const { soundEnabled, setSoundEnabled } = useNotification();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => { if (active) setPushEnabled(Boolean(subscription)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  async function togglePush() {
    setBusy(true);
    setMessage('');
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setMessage('Este navegador no admite notificaciones push.');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();
      if (current) {
        const serialized = serializeSubscription(current);
        if (serialized) await removeBrowserPushSubscription(serialized);
        await current.unsubscribe();
        setPushEnabled(false);
        setMessage('Notificaciones del navegador desactivadas.');
        return;
      }

      const publicKey = await getPushPublicKey();
      if (!publicKey) {
        setMessage('El servidor aún no tiene configuradas las claves Push.');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('Permiso del navegador no concedido. Puedes cambiarlo desde los ajustes del sitio.');
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(publicKey),
      });
      const serialized = serializeSubscription(subscription);
      if (!serialized) throw new Error('El navegador no devolvió las claves de suscripción.');
      const saved = await saveBrowserPushSubscription(serialized);
      if (!saved.success) {
        await subscription.unsubscribe();
        throw new Error(saved.error);
      }
      setPushEnabled(true);
      setMessage('Notificaciones del navegador activadas.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo actualizar la suscripción Push.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleSound() {
    const nextEnabled = !soundEnabled;
    if (nextEnabled) {
      try {
        const preview = new Audio('/sounds/notification-alert.mp3');
        await preview.play();
      } catch {
        setMessage('El navegador bloqueó el sonido. Intenta activar el sonido con otra interacción.');
      }
    }
    setSoundEnabled(nextEnabled);
  }

  return (
    <Card className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Preferencias de alertas</h2>
        <p className="mt-1 text-xs text-slate-500">El sonido se reproduce solo con la aplicación abierta. El Push depende del navegador y del sistema.</p>
        {message && <p role="status" className="mt-2 text-xs text-slate-600">{message}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void toggleSound()}>
          Sonido {soundEnabled ? 'activado' : 'desactivado'}
        </Button>
        <Button variant="secondary" onClick={() => void togglePush()} disabled={busy}>
          {busy ? 'Actualizando…' : `Push ${pushEnabled ? 'activado' : 'desactivado'}`}
        </Button>
      </div>
    </Card>
  );
}
