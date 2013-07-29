var publicOk = true;

function hasGetUserMedia() {
	// Note: Opera is unprefixed.
	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
}
if (hasGetUserMedia()) {
	//
} else {
	alert('getUserMedia() is not supported in your browser');
}
window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
// audio
var onSuccess = function(s) {
		var context = new webkitAudioContext();
		var mediaStreamSource = context.createMediaStreamSource(s);
		recorder = new Recorder(mediaStreamSource);
		setTimeout(recorder.record(), 500);
		
		// audio loopback
		// mediaStreamSource.connect(context.destination);
		setTimeout(function() {
			stopRecording();
		}, 1000);
	};
var onFailSoHard = function(e) {
		console.log('Reeeejected!', e);
	};
var video = document.querySelector('video');
var recorder;
var audio = document.querySelector('audio');

function shoot() {
	if (navigator.getUserMedia) {
		navigator.getUserMedia({
			video: true
		}, function(stream) {
			video.src = window.URL.createObjectURL(stream);
		}, onFailSoHard);
	} else {
		video.src = 'somevideo.webm'; // fallback.
	}
}
shoot();
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var localMediaStream = null;
ctx.translate(320, 0);
ctx.scale(-1, 1);
var upload_image, upload_audio;

function snapshot() {
	ctx.drawImage(video, 30, 0, 320, 240);
	// "image/webp" works in Chrome 18. In other browsers, this will fall back to image/png.
	upload_image = canvas.toDataURL('image/png');
	document.querySelector('img').src = upload_image;
}

function startRecording() {
	if (navigator.getUserMedia) {
		navigator.getUserMedia({
			audio: true
		}, onSuccess, onFailSoHard);
	} else {
		console.log('navigator.getUserMedia not present');
	}
}

function stopRecording() {
	recorder.stop();
	recorder.exportWAV(function(s) {
		var URL = self.URL || self.webkitURL || self;
		var object_url = URL.createObjectURL(s);
		audio.src = object_url;
		exportToBase64(s);
	});
	console.log('stopped recording');
}

function exportToBase64(a) {
	console.log(a);
	var reader = new FileReader();
	reader.readAsDataURL(a);
	reader.onloadend = function() {
		console.log(this.result);
		upload_audio = this.result;
	};
	reader.onerror = function() {
		console.log('An error occurred while reading a file.');
	};
}
/// final upload

function uploadFile() {
	socket.emit('file upload', {
		image: upload_image,
		audio: upload_audio,
		publicOk: publicOk
	});
}
// check with mongo
socket.on('image upload success', function(data) {
	console.log(data.msg + ", URL: " + data.imgurl);
});
socket.on('audio upload success', function(data) {
	console.log(data.msg + ", URL: " + data.audiourl);
});
// control------------------------------------------------------------------
/// Press Spacebar to shoot
$(document).keypress(function(e) {
	if (e.which == 32) {
		e.preventDefault();
		snapshot();
		video.pause();
		video.src = "";
		// hide video, show result
		$('#video').css({
			'display': 'none'
		});
		$('#result').fadeIn();
		$('.infoShoot').fadeOut();
		$('#retake').fadeIn();
		$('#satisfied').fadeIn();
	}
});
/// Retake 
$('#retake').click(function() {
	$('#retake').fadeOut();
	shoot();
	$('.infoShoot').fadeIn();
	$('#result').fadeIn();
	$('#video').fadeIn();
});
$('#satisfied').click(function() {
	$('#takeVid').hide();
	$('#recAudio').show();
	// audio fn
	startRecording();
});
// upload
$('#publicPic').click(function() {
	publicOk = false;
});
$('#privatePic').click(function() {
	publicOk = true;
});
$('#upload').click(function() {
	uploadFile();
});