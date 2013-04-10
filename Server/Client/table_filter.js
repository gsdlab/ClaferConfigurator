function tableFilter(tableid, claferXML, instancesXML, host, qualities){
	this.host = host;
	this.tableid = "#" + tableid;
	this.hidden = [];
	this.processor = new ClaferProcessor(claferXML, qualities);
	this.instanceProcessor = new InstanceProcessor(instancesXML);
	this.permahidden = [];
	this.closedFeatures = [];
}

tableFilter.method("onRendered", function(){
	this.rows = $(this.tableid + " tr");
});

tableFilter.method("filterContent", function (){
	this.showAll();
	this.saveFilters();
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
	 			if ($(curCell).hasClass("tick"))
	 				this.hideInstance(j);
	 		}
	 	}
 	}

 	//close features
 	for(i=0; i<this.closedFeatures.length; i++){
 		this.closeFeature(this.closedFeatures[i]);
 	}

 	//permanently hidden instances (removed)
 	if(this.permahidden != []){
	 	for(i=0;i<this.permahidden.length;i++){
	 		$(this.permahidden[i]).hide();
	 	}
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
	var instanceClaferName = this.instanceProcessor.getInstanceName();
	var root = this.processor.getAbstractClaferTree("/Module/Declaration/UniqueId", instanceClaferName);
	
	root = this.findNodeInTree(root, feature)

	this.hideChildren(root);
	if (this.closedFeatures.indexOf(feature) == -1)
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

tableFilter.method("resetFilters", function (filters, permahidden){
	if(filters != []){
		for (var i=1;i<this.rows.length;i++){
			var curRow = this.rows[i];
			$(curRow).attr("FilterStatus", filters[i]);
			if ($("#r" + i + "box").length > 0){
				if ($("#r" + i + "box").attr("src").indexOf("images/checkbox_ticked_greyed.png") == -1){
					if (filters[i] == "none")
						$("#r" + i + "box").attr("src", "images/checkbox_empty.bmp");
					else if (filters[i] == "require")
						$("#r" + i + "box").attr("src", "images/checkbox_ticked.bmp");
					else if (filters[i] == "exclude")
						$("#r" + i + "box").attr("src", "images/checkbox_x.bmp");
				}
			}
		}
 	}
 	this.permahidden = permahidden;
 	//fires to realign headers
 	this.host.scrollToSearch("");
});

tableFilter.method("saveFilters", function(){
	var filters = ["none"];
	for (var i=1;i<this.rows.length;i++){
 		var curRow = this.rows[i];
 		var filter = $(curRow).attr("FilterStatus")
 		if (filter == "none"){
 			filters.push("none");
 		} else if (filter == "require"){
			filters.push("require");
	 	} else if (filter == "exclude"){
			filters.push("exclude");
	 	}
 	}
 	this.host.SavedFilters = filters;
});

tableFilter.method("cleanFilters", function (){
	this.showAll();
 	for (var i=1;i<this.rows.length;i++){
 		var curRow = this.rows[i];
 		$(curRow).attr("FilterStatus", "none");
 		if ($("#r" + i + "box").attr("src").indexOf("images/checkbox_ticked_greyed.png") == -1)
 			$("#r" + i + "box").attr("src", "images/checkbox_empty.bmp");
 	}
});

tableFilter.method("removeInstance", function(instanceNum){
	$("#th0_" + instanceNum).hide();
	this.permahidden.push("#th0_" + instanceNum);

	for (var i=0;i<this.rows.length;i++){
		$("#td" + i + "_" + instanceNum).hide();
		this.permahidden.push("#td" + i + "_" + instanceNum);
	}
	this.host.permahidden = this.permahidden;

});
