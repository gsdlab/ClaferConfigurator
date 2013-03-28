function Control(host)
{ 
    this.id = "mdControl";
    this.title = "Control";
    
    this.width = 520;
    this.height = 70;
    this.posx = 280;
    this.posy = 0;
    
    this.host = host;
}

Control.method("getInitContent", function(){
	var ret = '<form id="ControlForm" enctype="multipart/form-data" method="get" action="/Control" style="display: block">';
	ret += '<input type="hidden" id="ControlOp" name="operation" value="next" disabled="disabled">';
    ret += '<input type="hidden" id="windowKey" name="windowKey" value="' + this.host.key + '" disabled="disabled">';
    ret += '<input type="number" class="inputText" id="NumOfNext" placeholder="# to get, default(10)">';
	ret += '<input type="button" class="inputButton" id="next" value="Get Instances" disabled="disabled"><br>';
    ret += '<input type="number" class="inputText" id="SetScope" placeholder="Increase Scope To">';
	ret += '<input type="button" class="inputButton" id="scope" value="Increase Scope" disabled="disabled"></form>';
    ret += '<text> Current scope = </text><text id="curScope">1</text>';
    ret += '<div id="ContWaitingDiv" style="display:none"><Progress id="getProgress" style="width:100%"></Progress></div>';
	

    this.data = "";
    this.error = "";
    this.overwrite = false;

    return ret;
});

Control.method("onInitRendered", function()
{
    var that = this;
    $("#next").click(function(){
        $("#getProgress").attr("value", 1);
        $("#ControlOp").val("next");
        if ($("#NumOfNext").val() == "")
            $("#NumOfNext").val(10);
        if ($("#NumOfNext").val() > 0){
            $("#getProgress").attr("max", $("#NumOfNext").val());
            that.instancesToGet = ($("#NumOfNext").val() - 1);
            $("#ControlForm").submit();
        }
    });
    $("#scope").click(function(){
        $("#ControlOp").val("scope");
        that.increaseScopeBy = ($("#SetScope").val() - parseInt($("#curScope").text()) - 1);
        if (that.increaseScopeBy >= 0){ //zero indicates that the form must only be submitted once
            $("#curScope").text(parseInt($("#curScope").text()) + 1);
            $("#ControlForm").submit();
            $("#getProgress").attr("max", that.increaseScopeBy);
            $("#getProgress").attr("value", 1);
        } else {
            that.host.consoleUpdate("Cannot reduce scope." + "<br>");
        }
    });

    var options = new Object();
    options.beforeSubmit = this.beginQuery.bind(this);
    options.success = this.showResponse.bind(this);
    options.error = this.handleError.bind(this);
    $('#ControlForm').ajaxForm(options); 
});

Control.method("beginQuery", function(formData, jqForm, options){
    
    $("#ContWaitingDiv").show();
    $("#ControlForm").hide();
});

Control.method("showResponse", function(responseText, statusText, xhr, $form){
    if ($("#ControlOp").val() == "scope"){
        $("#curScope").text(parseInt($("#curScope").text()) + 1);
        $("#ControlForm").show();
        $("#ContWaitingDiv").hide();
        this.overwrite = true;
        this.host.consoleUpdate(responseText + "<br>");
        this.error = "";
        if (this.increaseScopeBy){
            $("#getProgress").attr("value", ($("#getProgress").attr("value") + 1));
            this.increaseScopeBy--;
            $("#ControlForm").submit();
        }
        return;
    }

    $("#ControlForm").show();
    $("#ContWaitingDiv").hide();

    if (responseText.indexOf("No more instances found.") != -1){
        this.instancesToGet = 0;
        this.error += "No more instances found. Try increasing the scope.<br>";
    }
    else {
//        console.log(responseText);
        this.data += responseText;
    }



    if (this.instancesToGet > 0){
        this.instancesToGet--;
        $("#ContWaitingDiv").show();
        $("#getProgress").attr("value", ($("#getProgress").attr("value") + 1));
        $("#ControlForm").submit();
    } else {
        this.data = this.data.replaceAll("claferIG> ", "");  
        this.host.updateInstanceData(this.data, this.overwrite, this.error);
        this.error = "";
        this.data = "";
        $("#NumOfNext").val('');
        this.overwrite = false
    }

});

Control.method("handleError", function(responseText, statusText, xhr, $form){
    $("#ControlForm").show();
    $("#ContWaitingDiv").hide()
});
