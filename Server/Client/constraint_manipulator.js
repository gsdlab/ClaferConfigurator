function ConstraintManipulator(host){
    this.id = "mdConstraints";
    this.title = "Constraints";
    
    this.width = 224;
    this.height = 290;
    this.posx = 800;
    this.posy = 312;
    
    this.host = host;

	this.constraints = {};
}


ConstraintManipulator.method("getInitContent", function(){
	helpButton = this.host.getHelpButton(this.title);
    $("#" + this.id + " .window-titleBar").append(helpButton);

	var ret = '<form id="SaveConstraints" enctype="multipart/form-data" method="post" action="/Constraint" style="display: block">';
	ret += '<input type="hidden" id="windowKey" name="windowKey" value="' + this.host.key + '">';
	ret += '<input type="hidden" id="constraintCont" name="constraints" value="' + this.host.key + '">';
	ret += '<input type="hidden" id="instanceName" name="instName" value="' + this.host.key + '">';
	ret += '<input type="submit" class="inputButton" id="Save" value="Save New Constraints"></form>';
	ret += '<text id="constraintDisplay" style="white-space: pre;"></text>';
	return ret;

});

ConstraintManipulator.method("onInitRendered", function(){ 
	$("#SaveConstraints").hide(); // save constraints form removed until further notice
    var that = this;
    $("#Save").click(function(){
    	$("#constraintCont").val(that.getClaferConstraints(false));
    	$("#instanceName").val(that.instanceProcessor.getInstanceName().replace(/c[0-9]{1,}_/g, "") + " : " + that.instanceProcessor.getInstanceSuperClafer().replace(/c[0-9]{1,}_/g, ""));
    });

    $("#constraintDisplay").click(function(){
    	if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(document.getElementById("constraintDisplay"));
            range.select();
        } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(document.getElementById("constraintDisplay"));
            window.getSelection().addRange(range);
        }
    });

});

ConstraintManipulator.method("onDataLoaded", function(data){
	this.Processor = new ClaferProcessor(data.claferXML);
	this.instanceProcessor = new InstanceProcessor(data.instancesXML);

	this.constraints = {};
	this.updateContent();
});


ConstraintManipulator.method("addConstraint", function(feature, require){
	this.constraints[feature] = require;
	this.updateContent();
});

ConstraintManipulator.method("removeConstraint", function(feature){
	delete this.constraints[feature];
	this.updateContent();
});

ConstraintManipulator.method("getConstraints", function(){
	var array = [];
	for(var constraint in this.constraints){
		array.push(constraint);
	}
	return array;
})

ConstraintManipulator.method("getClaferConstraints", function(includeOriginalConstraints){
	var ret = "";

	if(includeOriginalConstraints){ //pull from original model
		var list = this.Processor.getConstraints();  
		for (var i=0; i<list.length; i++){
			ret += "\n" + list[i];
		}
	}

	var constraints = this.getConstraints();
	for (i=0; i<constraints.length; i++){
		ret += "\n[ ";
		if (!this.constraints[constraints[i]]){
			ret += "no ";
		}
		ret += constraints[i];
		ret += " ]";
	}
	console.log(ret)
	return ret;
});

ConstraintManipulator.method("updateContent", function(){
	var content = this.getClaferConstraints(true);
	$("#constraintDisplay").text(content);
});