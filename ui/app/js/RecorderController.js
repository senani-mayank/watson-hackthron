App.controller('RecorderController', ['$rootScope', '$scope', '$http','$state',
  function($rootScope, $scope, $http, $state) {

(function(window) {
  var client = new BinaryClient('ws://localhost:9111');

  client.on('open', function() {
    window.Stream = client.createStream();

    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio:true}, success, function(e) {
        alert('Error capturing audio.');
      });
    } else alert('getUserMedia not supported in this browser.');

    var recording = false;

   $scope.startRecording = function() {
	   alert("starting");
      recording = true;
    }

   $scope.stopRecording = function() {
	   alert("stopped");
      recording = false;
      window.Stream.end();
    }

    function success(e) {
		console.log(e);
      audioContext = (window.AudioContext || 
window.webkitAudioContext || 
window.mozAudioContext || 
window.oAudioContext || 
window.msAudioContext);
console.log("audioContext",audioContext);
      context = new audioContext();

      // the sample rate is in context.sampleRate
      audioInput = context.createMediaStreamSource(e);

      var bufferSize = 2048;
      recorder = context.createScriptProcessor(bufferSize, 1, 1);

      recorder.onaudioprocess = function(e){
        if(!recording) return;
        console.log ('recording');
        var left = e.inputBuffer.getChannelData(0);
        window.Stream.write(convertoFloat32ToInt16(left));
      }

      audioInput.connect(recorder)
      recorder.connect(context.destination); 
    }

    function convertoFloat32ToInt16(buffer) {
      var l = buffer.length;
      var buf = new Int16Array(l)

      while (l--) {
        buf[l] = buffer[l]*0xFFFF;    //convert to 16 bit
      }
      return buf.buffer
    }
  });
})(this);
 }
]);