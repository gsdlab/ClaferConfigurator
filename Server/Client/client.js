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

function getConfiguration() 
{
	var modules = [];
    modules.push({"name": "Input", "configuration": 
    	{
    		"layout": {
    			"width": (window.parent.innerWidth-40) * 0.38,
    			"height": 210,
    			"posx": 0,
    			"posy": 0
    		},

    		"title": "Input Clafer Model and Options",
    		"optimization_backend": false, 
            "input_default_cache": "checked",
            "input_default_flags": "",
            "file_extensions": [
                {
                    "ext": ".cfr", 
                    "button_file_caption": "Compile",
                    "button_example_caption": "Compile",
                    "button_editor_caption": "Compile",

                    "button_file_tooltip": "Compile the Clafer file selected on your machine",
                    "button_example_tooltip": "Compile the example chosen from the example list",
                    "button_editor_tooltip": "Compile the code in the editor below"
                }
            ],

            "onError": function(module, statusText, response, xhr){
                return onError(module, statusText, response, xhr);
            },

            "onBeginQuery": function(module)
            {
                module.host.storage.toReload = module.host.findModule("mdControl").sessionActive; // if there is an active IG session
                if (module.host.storage.toReload)
                {
                    module.host.findModule("mdControl").pausePolling();
                }

                module.host.storage.worker = new Worker(module.host); // creating a class for working with instances             

                return true;
            },

            "onFileSent": function(module){
                module.host.print("ClaferConfigurator> Processing the submitted model. Compiling...\n");
            },

            "onPoll" : function(module, responseObject){
                if (responseObject.args)
                {
                    module.host.print("ClaferConfigurator> clafer " + responseObject.args + "\n");
                }
            },
            "onCompleted" : function(module, responseObject){               
                if (responseObject.args)
                {
                    module.host.print("ClaferConfigurator> clafer " + responseObject.args + "\n");
                }

                if (responseObject.model != "")
                {
                    module.editor.selectAll();
                    module.editor.getSession().replace(module.editor.selection.getRange(), responseObject.model);
                    module.editor.selection.moveCursorTo(0, 0, false);
                    module.editor.selection.clearSelection();
                }

                if (responseObject.compiled_formats)
                {
                    for (var i = 0; i < responseObject.compiled_formats.length; i++)
                    {
                        if (responseObject.compiled_formats[i].id == "xml")
                        {
                            var xml = responseObject.compiled_formats[i].result;

                            xml = convertHtmlTags(xml);

                            xml = xml.replaceAll('<?xml version="1.0"?>', '');
                            xml = xml.replaceAll(' xmlns="http://clafer.org/ir" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cl="http://clafer.org/ir" xsi:schemalocation="http://clafer.org/ir https://github.com/gsdlab/clafer/blob/master/src/ClaferIR.xsd"', '');
                            xml = xml.replaceAll('cl:', '');
                            xml = xml.replaceAll('xsi:', '');

                            module.host.storage.worker.claferXML = xml;
                            break;
                        }                        
                    }
                }                

//                module.host.print("Compiler> " + responseObject.message + "\n");
//                module.host.print(responseObject.compiler_message + "\n");    

                if (responseObject.message == "Success")
                {
                    module.host.print("Compiler> " + responseObject.message + "\n");
                    module.host.print(responseObject.compiler_message + "\n");    

                    if (module.host.storage.toReload)
                    {
                        module.host.storage.toReload = false;
                        if (!module.host.findModule("mdControl").reload())
                        {
                            module.host.print("ClaferConfigurator> No reload command specified for the given backend.\nClaferConfigurator> Please re-run the backend to work with the changed model.\n");
                        }
                    }
                    else
                    {
                        module.host.findModule("mdControl").resetControls();
                    }
                }
                else
                {
                    module.host.print("Compiler> Error response:\n" + responseObject.compiler_message + "\n");
                    console.log(responseObject);
                    if (module.host.storage.toReload)
                    {
                        module.host.print("ClaferConfigurator> The instance generator is still running with the last version of the model.\n");
                        module.host.print("ClaferConfigurator> After you fix the compilation problem, the instance generator will reload.\n");
                        module.host.findModule("mdControl").resumePolling();
                    }
                    else
                    {
                        module.host.findModule("mdControl").disableAll(); // if exited IG, then disable controls
                    }
                }                 
             

                return true;   
    		}    		
    	}
	});
    
    modules.push({"name": "Output", "configuration": 
    	{
	    	"title": "Output",

            "layout": {
                "width": (window.parent.innerWidth+65) * 0.38,
                "height": 210,
                "posx": (window.parent.innerWidth-40) * (1 - 0.38),
                "posy": 0
            }

    	}});


    modules.push({"name": "Control", "configuration": 
    {
            "layout": {
                "width": (window.parent.innerWidth-40) * (0.24),
                "height": 210,
                "posx": (window.parent.innerWidth-40) * 0.38,
                "posy": 0
            },
            "title": "Instance Generator",
            "onError": function(module, statusText, response, xhr){
                return onError(module, statusText, response, xhr);
            },
            "onStart": function (module)
            {
                $("#ControlOpArg1").val($ ("#instancesToGet").val() - 1); // request (instancesToGet - 1) instances
                module.host.storage.worker.resetGeneration(); 
                module.host.storage.worker.refreshViews();
                module.host.storage.worker.initializeGeneration(); 
                return true;                
            },
            "onStop": function (module)
            {
                return true;                
            },            
            "onStarted": function (module)
            {
                module.host.print("ClaferConfigurator> Running the chosen instance generator...\n");            
            },
            "onStopped": function (module)
            {
                module.host.print("ClaferConfigurator> Forcing the instance generator to close...\n");               
            },
            "onDefaultScopeSet": function (module)
            {
                module.host.print("ClaferConfigurator> Setting the default scope...\n");
            },
            "onAllScopesIncreased": function (module)
            {
                module.host.print("ClaferConfigurator> Increasing all the scopes...\n");
            },
            "onIndividualScopeSet": function (module)
            {
                module.host.print("ClaferConfigurator> Setting the individual scope...\n");
            },
            "onIndividualScopeIncreased": function (module)
            {
                module.host.print("ClaferConfigurator> Increasing the individual scope...\n");
            },
            "onIntScopeSet": function (module)
            {
                module.host.print("ClaferConfigurator> Setting integer bounds...\n");
            },          
            "onBitwidthSet": function (module)
            {
                module.host.print("ClaferConfigurator> Setting the bitwidth...\n");
            },            
            "onPoll" : function(module, responseObject){
                module.host.storage.worker.processIGOutput(responseObject);
            },
            "onCompleted": function (module, responseObject){
                module.host.print("ClaferConfigurator> Instance generator has been successfully closed\n");
            },
            "onBackendChange": function (module, newBackend)
            {
                module.host.storage.backend = newBackend;
                $("#instancesToGet").remove();
                $("#getInstances").remove();
                $("#" + newBackend.id + "-next_instance").hide();
                $("#" + newBackend.id + "_buttons").prepend('<button id="getInstances" disabled>Get Instances</button>');
                $("#" + newBackend.id + "_buttons").prepend('<input class="scopeInput" type="text" value="10" name="instancesToGet" id="instancesToGet"/>');
     
                $("#getInstances").click(function()
                {
                    $("#ControlOp").val("getInstances");
                    $("#ControlOpArg1").val($ ("#instancesToGet").val());
                });
            },
            "onControlButtonClick": function(module, id)
            {
                var parts = id.split("-");
                if (parts[1] == "reload") // reload
                {
                    module.host.storage.worker.resetGeneration(); 
                    module.host.storage.worker.refreshViews();
                    module.host.print("ClaferConfigurator> Generation has been successfully reset.\n");        
                }
            },
            "onCustomEvent": function(module, response)
            {
                if (response == "instances_got")
                {
                    module.host.print("ClaferConfigurator> Generating instances...\n");            
                    module.host.storage.worker.initializeGeneration(); 
                }
                else
                {
                    module.host.print("ClaferConfigurator> '" + response + "' command sent.\n");
                }
            }
        }});

    modules.push({"name": "FeatureQualityMatrix", "configuration": 
        {
            "title": "Feature and Quality Matrix",

            "layout": {
                "width": window.parent.innerWidth - 20 - 230,
                "height": window.parent.innerHeight - 60 - 165,
                "posx": 0,
                "posy": 250
            },

            "buttonsForRemoval": true,
            "instancesSelectable": false,
            "useInstanceName": true,

            "onReset": function(module)
            {
                var constraintModule = module.host.findModule("mdConstraints");
                constraintModule.reset();
            },
            "onFeatureExpanded": function(module, feature)
            {
            },
            "onFeatureCollapsed": function(module, feature)
            {
            },          
            "onFeatureCheckedStateChange": function(module, feature, require)
            {
                var constraintModule = module.host.findModule("mdConstraints");

                if (require == 1){
                    constraintModule.addConstraint(feature, true);
                } else if (require == 0){
                    constraintModule.removeConstraint(feature);
                } else if (require == -1){
                    constraintModule.addConstraint(feature, false);
                } else {
                    alert("an error occured while adding a constraint");
                }

                module.host.storage.instanceFilter.filterByFeature(module, feature, require);                
            },
            "onInstanceRemove" : function(module, num)
            {
            },
            "onMouseOver" : function(module, num)
            {
            },
            "onMouseOut" : function(module, num)
            {
            }
        }});

    modules.push({"name": "ConstraintManipulator", "configuration": 
        {
            "title": "Constraints",

            "layout": {
                "width": 250,
                "height": window.parent.innerHeight - 60 - 165,
                "posx": window.parent.innerWidth - 20 - 230,
                "posy": 250
            }
        }});

    var settings = {
    	"onInitialize": function(host)
	    {
            host.storage.instanceFilter = new InstanceFilter(host);
	    },
    	"onLoaded": function(host)
	    {
            $('#ControlForm').prepend('<input type="hidden" name="instanceGenerationState" id="instanceGenerationState" value="none"/>');
 	    	$("#myform").submit();
	    }	    
	};

    return {"modules": modules, "settings": settings};
}

function onError(module, statusText, response, xhr) 
{
    var currentDate = new Date();
    var errorRecord = {};

    if (statusText == "compile_error")
        errorRecord = {
            "caption": "Compilation Error", 
            "body": "Please check whether Clafer Compiler is available, and the model is syntactically correct."
        };
    else if (statusText == "timeout")
        errorRecord = {
            "caption": "Request Timeout", 
            "body": "Please check whether the server is available. You may want to reload the browser page."
        };
    else if (response && response.responseText == "process_not_found")
        errorRecord = {
            "caption": "Session not found", 
            "body": "Looks like your session has been closed due to inactivity. Just recompile your model to start a new session."
        };
    else if (statusText == "error" && response.responseText == "")
        errorRecord = {
            "caption": "Request Error", 
            "body": "Please check whether the server is available. Try to recompile the model or to reload the browser page."
        };
    else
        errorRecord = {
            "caption": xhr, 
            "body": response.responseText
        };

    errorRecord.datetime = currentDate.today() + " @ " + currentDate.timeNow();
    errorRecord.contact = "If the error persists, please contact Alexandr Murashkin (http://gsd.uwaterloo.ca/amurashk) or Michal Antkiewicz (http://gsd.uwaterloo.ca/mantkiew)";

    module.host.print("ClaferConfigurator> " + errorRecord.caption + ": " + errorRecord.datetime + "\n" + errorRecord.body + "\n");
    module.host.errorWindow(errorRecord);

    return true;
}