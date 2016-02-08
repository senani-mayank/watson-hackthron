var cp = require("child_process");
var fs = require('fs');
var config = require("../config/config.js");
var express = require('express');
var app = express();

module.exports.textToSpeech = function textToSpeech(req, res, next) {

  //res.setHeader("Content-Type", "audio/x-wav");
  console.log("Conversion started...");
  var outputPath = "./resources/output.wav";
  console.log(JSON.stringify(req.swagger.params.text.value));

  var data = {
    "text": req.swagger.params.text.value
  }
  var curlCommand = 'curl -u ' + config.texttospeech.username + ':' + config.texttospeech.password + ' -k -X POST --header "Content-Type: application/json" --header "Accept: audio/wav" --data \'' + JSON.stringify(data) + '\' "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize" > ' + outputPath;
  console.log(curlCommand);
  cp.exec(curlCommand, function(error, stdout, stderr) {
    console.log('stderr : ' + stderr);
    if (error !== null) {
      console.log('exec error : ' + error);
      res.statsuCode = 500;
      res.end("Text to speech conversion failed.");
    }
    else {
      // res.writeHead(200, {
      //     'Content-Type': 'audio/wav',
      //     'Content-Disposition': 'attachment; filename=./resources/output.wav'
      // });

      fs.readFile('./resources/output.wav', 'base64', function (err, data) {
        res.end(data);
      });

      // res.statsuCode = 200;
      // res.end("Text converted and saved in audio file.");

      // var file = fs.readFile(outputPath, 'binary');
      // res.setHeader('Content-Type', 'audio/mpeg');
      // res.setHeader('Content-Disposition', 'attachment; filename=output.wav');
      // res.write(file, 'binary');
      // res.end();
    }
  });
}


//curl -u "46deb0ba-91a3-455f-a95a-c70456a93532":"AxBwNPGu6p4i" -k -X POST --header "Content-Type: application/json" --header "Accept: audio/wav" --data "{'text':'hello world'}" "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize" > hello_world.wav
