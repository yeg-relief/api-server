### API SERVER

This is the `API` for the `YouCanBenefit` project.

It has two accessible routes:

* `/protected/...`
* `/api/...`

There is no authentication service provided.

Since this is a small single tenant application auth is very
straighforward. My implementation is a reverse proxy that
handles basic auth and forwards the request.


