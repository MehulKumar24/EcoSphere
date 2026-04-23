// Keep a tiny root worker file so the whole site stays under service worker scope.
// The real cache logic lives in the js folder with the rest of the scripts.
importScripts('./js/service-worker.js');
