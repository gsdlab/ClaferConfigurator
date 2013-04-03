function ConstraintManipulator(){
    this.id = "mdConstraints";
    this.title = "ConstraintManipulator";
    
    this.width = 224;
    this.height = 290;
    this.posx = 800;
    this.posy = 312;
    
    this.host = host;

	this.constraints = {};
}

ConstraintManipulator.method("addConstraint", function(feature, require){
	this.constraints[feature] = require;
});

ConstraintManipulator.method("removeConstraint", function(feature){
	delete this.constraints[feature];
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
	for (var i=0; i<constraints.length; i++){
		ret += "[";
		if (!this.constraints[constraints[i]]){
			ret += "!";
		}
		ret += constraints[i];
		ret +="]\n";
	}
	console.log(ret);
	return ret;
});

