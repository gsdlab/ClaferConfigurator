function Output(host)
{ 
    this.id = "mdOutput";
    this.title = "Output";
    
    this.width = 600;
    this.height = 200;
    this.posx = 0;
    this.posy = 92;
    
    this.host = host;
    this.content = "";
}

Output.method("getInitContent", function(){
	return '<text id="output"></text>';
});

Output.method("onDataLoaded", function(data){
	$("#output").append(data.instancesXML);
    $("#mdOutput .window-content").scrollTop($("#output").height());
});
