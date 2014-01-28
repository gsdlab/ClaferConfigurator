function getConfiguration() 
{
	var modules = [];
    modules.push({"name": "Input", "configuration": 
    	{
    		"layout": {
    			"width": (window.parent.innerWidth-40) * 0.38,
    			"height": 125,
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
                var caption = "";
                if (statusText == "compile_error")
                    caption = "<b>Compile Error.</b><br>Please check whether Clafer Compiler is available, and the model is correct.";
                else if (statusText == "timeout")
                    caption = "<b>Request Timeout.</b><br>Please check whether the server is available.";
            //    else if (statusText == "malformed_output")
            //        caption = "<b>Malformed output received from ClaferMoo.</b><br>Please check whether you are using the correct version of ClaferMoo. Also, an unhandled exception is possible.  Please verify your input file: check syntax and integer ranges.";        
            //    else if (statusText == "malformed_instance")
            //        caption = "<b>Malformed instance data received from ClaferMoo.</b><br>An unhandled exception may have occured during ClaferMoo execution. Please verify your input file: check syntax and integer ranges.";        
            //    else if (statusText == "empty_instances")
            //        caption = "<b>No instances returned.</b>Possible reasons:<br><ul><li>No optimal instances, all variants are non-optimal.</li><li>An unhandled exception occured during ClaferMoo execution. Please verify your input file: check syntax and integer ranges.</li></ul>.";        
            //    else if (statusText == "empty_argument")
            //        caption = "<b>Empty argument given to processToolResult.</b><br>Please report this error.";        
            //    else if (statusText == "empty_instance_file")
            //        caption = "<b>No instances found in the specified file.";        
            //    else if (statusText == "optimize_first")
            //        caption = "<b>You have to run optimization first, and only then add instances.";        
                else if (statusText == "error" && response.responseText == "")
                    caption = "<b>Request Error.</b><br>Please check whether the server is available.";        
                else
                    caption = '<b>' + xhr + '</b><br>' + response.responseText.replace("\n", "<br>");

                return caption;

            },

            "onBeginQuery": function(module)
            {
                if (module.host.findModule("mdControl").sessionActive) // if there is an active IG session
                {
                    alert("Please stop the instance generator and save your results first");
                    return false;
                }

                module.host.findModule("mdControl").disableAll();
    
                module.host.storage.worker = new Worker(module.host); // creating a class for working with instances             

                return true;
            },

            "onFileSent": function(module){
                module.host.print("ClaferConfigurator> Processing the submitted model. Compiling...\n");
            },

            "onPoll" : function(module, responseObject){
//                if (responseObject.args)
//                {
//                    module.host.print("ClaferConfigurator> clafer " + responseObject.args + "\n");
//                }
            },
            "onCompleted" : function(module, responseObject){               
                if (responseObject.model != "")
                {
                    module.editor.getSession().setValue(responseObject.model);
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

                            module.host.storage.worker.data.claferXML = xml;
                            break;
                        }                        
                    }
                }                

                if (responseObject.qualities)
                {
                    module.host.storage.worker.data.qualities = responseObject.qualities;    
                }                

                module.host.print("Compiler> " + responseObject.message + "\n");
                module.host.print(responseObject.compiler_message + "\n");    

                if (responseObject.message == "Success")
                {
                    module.host.findModule("mdControl").resetControls();
                }
                else
                {
                    module.host.findModule("mdControl").disableAll(); // if exited IG, then disable controls
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
                "height": 125,
                "posx": (window.parent.innerWidth-40) * (1 - 0.38),
                "posy": 0
            }

    	}});


    modules.push({"name": "Control", "configuration": 
    {
            "layout": {
                "width": (window.parent.innerWidth-40) * (0.24),
                "height": 125,
                "posx": (window.parent.innerWidth-40) * 0.38,
                "posy": 0
            },
            "title": "Instance Generator",
            "onError": function(module, statusText, response, xhr)
            {
                if (statusText == "timeout")
                    caption = "<b>Request Timeout.</b><br>Please check whether the server is available.";
                else if (response && response.responseText == "process_not_found")
                    caption = "<b>Session not found.</b><br>Looks like your session has been closed due to inactivity. Please recompile your model to start a new session";
                else if (statusText == "error" && response.responseText == "")
                    caption = "<b>Request Error.</b><br>Please check whether the server is available.";        
                else
                    caption = '<b>' + xhr + '</b><br>' + response.responseText.replace("\n", "<br>");   

                return caption;     
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
                module.host.print("ClaferConfigurator> Instance generator stopped.\n");
            },
            "onBackendChange": function (module, newBackend)
            {
                module.host.storage.backend = newBackend;
                $("#instancesToGet").remove();
                $("#getInstances").remove();
                $("#" + newBackend.id + "-next_instance").hide();
                $("#" + newBackend.id + "_buttons").prepend('<button id="getInstances">Get Instances</button>');
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
                    module.host.print("Instances are reset.\n");        
                }
            },
            "onCustomEvent": function(module, response)
            {
                if (response == "instances_got")
                {
                    module.host.print("ClaferConfigurator> Generating instances...\n");            
                    module.host.storage.worker.initializeGeneration(); 
                }
            },               

        }});

    modules.push({"name": "FeatureQualityMatrix", "configuration": 
        {
            "title": "Feature and Quality Matrix",

            "layout": {
                "width": window.parent.innerWidth - 20 - 230,
                "height": window.parent.innerHeight - 60 - 165,
                "posx": 0,
                "posy": 165
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
            },
            "onInstanceRemove" : function(module, num)
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
                "posy": 165
            }
        }});

    var settings = {
    	"onInitialize": function(host)
	    {
	    },
    	"onLoaded": function(host)
	    {
            $('#ControlForm').prepend('<input type="hidden" name="instanceGenerationState" id="instanceGenerationState" value="none"/>');
 	    	$("#myform").submit();
	    }	    
	};

    return {"modules": modules, "settings": settings};
}