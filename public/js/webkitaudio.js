const PATH = '/avsys/snd/', SOUNDS = ['kick', 'hhclosed', 'tom', 'snare'];
var myAudioContext, myAudioAnalyser, myBuffers = {},
	mySource, myNodes = {},
	mySpectrum, isPlaying = false;

function initSound() {
	if ('webkitAudioContext' in window) {
		myAudioContext = new webkitAudioContext();
		// an analyser is used for the spectrum
		myAudioAnalyser = myAudioContext.createAnalyser();
		myAudioAnalyser.smoothingTimeConstant = 0.85;
		myAudioAnalyser.connect(myAudioContext.destination);
		fetchSounds();
	}
}

function fetchSounds() {
	var request = new XMLHttpRequest();
	for (var i = 0, len = SOUNDS.length; i < len; i++) {
		request = new XMLHttpRequest();
		// the underscore prefix is a common naming convention
		// to remind us that the variable is developer-supplied
		request._soundName = SOUNDS[i];
		request.open('GET', PATH + request._soundName + '.mp3', true);
		request.responseType = 'arraybuffer';
		request.addEventListener('load', bufferSound, false);
		request.send();
	}
}

function bufferSound(event) {
	var request = event.target;
	var buffer = myAudioContext.createBuffer(request.response, false);
	myBuffers[request._soundName] = buffer;
}

function selectBuffer(x) {
	var soundName = SOUNDS[x];
	return myBuffers[soundName];
}

function routeSound(source) {
	myNodes.filter = myAudioContext.createBiquadFilter();
	myNodes.panner = myAudioContext.createPanner();
	myNodes.volume = myAudioContext.createGainNode();
	myNodes.volume.gain = 1;
	myNodes.filter.type = 1; // highpass
	// pass source through series of nodes
	source.connect(myNodes.filter);
	myNodes.filter.connect(myNodes.panner);
	myNodes.panner.connect(myNodes.volume);
	myNodes.volume.connect(myAudioAnalyser);
	return source;
}

function playSound(x) {
	// create a new AudioBufferSourceNode
	var source = myAudioContext.createBufferSource();
	source.buffer = selectBuffer(x);
	source.loop = false;
	source = routeSound(source);
	// play right now (0 seconds from now)
	// can also pass myAudioContext.currentTime
	source.noteOn(0);
	mySource = source;
}

function pauseSound() {
	var source = mySource;
	source.noteOff(0);
}