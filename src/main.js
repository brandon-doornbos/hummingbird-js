window.addEventListener("load", HummingbirdSetup);
let HummingbirdCanvas, gl;
const Hummingbird = {
	version: "v0.0.69",
	noUpdate: false,
	toLoad: 0,
	loadTimeout: 5000,
	frames: 0,
	prevTime: 0,
	mouse: [0, 0],
	mouseIsPressed: false,
	renderer: undefined,
	textures: [],
};

function HummingbirdSetup() {
	console.log("Hummingbird "+Hummingbird.version+" by SantaClausNL. https://www.santaclausnl.ga/");

	if(typeof preload === 'function') {
		preload();
		const loading = document.createTextNode("LOADING...");
		document.body.appendChild(loading);
		if(Hummingbird.toLoad <= 0) Continue(); else {
			let elapsedLoading = 0;
			const loadingLoop = setInterval(() => {
				if(Hummingbird.toLoad <= 0 || elapsedLoading >= Hummingbird.loadTimeout) {
					if(elapsedLoading >= Hummingbird.loadTimeout) console.warn("Failed to load assets.");
					clearInterval(loadingLoop);
					loading.remove();
					Continue();
				} else elapsedLoading += 25;
			}, 25);
		}
	} else Continue();

	function Continue() {
		if(typeof setup === 'function') setup();
		if(typeof update === 'function' && Hummingbird.noUpdate !== true) requestAnimationFrame(HummingbirdUpdate);
	}
}

function init(width_, height_, options) {
	if(!defined(options)) options = {};
	if(options["noUpdate"] === true) Hummingbird.noUpdate = true;
	if(defined(options["canvas"])) {
		HummingbirdCanvas = options["canvas"], gl = HummingbirdCanvas.getContext('webgl2');
	} else {
		HummingbirdCanvas = document.createElement("CANVAS"), gl = HummingbirdCanvas.getContext('webgl2');
		if(defined(options["parent"])) options["parent"].appendChild(HummingbirdCanvas); else document.body.appendChild(HummingbirdCanvas);
	}
	if(gl === null) {
		HummingbirdCanvas.parentNode.removeChild(HummingbirdCanvas);
		const p = document.createElement('p');
		p.innerText = 'WebGL2 is not supported on your browser or machine.';
		if(defined(options["parent"])) options["parent"].appendChild(p); else document.body.appendChild(p);
	} else {
		HummingbirdCanvas.width = width_ || 100, HummingbirdCanvas.height = height_ || 100;
		HummingbirdCanvas.id = defined(options["id"]) ? options["id"] : "HummingbirdCanvas";

		Hummingbird.renderer = new Renderer();
	}

	if(typeof keyPressed === 'function') window.addEventListener('keydown', (e) => { keyPressed(e); });
	if(typeof keyReleased === 'function') window.addEventListener('keyup', (e) => { keyReleased(e); });
	window.addEventListener('mousemove', (e) => { Hummingbird.mouse = getMousePos(e); if(typeof mouseMoved === 'function') mouseMoved(e); });
	window.addEventListener('mousedown', (e) => { Hummingbird.mouseIsPressed = true; if(typeof mousePressed === 'function') mousePressed(e); });
	window.addEventListener('mouseup', (e) => { Hummingbird.mouseIsPressed = false; if(typeof mouseReleased === 'function') mouseReleased(e); });
	window.addEventListener('beforeunload', () => {
		Hummingbird.textures.forEach((texture) => { texture.delete(); });
		Hummingbird.renderer.delete();
	});
}

function resizeWindow(width_, height_) {
	HummingbirdCanvas.width = width_, HummingbirdCanvas.height = height_;
	gl.viewport(0, 0, width_, height_);
	projectionMatrix = Mat4.orthographic(0, HummingbirdCanvas.width, 0, HummingbirdCanvas.heigh, -100, 100);
}

function HummingbirdUpdate(now) {
	const deltaTime = now-Hummingbird.prevTime;
	Hummingbird.prevTime = now;
	update(deltaTime);
	Hummingbird.frames++;
	requestAnimationFrame(HummingbirdUpdate);
}