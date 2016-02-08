var cp = require("child_process");
var fs = require('fs');
var config = require("../config/config.js");

module.exports.speechToText = function speechToText(req, res, next) {

  //res.setHeader("Content-Type", "application/json");
  console.log("Conversion started...");

  var audio = req.swagger.params.audio.value;
  var extension = audio.substring(11, audio.indexOf(';'));
  // console.log("Extension : " + extension);
  var base64Data = audio.substring(audio.indexOf(',')+1);

  if(!fs.existsSync("./.tmp")) {
    fs.mkdirSync("./.tmp");
  }
  var filePath = "./.tmp/convert." + extension;
  console.log("Filepath : " + filePath);
  fs.writeFileSync(filePath, base64Data, 'base64');
  var curlCommand = 'curl -u ' + config.speechtotext.username + ':' + config.speechtotext.password + ' -k -X POST --header "Content-Type: audio/wav" --data-binary @' + filePath + ' "https://stream.watsonplatform.net/speech-to-text/api/v1/recognize?continuous=true"';
  cp.exec(curlCommand, function(error, stdout, stderr) {
    //console.log('stdout : ' + stdout);
    //fs.writeFileSync('./resources/transcription.txt', stdout);
    console.log('stderr : ' + stderr);
    if (error !== null) {
      console.log('exec error : ' + error);
      res.statsuCode = 500;
      res.end("Speech to text conversion failed.");
    }
    fs.unlinkSync(filePath);
    //fs.rmdirSync("./.tmp");
    res.statsuCode = 200;
    var alterStr = JSON.parse(stdout).results[0].alternatives;
    var transcript = "";
    for(var i=0; i<alterStr.length; i++) {
      transcript += alterStr[i].transcript;
    }
    res.end(transcript);
    //res.end("Audio file converted and saved in text file.");
  });
}

//curl -u "139e378a-e60d-4f20-aeff-f456678f8882":"UCAR33KRvTrk" -k -X POST --header "Content-Type: audio/wav" --data-binary @test1.wav "https://stream.watsonplatform.net/speech-to-text/api/v1/recognize?continuous=true"
