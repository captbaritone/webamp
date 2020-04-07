"strict";

// This project used to have a service worker. For the sake of simplicity I've
// removed it, but in case anyone still has the old service worker registered,
// we need this service worker to unregister the old one.

// Copied from https://github.com/NekR/self-destroying-sw
/* eslint-env serviceworker */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.registration
    .unregister()
    .then(() => {
      return self.clients.matchAll();
    })
    .then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    });
});
