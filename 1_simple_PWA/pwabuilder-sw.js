//This is the service worker with the Cache-first network

var CACHE = 'pwabuilder-precache';
var precacheFiles = [
  /* Add an array of files to precache for your app */
  '/'
  , '/article.html'
  , '/azure.appdeploy.json'
  , '/azure-create-output.json'
  , '/bootstrap.css'
  , '/bootstrap-grid.css'
  , '/bootstrap-reboot.css'
  , '/favicon.ico'
  , '/index.html'
  , '/style.css'
  , '/fonts/roboto-regular.woff'
  , '/fonts/roboto-regular.woff2'
  , '/fonts/stylesheet.css'
  , '/fonts/specimen_files/grid_12-825-55-15.css'
  , '/fonts/specimen_files/specimen_stylesheet.css'
  , '/images/arrow.png'
  , '/images/facebook.png'
  , '/images/google.png'
  , '/images/linkedin.png'
  , '/images/logo.png'
  , '/images/neymar.jpg'
  , '/images/pwa.png'
  , '/images/search-icon.png'
  , '/images/twitter.png'
  , '/pwabuilder_unzip/generationInfo.json'
  , '/pwabuilder_unzip/manifest.json'
  // , '/pwabuilder-sw.js'
  , '/pwabuilder_unzip/pwabuilder-sw-register.js'
  , '/images/icons/icon-128x128.png'
  , '/images/icons/icon-144x144.png'
  , '/images/icons/icon-152x152.png'
  , '/images/icons/icon-192x192.png'
  , '/images/icons/icon-384x384.png'
  , '/images/icons/icon-512x512.png'
  , '/images/icons/icon-72x72.png'
  , '/images/icons/icon-96x96.png'
];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function (evt) {
  console.log('The service worker is being installed.');
  evt.waitUntil(precache().then(function () {
    console.log('[ServiceWorker] Skip waiting on install');
    return self.skipWaiting();

  })
  );
});


//allow sw to control of current page
self.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Claiming clients for current page');
  return self.clients.claim();

});

self.addEventListener('fetch', function (evt) {
  console.log('The service worker is serving the asset.' + evt.request.url);
  evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
});


function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}


function fromCache(request) {
  //we pull files from the cache first thing so we can show them fast
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}


function update(request) {
  //this is where we call the server to get the newest version of the 
  //file to use the next time we show view
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

function fromServer(request) {
  //this is the fallback if it is not in the cahche to go to the server and get it
  return fetch(request).then(function (response) { return response })
}
