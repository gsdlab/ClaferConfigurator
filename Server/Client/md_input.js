function Input(host)
{ 
    this.id = "mdInput";
    this.title = "Input";
    
    this.width = 280;
    this.height = 70;
    this.posx = 0;
    this.posy = 0;
    
    this.host = host;

    this.key = Math.floor(Math.random()*1000000000).toString(16);
}

Input.method("getInitContent", function(){
	console.log(this.host.key);
	var ret = '<form id="InputForm" enctype="multipart/form-data" method="post" action="/uploads" style="display: block">';
	ret += '<input type="file" class="inputTextField" name="claferFile" size="15">';
	ret += '<br>Bitwidth: <input type="text" class="inputTextField" name="bitwidth" size="3" placeholder="4">';
	ret += '<input type="hidden" id="windowKey" name="windowKey" value="' + this.host.key + '">';
	ret += '<input type="submit" class="inputButton" id="Configure" value="Configure" style="float: right"></form>';
    ret += '<text style="display: none" id="waitText">Processing...</text>'
    ret += '<form id="getUnsat" enctype="multipart/form-data" method="get" action="/unsatisfiable" style="display: none">';
    ret += '<input type="hidden" id="windowKey" name="windowKey" value="' + this.host.key + '"></form>';
	return ret;
});

Input.method("onInitRendered", function()
{
    var options = new Object();
    options.beforeSubmit = this.beginQuery.bind(this);
    options.success = this.showResponse.bind(this); //problem in ie
    options.error = this.handleError.bind(this);
    $('#InputForm').ajaxForm(options); 
    var unsatOpt = new Object();
//    unsatOpt.beforeSubmit = function(formData, jqForm, options){};
//    unsatOpt.error = function(ErrorObject, statusText, xhr, $form){};
    unsatOpt.success = this.unsatReturn.bind(this); //problem in ie
    $("#getUnsat").ajaxForm(unsatOpt);

});

Input.method("beginQuery", function(formData, jqForm, options){
    $('#waitText').show();
    $('#InputForm').hide();
    $('#ControlForm').hide();
    $('#ControlForm #curScope').text(1);
    $("#output").text("");
    host.ClearOutput();
    this.unsatText = "";
});

Input.method("showResponse", function(responseText, statusText, xhr, $form){
    var data = responseText;
    data = data.split("=====");

    data[0] = data[0].replaceAll('<?xml version="1.0"?>', '');
    data[0] = data[0].replaceAll('cl:', '');
    data[0] = data[0].replaceAll('xsi:', '');
    data[0] = data[0].replaceAll(' xmlns="http://clafer.org/ir" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cl="http://clafer.org/ir" schemaLocation="http://clafer.org/ir https://github.com/gsdlab/clafer/blob/master/src/ClaferIR.xsd"', '');

    var unsat = false;
    var errorData = this.checkForCommonErrors(data[1]);
    if(errorData.indexOf("No more instances found.") != -1){ //unsat must display near miss on table, requires slightly different handling
        $('#waitText').hide();
        $('#InputForm').show();
        $('#ControlForm').show();
        this.host.updateClaferOnly(data[0]);
        return;
    } else if(errorData != ""){
        $('#waitText').hide();
        $('#InputForm').show();
        $('#ControlForm').show();
        this.host.consoleUpdate(errorData);
        return;
    }

    data[1] = data[1].replaceAll("claferIG> ", "");  

    $('#waitText').hide();
    $('#InputForm').show();
    $('#ControlForm').show();

	host.updateClaferData(data);

    $("#ControlForm").find(':input:disabled').prop('disabled', false);
    if (!unsat){
        $("#curScope").val(1);
        if  ($("#NumOfNext").val() > 0){
            $("#NumOfNext").val($("#NumOfNext").val() - 1);
        } else {
            $("#NumOfNext").val(9);  
        }
    $('#ControlForm #next').click();
    $("#NumOfNext").val(parseInt($("#NumOfNext").val()) + 1);
    }
});

Input.method("handleError", function(ErrorObject, statusText, xhr, $form){
    $('#waitText').hide();
    $('#InputForm').show();
    $('#ControlForm').show();
    var data = (ErrorObject.status + " " + ErrorObject.statusText + "\n" + ErrorObject.responseText);
    this.host.consoleUpdate(data);
});

Input.method("checkForCommonErrors", function(instanceOutput){
    //ClaferIG couldn't parse the file or the bitwidth was too low
    if (instanceOutput.indexOf('Exception in thread "main"') != -1){
        var ret = "An error occured in Processing. Make sure your .cfr does not contain goals and try increasing the bitwidth. <br>";
        return ret;
    }
    //Unsat model
    else if (instanceOutput.indexOf("No more instances found.") != -1){
        $("#getUnsat").submit();
        ret = instanceOutput + this.unsatText;
        return ret;
    }
    //No common errors
    else {
        return "";
    }
});

Input.method("unsatReturn", function(responseText, statusText, xhr, $form){
    var error = responseText.split("=====\n")[0];
    var nearMiss = responseText.split("=====\n")[1];
    nearMiss = nearMiss.replaceAll("claferIG> ", ""); 
    this.host.updateInstanceData(nearMiss, true, error);
});