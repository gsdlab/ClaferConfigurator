
var host;
$(document).ready(function()
{
    
    var modules = Array();
    
    modules.push("Input");
    modules.push("Control");
    modules.push("Output");
    
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
	for (var i = 0; i<this.modules.length; i++){
		if(this.modules[i].updateContent){
			$.updateWindowContent(this.modules[i].id, this.modules[i].updateContent(data));
		}
	}
});