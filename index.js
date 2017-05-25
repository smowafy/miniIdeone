const express = require('express');
const exec = require('child_process').exec;
var app = express();
var bodyParser = require('body-parser');
var escapeString = require('escape-string-regexp');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var escapeChars = function(str) {
	//console.log("[escapeChars] string before " + str);
	str = str.replace(/\"[^\"]*\"/g, function myFunction(x) {
		//console.log('replacing ' + x);
		return x.replace(/\\n/g, "\\\\\\n");
	});
	str = str.replace(/\n/g, "\\n");
	//console.log("[escapeChars] " + str);
	return str;
}

var generateCodeCommand = function(codeString) {
	//console.log(__dirname);
	return 'mkdir -p submissions; printf \"' + escapeChars(codeString) + '\" > ' + __dirname + '/submissions/submittedcode.py';
}

var generateDockerCommand = function(inputString) {
	var result = "";
	result = 'docker run -i --network none -v ' + __dirname + '/submissions:/app pythoncontainer /bin/bash -c \"';
	if (inputString != undefined && inputString.length > 0) result += ' printf \\\"' + inputString + '\\\" | ';
	result += ' python app/submittedcode.py > output.out; cat output.out\"'
	return result;
}
app.post('/submit', function(req, res) {
	var code = req.body.code;
	var inputStr = req.body.inputstdin;
	var finalOutput = "nil";
	var saveCodeCmd = generateCodeCommand(code);
	var dockerCommand = generateDockerCommand(inputStr);
	//console.log(`${saveCodeCmd}`);
	//console.log(`${dockerCommand}`);
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
		//console.log('finalOutput: ' + finalOutput);
		res.setHeader('Access-Control-Allow-Origin','*');
		res.json({outputCode : finalOutput, stderr : `${stderr}`});
	})
	})
	
})



app.listen(3260, function() {
	console.log('app listening to 3260');
})