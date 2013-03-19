function Control(host)
{ 
    this.id = "mdControl";
    this.title = "Control";
    
    this.width = 320;
    this.height = 50;
    this.posx = 280;
    this.posy = 0;
    
    this.host = host;
}

Control.method("getInitContent", function(){
	var ret = '<form id="ControlForm" enctype="multipart/form-data" method="get" action="/Control" style="display: block">';
	ret += '<input type="hidden" id="ControlOp" name="operation" value="next">';
    ret += '<input type="hidden" id="windowKey" name="windowKey" value="' + this.host.key + '">';
	ret += '<input type="button" class="inputButton" id="next" value="Next Instance">';
	ret += '<input type="button" class="inputButton" id="scope" value="Increase Scope"></form>';
    ret += '<text> Current scope = </text><text id="curScope">0</text>';
	return ret;
});

Control.method("onInitRendered", function()
{
    $("#next").click(function(){
        $("#ControlOp").val("next");
        $("#ControlForm").submit();
    });
    $("#scope").click(function(){
        $("#ControlOp").val("scope");
        $("#curScope").text(parseInt($("#curScope").text()) + 1);
        $("#ControlForm").submit();
    });

    var options = new Object();
    options.beforeSubmit = this.beginQuery.bind(this);
    options.success = this.showResponse.bind(this);
    options.error = this.handleError.bind(this);
    $('#ControlForm').ajaxForm(options); 
});

Control.method("beginQuery", function(formData, jqForm, options){
    $("#ControlForm").hide();
});

Control.method("showResponse", function(responseText, statusText, xhr, $form){
    $("#ControlForm").show();
    host.updateData(responseText);
});

Control.method("handleError", function(responseText, statusText, xhr, $form){

});
