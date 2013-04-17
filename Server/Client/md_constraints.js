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
	return '<text id="constraintDisplay" style="white-space: pre;"></text>';
});

ConstraintManipulator.method("onInitRendered", function(){ 
	var that=this;

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

ConstraintManipulator.method("getClaferConstraints", function(){
	var ret = "";

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
	var content = this.getClaferConstraints();
	$("#constraintDisplay").text(content);
});