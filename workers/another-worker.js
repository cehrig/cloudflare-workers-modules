addEventListener('fetch', event => {
    event.respondWith(processWorker(event.request))
});

// For this worker we are using the header override module
const _mod_hdr_override = require("mod-hdr-override");

async function processWorker(request) {
    let response;

    request = _mod_hdr_override.setHeader(request, 'X-REQUEST-HEADER', 'test');

    response = await fetch(request);
    return response;
}
