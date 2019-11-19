addEventListener('fetch', event => {
    event.respondWith(processWorker(event.request))
});

// We are re-using the AB-Test Module for this worker
const _mod_hdr_override = require("mod-hdr-override");

async function processWorker(request) {
    let response;

    request = _mod_hdr_override.setHeader(request, 'Host', 'example.com');

    response = await fetch(request);
    return response;
}
