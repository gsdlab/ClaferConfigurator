/*
Copyright (C) 2012 - 2014 Alexander Murashkin, Neil Redman <http://gsd.uwaterloo.ca>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var url = require("url");
var sys = require("sys");
var fs = require("fs");
var path = require('path');
var express = require('express');
var spawn = require('child_process').spawn;    

var config = require('./config.json');
var backendConfig = require('./Backends/backends.json');
var formatConfig = require('./Formats/formats.json');

var lib = require("./commons/common_lib");
var core = require("./commons/core_lib");

/*  Rate Limiter */
//var rate            = require('express-rate/lib/rate'),
//  redis     = require('redis'),
//  client      = redis.createClient();

//var redisHandler = new rate.Redis.RedisRateHandler({client: client});
//var commandMiddleware = rate.middleware({handler: redisHandler, interval: config.commandLimitingRate.interval, limit: config.commandLimitingRate.limit}); // limiting command sending
//var pollingMiddleware = rate.middleware({handler: redisHandler, interval: config.pollingLimitingRate.interval, limit: config.pollingLimitingRate.limit}); // limiting polling
//var fileMiddleware = rate.middleware({handler: redisHandler, interval: config.fileRequestLimitingRate.interval, limit: config.fileRequestLimitingRate.limit}); // limiting requesting files

/* ----- */

var port = config.port;

var server = express();

server.use("/commons/Client", express.static(__dirname + '/commons/Client'));
server.use("/Client", express.static(__dirname + '/Client'));
//server.use(express.static(__dirname + '/commons/Client'));
//server.use(express.static(__dirname + '/Client/'));
server.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/uploads' }));

//-------------------------------------------------
// Standard GET request
//-------------------------------------------------
// Response: File contents
server.get('/', /*fileMiddleware, */function(req, res) {
    res.writeHead(200, { "Content-Type": "text/html"});    
    res.end(lib.getMainHTML());

});

//server.get('/commons/Client/:file', function(req, res) {
//    res.sendfile('commons/Client/' + req.params.file);
//});

//server.get('/commons/Client/modules/:file', function(req, res) {
//    res.sendfile('commons/Client/modules/' + req.params.file);
//});

//-------------------------------------------------
// File requests
//-------------------------------------------------

server.get('/Examples/:file', /*fileMiddleware,*/ function(req, res) {
    res.sendfile('Examples/' + req.params.file);
});

server.get('/Backends/:file', /*fileMiddleware, */ function(req, res) {
    res.sendfile('Backends/' + req.params.file);
});

server.get('/Formats/:file', /*fileMiddleware, */function(req, res) {
    res.sendfile('Formats/' + req.params.file);
});

server.get('/htmlwrapper', /*fileMiddleware,*/ function(req, res) {
    res.sendfile("commons/Client/compiler_html_wrapper.html");
});

//------------------- save instances request --------------------------
server.post('/saveinstances', /*commandMiddleware,*/ function(req, res, next) {
    var process = core.getProcess(req.body.windowKey);
    if (process != null)
    {
        core.logSpecific("Returning instances file", req.body.windowKey);
        res.writeHead(200, { "Content-Type": "text/html",
                         "Content-Disposition": "attachment; filename=instances.cfr.data"});
        res.end(req.body.data);
    }
    else
    {
        res.send(404, "Sorry can't find your session. Please re-compile your file to start a new one");        
    }
});


//-------------------------------------------------
//  Command Requests
//-------------------------------------------------

function requestInstances(process, req)
{
    var backend = core.getBackend(req.body.backend);
    if (!backend)
    {
        core.logSpecific("Error: Backend was not found", req.body.windowKey);
        return false;
    }

    var instancesToGet = req.body.operation_arg1;

    core.logSpecific(backend.id + " " + instancesToGet, req.body.windowKey);

    var operationId = "next_instance";
    var operation = null;
    // looking for a backend

    // looking for the operation
    var found = false;

    for (var j = 0; j < backend.control_buttons.length; j++)
    {
        if (backend.control_buttons[j].id == operationId)
        {
            operation = backend.control_buttons[j];
            found = true;
            break;
        }
    }

    if (!found)
    {
        core.logSpecific("Error: Required operation was not found", req.body.windowKey);
        return false;
    }

    core.logSpecific(backend.id + " ==> " + operation.id, req.body.windowKey);

    for (var i = 0; i < instancesToGet; i++)
    {
        process.tool.stdin.write(operation.command);
    }    

    return true;
}

/* Controlling Instance Generators */
server.post('/control', /*commandMiddleware, */function(req, res)
{

    var settings = new Object();
    settings.onData = function(data, backend){
        var process = core.getProcess(req.body.windowKey);
        if (process != null)
        {
            if (!process.completed)
            {
                if (process.ig_just_started)
                {
                    // if the backend supports production of the scope file, then send this command
                    // the command will be handled after the initial processing in any case
                    process.ig_just_started = false;
                    lib.produceScopes(process, backend);
                }

                process.freshData += data;
                // core.logSpecific(process.freshData, req.body.windowKey);


            }
        }
    };
    settings.onError = function(data, backend){
        var process = core.getProcess(req.body.windowKey);
        if (process != null)
        {
            if (!process.completed)
            {
                process.freshData += data;
            }
        }
    };

    var process = core.getProcess(req.body.windowKey);
    if (process == null)
    {
        res.writeHead(400, { "Content-Type": "text/html"});
        res.end("process_not_found");               
        return;
    }

    if (req.body.operation == "getInstances") // "getInstances" operation
    {
        core.logSpecific("Control: GetInstances", req.body.windowKey);
        if (requestInstances(process, req))
        {
            res.writeHead(200, { "Content-Type": "text/html"});
            res.end("instances_got");
        }
        else
        {
            res.writeHead(400, { "Content-Type": "text/html"});
            res.end("failed_generating_instances");                           
        }
    }
    else
    {
        if (lib.handleControlRequest(req, res, settings))
        {
            if (req.body.operation == "run") // just running
            {
                requestInstances(process, req);
            }
        }
    }
});

/*
 * "Compile" command
 * This is related to any time of submissions done using the Input view: compiling a file, example or text, etc.
 */
server.post('/upload', /*commandMiddleware,*/ function(req, res, next) 
{
    lib.handleUploads(req, res, next, fileReady, true);

    function fileReady(process)
    {        

        var loadExampleInEditor = req.body.loadExampleInEditor;
        if (process.loadedViaURL)
        {
            loadExampleInEditor = true;
        }

        // read the contents of the uploaded file
        fs.readFile(process.file + ".cfr", function (err, data) {

            if (err)
            {
                res.writeHead(500, { "Content-Type": "text/html"});
                res.end("Error while reading the file: " + err);
                return;
            }

            var file_contents;
            if(data)
                file_contents = data.toString();
            else
            {
                res.writeHead(500, { "Content-Type": "text/html"});
                res.end("Could not read the target file contents");
                return;
            }
            
            core.logSpecific("Compiling...", req.body.windowKey);

            var ss = "--ss=none";

            core.logSpecific(req.body.ss, req.body.windowKey);

            if (req.body.ss == "simple")
            {
                ss = "--ss=simple";
            }
            else if (req.body.ss == "full")
            {
                ss = "--ss=full";
            }

            var specifiedArgs = [];
            var genericArgs = [ss, process.file + ".cfr"];

            process.ss = ss; // saving the scope strategy

            if (loadExampleInEditor)
                process.model = file_contents;
            else
                process.model = "";                                   

            lib.runClaferCompiler(req.body.windowKey, specifiedArgs, genericArgs, function(){
                process.mode_completed = true;
            });

            core.timeoutProcessSetPing(process);

            res.writeHead(200, { "Content-Type": "text/html"});
            res.end("OK"); // we have to return a response right a way to avoid confusion.               
        });
    }
});

/* =============================================== */
// POLLING Requests
/* ------------------------------------------*/

/*
 * Handle Polling
 * The client will poll the server to get the latest updates or the final result
 * Polling is implemented to solve the browser timeout problem.
 * Moreover, this helps to control the execution of a tool: to stop, or to get intermediate results.
 * An alternative way might be to create a web socket
 */

server.post('/poll', /*pollingMiddleware,*/ function(req, res, next)
{
    var process = core.getProcess(req.body.windowKey);
    if (process == null)
    {
        res.writeHead(404, { "Content-Type": "application/json"});
        res.end('{"message": "Error: the requested process is not found."}');     
        // clearing part
        core.cleanProcesses();
        core.logSpecific("Client polled", req.body.windowKey);
        return;
    }

    if (req.body.command == "ping") // normal ping
    {               
        core.timeoutProcessClearPing(process);

        if (process.mode_completed) // the execution of the current mode is completed
        {
            if (process.mode == "compiler") // if the mode completed is compilation
            {       

                res.writeHead(200, { "Content-Type": "application/json"});
                var jsonObj = JSON.parse(process.compiler_result);
                jsonObj.compiled_formats = process.compiled_formats;
                jsonObj.args = process.compiler_args;
                process.compiler_args = "";
                jsonObj.scopes = "";
                jsonObj.model = process.model;
                jsonObj.compiler_message = process.compiler_message;

                /* sending qualities */
                jsonObj.qualities = process.qualities;
                process.qualities = "";

                res.end(JSON.stringify(jsonObj));

                process.mode = "ig";
                process.mode_completed = false;
            }
            else
            {

                var currentResult = "";

                if (process.freshData != "")
                {
                    currentResult += process.freshData;
                    process.freshData = "";
                }

                if (process.freshError != "")
                {
                    currentResult += process.freshError;
                    process.freshError = "";
                }                    

                res.writeHead(200, { "Content-Type": "application/json"});

                var jsonObj = new Object();              
                jsonObj.message = currentResult;
                jsonObj.scopes = "";
                jsonObj.ig_args = process.ig_args;
                process.ig_args = "";                
                jsonObj.completed = true;
                res.end(JSON.stringify(jsonObj));
            }

            // if mode is completed, then the tool is not busy anymore, so now it's time to 
            // set inactivity timeout

            core.timeoutProcessClearInactivity(process);
            core.timeoutProcessSetInactivity(process);
        }   
        else // still working
        {
            core.timeoutProcessSetPing(process);

            if (process.mode == "compiler") // if the mode completed is compilation
            {
                var jsonObj = new Object();
                jsonObj.message = "Working";
                jsonObj.args = process.compiler_args;
                process.compiler_args = "";
                res.writeHead(200, { "Content-Type": "application/json"});
                res.end(JSON.stringify(jsonObj));
            }
            else
            {
                if (!process.producedScopes)
                {
                    var scopesFileName = process.file + ".cfr-scope";
                    fs.readFile(scopesFileName, function (err, data) {
                        if (!err)
                        {
                            var process = core.getProcess(req.body.windowKey);
                            if (process != null)
                            {
                                process.scopes = data.toString();    
                                process.producedScopes = true;                                    
                            }

                            // removing the file from the system. 
                            fs.unlink(scopesFileName, function (err){
                                // nothing
                            });
                        }
                    });
                }

                var currentData = "";
                var currentError = "";

                if (process.freshData != "")
                {
                    currentData += process.freshData;
                    process.freshData = "";
                }

                if (process.freshError != "")
                {
                    currentError += process.freshError;
                    process.freshError = "";
                }                    

                res.writeHead(200, { "Content-Type": "application/json"});

                var jsonObj = new Object();
                jsonObj.data = currentData;
                jsonObj.error = currentError;

                jsonObj.scopes = process.scopes;
                process.scopes = "";

                jsonObj.ig_args = process.ig_args;
                process.ig_args = "";                

                jsonObj.completed = false;
                res.end(JSON.stringify(jsonObj));
            }
        }
    }
    else // if it is cancel
    {
        process.toKill = true;
        core.timeoutProcessClearPing(process);

        // starting inactivity timer
        core.timeoutProcessClearInactivity(process);
        core.timeoutProcessSetInactivity(process);

        res.writeHead(200, { "Content-Type": "application/json"});

        var jsonObj = new Object();
        jsonObj.message = "Cancelled";
        jsonObj.scopes = "";
        jsonObj.compiler_message = "Cancelled compilation";
        jsonObj.completed = true;
        res.end(JSON.stringify(jsonObj));

        core.logSpecific("Cancelled: " + process.toKill, req.body.windowKey);
    }
    
    // clearing part
    core.cleanProcesses();
    core.logSpecific("Client polled", req.body.windowKey);
    
});

server.get('/initdata', /*commandMiddleware,*/ function(req, res)
{
    core.logSpecific("Initialization data request", req.body.windowKey);

    res.writeHead(200, { "Content-Type": "application/json"});

    var jsonObj = new Object();
    jsonObj.versions = core.getDependencyVersionsText();
    jsonObj.version = core.getVersion();
    jsonObj.title = core.getTitle();
    res.end(JSON.stringify(jsonObj));
});

/*
 * Catch all the rest. Error reporting for unknown routes
 */
server.use(function(req, res, next)
{
    core.logSpecific(req.url, null);
    res.send(404, "Sorry can't find that!");
});

//================================================================
// Initialization Code
//================================================================

core.logNormal('===============================');
core.logNormal('| ' + core.getTitle() + ' ' + core.getVersion() + ' |');
core.logNormal('===============================');

core.addDependency("clafer", ["-V"], "Clafer Compiler", true);
core.addDependency("java", ["-version"], "Java", true);

var dirReplacementMap = [
        {
            "needle": "$dirname$", 
            "replacement": __dirname + "/Backends"
        }
    ];

for (var i = 0; i < backendConfig.backends.length; i++)
{
    core.addDependency(backendConfig.backends[i].tool, core.replaceTemplateList(backendConfig.backends[i].tool_version_args, dirReplacementMap), backendConfig.backends[i].label, false);
}

core.runWithDependencyCheck(function(){
    server.listen(port);
    core.logNormal('======================================');
    core.logNormal('Ready. Listening on port ' + port);        
});
