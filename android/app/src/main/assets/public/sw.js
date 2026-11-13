/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "e127bc61ffb64699926baee68759a55b"
  }, {
    "url": "pwa-512x512.png",
    "revision": "e127bc61ffb64699926baee68759a55b"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d6bdca9430980b695d45a3475f0f5687"
  }, {
    "url": "index.html",
    "revision": "6c9c2ff75d3ee7d2921e5ef9a6982b0d"
  }, {
    "url": "icon.svg",
    "revision": "7f78641cefed3ab8baab0cee3e523e22"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d61fb215172154744d20b2813859b2bf"
  }, {
    "url": "assets/index-Fjhy6uOB.js",
    "revision": null
  }, {
    "url": "assets/index-D2_akAgD.css",
    "revision": null
  }, {
    "url": "assets/aistudio/image_64d66251.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "d61fb215172154744d20b2813859b2bf"
  }, {
    "url": "icon.svg",
    "revision": "7f78641cefed3ab8baab0cee3e523e22"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d6bdca9430980b695d45a3475f0f5687"
  }, {
    "url": "pwa-512x512.png",
    "revision": "e127bc61ffb64699926baee68759a55b"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "e127bc61ffb64699926baee68759a55b"
  }, {
    "url": "manifest.webmanifest",
    "revision": "a97839102bcf873125772d5b65049426"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
