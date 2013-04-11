ClaferConfigurator
==================

An interactive, web-based, configurator for Clafer models.

### Background

[Clafer](http://clafer.org) is a general-purpose lightweight structural modeling language developed at [GSD Lab](http://gsd.uwaterloo.ca/), [University of Waterloo](http://uwaterloo.ca). Clafer can be used for *product-line modeling* and *multi-objective optimization*, whereby a the model of a product line can be used to find optimal products given a set of optimization goals. 

### Functions

1. Provides a web based GUI for interaction with claferIG.

2. Allows to compare and analyze product configurations.

3. Facilitates configuration of clafer models.

### Nature

The ClaferConfigurator is a web-based application. Its server side (implemented with Node.JS) only runs Clafer and ClaferIG and passes back its output.
The client-side is implemented using Javascript/HTML and handles all the basic functionality.

### Live demo

[http://gsd.uwaterloo.ca/5002](http://gsd.uwaterloo.ca/5003)

Installation
------------

### Dependencies for running

* [Clafer](https://github.com/gsdlab/clafer.git) - can also be downloaded [claferIG downloads](https://github.com/gsdlab/claferig/downloads) page as a binary

* [ClaferIG](https://github.com/gsdlab/claferMooStandalone)

* [Java](http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html)

* [Node.JS Framework](http://nodejs.org/download/), the stable version "0.10.0". Exactly this version should be installed, since the tool has not been tested with other versions.

### Installation

1. Install [ClaferIG](https://github.com/gsdlab/claferIG)
  * Clafer is installed as part of this procedure
2. Ensure that both clafer and claferIG are on your system path
3. Download the [ClaferConfigurator](https://github.com/gsdlab/ClaferConfigurator) to some directory `<target directory>`
4. Go to `<target directory>/ClaferConfigurator/Server/` and exectue the command:
	
 `npm install`

### Settings

1. Make sure the port `5003` is free, or change the variable value in `server.js`:
`var port = 5003;` to any free one. This will be moved to the configuration settings file later.

2. Make sure `clafer`, `claferIG` `node`, and `java` are in `PATH` environment variables, so they can be executed without any path prefixes.

3. Make sure *uploads* folder is accessible for writing, since temporary files will be stored there.

### Running

To run the server execute
	
`node server.js`
 
from `<target directory>/ClaferMooVisualizer/Server/`

Then you can go to any browser and type `http://localhost:[port]/` and open ClaferIG compatible model.
