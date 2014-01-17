function Worker(host){
    this.host = host;

    this.igData = "";
    this.igError = "";
    this.data = new Object();
    this.data.instancesData = "";

    this.instancesToGet = 0;
    this.instancesCounter = 0;
}

Worker.method("processIGOutput", function(output)
{
    if (output.message) // means completed
    {
        host.print(output.message);                
        return;
    }

    var data = output.data;

//    if (($("#ControlOp").val() != "GetInstances") && ($("#ControlOp").val() != "run")){
//        this.overwrite = true;
//        return;
//    }

    if ($("#instanceGenerationState").val() != "none")
    {
        var error = this.checkForCommonErrors(output.error);

        if (error != ""){
            this.onGenerationError(error);     
//            console.log(error);   
        }
        else 
        {
            if (data && (data != ""))
            {
                this.igData += data;
                this.igData = this.igData.replaceAll("claferIG> ", "");  
//                console.log(this.igData);
                this.updateInstanceData();
            }
//            else
//                console.log("no data");
        }
    }
    else
    {
        host.print(data);        
    }
});

Worker.method("updateInstanceData", function()
{
    if (this.overwrite)
    {
        this.data.instancesData = "";
        this.overwrite = false;        
    }

    this.data.instancesData += this.igData;
    this.igData = "";
    this.data.instancesXML = new InstanceConverter(this.data.instancesData).convertFromClaferIGOutputToClaferMoo(this.data.instancesData);
    this.data.instancesXML = new InstanceConverter(this.data.instancesXML).convertFromClaferMooOutputToXML(); 

    console.log(this.data.instancesXML);

    var instanceProcessor = new InstanceProcessor(this.data.instancesXML);

    console.log(instanceProcessor.getInstanceCount());
    this.instancesCounter = instanceProcessor.getInstanceCount();

    if (this.instancesCounter == this.instancesToGet)
    {
        this.onGenerationSuccess();
    } 
});

Worker.method("checkForCommonErrors", function(instanceOutput){
    //ClaferIG couldn't parse the file or the bitwidth was too low
    if (instanceOutput.indexOf('Exception in thread "main"') != -1){
        var ret = "An error occured in Processing. Make sure your .cfr does not contain goals and try increasing the bitwidth. <br>";
        return ret;
    }
    //Unsat model
    else if (instanceOutput.indexOf("No more instances found.") != -1 || instanceOutput == "N"){
//        $("#getUnsat").submit();
        return instanceOutput;
    }
    //No common errors
    else {
        return "";
    }
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

    if (this.instancesCounter == this.instancesToGet)
    {
        this.host.print("All requested instances were generated\n");
    }
    else if (this.instancesCounter == 0)
    {
        this.host.print("Could not generate any instance\n");        
    }
    else
    {
        this.host.print("Generated " + this.instancesCounter + " out of " + this.instancesToGet + " instances\n");        
    }

//    alert(this.data.instancesData);    
    console.log(this.data);
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
        this.instancesToGet = $("#instancesToGet").val();       
        this.host.print("Trying to generate " + this.instancesToGet + " instances...\n");        
    }
});