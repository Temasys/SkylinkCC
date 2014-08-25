# SkywayCC

> SkywayCC is an open-source client-side library for your web-browser that enables developers to create a Control Center environment.

The latest complete version including [Socket.io](http://socket.io/), [AdapterJS](https://github.com/Temasys/AdapterJS) and [SkywayJS](https://github.com/Temasys/SkywayJS)
- `//cdn.temasys.com.sg/skyway/skywayjs/0.3.x/skywaycc.complete.min.js`

Library versions:
- `//cdn.temasys.com.sg/skyway/skywaycc/0.1.0/skywaycc.min.js`
- `//cdn.temasys.com.sg/skyway/skywaycc/0.1.0/skywaycc.debug.js`

You'll need a Temasys Developer Account and an API key to use this. [Get it here](https://developer.temasys.com.sg).

- [Getting started](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkywayJS/)
- [Introducing SkywayCC](http://temasys.atlassian.net/wiki/display/TPD/Introducing+SkywayCC)
- [SkywayCC API Docs](http://cdn.temasys.com.sg/skyway/skywaycc/0.1.0/doc/classes/SkywayCC.html)
- [SkywayJS API Docs](http://cdn.temasys.com.sg/skyway/skywayjs/0.3.x/doc/classes/Skyway.html)
- [Developer Console](https://developer.temasys.com.sg) - Get your API key


#### Need help or want something changed?

Please read how you can find help, contribute and support us advancing SkywayCC on [our Github Page](http://temasys.github.io/support).


## How to setup this project

- Install or update to the latest version of node and npm
- Install `grunt-cli` (See: http://gruntjs.com/getting-started)
- Run `npm install` to install dev dependencies.
- Run `npm install -g browserify` and `npm install -g testling` (might require sudo) to install the necessary tools to test locally
- Run `npm start` to start a local webserver to be able access the demo and doc folders (WebRTC won't work from your local file-system). This will popup Chrome (Mac). You can configure a different browsers in the `start.sh` file.

## Development

- Run `npm test` to execute jshint and run the tests in your local Chrome (Mac). You can configure this in the `test.sh` file.
- Run `grunt jshint` to run jshint on its own.
- Run `grunt publish` to create production version in `publish` folder and generate the documentation in `doc` folder


## What's included?

#### demo

Some demos to help with the development. You may access a simple demo called `app` from `http://localhost:8028/demo/app/{agent|client}.html`.

#### doc

YUI documentation for the Skyway object and its events

#### doc-style

Template for our YUI documentation

#### publish

The production version of the library and a minified copy of it

#### source

The skywaycc.js library development files

#### tests

Tape/Testling tests, currently work-in-progress


## License

[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)