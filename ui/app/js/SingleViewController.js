  var IMAGE_UPLOAD_URL = baseURL + '/visual_recognition';
  var SPEECH_UPLOAD_URL = baseURL + '/speech_to_text';
 var TEXT_UPLOAD_URL = baseURL + '/text_to_speech';
  App.controller('SingleViewController', ['$rootScope', '$scope', '$http', '$state',
      function($rootScope, $scope, $http, $state) {
          $scope.recordedInput = "";
          $scope.uploadSnapshot = function() {

              // make array for multiple snapshots file
              $scope.snapshot = {
                  name: "image",
                  data: $scope.image
              };
              uploadFileToUrl($scope.snapshot, IMAGE_UPLOAD_URL).success(function(response) {
                      console.log("successfully uploaded snapshot:-", response);
                  })
                  .error(function(response) {
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
				  $scope.sentAudioPlayer.src = window.URL.createObjectURL($scope.recordedInput);
				  //$scope.sentAudioPlayer.play();
				  console.log("$scope.sentAudioPlayer",$scope.sentAudioPlayer);
                  var speech = {
                      name: "audio",
                      data: $scope.recordedInput
                  };
                  uploadFileToUrl(speech, SPEECH_UPLOAD_URL).success(function(response) {
					  $scope.RecivedTextFromAudio = response;
					  var keywords = response.split(" ");
					  console.log("keyword",keywords);
				  if( (response.indexOf("camera") !=-1)  || (response.indexOf("picture") !=-1) || (response.indexOf("photo") !=-1) || (response.indexOf("selfie") !=-1)) 
						  if( (response.indexOf("open") !=-1) || response.indexOf("take") !=-1)
						  {
							//  $rootScope.capturePicture();
							  console.log("capturing image");
						  }
						  else{
							//$rootScope.capturePicture();
							}
							$rootScope.capturePicture();
					  console.log("Text Recognized:-",response);

                      })
                      .error(function(response) {
                          console.log("error recognizing text:-",response);
                      });
              };

          }
		  
		  

          function uploadFileToUrl(file, uploadUrl) {
              console.log("file", file);
              console.log("uploadUrl", uploadUrl);
              var fd = new FormData();
              fd.append(file.name, file.data);

              //fd.append('apk', addLogoFile);
              //fd.append('snapshot', addSnapshotFile);
              console.log("fd", fd);
              return $http.post(uploadUrl, fd, {
                  transformRequest: angular.identity,
                  headers: {
                      'Content-Type': undefined
                  }
              });
          }

		
		$rootScope.onImageCapture = function(img){
			var file = {
				name : "image",
				data : img
			};
			uploadFileToUrl(file,IMAGE_UPLOAD_URL).success(function(response) {
				var labels = [];
						if(response.images[0].labels)
							 labels = response.images[0].labels;
				  else 
					  labels = [{"label_name":"recognization failed.no text recived","label_score":"0.0"}];
						$scope.recogenizedLabels = labels;
					  var speech = "";
					  labels.forEach(function(label){
						  speech  =speech+" "+label.label_name;
					  });
					   $scope.getSpeechFromText(speech);
					  console.log("image uploaded succesfullt:-",response,speech);

                      })
                      .error(function(response) {
                          console.log("error uploading image:-",response);
                      });;
		};
		
		
		
  $scope.getSpeechFromText = function( text )
  {
	  var file = { 
	  name : "text" ,
	  data  : text
	  };
	  uploadFileToUrl(file,TEXT_UPLOAD_URL).success(function(response) {
						
				
					  console.log("text sent succesfullt:-",response);

                      })
                      .error(function(response) {
                          console.log("error sending text:-",response);
                      });;
  };
		
		
		$scope.sentAudioPlayer = $("#sentAudio");
		
		
		
      }
  ]);
  

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