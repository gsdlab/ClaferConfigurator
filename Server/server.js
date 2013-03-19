var http = require("http");
var url = require("url");
var sys = require("sys");
var fs = require("fs");
var path = require('path');
var express = require('express');

processes = [];

var port = 5003;

var toolpath = __dirname + "/claferIg/claferIG"

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
		fs.rename(oldPath, upFilePath, function (err){
			if (err) throw err;
			var util  = require('util');
			spawn = require('child_process').spawn;
			var obj = { windowKey: req.body.windowKey, tool: null, freshData: "", folder: dlDir};
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
							res.writeHead(200, { "Content-Type": "text/html"});
							res.end(data);
							resEnded = true;
							processes[i].freshData = '';
							processes[i].tool.stdout.removeAllListeners("data");
						}
					}
				}
			});
			tool.on('exit', function (code){
				for (var i = 0; i<processes.length; i++){
					if (processes[i].windowKey == req.body.windowKey){
						processes.splice(i, 1);
						if (!resEnded){
							console.log("closing process")
							res.writeHead(200, { "Content-Type": "text/html"});
							res.send(code);
							res.end("closing process");
							resEnded = true;
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

closeProcess = function(Key){
	for (var y = 0; y<this.processes.length; y++){
		console.log(y);
		if (processes[y].windowKey == Key){
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

/*
 * Catch all. error reporting for unknown routes
 */
server.use(function(req, res, next){
  res.send(404, "Sorry can't find that!");
});

server.listen(port);
console.log('ClaferConfigurator listening on port ' + port);

var getkeys = function(obj){
		var keys = [];
		for(var key in obj){
			keys.push(key);
		}
		return keys;
}