
var host;
$(document).ready(function()
{
    
    var modules = Array();
    
    modules.push("Input");
    modules.push("Control");
    modules.push("Output");
    modules.push("ComparisonTable");
    
    host = new Host(modules);
});

$(window).unload( function(){
    $.ajax({
        type: "POST",
        url: "/close",
        data: { windowKey: host.key }
    });
});

function Host(modules)
{
	this.key = Math.floor(Math.random()*1000000000).toString(16);
    this.modules = new Array();
    this.data = {claferXML:'', instancesXML:''};
    
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
   
}

Host.method("updateData", function(data){


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
});

Host.method("updateClaferData", function(data){
    console.log(data);
    console.log(this.data)
    this.data.claferXML = data[0];
    this.data.instancesData = data[1];
    this.data.instancesXML = new InstanceConverter(this.data.instancesData).convertFromClaferIGOutputToClaferMoo(this.data.instancesData);
    this.data.instancesXML = new InstanceConverter(this.data.instancesXML).convertFromClaferMooOutputToXML(); 
    this.data.instancesXML = this.data.instancesXML.replaceAll('<?xml version="1.0"?>', '');
    console.log(this.data)
    this.updateData(this.data);
});

Host.method("updateErrorData", function(data){
    $.updateWindowContent("mdOutput", data);
});

Host.method("updateInstanceData", function(data){
    this.data.instancesData += data;
    this.data.instancesXML = new InstanceConverter(this.data.instancesData).convertFromClaferIGOutputToClaferMoo(this.data.instancesData);
    this.data.instancesXML = new InstanceConverter(this.data.instancesXML).convertFromClaferMooOutputToXML(); 
    this.updateData(this.data);
});