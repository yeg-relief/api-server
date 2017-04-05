### YouCanBenefit API Server

This server sits infront of [Elasticsearch](https://www.elastic.co/products/elasticsearch) managing the data etc.
It is assumed that the `Elasticsearch` server is on localhost listening on default port.

The `API Server` does not handle authentication. That responsibility is delegated to a reverse proxy.

`app/seed.js` will create the mappings/indices in `Elasticsearch` that the application requires. 
`seed` will wipe all applicable data from `Elasticsearch`... use with care.


### npm scripts

* `start` starts the server listening on port 3000.
* `seed` tearsdown/rebuilds all indices and their associated mappings.
* `build` compiles all `ts` files to `js` -- used to build tests 
* `test` runs tests... assumes `build/test/**/*.js` glob pattern
* `clean` removes build folder
