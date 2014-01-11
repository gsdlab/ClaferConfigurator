ClaferConfigurator
==================

v0.3.5.15-01-2013

An interactive, web-based, configurator for attributed feature models with inheritance subset of [Clafer](http://clafer.org).
The configurator provides a novel approach to feature configuration, whereby the configurer works with multiple correct configurations at the same time instead of working with a single configuration, making configuration steps, and resolving configuration conflicts. 
When working with a single configuration, the configurer is often not aware of the impact of their configuration actions, and when conflicts arise, they have great difficulty resolving the conflicts.
In contrast, in ClaferConfigurator, the configurers always see only correct configurations and can explore them using filtering, ordering, highlighting of the differences, and creating more configurations on demand.

### Live demo

[Try me!](http://t3-necsis.cs.uwaterloo.ca:8093/)

If the demo is down or you encounter a bug, please email [Michal Antkiewicz](mailto:mantkiew@gsd.uwaterloo.ca).

### Background

[Clafer](http://clafer.org) is a general-purpose lightweight structural modeling language developed at [GSD Lab](http://gsd.uwaterloo.ca/), [University of Waterloo](http://uwaterloo.ca). Clafer can be used for *product-line modeling* and *multi-objective optimization*, whereby a the model of a product line can be used to find optimal products given a set of optimization goals. 

### Functions

1. Provides a web based GUI for interaction with claferIG.
2. Allows to compare and analyze product configurations.
3. Facilitates configuration of clafer models.

### Nature

The ClaferConfigurator is a web-based application. Its server side (implemented with Node.js) only runs Clafer and ClaferIG and passes back their outputs.
The client-side is implemented using Javascript/HTML and provides configuration functionality.

Contributors
------------

* Neil Vincent Redman, co-op student Jan-Apr 2013. Main developer.
* [Michał Antkiewicz](http://gsd.uwaterloo.ca/mantkiew), Research Engineer. Requirements, development, architecture, testing, technology transfer.
* [Alexandr Murashkin](http://gsd.uwaterloo.ca/amurashk), MSc. Candidate. Developer.

Getting Clafer Tools
--------------------

Binary distributions of the release 0.3.5 of Clafer Tools for Windows, Mac, and Linux, 
can be downloaded from [Clafer Tools - Binary Distributions](http://http://gsd.uwaterloo.ca/clafer-tools-binary-distributions). 
Clafer Wiki requires Haskell Platform and MinGW to run on Windows. 

In case these binaries do not work on your particular machine configuration, the tools can be built from source code, as described below.


### Dependencies for running

* [Java Platform (JDK)](http://www.oracle.com/technetwork/java/javase/downloads/index.html) v6+, 32bit
* [Clafer](https://github.com/gsdlab/clafer) v0.3.5
  * can be from the binary distribution
* [ClaferIG](https://github.com/gsdlab/claferIG) v0.3.5
  * can be from the binary distribution
* [Node.JS Framework](http://nodejs.org/download/) v0.10.20

### Installation

1. Install [ClaferIG](https://github.com/gsdlab/claferIG)
  * Clafer is installed as part of this procedure
2. Ensure that both clafer and claferIG are on your system path
3. Download the [ClaferConfigurator](https://github.com/gsdlab/ClaferConfigurator) to some directory `<target directory>`
4. Go to `<target directory>/ClaferConfigurator/Server/` and exectue the command:
  
 `npm install`

### Important: Branches must correspond

All related projects are following the *simultaneous release model*. 
The branch `master` contains releases, whereas the branch `develop` contains code under development. 
When building the tools, the branches should match.
Releases from branches 'master` are guaranteed to work well together.
Development versions from branches `develop` should work well together but this might not always be the case.

### Settings

1. Make sure the port `8093` is free, or change the value of the parameter `port` in `Server/config.json` to any free one. 

2. Make sure `clafer`, `claferIG` `node`, and `java` are in `PATH` environment variables, so they can be executed without any path prefixes.

Running the following commands should produce the following results or later version:

`clafer -V` 

> `Clafer v0.3.5.15-01-2014`

`python -V`

> `Python 2.7.5`

`java -version`

> `java version 1.7.0_25`

`node -v`

>v0.10.20

3. Make sure `uploads` folder is accessible for writing, since temporary files will be stored there.

### Running

To run the server execute
  
`node server.js`
 
from `<target directory>/ClaferConfigurator/Server/`

Then you can go to any browser and type `http://localhost:[port]/` and open ClaferIG compatible model (limited to attributed feature models with inheritance subset of Clafer).

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
* Post questions, report bugs, suggest improvements [GSD Lab Bug Tracker](http://gsd.uwaterloo.ca:8888/questions/). Tag your entries with `claferconfigurator` (so that we know what they are related to) and with `michal` (so that Michał gets a notification).