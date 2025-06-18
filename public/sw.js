importScripts('/gp/gp.sw.js');

const gemini = new GeminiProxy('AIzaSyBjHCN41HnvuNqBQo7MdCpUyTWCyKRDDoE');

async function handleRequest(event) {
    if (gemini.route({ request: event.request })) {
        return gemini.fetch({ request: event.request });
    }

    return fetch(event.request);
}

self.addEventListener('fetch', event => {
    event.respondWith(handleRequest(event));
});

