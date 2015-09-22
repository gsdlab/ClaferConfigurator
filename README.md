ClaferConfigurator
==================

v0.4.1

An interactive, web-based, configurator for models expressed in [Clafer](http://clafer.org).
The configurator provides a novel approach to configuration (model instantiation), whereby the configurer works with multiple correct configurations at the same time instead of working with a single configuration, making configuration steps, and resolving configuration conflicts.
When working with a single configuration, the configurer is often not aware of the impact of their configuration actions, and when conflicts arise, they have great difficulty resolving the conflicts.
In contrast, in ClaferConfigurator, the configurers always see only correct configurations and can explore them using filtering, ordering, highlighting of the differences, and creating more configurations on demand.
Read more in the paper [Clafer Tools for Product Line Engineering](http://gsd.uwaterloo.ca/publications/view/519).

### Live demo

* Master branch (stable and released): [ClaferConfigurator 0.4.1](http://t3-necsis.cs.uwaterloo.ca:8093/)
* Develop branch (with newest features, but not guaranteed to be stable): [ClaferConfigurator Development ](http://t3-necsis.cs.uwaterloo.ca:8193/)

If the demo is down or you encounter a bug, please email [Michał Antkiewicz](mailto:mantkiew@gsd.uwaterloo.ca).

### Background

See [clafer.org](http://clafer.org).

### Functions

1. Provides a web based GUI for interaction with instance generators.
2. Allows for comparing and analyzing multiple product configurations simultaneously.
3. Facilitates configuration of clafer models.

### Nature

The ClaferConfigurator is a web-based application. Its server side (implemented with `Node.js`) only runs the chosen backend passes back its output.
The client-side is implemented using `JavaScript/HTML` and provides configuration functionality.

Contributors
------------

* Neil Vincent Redman, co-op student Jan-Apr 2013. Main developer.
* [Michał Antkiewicz](http://gsd.uwaterloo.ca/mantkiew). Research Engineer. Requirements, development, architecture, testing, technology transfer.
* [Alexandr Murashkin](http://gsd.uwaterloo.ca/amurashk). Developer. Transition to the platform, improvements, multiple backends.
* [Eldar Khalilov](http://gsd.uwaterloo.ca/ekhalilov). Developer. Upgrade to 0.4.1 (replace XML with JSON, test suites).

### Dependencies for running

* [Java Platform (JDK)](http://www.oracle.com/technetwork/java/javase/downloads/index.html) v8+
* [Clafer](https://github.com/gsdlab/clafer) v0.4.1
  * can be from the binary distribution
* [Node.js Framework](http://nodejs.org/download/), v0.12.0
* [Redis Server](https://launchpad.net/~chris-lea/+archive/ubuntu/redis-server), v2:2.*
  * On Ubuntu, execute `sudo add-apt-repository ppa:chris-lea/redis-server && apt-get install redis-server`
* Backends' dependencies must be satisfied. See the backend installation steps below.

### Installation

**Core**

1. Download (`git clone`) [ClaferConfigurator](https://github.com/gsdlab/ClaferConfigurator) to some directory `<target directory>`
2. Go to `<target directory>/ClaferConfigurator` and execute

```
git submodule init
git submodule update
```

This will install the platform.

When working with a branch other then `master`, you need to additionally checkout that branch (e.g., `develop`):

```
git submodule foreach git checkout develop
```

3. Go to `<target directory>/ClaferConfigurator/Server` and execute

 `npm install`

This will download all the required `Node.js` modules.

4. Install the necessary backends into some location `<bin>` found on `PATH`. The default configuration in `<target directory>/ClaferIDE/Server/Backends/backends.json` assumes `/home/clafertools040/bin`.

The fastest way is to unzip a binary distribution into the folder `<bin>`.

See [Installing Backends](https://github.com/gsdlab/ClaferToolsUICommonPlatform#backends) for detailed steps.

### Settings

1. Make sure the port `8093` is free, or change the value of the key `port` in `Server/config.json`:
`"port" = "8093"` to any free one.

2. Make sure `clafer`, `node`, and `java` are in `PATH` environment variables, so they can be executed without any path prefixes.

3. Running the following commands should produce the following results or later version:

`clafer --version`

> `Clafer v0.4.1`

`java -version`

> `java version 1.8.0_60`

`node -v`

> `v0.12.0`

4. Make sure `uploads` folder is accessible for writing, since temporary files will be stored there.

5. If you use Shell scipts (`.sh`) for running, make sure the scripts have `Execute` permissions.

### Running

* To run the server in a standard mode, execute

`cd <target directory>/ClaferConfigurator/Server/`

`node ClaferConfigurator.js`

* If you use `Node Supervisor` under Linux, you can execute

```sh
cd <target directory>/ClaferConfigurator/Server/commons
chmod +x start.sh
sh start.sh
```

Then you can go to any browser and type `http://localhost:[port]/` and open any Clafer file with objectives in it.

### Trying an Example

* Choose `Adaptive Cruise Control Example` example in the dropdown box in the upper-left corner of the tool window.
* Press `Compile` button right in the front of the drop down list.
* Once you see the compilation is complete, go to `Instance Generator` view and press `Run` there (the default backend is `Choco-based IG (IG + MOO)`).
* The `Feature and Quality Matrix` view should show the first 10 generated configurations (instances).

### Important: Branches must correspond

All related projects are following the *simultaneous release model*.
The branch `master` contains releases, whereas the branch `develop` contains code under development.
When building the tools, the branches should match.
Releases from branches `master` are guaranteed to work well together.
Development versions from branches `develop` should work well together but this might not always be the case.

Need help?
==========

* Visit [language's website](http://clafer.org).
* Report issues to [issue tracker](https://github.com/gsdlab/ClaferConfigurator/issues)
