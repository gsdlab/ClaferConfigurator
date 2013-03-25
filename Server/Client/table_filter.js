function tableFilter(tableid, claferXML, instancesXML, host){
	this.host = host;
	this.tableid = "#" + tableid;
	this.hidden = [];
	this.processor = new ClaferProcessor(claferXML);
	this.instanceProcessor = new InstanceProcessor(instancesXML);
	this.closedFeatures = [];
}

tableFilter.method("onRendered", function(){
	this.rows = $(this.tableid + " tr");
});

tableFilter.method("filterContent", function (){
	this.showAll();
	//filter by features
 	for (var i=0;i<this.rows.length;i++){
 		var curRow = this.rows[i];
 		var filter = $(curRow).attr("FilterStatus")
 		if (filter == "none")
 			continue;
 		else if (filter == "require"){
	 		for (var j=0;j<$(curRow).children().length;j++){
	 			var curCell = $(curRow).children()[j];
	 			if ($(curCell).hasClass("no"))
	 				this.hideInstance(j);
	 		}
	 	} else if (filter == "exclude"){
	 		for (var j=0;j<$(curRow).children().length;j++){
	 			var curCell = $(curRow).children()[j];
	 			if ($(curCell).hasClass("yes"))
	 				this.hideInstance(j);
	 		}
	 	}
 	}

 	//close features
 	for(i=0; i<this.closedFeatures.length; i++){
 		this.closeFeature(this.closedFeatures[i]);
 	}
 	this.host.scrollToSearch($("#search").val());
});

tableFilter.method("hideInstance", function (position){
	for (var i=0;i<this.rows.length;i++){
		$($(this.rows[i]).children()[position]).hide();
		this.hidden.push($($(this.rows[i]).children()[position]));
	}
});

tableFilter.method("showAll", function (){
	while(this.hidden.length > 0)
		$(this.hidden.pop()).show();
});

tableFilter.method("hideRowByName", function (name){
	for (var i=0;i<this.rows.length;i++){
		var curRow = this.rows[i];
		hideThis = $($(curRow).find(':contains("' + name + '")')).parent();
		if (hideThis.length != 0){
			$(hideThis).hide();
			this.hidden.push(hideThis);
		}
	}
});

tableFilter.method("closeFeature", function (feature){
	var instanceSuperClafer = this.instanceProcessor.getInstanceSuperClafer();
	var root = this.processor.getAbstractClaferTree("/Module/Declaration/UniqueId", instanceSuperClafer);
	
	root = this.findNodeInTree(root, feature)

	this.hideChildren(root);
	this.closedFeatures.push(feature)
	this.host.scrollToSearch($("#search").val());
});

tableFilter.method("hideChildren", function (node){
 	for (var i=0;i<node.subclafers.length;i++){
 		this.hideChildren(node.subclafers[i]);
 		this.hideRowByName(node.subclafers[i].displayId);
 	}
});

tableFilter.method("findNodeInTree", function (root, feature){
	if (root.displayId === feature)
		return root;
	else if (root.subclafers.length < 1)
		return null;
	else{
		for (var i=0; i<root.subclafers.length; i++){
			var ret = this.findNodeInTree(root.subclafers[i], feature);
			if (ret != null)
				return ret;
		}
	}
});	

tableFilter.method("openFeature", function (feature){
	var index = this.closedFeatures.indexOf(feature);
	this.closedFeatures.splice(index, 1);
	this.filterContent();
});