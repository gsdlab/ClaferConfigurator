/*
Copyright (C) 2012 Neil Redman <http://gsd.uwaterloo.ca>

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
    ret += '<input type="hidden" id="iScopeBy" name="increaseScopeBy" value="1" disabled="disabled">';
    ret += '<input type="hidden" id="superClafer" name="superClafer" value="" disabled="disabled">';
    ret += '<input type="number" class="inputText" id="NumOfNext" placeholder="10">';
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
        that.increaseScopeBy = ($("#SetScope").val() - parseInt($("#curScope").text()));
        $("#iScopeBy").val(that.increaseScopeBy)
        if (that.increaseScopeBy >= 0){ //zero indicates that the form must only be submitted once
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

Control.method("onDataLoaded", function(data){
    $("#superClafer").val((new InstanceProcessor(data.instancesXML)).getInstanceName().replace(/c[0-9]{1,}_/g, ""));
});

Control.method("beginQuery", function(formData, jqForm, options){
    
    $("#ContWaitingDiv").show();
    $("#ControlForm").hide();
});

Control.method("showResponse", function(responseText, statusText, xhr, $form){
    var data = responseText.split("\n=====\n");
    if ($("#ControlOp").val() == "scope"){
        $("#curScope").text(parseInt($("#curScope").text()) + this.increaseScopeBy);
        $("#ControlForm").show();
        $("#ContWaitingDiv").hide();
        this.overwrite = true;
        this.host.consoleUpdate(responseText + "<br>");
        this.error = "";
        return;
    }

    $("#ControlForm").show();
    $("#ContWaitingDiv").hide();

    var error = this.checkForCommonErrors(data[1]);
    if (error != ""){
        this.instancesToGet = 0;
        this.error += error
    }
    else {
//        console.log(responseText);
        this.data += data[0];
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
        this.overwrite = false
    }

});

Control.method("handleError", function(responseText, statusText, xhr, $form){
    $("#ControlForm").show();
    $("#ContWaitingDiv").hide()
});

Control.method("checkForCommonErrors", function(instanceOutput){
    //Unsat
    if (instanceOutput.indexOf("The following set of constraints cannot be satisfied in the current scope.") != -1){
        var ret = instanceOutput.replaceAll("\n", "<br>").replaceAll(" ", "&nbsp")
        return ret;
    }
    //No more instances
    else if (instanceOutput.indexOf("No more instances found.") != -1){
        var ret = instanceOutput.replaceAll("\n", "<br>").replaceAll(" ", "&nbsp")
        return ret;
    }
    //No common errors
    else {
        return "";
    }
});