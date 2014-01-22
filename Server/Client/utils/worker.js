function Worker(host){
    this.host = host;
    this.data = new Object();    
    this.resetGeneration();
    this.selectedBackend = null;
}

Worker.method("processIGOutput", function(output)
{
//    if (output.ig_args != "")
//    {
//        this.host.print("ClaferConfigurator> " + output.ig_args + "\n");
//    }       

    if (output.message) // means completed
    {
        this.host.print(output.message);                
        return;
    }

    var data = output.data;

    if (data && host.storage.backend.presentation_specifics.prompt_title != "")
    {
        data = data.replaceAll(host.storage.backend.presentation_specifics.prompt_title, "");
    }

    if (data)
    {
//        alert(data);
        data = data.replace(/^=== Instance \d* ===/gm, ""); // removing instances labels
        data = data.replace(/^\s*\n/gm, "");
//        alert(data);
    }

    if ($("#instanceGenerationState").val() != "none")
    {
//        console.log(output.error);
        var obj = this.checkForCommonErrorsAndFilter(output.error);
        var error = obj.error;

        if (error != ""){
            this.onGenerationError(error);    
            return; 
        }

        var obj = this.checkForCommonErrorsAndFilter(data);
        var error = obj.error;
        data = obj.filteredInput;

        if (data && (data != ""))
        {
            this.igData += data;
//            console.log(this.igData);
            if (this.updateInstanceData())
            {
                this.onGenerationSuccess();
                return;
            }
        }
//        else
//            console.log("no data");

        if (error != "")
        {
            this.onGenerationError(error);    
        }

    }
    else
    {
        if (data && (data != "")) 
            this.host.print(data);        
    }
});

Worker.method("updateInstanceData", function()
{
    this.data.instancesData += this.igData;
    this.igData = "";
    this.data.instancesXML = new InstanceConverter(this.data.instancesData).convertFromClaferIGOutputToClaferMoo(this.data.instancesData);
    this.data.instancesXML = new InstanceConverter(this.data.instancesXML).convertFromClaferMooOutputToXML(); 

//    console.log(this.data.instancesXML);

    var instanceProcessor = new InstanceProcessor(this.data.instancesXML);

//    console.log(instanceProcessor.getInstanceCount());
    this.instancesCounter = instanceProcessor.getInstanceCount();

    if (this.instancesCounter == this.requiredNumberOfInstances)
    {
        return true;
    } 

    return false;
});

Worker.method("checkForCommonErrorsAndFilter", function(instanceOutput)
{
    var result = new Object();
    result.filteredInput = instanceOutput;
    result.error = "";

    if (instanceOutput.indexOf(this.host.storage.backend.presentation_specifics.no_more_instances) >= 0)
    {
        result.error = this.host.storage.backend.presentation_specifics.no_more_instances + "\n";
        result.filteredInput = instanceOutput.replaceAll(this.host.storage.backend.presentation_specifics.no_more_instances, "").trim();
    }

    return result;
});

Worker.method("onGenerationError", function(error){
    this.host.print(error);
    this.onGenerationComplete();
});

Worker.method("onGenerationSuccess", function(){
    this.onGenerationComplete();
});

Worker.method("onGenerationComplete", function(){
    $("#instanceGenerationState").val("none");    

    if (this.instancesCounter == this.requiredNumberOfInstances)
    {
        this.host.print("All requested instances were generated\n");
    }
    else if (this.instancesCounter == this.initialNumberOfInstances)
    {
        this.host.print("Could not generate any instance\n");        
    }
    else
    {
        this.host.print("Generated " + (this.instancesCounter - this.initialNumberOfInstances) + " out of " + (this.requiredNumberOfInstances - this.initialNumberOfInstances) + " instances\n");        
    }

//    alert(this.data.instancesData);    
//    console.log(this.data);

    this.refreshViews();
});

Worker.method("refreshViews", function(){

//    alert("refresh views");
    var matrixModule = this.host.findModule("mdFeatureQualityMatrix");
    var constraintModule = this.host.findModule("mdConstraints");

    matrixModule.onDataLoaded(this.data);
    constraintModule.onDataLoaded(this.data);
    $.updateWindowContent(matrixModule.id, matrixModule.getContent());
    matrixModule.onRendered();
});

Worker.method("initializeGeneration", function(){
    if ($("#instanceGenerationState").val() == "none")
    {
        $("#instanceGenerationState").val("running");
        this.initialNumberOfInstances = this.instancesCounter;
        this.requiredNumberOfInstances = parseInt($("#instancesToGet").val()) + this.initialNumberOfInstances;       
        this.host.print("Trying to generate " + (this.requiredNumberOfInstances - this.initialNumberOfInstances) + " instances...\n");        
    }
});

Worker.method("resetGeneration", function(){
    this.igData = "";
    this.igError = "";
    this.data.instancesData = "";
    this.data.instancesXML = new InstanceConverter(this.data.instancesData).convertFromClaferIGOutputToClaferMoo(this.data.instancesData);
    this.data.instancesXML = new InstanceConverter(this.data.instancesXML).convertFromClaferMooOutputToXML(); 

    this.requiredNumberOfInstances = 0;
    this.initialNumberOfInstances = 0;
    this.instancesCounter = 0;
});

