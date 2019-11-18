addEventListener('fetch', event => {
    event.respondWith(processHomepage(event.request))
});

// We are re-using the AB-Test Module for this worker
const _mod_ab_test = require("mod-ab-test");

async function processHomepage(request) {
    let response;

    // 1) We are going to setup our AB-Test, by setting the B-Group Size to 30% and defining a cookie called Testgroup
    let ABTestConfig = new _mod_ab_test.ABTestConfig('Testgroup', 30);

    // 2) We are passing the Request and ABTestConfig to setTestgroup. The function calculates the testgroup for this
    // request or will reuse the testgroup, if the client sent a Testgroup cookie already.
    let ABTest = _mod_ab_test.setTestgroup(request, ABTestConfig);

    request = ABTest.rq;

    // Here we can add any special logic for this worker.
    // ...

    response = await fetch(request);

    // 3) For keeping the client in the calculated testgroup, we are going to Set-Cookie on the response object here.
    response = _mod_ab_test.setTestgroupCookie(response, ABTestConfig, ABTest);
    return response;
}