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
    ret += '<input type="number" class="inputText" id="NumOfNext">';
	ret += '<input type="button" class="inputButton" id="next" value="Next Instance">';
	ret += '<input type="button" class="inputButton" id="scope" value="Increase Scope"></form>';
    ret += '<text> Current scope = </text><text id="curScope">1</text>';
    ret += '<div id="ContWaitingDiv" style="display:none"><Progress id="getProgress" style="width:100%"></Progress></div>'
	return ret;

    this.data = "";
});

Control.method("onInitRendered", function()
{
    that = this;
    $("#next").click(function(){
        that.instancesToGet = ($("#NumOfNext").val() - 1);
        $("#ControlOp").val("next");
        $("#ControlForm").submit();
        $("#getProgress").attr("max", $("#NumOfNext").val());
        $("#getProgress").attr("value", 1);
        $("#ContWaitingDiv").show()
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
    $("#ContWaitingDiv").hide();

    if (responseText.indexOf("No more instances found.") != -1){
        this.instancesToGet = 0;
    }
    else {
        console.log(responseText);
        this.data += responseText;
    }

    

    if (this.instancesToGet > 0){
        $("#ContWaitingDiv").show();
        $("#getProgress").attr("value", ($("#getProgress").attr("value") + 1));
        $("#ControlForm").submit();
        $("#ControlForm").hide();
        this.instancesToGet--;
    } else {
        this.data = this.data.replaceAll("claferIG> ", "");  

        this.host.updateInstanceData(this.data);
        this.data = "";
    }

});

Control.method("handleError", function(responseText, statusText, xhr, $form){
    this.waiting = true;
    $("#ControlForm").show();
});
