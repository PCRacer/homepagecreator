/*=============================================================================
    Initialization
=============================================================================*/

/*
 * Some imported browser scripts expect "window" and "document" to exist.
 * A Service Worker only exposes the global "self" object, so create aliases.
 */
self.window = self;
self.document = self;

/*=============================================================================
    Configuration
=============================================================================*/

/**
 * Increment this whenever cached files change.
 */
const CACHE_NAME = "SSHomePage2607";

/**
 * Resources that are cached immediately after installation.
 */
const PRECACHE_FILES = ["/","/index.html","/LightMode.jpg","/DarkMode.jpg","/images/apps.png","/images/article.png","/images/clearlist.png","/images/cloud.png","/images/darkweb.png","/images/desktop.png","/images/doc.png","/images/email.png","/images/esoteric.png","/images/fin.png","/images/insertlink.png","/images/laptop.png","/images/mobiledevice.png","/images/multimedia.png","/images/news.png","/images/office.png","/images/halai.png","/images/calendar.png","/images/word.png","/images/router.png","/images/science.png","/images/search.png","/images/server.png","/images/shopping.png","/images/socialmedia.png","/images/ssuitedownload.png","/images/tasks.png","/images/tech.png","/images/tv.png","/images/video.png","/images/web.png","/pwa/HomePage144.png","/pwa/webappmanifest.webmanifest","/fonts/roboto/roboto-v20-latin_latin-ext-300.woff2","/fonts/roboto/roboto-v20-latin_latin-ext-700.woff2","/fonts/roboto/roboto-v20-latin_latin-ext-regular.woff2"];

/**
 * Offline fallback page.
 */
const OFFLINE_PAGE = "/index.html";

/*=============================================================================
    Install Event
=============================================================================*/

/*
 * Install the Service Worker and pre-cache essential application files.
 */
self.addEventListener("install", event => {
    console.log("[Service Worker] Installing...");
    event.waitUntil(
        (async () => {
            const cache=await caches.open(CACHE_NAME);
            console.log("[Service Worker] Caching application files...");
            await cache.addAll(PRECACHE_FILES);
            /*
             * Activate this Service Worker immediately instead of waiting
             * until every browser tab has been closed.
             */
            await self.skipWaiting();
        })()
    );
});


/*=============================================================================
    Activate Event
=============================================================================*/

/*
 * Remove obsolete cache versions.
 */
self.addEventListener("activate", event => {
    console.log("[Service Worker] Activating...");
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[Service Worker] Removing old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
            /*
             * Immediately begin controlling all open pages.
             */
            await self.clients.claim();
        })()
    );
});

/*=============================================================================
    Fetch Event
=============================================================================*/

/*
 * Cache First Strategy
 */
self.addEventListener("fetch",event=>{
    /*
     * Ignore unsupported request methods.
     */
    if(event.request.method!=="GET"){return;}
    event.respondWith(handleFetch(event.request));
});

/*=============================================================================
    Utility Functions
=============================================================================*/

/**
 * Handle every fetch request.
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleFetch(request){
    /*
     * Try the cache first.
     */
    const cachedResponse = await findInCache(request);
    if (cachedResponse){return cachedResponse;}
    /*
     * Otherwise try the network.
     */
    try {
        const networkResponse = await fetch(request);
        /*
         * Cache only successful responses.
         */
        if (networkResponse && networkResponse.ok){await saveToCache(request,networkResponse.clone());}
        return networkResponse;
    }
    catch (error) {
        console.warn("[Service Worker] Network request failed:",request.url);
        /*
         * Attempt to return the offline page.
         */
        const fallback = await caches.match(OFFLINE_PAGE);
        if (fallback){return fallback;}
        /*
         * Nothing available.
         */
        return new Response(
            "Offline",
            {
                status: 503,
                statusText: "Service Unavailable"
            }
        );
    }
}

/**
 * Search every cache for a matching request.
 *
 * @param {Request} request
 * @returns {Promise<Response|null>}
 */
async function findInCache(request){return await caches.match(request);}

/**
 * Save a response into the current cache.
 *
 * @param {Request} request
 * @param {Response} response
 */
async function saveToCache(request,response){const cache=await caches.open(CACHE_NAME);await cache.put(request,response);}

/**
 * Remove every cache except the current one.
 */
async function removeOldCaches(){
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name=>{if(name!==CACHE_NAME){return caches.delete(name);}}));
}

/**
 * Clear the active cache.
 * Useful for debugging.
 */
async function clearCurrentCache(){return caches.delete(CACHE_NAME);}

/**
 * Returns true if a request exists in the cache.
 *
 * @param {Request} request
 * @returns {Promise<boolean>}
 */
async function isCached(request){const response=await caches.match(request);return response!==undefined;}

/**
 * Returns a list of all cache names.
 *
 * Useful while debugging.
 */
async function listCaches(){return await caches.keys();}