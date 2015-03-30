# ![SkylinkCC](http://temasys.github.io/resources/img/SkylinkCC.svg)

> SkylinkCC is an open-source client-side library for your web-browser that enables any website to easily leverage the capabilities of WebRTC and its direct data streaming powers between agent and clients for audio/video conferencing, creating a control-center environment.

SkylinkCC is build on top of [SkylinkJS](https://github.com/Temasys/SkylinkJS) and works with our Temasys WebRTC Plugin even in Internet Explorer and Safari on Mac and PC.

You'll need a Temasys Developer Account and an App key to use this. [Register here to get your App key](https://developer.temasys.com.sg).

- [Getting started with SkylinkJS](http://temasys.github.io/how-to/2014/08/08/Getting_started_with_WebRTC_and_SkylinkJS/)
- [SkylinkJS API Docs](http://cdn.temasys.com.sg/skylink/skylinkjs/0.5.9/doc/classes/Skylink.html)
- [SkylinkCC API Docs](http://cdn.temasys.com.sg/skylink/skylinkcc/0.3.0/doc/classes/SkylinkCC.html)
- [Versions](http://github.com/Temasys/SkylinkCC/releases)
- [Developer Console  - Get your App key](https://developer.temasys.com.sg)



##### Need help or want something changed?
Please read how you can find help, contribute and support us advancing SkylinkJS on [our Github Page](https://developer.temasys.com.sg/support).

##### Current versions and stability
Always use the latest versions of the SkylinkCC library as WebRTC is still evolving and we adapt to changes very frequently and we constantly upgrade our SkylinkJS dependency to get updated with the changes.

[Latest version: 0.3.0](https://github.com/Temasys/SkylinkCC/releases/tag/0.3.0).

##### Issues faced in SkylinkJS - 0.5.7 and above:
It's recommended to use the `init()` callback instead of using `readyStateChange` event state to go completed as this may result in an infinite loop.

Ready state change triggers whenever the current room information is retrieved,  and joining another room instead of the default room will result in a re-retrieval to the API server, causing readyStateChange to trigger again and making SkylinkJS to re-join the room over and over again.
```
// Use this
sw.init(data, function () {
  sw.joinRoom('name');
});

// Instead of
sw.on('readyStateChange', function (state) {
  if (state === sw.READY_STATE_CHANGE.COMPLETED) {
     sw.joinRoom('name');
  }
});
```

## How to build your own SkylinkCC
In your [Git](http://git-scm.com/download) terminal, execute the following commands:
```
# 1. Clone or download this repository via git terminal.

git clone https://github.com/Temasys/SkylinkCC.git

# 2. Install all required SkylinkCC dependencies. Use (sudo npm install) if required.

npm install

# 3. Install Grunt to run tasks.

npm install grunt -g
npm install grunt-cli -g

# 4. Install Browserify and Testling to run test scripts :

npm install browserify -g
npm install testling -f

# 5. Run the start script to start a local webserver to be able access the demo and doc folders. This will popup Chrome (Mac). You can configure a different browsers in the start.sh file. Alternatively, you can run (sh start.sh)

npm start
```

After making edits, here are some commands to run and build Skylink:

- `grunt jshint` : To check for code formatting and syntax errors.
- `grunt yuidoc` : To generate document from code.
- `grunt dev` : To run and compile all the codes.
- `grunt publish` : To run when code is ready for next release.

__What's included in the repository?__

- `demo` : Contains the sample demos.

- `doc` : Contains the generated YUI documentation for the SkylinkCC.

- `doc-style` : Contains the template for our YUI documentation.

- `publish` : Contains the production version of the library and a minified copy of it

- `source` : Contains the skylinkcc.js library development files

- `tests` : _Not yet available_. Contains the list of test scripts.

## License
[APACHE 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
