var watson = require('watson-developer-cloud');
var fs = require('fs');
var config = require("../config/config.js");

module.exports.visualRecognition = function visualRecognition(req, res, next) {

  res.setHeader("Content-Type", "application/json");
  var visual_recognition = watson.visual_recognition({
    username: config.visualrecognition.username,
    password: config.visualrecognition.password,
    version: 'v1-beta'
  });

  if(!fs.existsSync("./.tmp")) {
    fs.mkdirSync("./.tmp");
  }

  var image = req.swagger.params.image.value;
  var base64Data = image.substring(image.indexOf(',')+1);
  var filePath = "./.tmp/output.png";
  // fs.writeFileSync(filePath, file.buffer);

  // console.log("Before writing file..............................................");
  fs.writeFileSync(filePath, base64Data, 'base64');

  var params = {
    // From file
    image_file: fs.createReadStream(filePath)
  };

  console.log("Recognition started...");

  visual_recognition.recognize(params, function(error, response) {
    if (error) {
      console.log("Error : " + JSON.stringify(error));
      res.statsuCode = 500;
      res.end("Failed to recognize the image.");
    }
    else {
      console.log(JSON.stringify(response));
      //fs.unlinkSync(filePath);
      //fs.rmdirSync("./.tmp");
      res.statusCode = 200;
      res.end(JSON.stringify(response));
    }
  });
}
