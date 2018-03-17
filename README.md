### API SERVER

This is the `API` for the `YouCanBenefit` project.

# service dependencies
* [elasticsearch](https://www.elastic.co/products/elasticsearch)
* [install tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-elasticsearch-on-ubuntu-16-04)

# setup
* `npm run prestart:prod`
* `npm run start:prod`
  * one should use a process management tool
* `http get localhost:3000/data/init`
  * this will create and map required elasticsearch indices


---

It has three accessible routes:

* `/protected/...`
* `/api/...`
* `/data/...`

There is no authentication service provided.

Since this is a small single tenant application auth is very
straighforward. My implementation is a reverse proxy that
handles basic auth and forwards the request.


