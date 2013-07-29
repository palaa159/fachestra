var scrWidth = window.innerWidth,
	scrHeight = window.innerHeight,
	faceSize = scrWidth/6;
$('#canvas').attr('width', faceSize);
$('#canvas').attr('height', faceSize);
var canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d");
window.onload = function() {
	bodyChange();
};
var faceData;
var faceArray = [];
var facePixel8Array = [];
socket.emit('req data');
socket.on('req result', function(data) {
	faceData = data;
	console.log(faceData);
	$.each(faceData, function(index, value){
		$.ajax({
			url: 'https://singyourface.s3.amazonaws.com/audio/' + value.id + '.wav',
			success: function() {
				console.log('sound preloaded, let us push the pixel');
				}
	});
	});
	// display facedata
	$.each(faceData, function(index, value) {
		console.log(index);
		// preload sound
				$('#faceForClone').clone().attr('title', value.publicOk).attr('id', 'f' + value.id).attr('src', 'https://singyourface.s3.amazonaws.com/images/' + value.id + '.png').appendTo('#faceGrid');
				// push pixel
				pushPixel(value.id);
				// bind mouseover
				$('#f' + value.id).mouseover(function() {
					$('#canvas').css({
						'top': $('#f' + value.id).position().top,
						'left': $('#f' + value.id).position().left
					});
					$('#canvas').show();
				});
		});
	});
	
// push pixel

function pushPixel(x) {
	var imageObj = new Image();
	imageObj.crossOrigin = "Anonymous";
	imageObj.onload = function() {
		var sourceWidth = faceSize;
		var sourceHeight = faceSize;
		var destX = 0;
		var destY = 0;
		context.drawImage(imageObj, destX, destY, sourceWidth, sourceHeight);
		var imageData = context.getImageData(0,0,sourceWidth, sourceHeight);
		/* console.log(imageData.data); */
	};
	imageObj.src = 'https://s3.amazonaws.com/singyourface/images/' + x + '.png';
}
// pixelation
var pixelation = 60;
var rawImgData;
var pixelArray = [];

// Resizing handler

function bodyChange() {
	$('body').css({
		'width': scrWidth,
		'height': scrHeight
	});
	$('#canvas').attr('width', faceSize);
	$('#canvas').attr('height', faceSize);
	$('.oneFace').animate({
		'width': faceSize,
		'height': faceSize
	}, 50);
} /* window.addEventListener('resize', onResize, false); */

function onResize() {
	scrWidth = window.innerWidth, scrHeight = window.innerHeight;
	faceSize = scrWidth / 8;
	bodyChange();
}