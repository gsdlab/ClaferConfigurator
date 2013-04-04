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
	var ret = '<form id="SaveConstraints" enctype="multipart/form-data" method="post" action="/Constraint" style="display: block">';
	ret += '<input type="hidden" id="windowKey" name="windowKey" value="' + this.host.key + '">';
	ret += '<input type="hidden" id="constraintCont" name="constraints" value="' + this.host.key + '">';
	ret += '<input type="hidden" id="instanceName" name="instName" value="' + this.host.key + '">';
	ret += '<input type="submit" class="inputButton" id="Save" value="Save New Constraints"></form>';
	ret += '<text id="constraintDisplay" style="white-space: pre;"></text>';
	return ret;

});

ConstraintManipulator.method("onInitRendered", function(){ 
    var that = this;
    $("#Save").click(function(){
    	$("#constraintCont").val(that.getClaferConstraints(false));
    	$("#instanceName").val(that.instanceProcessor.getInstanceName().replace(/c[0-9]_/, "") + " : " + that.instanceProcessor.getInstanceSuperClafer().replace(/c[0-9]_/, ""));
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
		ret += "\n[";
		if (!this.constraints[constraints[i]]){
			ret += "!";
		}
		ret += constraints[i];
		ret += "]";
	}
	console.log(ret)
	return ret;
});

ConstraintManipulator.method("updateContent", function(){
	var content = this.getClaferConstraints(true);
	$("#constraintDisplay").text(content);
});