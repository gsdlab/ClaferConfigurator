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
	ret += '<br>Bitwidth: <input type="text" class="inputTextField" name="bitwidth" size="3">';
	ret += '<input type="hidden" id="windowKey" name="windowKey" value="' + this.host.key + '">';
	ret += '<input type="submit" class="inputButton" id="Configure" value="Submit to IG" style="float: right"></form>';
    ret += '<text style="display: none" id="waitText">Processing...</text>'
	return ret;
});

Input.method("onInitRendered", function()
{
    var options = new Object();
    options.beforeSubmit = this.beginQuery.bind(this);
    options.success = this.showResponse.bind(this);
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
    $('#waitText').hide();
    $('#InputForm').show();
    $('#ControlForm').show();
	host.updateData(responseText);
});

Input.method("handleError", function(responseText, statusText, xhr, $form){

});