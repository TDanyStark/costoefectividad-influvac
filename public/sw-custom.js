// Service Worker personalizado para funcionalidades adicionales
// Este archivo será generado automáticamente por Vite PWA, pero puedes personalizarlo

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // Forzar activación inmediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // Tomar control de todas las pestañas inmediatamente
  event.waitUntil(self.clients.claim());
});

// Manejar notificaciones push (opcional)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/apps/abbott/costoefectividad-influvac/favicon.png',
      badge: '/apps/abbott/costoefectividad-influvac/favicon.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/apps/abbott/costoefectividad-influvac/')
  );
});
