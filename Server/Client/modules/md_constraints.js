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

function ConstraintManipulator(host, settings){
    this.id = "mdConstraints";
    this.settings = settings;
    this.title = this.settings.title;

    this.width = this.settings.layout.width;
    this.height = this.settings.layout.height;
    this.posx = this.settings.layout.posx;
    this.posy = this.settings.layout.posy;
    
    this.host = host;

	this.constraints = {};
	this.host.loaded();
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