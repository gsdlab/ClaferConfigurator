function Input(host)
{ 
    this.id = "mdInput";
    this.title = "Input";
    
    this.width = 280;
    this.height = 50;
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
	ret += '<input type="submit" class="inputButton" id="Configure" value="Submit to IG" style="float: right"></form>';
    ret += '<text style="display: none" id="waitText">Processing...</text>'
	return ret;
});

Input.method("onInitRendered", function()
{
    var options = new Object();
    options.beforeSubmit = this.beginQuery.bind(this);
    options.success = this.showResponse.bind(this); //problem in ie
    options.error = this.handleError.bind(this);
    $('#InputForm').ajaxForm(options); 
});

Input.method("beginQuery", function(formData, jqForm, options){
    $('#waitText').show();
    $('#InputForm').hide();
    $('#ControlForm').hide();
    $("#output").text("");
});

Input.method("showResponse", function(responseText, statusText, xhr, $form){
    var data = responseText;
    data = data.split("=====");
    data[1] = data[1].replaceAll("claferIG> ", "");  

    data[0] = data[0].replaceAll('<?xml version="1.0"?>', '');
    data[0] = data[0].replaceAll('cl:', '');
    data[0] = data[0].replaceAll('xsi:', '');
    data[0] = data[0].replaceAll(' xmlns="http://clafer.org/ir" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cl="http://clafer.org/ir" schemaLocation="http://clafer.org/ir https://github.com/gsdlab/clafer/blob/master/src/ClaferIR.xsd"', '');


    $('#waitText').hide();
    $('#InputForm').show();
    $('#ControlForm').show();

	host.updateClaferData(data);

    $("#ControlForm").find(':input:disabled').prop('disabled', false)
    $("#NumOfNext").val(9)
    $('#ControlForm #next').click();
});

Input.method("handleError", function(ErrorObject, statusText, xhr, $form){
    $('#waitText').hide();
    $('#InputForm').show();
    $('#ControlForm').show();
    var data = (ErrorObject.status + " " + ErrorObject.statusText + "\n" + ErrorObject.responseText);
    host.errorUpdate(data);
});