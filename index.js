const express = require('express');
const exec = require('child_process').exec;
var app = express();
var bodyParser = require('body-parser');
var escapeString = require('escape-string-regexp');

//var saveCodeCommand = 'tee ../pythonJudge/files/trial.py <<< ';
//var cmnd = 'docker run -i -v /home/sherif/Documents/dockerstuff/pythonJudge/files/:/app pythonjudge01 python /app/trial.py | tee ../pythonJudge/output.out';
//var cmdgetfile = 'cat ./submissions/output.out';

/*app.post('/submit', function(req, res) {

})*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*app.get('/', function(req, res) {
	console.log('Starting to execute function');
	exec(cmnd, (error, stdout, stderr) => {
		if (error) {
			console.log('error');
			return;
		}
		console.log('executed python file');
		//console.log(`stdout: ${stdout}`);
		exec(cmdgetfile, (error, stdout, stderr) => {
			console.log(`${stdout}`);
		})
	})
	res.send('done');
})*/

/*function escapeChsars(str) {
  //return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  return escapeString(str);
}*/

var escapeChars = function(str) {
	/*var result = "";
	if (str == undefined) return "";
	for(var i = 0; i < str.length; i++) {
		if (str[i] == '\n') {
			result += '\\\n';
		}
		else if (str[i] == '\"') {
			result += '\\\"';
		} else {
			result += str[i];
		}
	}
	return result;*/
	console.log("[escapeChars] string before " + str);
	str = str.replace(/\"[^\"]*\"/g, function myFunction(x) {
		console.log('replacing ' + x);
		return x.replace(/\\n/g, "\\\\\\n");
	});
	//str = str.replace(/\"/g, "\\\"");
	//str = str.replace(/\\n/g, "\\\\\\n");
	str = str.replace(/\n/g, "\\n");
	console.log("[escapeChars] " + str);
	return str;
}

var generateCodeCommand = function(codeString) {
	console.log(__dirname);
	return 'mkdir -p submissions; printf \"' + escapeChars(codeString) + '\" > ' + __dirname + '/submissions/submittedcode.py';
}

var generateDockerCommand = function(inputString) {
	var result = "";
	result = 'docker run -i --network none -v ' + __dirname + '/submissions:/app pythonjudge01 /bin/bash -c \"';
	if (inputString != undefined && inputString.length > 0) result += ' printf \\\"' + inputString + '\\\" | ';
	result += ' python submittedcode.py > output.out; cat output.out\"'
	return result;
}
app.post('/submit', function(req, res) {
	var code = req.body.code;
	var inputStr = req.body.inputstdin;
	console.log(escapeChars("hey\nhey"));
	//code = escapeChars(code);
	//code.replace(/"/g, '\\\"');
	var finalOutput = "nil";
	console.log(code);
	var saveCodeCmd = generateCodeCommand(code);
	var dockerCommand = generateDockerCommand(inputStr);
	console.log(`${saveCodeCmd}`);
	console.log(`${dockerCommand}`);
	exec(saveCodeCmd, function(error, stdout, stderr) {
		if (error) {
			console.log(`${error}`);
			res.json({outputCode : "", stderr : `${error}`});
			return;
		}
		exec(dockerCommand, (error, stdout, stderr) => {
		if (error) {
			console.log(`${error}`);
			res.json({outputCode : "", stderr : `${error}`});
			return;
		}
		console.log('executed python file');
		console.log(`${stdout}`);
		console.log('stderr: ' + `${stderr}`);
		finalOutput = `${stdout}`;
		//finalOutput = escapeChars(finalOutput);
		console.log('finalOutput: ' + finalOutput);
		res.setHeader('Access-Control-Allow-Origin','*');
		res.json({outputCode : finalOutput, stderr : `${stderr}`});
		//console.log(`stdout: ${stdout}`);
		/*exec(cmdgetfile, (error, stdout, stderr) => {
			console.log(`${stdout}`);
			finalOutput = `${stdout}`;
			//finalOutput = escapeChars(finalOutput);
			console.log('finalOutput: ' + finalOutput);
			res.setHeader('Access-Control-Allow-Origin','*');
			res.json({outputCode : finalOutput});
		})*/
	})
	})
	
})



app.listen(3260, function() {
	console.log('app listening to 3260');
})