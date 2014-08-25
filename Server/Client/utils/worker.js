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
function Worker(host){
    this.host = host;
    this.data = new DataTable();    
    this.resetGeneration();
    this.selectedBackend = null;
    this.firstTime = true;
}

Worker.method("processIGOutput", function(output)
{
    if (output.ig_args != "")
    {
        this.host.print("ClaferConfigurator> " + output.ig_args + "\n");
    }       

    if (output.message)
    {
        this.host.print(output.message);             
        return;
    }

    var textOutputFromIG = output.data;

    if (textOutputFromIG && this.host.storage.backend.presentation_specifics.prompt_title != "")
    {
        textOutputFromIG = textOutputFromIG.replaceAll(this.host.storage.backend.presentation_specifics.prompt_title, "");
    }

    if ($("#instanceGenerationState").val() != "none") // if we are generating instances currently
    {
        var obj = this.checkForCommonErrorsAndFilter(output.error);

        if (obj.error != ""){
            this.onGenerationError(error);    
            return; 
        }

        var obj = this.checkForCommonErrorsAndFilter(textOutputFromIG);
        var error = obj.error;
        var filteredTextOutputFromIG = obj.filteredInput;

        if (filteredTextOutputFromIG && (filteredTextOutputFromIG != ""))
        {
            this.freshUnparsedInstances = filteredTextOutputFromIG;
            if (this.updateInstanceData())
            {
                this.onGenerationSuccess();
                return;
            } // else we continue generating
        }

        if (obj.error != ""){
            this.onGenerationError(error);    
            return; 
        }

    }
    else
    {
        if (textOutputFromIG && (textOutputFromIG != "")) 
            this.host.print(textOutputFromIG);        
    }
});

Worker.method("updateInstanceData", function()
{
    var dataSource = new Object(); // creating a datasource to load a DataTable from
    this.unparsedInstances += this.freshUnparsedInstances;
    this.freshUnparsedInstances = "";

    dataSource.unparsedInstances = this.unparsedInstances;

    dataSource.error = false;
    dataSource.output = "";

    /* getting XML from unparsed data */
    var converter = new InstanceConverter(this.unparsedInstances);
    dataSource.instancesXML = converter.convertFromClaferMooOutputToXML(); 
    this.host.print(converter.residualExtraText);

    dataSource.claferXML = this.claferXML;
    dataSource.unparsedInstances = this.unparsedInstances;   

    this.data.loadFromDataSource(dataSource); // now we are creating a unified data source that has all the data processed

    this.host.storage.instanceFilter.onDataLoaded(this.data);

    this.instancesCounter = this.data.instanceCount;

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

    this.refreshViews();
});

Worker.method("refreshViews", function(){

//    alert("refresh views");
    var matrixModule = this.host.findModule("mdFeatureQualityMatrix");
    var constraintModule = this.host.findModule("mdConstraints");

    matrixModule.onDataLoaded(this.data);
    constraintModule.onDataLoaded(this.data);

    if (this.firstTime === true) 
    {
        this.firstTime = false;
        console.log("firstTime");
        $.updateWindowContent(matrixModule.id, matrixModule.getContent());
        matrixModule.onRendered();
    }
    else
    {
        console.log("NOTfirstTime");
        matrixModule.refresh();
    }

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
    this.unparsedInstances = "";
    this.freshUnparsedInstances = "";
    this.igError = "";
    this.data.clear();
    this.requiredNumberOfInstances = 0;
    this.initialNumberOfInstances = 0;
    this.instancesCounter = 0;
});

