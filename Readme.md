# Cloudflare Workers with custom npm modules

This repository demonstrates the use of encapsulated local npm modules, that can be reused across different Workers on
a multi-page web-application.

## Cloudflare Workers

Cloudflare Workers is a powerful tool, that lets you execute Javascript code at the edge server of Cloudflare.[1] This is 
extremely helpful when you have to 
- alter a client's request - by modifying the Request Object - before it is passed to your 
web-application
- alter your web-application's response - by modifying the Response Object - before it is sent back to 
your clients.

One common use-case for such a Worker-Script is the implementation of an A/B-Test.[2] An A/B-Test is used when you want to
see how a modified version of your page (B-version) - for example a new layout of your web-application's header - performs, 
compared to your existing one (A-version). While it is possible to implement the business logic for such an A/B-Test in
your origin web-application, you usually have to redeploy the entire web-application when you want to change it's
configuration. Depending on the complexity of your application, this can take a lot of time (minutes sometimes matter) 
and you want to shut-down the new version very quickly (because it causes issues in regard to your conversion rate, ...).

With Cloudflare Workers we can 
- encapsulate the whole logic for the A/B-Test at Cloudflare's edge servers
- redeploy a new configuration within seconds and independently from your web-application

This repository shows how to use Cloudflare Workers with custom local npm modules, using the A/B-Test as an example.

### Why npm modules

Cloudflare Workers consist of two components:
- A Workers script, containing the Javascript, that is executed at the edge servers
- A Workers route, defining a URL path to our web-application for which the script is executed.

At the time of writing we are not able to execute multiple Cloudflare Workers scripts for a single URL path, because
there is a 1:1 relation between a route and a script / the most specific route will apply.[3] Let's assume we have two 
scripts (and routes) in place. One for our web-application's homepage and one for our checkout, holding specific 
scripts for those pages. If we now want to use the A/B-Test logic for both of the pages, we would have to copy/paste 
the entire Javascript for the A/B Test to both of the scripts. One of the disadvantages of this approach is, that in 
case of changes in the logic of our A/B-Test, we would have to change the code in each of our Worker scripts, that 
implements the A/B-Test. Since our A/B-Test logic consists of ~60 lines of code (See `modules/mod-ab-test/index.js`) 
this is error prone and nobody wants to duplicate code.

Luckily we can work-around this limitation by encapsulating the code for our A/B-test using npm modules and building
the whole Workers script locally using webpack.[4] Compared to the example provided by Cloudflare, I'm going to show
how to write and use a custom/local npm module with a Workers script.

### How the code is structured

I am not going into the details how to use npm modules and webpack with Cloudflare Workers, because this is covered by 
Cloudflare docs.[4] Instead, I'm explaining how the code is structured, to give you some inspiration how to encapsulate and
reuse business logic with Workers.

### `modules/`

The modules directory contains re-usable local npm modules - each with their own package.json. The repository provides
an A/B-test module.

### `workers/`

The workers directory contains our Workers script, that implement re-usable local npm modules from `modules/`. The
`package.json` in this directory defines
- dependencies to local npm modules
- dev-dependencies like webpack, for building the final Workers script locally

I am providing a `homepage-worker.js` that demonstrates how to use the A/B-Test module for our web-application's homepage.
Re-using the logic is as simple as requiring the module itself:

`const _mod_ab_test = require("mod-ab-test");`

From there on, we can use the exported functions from our module:
- Set up the testgroup (Put 30% of the traffic to the B-Version): `let ABTestConfig = new _mod_ab_test.ABTestConfig('Testgroup', 30);` 
- Calculate the testgroup for a client (If the client does not yet provide a cookie): `let ABTest = _mod_ab_test.setTestgroup(request, ABTestConfig);`
- Keep the client in the testgroup by using Set-Cookie on the response object: `response = _mod_ab_test.setTestgroupCookie(response, ABTestConfig, ABTest);`

### Building the final Cloudflare Worker Script

For building the final Cloudflare Worker Script for our homepage, that implements the A/B-Test local npm module, we have to
execute three simple commands:

```
cd workers
npm install
npm run build
```

The last command builds the Workers script and stores it to `workers/dist/main.js`. We can now deploy this script to Cloudflare
edge servers, that implements our re-usable A/B-Test script.

### References
[1] https://www.cloudflare.com/products/cloudflare-workers/

[2] https://developers.cloudflare.com/workers/archive/recipes/a-b-testing/

[3] https://community.cloudflare.com/t/chaining-multiple-workers-on-enterprise-plan/83859/4

[4] https://developers.cloudflare.com/workers/archive/writing-workers/using-npm-modules/