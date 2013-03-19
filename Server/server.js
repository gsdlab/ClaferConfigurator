var http = require("http");
var url = require("url");
var sys = require("sys");
var fs = require("fs");
var path = require('path');
var express = require('express');

processes = [];

var port = 5003;

var toolpath = __dirname + "/claferIG/claferIG"

var server = express();
server.use(express.cookieParser('asasdhf89adfhj0dfjask'));
server.use(express.static(__dirname + '/Client'));
server.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/uploads' }));

server.get('/', function(req, res) {
	res.sendfile("Client/app.html");
});

server.post('/close', function(req, res){
	closeProcess(req.body.windowKey)
});

server.post('/uploads', function(req, res){
	closeProcess(req.body.windowKey)
	var resEnded = false;
	if (req.files.claferFile === undefined){
		res.send("no clafer file submitted");
	} else {
		var upFilePath = req.files.claferFile.path;
	}

	//make temp folder for files and move file there
	var i = 0;
	while(fs.existsSync("./uploads/" + i + "tempfolder/")){
		i++;
	}
	var pathTokens = "." + upFilePath.split("Server")[1];
	pathTokens = pathTokens.split("/");
	var oldPath = upFilePath
	var upFilePath = __dirname + "/" + pathTokens[1] + "/" + i + "tempfolder/";
	fs.mkdir(upFilePath, function (err){
		if (err) throw err;
		var dlDir = upFilePath;
		upFilePath += pathTokens[2];
		console.log("moving file from" + oldPath + " to " + upFilePath);
		fs.rename(oldPath, upFilePath, function (err){
			if (err) throw err;
			console.log("proceeding with " + upFilePath)
			var util  = require('util');
			spawn = require('child_process').spawn;
			var d = new Date();
			var obj = { windowKey: req.body.windowKey, tool: null, freshData: "", folder: dlDir, lastUsed: d};
			tool = spawn("claferIG", [upFilePath , "--bitwidth=" + req.body.bitwidth], { stdio: ["pipe", "pipe", process.stderr, "pipe", "pipe"]});
			obj.tool = tool;
			processes.push(obj);
			tool.stdout.on("data", function (data){
				for (var i = 0; i<processes.length; i++){
//					console.log(processes.length)
//					console.log(i);
//					console.log("stuck in post loop")
					if (processes[i].windowKey == req.body.windowKey){
						processes[i].freshData += data
						if (!resEnded){
							resEnded = true;
							res.writeHead(200, { "Content-Type": "text/html"});
							res.end(data);
							processes[i].freshData = '';
							processes[i].tool.stdout.removeAllListeners("data");
						}
					}
				}
			});
		});
	});
});

server.get('/Control', function(req, res){
//	console.log("got control get")
	var resEnd = false;
	for (var y = 0; y<this.processes.length; y++){
		if (processes[y].windowKey == req.query.windowKey){
			var d = new Date();
			processes[y].lastUsed = d;
			var CurProcess = processes[y];
			if (req.query.operation == "next"){
				CurProcess.tool.stdin.write("n\n", function(){
					CurProcess.tool.stdout.on("data", function (data){
						if (!resEnd){	
							res.writeHead(200, { "Content-Type": "text/html"});
							res.end(data);
							resEnded = true;
						}
						CurProcess.tool.stdout.removeAllListeners("data");
					});	
				});
				break;
			} else if (req.query.operation == "scope"){
				CurProcess.tool.stdin.write("i\n", function(){
					CurProcess.tool.stdout.on("data", function (data){
						if (!resEnd){	
							res.writeHead(200, { "Content-Type": "text/html"});
							res.end(data);
							resEnded = true;
						}
						CurProcess.tool.stdout.removeAllListeners("data");
					});	
				});
				break;
			}

		}
	}
});

function closeProcess(Key){
	for (var y = 0; y<this.processes.length; y++){
		console.log(processes[y].windowKe + " // " + Key)
		if (processes[y].windowKey == Key){
			console.log("closing process");
			var toDelete = processes[y];
			toDelete.tool.removeAllListeners("exit");
			toDelete.tool.stdin.write("q\n");
			cleanupOldFiles(toDelete.folder);
			processes.splice(y, 1);
		}
	}
}

function finishCleanup(dir, results){
	if (fs.existsSync(dir)){
		fs.rmdir(dir, function (err) {
  			if (err) throw err;
 			console.log("successfully deleted " + dir + " along with contents:\n" + results);
		});
	}
}
 
function cleanupOldFiles(dir) {

	//cleanup old files
	fs.readdir(dir, function(err, files){
		if (err) throw err;
		var results = "";
		var numFiles = files.length;
		console.log("#files = " + numFiles);
		if (!numFiles){
			return finishCleanup(dir, results);
		} else {
			files.forEach(function(file){
				deleteOld(dir + "/" + file);
				results += file + "\n";
			});	
			finishCleanup(dir, results);
		}
	});


//done cleanup
}

function deleteOld(path){
	if (fs.existsSync(path)){
		fs.unlink(path, function (err) {
			if (err) throw err;
		});
	}
}

function ProcessCleaner(){
	var Cleaner = setInterval(function(){
		for (var i = 0; i<processes.length; i++){
			var d = new Date();
			if((d-processes[i].lastUsed)>600000){
				closeProcess(processes[i].windowKey);
			}
		}
	}, 600000);
}

/*
 * Catch all. error reporting for unknown routes
 */
server.use(function(req, res, next){
  res.send(404, "Sorry can't find that!");
});

server.listen(port);
console.log('ClaferConfigurator listening on port ' + port);
ProcessCleaner();

var getkeys = function(obj){
		var keys = [];
		for(var key in obj){
			keys.push(key);
		}
		return keys;
}
