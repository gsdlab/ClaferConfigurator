
var host;
$(document).ready(function()
{
    
    var modules = Array();
    
    modules.push("Input");
    modules.push("Control");
    modules.push("Output");
    modules.push("ComparisonTable");
    modules.push("ConstraintManipulator");
    
    host = new Host(modules);

    $(window).unload( function(){
        $.ajax({
            type: "POST",
            url: "/close",
            data: { windowKey: host.key }
        });
    });
});



function Host(modules)
{
	this.key = Math.floor(Math.random()*1000000000).toString(16);
    this.modules = new Array();
    this.data = {claferXML:'', instancesXML:''};
    this.helpGetter = new helpGetter(this);
    
    for (var i = 0; i < modules.length; i++)
    {
        var MyClass = stringToFunction(modules[i]);        
        var instance = new MyClass(this);
        
        this.modules.push(instance);
    }    

    for (var i = 0; i < this.modules.length; i++)
    {
        var resize = null;
        
        if (this.modules[i].resize)
        {
            resize = this.modules[i].resize;
        }
        
        var x = $.newWindow({
            id: this.modules[i].id,
            title: this.modules[i].title,
            width: this.modules[i].width,
            height: this.modules[i].height,
            posx: this.modules[i].posx,
            posy: this.modules[i].posy,
            content: '',
            onDragBegin : null,
            onDragEnd : null,
            onResizeBegin : null,
            onResizeEnd : resize,
            onAjaxContentLoaded : null,
            statusBar: true,
            minimizeButton: true,
            maximizeButton: true,
            closeButton: false,
            draggable: true,
            resizeable: true
        });    
    
        if (this.modules[i].getInitContent)
            $.updateWindowContent(this.modules[i].id, this.modules[i].getInitContent());

        if (this.modules[i].onInitRendered)
            this.modules[i].onInitRendered();        
    }

    $("body").prepend(this.helpGetter.getInitial());
    this.helpGetter.setListeners();
   
}

Host.method("updateData", function(data){
    data.consoleOut = data.consoleOut.replaceAll("undefined", "");
    if (data.instancesXML != '' && data.claferXML != ''){
        for (var i = 0; i < this.modules.length; i++)
        {
            if (this.modules[i].onDataLoaded)
                this.modules[i].onDataLoaded(data);
        }

        for (var i = 0; i < this.modules.length; i++)
        {
            if (this.modules[i].getContent)
                $.updateWindowContent(this.modules[i].id, this.modules[i].getContent());

            if (this.modules[i].onRendered)
                this.modules[i].onRendered();
                
            if (this.modules[i].resize)
                this.modules[i].resize();
                    
        }
    } else {
        for (var i = 0; i < this.modules.length; i++){
            if (this.modules[i].id == "mdOutput"){
                this.modules[i].onDataLoaded(data);
                $.updateWindowContent(this.modules[i].id, this.modules[i].getContent());
            }
        }
    }
});

Host.method("updateClaferData", function(data){
    this.data.consoleOut = "";
    this.data.claferXML = data[0];
    this.data.instancesData = data[1];
    this.data.qualities = data[2];
    this.data.instancesXML = new InstanceConverter(this.data.instancesData).convertFromClaferIGOutputToClaferMoo(this.data.instancesData);
    this.data.instancesXML = new InstanceConverter(this.data.instancesXML).convertFromClaferMooOutputToXML(); 
    this.data.instancesXML = this.data.instancesXML.replaceAll('<?xml version="1.0"?>', '');

    console.log(this.data)
    this.updateData(this.data);
});

Host.method("updateInstanceData", function(data, overwrite, consoleOut){
    if (overwrite){
        this.data.instancesData = "";
    }
    this.data.instancesData += data;
    this.data.instancesXML = new InstanceConverter(this.data.instancesData).convertFromClaferIGOutputToClaferMoo(this.data.instancesData);
    this.data.instancesXML = new InstanceConverter(this.data.instancesXML).convertFromClaferMooOutputToXML(); 
    this.data.consoleOut = consoleOut;

    console.log(this.data)
    this.updateData(this.data);
});

Host.method("updateClaferOnly", function(data){
    this.data.consoleOut = "";
    this.data.claferXML = data;
});

Host.method("consoleUpdate", function(data){
    console.log(data);
    this.data.consoleOut = data;
    this.updateData(this.data);
});

Host.method("ClearOutput", function(data){
    for (var i = 0; i < this.modules.length; i++){
        if (this.modules[i].id == "mdOutput"){
            this.modules[i].ClearContent();
            $.updateWindowContent(this.modules[i].id, this.modules[i].getContent());
        }
    } 
});

Host.method("ClearOutput", function(data){
    for (var i = 0; i < this.modules.length; i++){
        if (this.modules[i].id == "mdOutput"){
            this.modules[i].ClearContent();
            $.updateWindowContent(this.modules[i].id, this.modules[i].getContent());
        }
    } 
});

Host.method("changeConstraint", function(feature, require){
    for (var i = 0; i < this.modules.length; i++){
        if (this.modules[i].id == "mdConstraints"){
            if (require == 1){
                this.modules[i].addConstraint(feature, true);
            } else if (require == 0){
                this.modules[i].removeConstraint(feature);
            } else if (require == -1){
                this.modules[i].addConstraint(feature, false);
            } else {
                console.log("an error occured while adding a constraint")
            }
        }
    }
});

Host.method("clearFilters", function(){
    for (var i = 0; i < this.modules.length; i++){
        if (this.modules[i].id == "mdComparisonTable"){
            this.modules[i].clearFilters();
        }
    }
});

Host.method("getHelp", function(moduleName){
    this.helpGetter.getHelp(moduleName);
});

Host.method("getHelpButton", function(moduleName){
    return this.helpGetter.getHelpButton(moduleName);
});