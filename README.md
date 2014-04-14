ClaferConfigurator
==================

v0.3.6.15-04-2014

An interactive, web-based, configurator for attributed feature models with inheritance subset of [Clafer](http://clafer.org).
The configurator provides a novel approach to feature configuration, whereby the configurer works with multiple correct configurations at the same time instead of working with a single configuration, making configuration steps, and resolving configuration conflicts. 
When working with a single configuration, the configurer is often not aware of the impact of their configuration actions, and when conflicts arise, they have great difficulty resolving the conflicts.
In contrast, in ClaferConfigurator, the configurers always see only correct configurations and can explore them using filtering, ordering, highlighting of the differences, and creating more configurations on demand.

### Live demo

* Master branch (stable and released): [Try me!](http://t3-necsis.cs.uwaterloo.ca:8093/)
* Develop branch (with newest features, but not guaranteed to be stable): [Try me!](http://t3-necsis.cs.uwaterloo.ca:8193/)

If the demo is down or you encounter a bug, please email [Michal Antkiewicz](mailto:mantkiew@gsd.uwaterloo.ca).

### Background

[Clafer](http://clafer.org) is a general-purpose lightweight structural modeling language developed at [GSD Lab](http://gsd.uwaterloo.ca/), [University of Waterloo](http://uwaterloo.ca). 
Clafer can be used for *domain modeling*, *product-line modeling* and *multi-objective optimization* with respect to various one or more optimization goals. 

### Functions

1. Provides a web based GUI for interaction with claferIG.
2. Allows to compare and analyze product configurations.
3. Facilitates configuration of clafer models.

### Nature

The ClaferConfigurator is a web-based application. Its server side (implemented with `Node.JS`) only runs the chosen backend passes back its output.
The client-side is implemented using Javascript/HTML and provides configuration functionality.

Contributors
------------

* Neil Vincent Redman, co-op student Jan-Apr 2013. Main developer.
* [Michał Antkiewicz](http://gsd.uwaterloo.ca/mantkiew), Research Engineer. Requirements, development, architecture, testing, technology transfer.
* [Alexandr Murashkin](http://gsd.uwaterloo.ca/amurashk), MSc. Candidate. Developer, transition to the platform, new improvements, multiple backends.

Getting Binaries
--------------------

Binary distributions of the release 0.3.6 of Clafer Tools for Windows, Mac, and Linux, 
can be downloaded from [Clafer Tools - Binary Distributions](http://http://gsd.uwaterloo.ca/clafer-tools-binary-distributions). There you can get binaries for `Clafer Compiler`, `ClaferIG` and the `ClaferChocoIG` backend.

### Dependencies for running

* [Java Platform (JDK)](http://www.oracle.com/technetwork/java/javase/downloads/index.html) v7+, 32bit
* [Clafer](https://github.com/gsdlab/clafer) v0.3.6
  * can be from the binary distribution
* [Node.JS Framework](http://nodejs.org/download/), v0.10.20
* Backends' dependencies must be satisfied. See the backend installation steps below

### Installation

**Core**

1. Download (`git clone`) [ClaferConfigurator](https://github.com/gsdlab/ClaferConfigurator) to some directory `<target directory>`
2. Go to `<target directory>/ClaferConfigurator` and execute
	
 `git submodule init`

 `git submodule update`

  This will install the platform

3. Go to `<target directory>/ClaferConfigurator/Server` and execute
	
 `npm install`

  This will download all the required `Node.JS` modules.

4. Install the necessary backends using the steps below.

**Backend: ClaferIG**

This assumes you use the default configuration `<target directory>/ClaferConfigurator/Server/Backends/backends.json` file.

1. Install [ClaferIG](https://github.com/gsdlab/claferIG) following the installation instructions.

**Backend: ClaferChocoIG**

This assumes you use the default configuration `<target directory>/ClaferConfigurator/Server/Backends/backends.json` file.

1. Install [Java 7+](http://www.oracle.com/technetwork/java/javase/downloads/index.html).

2. Copy the binary of `ClaferChocoIG` (`claferchocoig-0.3.6-jar-with-dependencies.jar`) into the folder `<target directory>/ChocoIG`.

**Backend: ClaferZ3**

This assumes you use the default configuration `<target directory>/ClaferConfigurator/Server/Backends/backends.json` file.

1. Refer to the [ClaferZ3](https://github.com/gsdlab/ClaferZ3/) installation requirements. This should install `Python 3`, `PIP` and `Z3`.

2. Install `ClaferZ3` into the folder `<target directory>/ClaferZ3`.

### Settings

1. Make sure the port `8193` is free, or change the value of the key `port` in `Server/config.json`:
`"port" = "8193"` to any free one. 

2. Make sure `clafer`, `node`, `python`, and `java` are in `PATH` environment variables, so they can be executed without any path prefixes.

3. Running the following commands should produce the following results or later version:

`clafer -V` 

> `Clafer v0.3.5.20-01-2014`

`java -version`

> `java version 1.7.0_25`

`node -v`

> `v0.10.20`

4. Make sure `uploads` folder is accessible for writing, since temporary files will be stored there.

5. If you use Shell scipts (`.sh`) for running, make sure the scripts have `Execute` permissions. 

### Running

* To run the server in a standard mode, execute
	
`cd <target directory>/ClaferConfigurator/Server/`

`node ClaferConfigurator.js`

* If you use `Node Supervisor` under Linux, you can execute

`cd <target directory>/ClaferConfigurator/Server/commons`

`sh start.sh`

Then you can go to any browser and type `http://localhost:[port]/` and open any Clafer file with objectives in it.

### Trying an Example

* Choose `Adaptive Cruise Control Example` example in the dropdown box in the upper-left corner of the tool window.
* Press `Compile` button right in the front of the drop down list.
* Once you see the compilation is complete, go to `Instance Generator` view and press `Run` there (the default backend is `Choco-based IG (IG + MOO)`).
* The `Feature and Quality Matrix` view should show the first 10 generated instances.

### Important: Branches must correspond

All related projects are following the *simultaneous release model*. 
The branch `master` contains releases, whereas the branch `develop` contains code under development. 
When building the tools, the branches should match.
Releases from branches `master` are guaranteed to work well together.
Development versions from branches `develop` should work well together but this might not always be the case.

Need help?
==========
* See [language's website](http://clafer.org) for news, technical reports and more
  * Check out a [Clafer tutorial](http://t3-necsis.cs.uwaterloo.ca:8091/Tutorial/Intro)
  * Try a live instance of [ClaferWiki](http://t3-necsis.cs.uwaterloo.ca:8091)
  * Try a live instance of [ClaferIDE](http://t3-necsis.cs.uwaterloo.ca:8094)
  * Try a live instance of [ClaferConfigurator](http://t3-necsis.cs.uwaterloo.ca:8093)
  * Try a live instance of [ClaferMooVisualizer](http://t3-necsis.cs.uwaterloo.ca:8092)
* Take a look at (incomplete) [Clafer wiki](https://github.com/gsdlab/clafer/wiki)
* Browse example models in the [test suite](https://github.com/gsdlab/clafer/tree/master/test/positive) and [MOO examples](https://github.com/gsdlab/clafer/tree/master/spl_configurator/dataset)
* Post questions, report bugs, suggest improvements [GSD Lab Bug Tracker](http://gsd.uwaterloo.ca:8888/questions/). Tag your entries with `claferconfigurator` (so that we know what they are related to) and with `alexander-murashkin` or `michal` (so that Alex or Michał gets a notification).
