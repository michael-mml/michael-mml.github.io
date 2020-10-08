importScripts("/precache-manifest.8dd3a8f39577aec2faa43505fd5cbfd3.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
const ns = '[serviceWorker.js]';
const version = '0.0.1';

self.addEventListener('fetch', (event) => {
  const fn = '[fetch]';
  console.info(`${ns}${fn} clientId: ${event.clientId}`);

  // skip caching in the request is not a GET
  if (event.request.method !== 'GET') {
    return;
  }

  // "middleware" that intercepts XHR/fetch
  const preFetch = async () => {
    const { request: { url } } = event;

    // TODO: cache chunk-vendors (node_module dependencies are unlikely to change)
    // if mapbox resource is fetched, cache it
    if (url.startsWith('https://') && (url.includes('tiles.mapbox.com') || url.includes('api.mapbox.com'))) {
      // create cache (key-value pair between request and response)
      const cache = await caches.open(version);

      // check if request is cached and return the cached response if found
      let res = await cache.match(event.request);
      if (res) {
        return res;
      }

      // otherwise, fetch the request and cache it
      res = await fetch(event.request);
      cache.put(event.request, res.clone());
      return res;
    }

    // otherwise don't intercept the fetch
    return fetch(event.request);
  };

  // attach XHR/fetch interceptor
  event.respondWith(preFetch());
});

self.addEventListener('install', (event) => {
  const fn = '[install]';
  console.info(`${ns}${fn} install: ${event}`);
  // TODO: enable below when Workbox is upgraded to v5
  /* const preCache = async () => {
    const cache = await caches.open(version);
    return cache.addAll([
      `${process.env.BASE_URL}/index.html`,
    ]);
  };
  event.waitUntil(preCache()); */
});

self.addEventListener('activate', (event) => {
  const fn = '[activate]';
  console.info(`${ns}${fn} activate: ${event}`);
});

self.addEventListener('message', (event) => {
  if (!event.data || !event.data.type) {
    return;
  }
  switch (event.data.type) {
    case 'USER_IDLE': {
      self.skipWaiting();
      break;
    }
    default: {
      break;
    }
  }
});

console.info(`${ns} version: ${version}`);

