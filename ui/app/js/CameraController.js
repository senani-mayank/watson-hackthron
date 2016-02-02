
  App.controller('CameraController', ['$rootScope', '$scope', '$http', '$state',
      function($rootScope, $scope, $http, $state) {
	  
	  var video = "";
	  var canvas = "";
	  var constraints = {
			audio: false,
			video: true
		};
	  $scope.LoadCamera = function (){
			  navigator.getUserMedia = navigator.getUserMedia ||
              navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
			  video = document.querySelector('video');
              canvas = document.getElementById("canvas");
			  navigator.getUserMedia(constraints, successCallback, errorCallback);
	  };
	  
		$rootScope.capturePicture = function() {
			alert("press ok to capture");
			canvas.getContext("2d").drawImage(video, 0, 0, 300, 300, 0, 0, 300, 300);
			var img = canvas.toDataURL("image/jpg");
			//console.log("img:-", img);
			$rootScope.onImageCapture(   img  );
			alert("done");
		};

		var successCallback = function (stream) {
			window.stream = stream; // stream available to console
			if (window.URL) {
				video.src = window.URL.createObjectURL(stream);
			} else {
				video.src = stream;
			}
		}
		var errorCallback = function (error) {
			console.log('navigator.getUserMedia error: ', error);
		}
		$scope.LoadCamera();



var dataURItoBlob = function (dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}



	  
	  
  }]);