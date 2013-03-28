function Output(host)
{ 
    this.id = "mdOutput";
    this.title = "Output";
    
    this.width = 224;
    this.height = 602;
    this.posx = 800;
    this.posy = 0;
    
    this.host = host;
    this.content = "";
}

Output.method("getInitContent", function(){
	return '<text id="output"></text>';
});

Output.method("onDataLoaded", function(data){
    if (data.consoleOut)
        this.content += data.consoleOut;
});

Output.method("onRendered", function(){
    $("#mdOutput .window-content").scrollTop($("#mdOutput #output").height());
});

Output.method("getContent", function()
{
    return '<text id="output">' + this.content + '</text>';
});