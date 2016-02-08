window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
//context.createBufferSource();
var IMAGE_UPLOAD_URL = baseURL + '/visual_recognition';
var SPEECH_UPLOAD_URL = baseURL + '/speech_to_text';
var TEXT_UPLOAD_URL = baseURL + '/text_to_speech';
var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

App.controller('SingleViewController', ['$rootScope', '$scope', '$http', '$state', function($rootScope, $scope, $http, $state) {
    $scope.recordedInput = "";
	var snd = "";
    $scope.uploadSnapshot = function() {
        $scope.snapshot = {
            name: "image",
            data: $scope.image
        };
        uploadFileToUrl($scope.snapshot, IMAGE_UPLOAD_URL, {}).success(function(response) {
            console.log("successfully uploaded snapshot:-", response);
        }).error(function(response) {
            console.log("error uploading snapshot:-", response);
        });
    }
    $scope.onRecordComplete = function(count) {
        if (count == 3)
            return;
        if (($scope.recordedInput == null) || ($scope.recordedInput == undefined)) {
            setTimeout(function() {
                $scope.onRecordComplete(++count);
            }, 1000);
        } else {
			
			var sendRecordedData = function(data)
			{
					var speech = {
						"name": "audio",
						"data": data
					};		

				uploadFileToUrl(speech, SPEECH_UPLOAD_URL, {}).success(function(response) {
					$scope.RecivedTextFromAudio = response;
					var keywords = response.split(" ");
					console.log("keyword", keywords);
					if ((response.indexOf("camera") != -1) || (response.indexOf("picture") != -1) || (response.indexOf("photo") != -1) || (response.indexOf("selfie") != -1))
						if ((response.indexOf("open") != -1) || response.indexOf("take") != -1) {
							console.log("capturing image");
						} else {}
					$rootScope.capturePicture();
					console.log("Text Recognized:-", response);
				}).error(function(response) {
					console.log("error recognizing text:-", response);
				});
				
			};

			
				var reader = new window.FileReader();
				 reader.readAsDataURL($scope.recordedInput); 
				 reader.onloadend = function() {
								sendRecordedData(reader.result);

				  };
			
			

			
			


        };
    }

    function uploadFileToUrl(file, uploadUrl, headers) {
        console.log("uploadUrl\n", uploadUrl);
        headers['Content-Type'] = undefined;


		
		
		
		//getData(file.data);
  /* var fs = new CoFS();

    fs.readFile(file, function (err, data) {

        if (err) {
			console.log("err:-",err);
			return "";
            //return errHandler(err);
        }
		console.log("data",data);
        var fd = new FormData();

        fd.append('attachment', new Blob(data));
        fd.append('uuid', uuid);
        fd.append('userRoleId', userRole);

        console.log("Data of file:" + data.toString('base64'));
        // Send fd...
		        return $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: headers
        });

    });		
		*/
		
        var fd = new FormData();
        fd.append(file.name, file.data);
        console.log("fd", fd);
        return $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: headers
        });
    }
    $rootScope.onImageCapture = function(img) {
        var file = {
            name: "image",
            data: img
        };
        uploadFileToUrl(file, IMAGE_UPLOAD_URL, {}).success(function(response) {
            console.log("image uploaded succesfullt:-", response, speech);
            var labels = [];
            if (response.images[0].labels)
                labels = response.images[0].labels;
            else
                labels = [{
                    "label_name": "recognization failed.no text recived",
                    "label_score": "0.0"
                }];
            $scope.recogenizedLabels = labels;
            var speech = "The Image Captured Likely contains:-";
            var len = 5;
            if (labels.length < 5)
                len = labels.length;
            for (var i = 0; i < len; i++)
                speech = speech + " " + labels[i].label_name + ".\n";
            console.log("sending text:-", speech);
            $scope.getSpeechFromText(speech);
        }).error(function(response) {
            console.log("error uploading image:-", response);
        });;
    };
    $scope.getSpeechFromText = function(text) {
        var headers = {
            "Response-Type": "arraybuffer"
        };
        $scope.speechTextSent = text;
        var file = {
            name: "text",
            data: text
        };
        uploadFileToUrl(file, TEXT_UPLOAD_URL, headers).success(function(response) {
            //$scope.recivedSpeech = response;
			snd = new Audio("data:audio/wav;base64," + response);
            $scope.playRecivedSpeech();
        }).error(function(response) {
            console.log("error sending text:-", response);
        });;
    };
    $scope.playRecivedSpeech = function() {
        snd.play();
    };
	
	
	
	
	 //uploadFileToUrl(file, IMAGE_UPLOAD_URL, {})
	/*
function  uploadFileToUrl (files, url, config) {
    config = config || {};
    files = angular.isArray(files) ? files : [files];

    config.transformRequest = angular.identity;
    config.headers = config.headers || {};
    config.headers['Content-Type'] = undefined;

    return fileAppender(files).then(function (formData) {

      return $http.post(url, formData, config);
    }, repeatRejection);
  };	
	
	
	
function fileAppenderFactory ($q, $window, $log, safeApply) {

  var mimetypes = {
    // only for example
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png'
  };

  return function (files, formData) {
    formData = formData || new FormData();

    var fileID = 0;
    return $q.all(files.map(function (fileUri) {

      return addFile(formData, fileUri, 'file' + fileID++);
    })).then(function () {

      return formData;
    }, function (reason) {

      return $q.reject(reason);
    })
  };

  function addFile(form, fileUri, key) {
    $log.debug('Add file: %s', fileUri);
    var deferred = $q.defer();

    $window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
      fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function (fileReadResult) {
          var data = new Uint8Array(fileReadResult.target.result);
          var blob = createBlob(data, file.type || getMimeType(file.name));
          form.append(key, blob, file.name);

          safeApply(function () {
            deferred.resolve();
          });
        };

        reader.onerror = function (fileReadResult) {

          safeApply(function () {
            deferred.reject(fileReadResult);
          });
        };
        reader.readAsArrayBuffer(file);
      });
    });

    return deferred.promise;
  }

  function createBlob(data, type) {
    var r;
    try {
      r = new $window.Blob([data], {type: type});
    }
    catch (e) {
      // TypeError old chrome and FF
      $window.BlobBuilder = $window.BlobBuilder ||
      $window.WebKitBlobBuilder ||
      $window.MozBlobBuilder ||
      $window.MSBlobBuilder;
      // consider to use crosswalk for android

      if (e.name === 'TypeError' && window.BlobBuilder) {
        var bb = new BlobBuilder();
        bb.append([data.buffer]);
        r = bb.getBlob(type);
      }
      else if (e.name == "InvalidStateError") {
        // InvalidStateError (tested on FF13 WinXP)
        r = new $window.Blob([data.buffer], {type: type});
      }
      else {
        throw e;
      }
    }

    return r;
  }

  function getMimeType(fileName) {
    var extension = fileName.split('.').pop();

    return mimetypes.hasOwnProperty(extension) ?
      mimetypes[extension] : undefined;
  }
}	
	
	
	*/
	
	
	
	
	
	
	
	
	
	
}]);
App.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            console.log("model", model);
            console.log("modelSetter", modelSetter);
            element.bind('change', function() {
                scope.$apply(function() {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);









/*
var fd = new FormData();
     window.resolveLocalFileSystemURL(attachment.img, function(fileEntry) {
         fileEntry.file(function(file) {
             var reader = new FileReader();
                 reader.onloadend = function(e) {
                      var imgBlob = new Blob([ this.result ], { type: "image/jpeg" } );
                      fd.append('attachment', imgBlob);
                      fd.append('uuid', attachment.uuid);
                      fd.append('userRoleId', 12345);
                      console.log(fd);
                      //post form call here
                 };
                 reader.readAsArrayBuffer(file);

         }, function(e){$scope.errorHandler(e)});
    }, function(e){$scope.errorHandler(e)});*/
	
	
	function getData(audioFile, callback) {
    var reader = new FileReader();
    reader.readAsBinaryString(audioFile);
   // reader.readAsDataURL(audioFile);
}

function getData(file)
{
	/*var files = new File([file], "filename.txt", {type: "audio/wav", lastModified: new Date()});
	console.log("files",files);
	var blob = new Blob(file.data, { type: 'audio/wav',
                                      endings: 'native' });

	
	console.log(blob);*/
	 var reader = new window.FileReader();
 reader.readAsDataURL(file); 
 reader.onloadend = function() {
                base64data = reader.result;                
                console.log(base64data );
  }
};


