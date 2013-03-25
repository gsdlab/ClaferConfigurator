function ComparisonTable(host)
{ 
    this.id = "mdComparisonTable";
    this.title = "Feature and Quality Matrix";

    this.width = 600;
    this.height = 200;
    this.posx = 0;
    this.posy = 92;
    
    this.host = host;

	this.fadeColor = "#777";
	this.normalColor = "#000"

	this.fadeOpacity = "0.7";
	this.normalOpacity = "1.0"

//    this.dataTable.matrix = null;
//    this.dataTable.

}

ComparisonTable.method("onDataLoaded", function(data){
    this.instanceProcessor = new InstanceProcessor(data.instancesXML);
    this.processor = new ClaferProcessor(data.claferXML);
    this.abstractClaferOutput = "";    
    this.toggled = false;
    this.filter = new tableFilter("comparison", data.claferXML, data.instancesXML, this)

    this.dataTable = this.getDataTable();   
    
    this.content = $('<div id="comparison" class="comparison"></div>').append(new TableVisualizer().getHTML(this.dataTable));
    $("#mdComparisonTable .window-titleBar-content").text("Feature and Quality Matrix: " + this.dataTable.title);
    this.currentRow = 1;
    this.EMfeatures = [];

});

ComparisonTable.method("onRendered", function(){
    this.filter.onRendered();
// Add search bar 
    var td = $('#comparison .table_title')[0];
    $(td).html('<input type="text" id="search" class="text_input" placeholder="search" style="width: 100px">');
    $(td).addClass("TableSearch");

// Adding buttons for comparison table
// Distinct button for greying out non-distinct features
    td = $('#comparison .TableSearch')[0];
    $(td).append('<button id="toggle_link">Toggle</button>');
    var that = this;
    $('#toggle_link').html("Distinct");
    $('#toggle_link').click(function(event){
        event.stopPropagation();  //to keep table from sorting by instance number
        that.toggleDistinct();
    }).css("cursor", "pointer");

// Reset button for reseting filters

    $(td).append('&nbsp;<button id="filter_reset">Toggle</button>');

    $('#filter_reset').html("Reset");
    $('#filter_reset').click(function(event){
        event.stopPropagation(); //to keep table from sorting by instance number
        that.filter.resetFilters();
            //if currently set to distinct mode, refresh distinct rows
        if (this.toggled){
            this.toggleDistinct(); //one to turn off distinct
            this.toggleDistinct(); //one to reapply it
        }
    }).css("cursor", "pointer");

//************************* Most of the following is to get proper formatting on the table  *******************

// Move headers into new div
    $("#comparison").prepend('<div id="tHeadContainer"><table id="tHead" width="100%" cellspacing="0" cellspadding="0"></table></div>');
    $("#tHead").append($("#comparison #r0"));

// make headers positioning always on top of window
    $('#mdComparisonTable .window-content').scroll(function(){
            $("#comparison #tHeadContainer").css("position", "relative");
            $("#comparison #tHeadContainer").css("top", ($("#comparison").height() - $('#mdComparisonTable .window-content').scrollTop())*(-1) + $("#comparison #tHeadContainer").height());
            $("#comparison #tBodyContainer").css("top" , $("#comparison #tHeadContainer").height());
    });

    $("#mdComparisonTable").resize(function(){
        $('#mdComparisonTable .window-content').scroll();
    })

// Move body into new div
    $("#comparison").prepend('<div id="tBodyContainer" style="position: relative;"></div>');
    $("#tBodyContainer").prepend($("#comparison #tBody"));
    



// fix formatting for new headers
// shrink table to obtain minimum widths
    $("#tBodyContainer").css("width", "10%")
    $("#tHeadContainer").css("width", "10%")

// obtain minimum widths
    var i;

    $("#tHead .td_abstract").width("40%");
    $("#tBody .td_abstract").width("40%");

    i = 0;
    var row = $("#r" + i);
    var minWidth = 0;
    while ($(row).children().length != 0){
        for (var x = 1; x<=$(row).children().length; x++){
            var current = $(row).children()[x];
            if ($(current).width() > minWidth)
                minWidth = $(current).width();
        }
        i++;
        row = $("#r" + i);
    }

    var minAbstractWidth = $("#tBody .td_abstract").width();
//    console.log(minWidth);

// Set new widths and minimum widths (important to do both for cross browser functionality)
    for(i=1; i<$("#tHead #r0").children().length; i++){
        $("#tHead #th0_" + i).width(minWidth);
        $("#tBody #td0_" + i).width(minWidth);
        $("#tHead #th0_" + i).css("min-width", minWidth);
        $("#tBody #td0_" + i).css("min-width", minWidth);
        var x = 1;
        row = $("#r" + x);
        while ($(row).children().length != 0){
            $("#tBody #td" + x + "_" + i).width(minWidth);
            $("#tBody #td" + x + "_" + i).css("min-width", minWidth);
            x++;
            row = $("#r" + x);
        }
    }

    $("#tHead .td_abstract").width(minAbstractWidth);
    $("#tBody .td_abstract").width(minAbstractWidth);
    $("#tHead .td_abstract").css("min-width", minAbstractWidth);
    $("#tBody .td_abstract").css("min-width", minAbstractWidth);
    $("#tHead .td_abstract").css("max-width", minAbstractWidth);
    $("#tBody .td_abstract").css("max-width", minAbstractWidth);

// reset table widths to 100%
    $("#tBodyContainer").css("width", "100%")
    $("#tHeadContainer").css("width", "100%")

// Mostly done formatting table. adding interactive features now.

// Add tristate checkboxes for filtering features
    i = 1;
    row = $("#r" + i);
    var that = this;
    while (row.length != 0){
        if (!row.find(".numeric").length && !row.find(".EffectMan").length){
            $("#r" + i).attr("FilterStatus", "none");
            $("#r" + i + " .td_abstract").prepend('<image id="r' + i + 'box" src="images/checkbox_empty.bmp" class="maybe">');
            $("#r" + i + "box").click(function(){
                if (this.className == "maybe"){
                    this.src = "images/checkbox_ticked.bmp";
                    this.className = "wanted";
                    $(this).parent().parent().attr("FilterStatus", "require");
                    that.filter.filterContent();
                } else if (this.className == "wanted"){
                    this.src = "images/checkbox_x.bmp";
                    this.className = "unwanted";
                    $(this).parent().parent().attr("FilterStatus", "exclude");
                    that.filter.filterContent();
                } else {
                    this.src = "images/checkbox_empty.bmp";
                    this.className = "maybe";
                    $(this).parent().parent().attr("FilterStatus", "none");
                    that.filter.filterContent();
                }
            }).css("cursor", "pointer");
        }
        i++;
        row = $("#r" + i);
    }
//  Add collapse buttons for features with children
    i = 1;
    row = $("#r" + i);
    var that = this;
    while (row.length != 0){
        if (!row.find(".numeric").length){
            $("#r" + i + " .td_abstract").prepend('<text id="r' + i + 'collapse" status="false">\u25BC<text>')
            $("#r" + i + "collapse").click(function(){
                if ($(this).attr("status") === "false"){
                    that.filter.closeFeature($(this).parent().text().replaceAll(/[^A-z]/g, ''));
                    $(this).attr("status", "true")
                    $(this).text("\u25B6")
                } else {
                    that.filter.openFeature($(this).parent().text().replaceAll(/[^A-z]/g, ''));
                    $(this).attr("status", "false")
                    $(this).text("\u25BC")
                }
            }).css("cursor", "pointer");
        }
//  Add Greyed out checkboxes to denote effectively mandatory features
        else if (!row.find(".numeric").length){
            $("#r" + i + " .td_abstract").prepend('<image id="r' + i + 'box" src="images/checkbox_ticked_greyed.png" class="wanted">');
        }
//  Add sorting to quality attributes
        else {
            $("#r" + i + " .td_abstract").append('<div id=sortText style="display:inline"></div>');
            $("#r" + i + " .td_abstract").addClass('noSort');
            $("#r" + i + " .td_abstract").click(function(){
                if($(this).hasClass("sortAsc")){
                    $(this).toggleClass("sortAsc sortDesc");
                    $(this).find("#sortText").text(" \u25B6");
                } else if ($(this).hasClass("sortDesc")){
                    $(this).toggleClass("sortDesc sortAsc");
                    $(this).find("#sortText").text(" \u25C0");
                } else if ($(this).hasClass("noSort")){
                    $(this).toggleClass("noSort sortAsc");
                    $(this).find("#sortText").text(" \u25C0");
                }
                that.rowSort($(this).text());
            }).css("cursor", "pointer");
        }
            
        i++;
        row = $("#r" + i);
    }
//  Add sorting by instance names (default);
    $("#r" + 0 + " .td_abstract").append('<div id=sortText style="display:inline"> \u25C0</div>');
    $("#r" + 0 + " .td_abstract").addClass('sortAsc');
    $("#r" + 0 + " .td_abstract").click(function(){
        if($(this).hasClass("sortAsc")){
            $(this).toggleClass("sortAsc sortDesc");
            $(this).find("#sortText").text(" \u25B6");
        } else if ($(this).hasClass("sortDesc")){
            $(this).toggleClass("sortDesc sortAsc");
            $(this).find("#sortText").text(" \u25C0");
        } else if ($(this).hasClass("noSort")){
            $(this).toggleClass("noSort sortAsc");
            $(this).find("#sortText").text(" \u25C0");
        }
        that.rowSort($(this).text());
    }).css("cursor", "pointer");

// add handler to search bar
    that = this;
    $('#search').keyup(function(){
        that.scrollToSearch($(this).val());
    }); 
    $('#search').click(function(event){
        event.stopPropagation(); //to keep table from sorting by instance number
    });

    //fire the scroll handler to align table after half a second (fixes chrome bug)
    setTimeout(function(){$('#mdComparisonTable .window-content').scroll()},500);
    this.filter.filterContent();
});


ComparisonTable.method("getContent", function()
{
    return this.content;
});


//input: node in clafer tree, level in tree
//output: object with unique clafer id, id for display and, display id with indentation
ComparisonTable.method("collector", function(clafer, spaceCount)
{
	var unit = new Object();
	unit.claferId = clafer.claferId;
	unit.displayId = clafer.displayId;

	unit.displayWithMargins = unit.displayId;
	
	for (var i = 0; i < spaceCount; i++)
		unit.displayWithMargins = " " + unit.displayWithMargins;

	abstractClaferOutput.push(unit);
});

//Traverses clafer tree to and runs collector on every node
ComparisonTable.method("traverse", function(clafer, level)
{
	this.collector (clafer, level);
	for (var i = 0; i < clafer.subclafers.length; i++)
	{
		this.traverse(clafer.subclafers[i], level + 1);
	}
});

//generate data table
ComparisonTable.method("getDataTable", function()
{
	var instanceCount = this.instanceProcessor.getInstanceCount();
	var instanceSuperClafer = this.instanceProcessor.getInstanceSuperClafer();
//	alert(instanceSuperClafer);
	var abstractClaferTree = this.processor.getAbstractClaferTree("/Module/Declaration/UniqueId", instanceSuperClafer);
    var EMfeatures = this.processor.getEffectivelyMandatoryFeatures(abstractClaferTree)
//    console.log(abstractClaferTree)	;
//	alert(abstractClaferTree.subclafers[0].subclafers.length);
	
//	alert(instanceSuperClafer);

	
	var parent = null;
	var current = abstractClaferTree;
	abstractClaferOutput = new Array();

	this.traverse(current, 0);
	output = abstractClaferOutput;
	


    var goalNames = this.processor.getGoals();
    var result = new DataTable();   
    result.title = output[0].displayWithMargins;
    
    for (var j = 1; j <= instanceCount; j++)
    {
        result.products.push(String(j));
    }
	
	for (var i = 0; i < output.length; i++)
	{
        var currentMatrixRow = new Array();
        var currentContextRow = new Array();
        if (i > 0){ // do not push the parent clafer
            result.features.push(output[i].displayWithMargins + " " + this.processor.getIfMandatory(output[i].claferId));
            currentContextRow.push(output[i].displayWithMargins + " " + this.processor.getIfMandatory(output[i].claferId));
            var featureIsEM = (EMfeatures.indexOf(output[i].displayId) != -1);
        }
        else 
            currentContextRow.push(output[i].displayWithMargins);

        denyAddContextRow = false;
        
		for (var j = 1; j <= instanceCount; j++)
		{
			if (i == 0)
            {
				currentContextRow.push(String(j));
            }
			else
			{
				sVal = this.instanceProcessor.getFeatureValue(j, output[i].claferId, false);
				currentMatrixRow.push(sVal);
                if (sVal == "yes")
                    currentContextRow.push("X");
                else if (sVal == "-")
                    currentContextRow.push("");
                else
                    denyAddContextRow = true;
			}
		}
		
        if (i > 0)
            result.matrix.push(currentMatrixRow);
            
        if (!denyAddContextRow)
            result.formalContext.push(currentContextRow);
            result.EMcontext.push(featureIsEM);


	}
    console.log(result)
	return result;

});

//change row from tansparent to opaque or vice-versa
ComparisonTable.method("toggleRow", function(row, isOn)
{
    if (!isOn)
    {
        $(row).fadeTo('slow', 0.3);    
    }
    else
    {
        $(row).fadeTo('slow', 1);
    }
});

/*toggle all rows containing either all ticks, all bars, or rows that are effectively mandatory
  between transparent and opaque*/
ComparisonTable.method("toggleDistinct", function()
{
    this.toggled = !this.toggled;
    if (!this.toggled)
    {
        var table = $("#comparison table");
        $("#toggle_link").html("Distinct");
        
        var rows = table.find("tr");
        for (var i = 0; i < rows.length; i++)
        {
            this.toggleRow(rows[i], true);
        }
    }
    else
    {
        $("#toggle_link").html("Normal");

        var table = $("#comparison");
        
        var row = table.find("#r1");
        var i = 1;
        while (row.length != 0)
        {
            var instanceTds = row.find(".td_instance");

            var allAreTheSame = true;
            var last = "";

/*  loop iterates through cells until it has crossed an entire row without finding 
    a difference (non-distinct) or it finds a difference (distinct). It will also 
    break if it finds that the row is an effectively mandatory row (non-distinct)*/

            for (var j = 0; j < instanceTds.length; j++)
            {
                if ($(instanceTds[j]).css("display") == "none"){ //case for filtered out elements that are hidden
                    //do nothing
                }
                else if ($(instanceTds[j]).hasClass("tick"))
                {
                    if (last == "" || last == "tick")
                        last = "tick";
                    else {allAreTheSame = false; break;}
                }   
                else if ($(instanceTds[j]).hasClass("no"))
                {
                    if (last == "" || last == "no")
                        last = "no";
                    else {allAreTheSame = false; break;}
                }
                else if ($(instanceTds[j]).hasClass("EffectMan")){
                    allAreTheSame = true; break;
                }
                else {allAreTheSame = false; break;}
            }
            
//  toggles based on outcome of loop
            if (allAreTheSame)
            {
                this.toggleRow(row, false);
            }
            
            i++;
            row = table.find("#r" + i);
        }
    }
//  since the table height has potentially changed we call this to realign the headers. 
    this.scrollToSearch($("#search").val());
    return true;
});


//makes instance red on graph, for actual selection function see onSelected(pid) in selector.js
ComparisonTable.method("makePointsSelected", function (pid){;
    $("#mdComparisonTable #th0_" + pid.substring(1)).find("text").css("fill", "Red");
});

//makes instance red on graph, for actual deselection function see onDeselected(pid) in selector.js
ComparisonTable.method("makePointsDeselected", function (pid){
    $("#mdComparisonTable #th0_" + pid.substring(1)).find("text").css("fill", "Black");
});

ComparisonTable.method("scrollToSearch", function (input){
    //method name is from before. doesn't actually scroll... hides rows not containing input.
    //You can search multiple strings by seperating them with a space or comma (or both)
    var searchStrings = input.split(/[,\s]{1,}/g);
    var iteratedRow = 0;
    while (iteratedRow <= $("#comparison #tBody tbody").children().length){
        var found = false;
        for (var i = 0; i<searchStrings.length; i++){
            if ($("#comparison #tBody #r" + iteratedRow).text().toLowerCase().indexOf(searchStrings[i].toLowerCase()) != -1)
                found = true;
        }
        if (found)
            $("#comparison #tBody #r" + iteratedRow).removeClass("searchOmitted");
        else
            $("#comparison #tBody #r" + iteratedRow).addClass("searchOmitted");;
        iteratedRow++;
    }
    $('#mdComparisonTable .window-content').scroll();
});

// sorts instances in comparison table by either Instance numbers or quality values
// gets passed the text of the row clicked
ComparisonTable.method("rowSort", function(rowText){
    var i=0;
    var row = $("#comparison #r" + i);
    while (row.length != 0){
        //finds the correct row
        if (row.find(".numeric").length != 0 || i==0){
            var current = $(row).find(".td_abstract");
            if ($(current).text() == rowText){
                //gets cells of row and pairs them with their values
                var instances = row.find(".td_instance");
                var sortableArray = [];
                for(var j=0; j<instances.length; j++){
                    sortableArray.push({ instance: $(instances[j]).attr("id"), value: $(instances[j]).text()} );
                }
                //checks what kind of sort is applied
                if($(current).hasClass("sortDesc")){ //sort instances by descending value
                    sortableArray.sort(function(a,b){
                        return a.value - b.value;
                    });
                }
                else if($(current).hasClass("sortAsc")){
                    sortableArray.sort(function(a,b){ //sort instances by ascending value
                        return b.value - a.value
                    });
                }
                //replace all cells in the new order
                while(sortableArray.length){
                    current = sortableArray.pop().instance;
                    current = current.replace(/[^_]{1,}/, "");
                    //headers
                    $("#comparison #th0" + current).appendTo("#comparison #r0");
                    //body
                    j = 1;
                    row = $("#comparison #r" + j);
                    while (row.length != 0){
                        $("#comparison #td" + (j-1) + current).appendTo(row);
                        j++;
                        row = $("#comparison #r" + j);
                    }

                }

            } else { //remove and sorting from other rows
                current.find("#sortText").text("  ");
                current.removeClass("sortAsc sortDesc");
                current.addClass("noSort");
            }
        }
        i++;
        row = $("#comparison #r" + i);
    }
});

ComparisonTable.method("getInitContent", function()
{
	return '';	   
});