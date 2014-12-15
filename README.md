# ![SkylinkCC](http://temasys.github.io/resources/img/SkylinkCC.svg)

> SkylinkCC is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between agent and clients for audio/video conferencing, creating a control-center environment.

You'll need a Temasys Developer Account and an API key to use this. [Get it here](https://developer.temasys.com.sg).

SkylinkCC is build on top of [SkylinkJS](https://github.com/Temasys/SkylinkJS) and works with our Temasys WebRTC Plugin even in Internet Explorer and Safari on Mac and PC.

You will require to setup your own `config.js` file to place your API key. Check out `config-example.js` in the `demo/app/js` folder on how it should be set up.

- [How SkylinkJS works](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkylinkJS/)
- [Introducing SkylinkCC](http://temasys.atlassian.net/wiki/display/TPD/Introducing+SkylinkCC)
- [Introducing SkylinkJS](http://temasys.atlassian.net/wiki/display/TPD/Introducing+SkylinkJS)
- [SkylinkJS API Docs](http://cdn.temasys.com.sg/skyway/SkylinkJS/0.3.x/doc/classes/Skyway.html)
- [SkylinkCC API Docs](http://cdn.temasys.com.sg/skyway/SkylinkCC/0.1.0/doc/classes/SkylinkCC.html)
- [Developer Console](https://developer.temasys.com.sg) - Get your API key


#### Need help or want something changed?
Please read how you can find help, contribute and support us advancing SkylinkCC on [our Github Page](http://temasys.github.io/support).

## How to setup this project
1. Clone or download this repository via [Git](http://git-scm.com/download) terminal:
```
git clone https://github.com/Temasys/SkywayCC.git
```
2. Install all required SkylinkCC dependencies:
```
npm install
```
3. Install Grunt to run tasks:
```
npm install grunt -g
npm install grunt-cli -g
```
4. Install Browserify and Testling to run test scripts :
```
npm install browserify -g
npm install testling -f
```
5. Run the start script to start a local webserver to be able access the demo and doc folders. This will popup Chrome (Mac). You can configure a different browsers in the `start.sh` file.
```
npm start
# or
sh start.sh
```

## Development

For developers making edits on the source code, here are the commands to make sure it is Skylink friendly:

- `grunt jshint` : To check for code formatting and syntax errors.
- `grunt yuidoc` : To generate document from code.
- `grunt dev` : To run and compile all the codes.
- `grunt publish` : To run when code is ready for next release.


#### Commit message format

Here's the format to push commits into SkylinkCC:

`[Ticket][Type: DOC|DEMO|STY|ENH|REF|DEP|BUG][WIP|<null>]: Commit name`

- `DOC` : This commit is related to documentation changes.
- `DEMO` : This commit is related to demo changes.
- `STY` : This commit is related to interface styling changes.
- `ENH` : This commit is related to an enhancement of a feature or new feature. Some improvements.
- `REF` : This commit is to upgrade the dependencies reference or changes to the references in Skylink.
- `DEP` : This commit is to upgrade the dependencies. _e.g. socket.io-client 1.2.1 upgrade_
- `BUG` : This commit is to fix a bug.
- `WIP` : This commit related to the ticket state is still in progress. Incomplete

__Examples:__<br>
- Commit that's a new feature but still in progress<br>
  `[#12][ENH][WIP]: New feature in progress.`<br>
- Commit that's a bug fix that has been completed<br>
  `[#15][BUG]: Fix for new bug found.`

## What's included?

#### demo

Some demos to help with the development.

Create your own `config.js` file with your own API keys to use demo in the `app` folder.

#### doc

YUI documentation for the SkylinkCC and SkylinkJS object and its events

#### doc-style

Template for our YUI documentation

#### publish

The production version of the library and a minified copy of it

#### source

The skylinkcc.js library development files

#### tests

Coming soon.

## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)