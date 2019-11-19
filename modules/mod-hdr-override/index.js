let setHeader = function (rq, k, v) {
    let nrq;

    // Make request attributes mutable
    nrq = new Request(rq);

    // Set request header or do something more useful here
    nrq.headers.set(k, v);

    return nrq;
};

// Exporting symbol, so we can use the function in our main javascript
exports.setHeader = setHeader;