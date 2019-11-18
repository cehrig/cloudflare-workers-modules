class ABTestConfig {
    constructor(cookie, siz) {
        // Specifies the name of the cookie we are going to use for keeping users in a testgroup
        this.cookie = cookie;
        // Specifies how much percent of the traffic we are going to put in the B-Group
        this.siz = (Number.isInteger(siz) && siz > 0 && siz <= 100) ? siz : 0;
    }
}

class ABTest {
    constructor(rq, tg) {
        this.rq = rq;
        this.tg = tg;
    }
}

let setTestgroup = function (rq, cfg) {
    let nrq;
    let cookie;
    let ntg;
    let cregex;
    let regex;

    // Make request attributes mutable
    nrq = new Request(rq);

    // Store sent cookies from client
    cookie = nrq.headers.get('Cookie') || "";

    // Calculate test group for a request
    ntg = (Math.random() < cfg.siz/100);

    // If a client already sent a testgroup cookie, we are reusing this to keep the user in the testgroup
    cregex = `${cfg.cookie}=([a-zA-Z]{1})`;
    regex = new RegExp(cregex);

    // Return immediately, if a testgroup cookie exists
    if ((match = regex.exec(cookie)) != null) {
        // Re-Use existing testgroup cookie and add request header towards the origin
        nrq.headers.set('X-TESTGROUP', match[1]);
        return new ABTest(nrq, match[1]);
    }

    nrq.headers.set('X-TESTGROUP', (ntg) ? 'B' : 'A');
    return new ABTest(nrq,(ntg) ? 'B' : 'A');
};

let setTestgroupCookie = function(rp, cfg, abt) {
    let nrp;

    // Make response attributes mutable
    nrp = new Response(rp.body, rp);

    // Adds a Set-Cookie response header to keep client in the testgroup for the next request.
    nrp.headers.append('Set-Cookie', `${cfg.cookie}=${abt.tg}`);

    return nrp;
};

// Exporting symbol, so we can use the function in our main javascript
exports.ABTestConfig = ABTestConfig;
exports.setTestgroup = setTestgroup;
exports.setTestgroupCookie = setTestgroupCookie;