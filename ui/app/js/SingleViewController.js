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
            var speech = {
                name: "audio",
                data: $scope.recordedInput
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
    }

    function uploadFileToUrl(file, uploadUrl, headers) {
        console.log("uploadUrl\n", uploadUrl);
        headers['Content-Type'] = undefined;
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