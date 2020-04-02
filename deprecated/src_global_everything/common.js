window.addEventListener("load", HummingbirdSetup);
let HBCanvas, gl;
let renderer, batch, camera, shader;
const HB = {
	version: "v0.1.20",
	noUpdate: false,
	toLoad: 0,
	loadTimeout: 5000,
	frames: 0,
	prevTime: 0,
	mousePos: [0, 0],
	mouseIsPressed: false,
	keysPressed: {}
};

function HummingbirdSetup() {
	console.log("Hummingbird "+HB.version+" by SantaClausNL. https://www.santaclausnl.ga/");

	if(typeof preload === 'function') {
		preload();
		const loading = document.createTextNode("LOADING...");
		document.body.appendChild(loading);
		if(HB.toLoad <= 0) Continue(); else {
			let elapsedLoading = 0;
			const loadingLoop = setInterval(() => {
				if(HB.toLoad <= 0 || elapsedLoading >= HB.loadTimeout) {
					if(elapsedLoading >= HB.loadTimeout) console.warn("Failed to load assets.");
					clearInterval(loadingLoop);
					loading.remove();
					Continue();
				} else elapsedLoading += 25;
			}, 25);
		}
	} else Continue();

	function Continue() {
		if(typeof setup === 'function') setup();
		if(typeof update === 'function' && HB.noUpdate !== true) requestAnimationFrame(HummingbirdUpdate);
	}
}

function init(width_, height_, options) {
	if(options === undefined) options = {};
	if(options["noUpdate"] === true) HB.noUpdate = true;
	if(options["canvas"] === undefined) {
		HBCanvas = document.createElement("CANVAS"), gl = HBCanvas.getContext('webgl2');
		if(options["parent"] === undefined) document.body.appendChild(HBCanvas); else options["parent"].appendChild(HBCanvas);
	} else HBCanvas = options["canvas"], gl = HBCanvas.getContext('webgl2');

	if(gl === null) {
		HBCanvas.parentNode.removeChild(HBCanvas);
		const p = document.createElement('p');
		p.innerText = 'WebGL2 is not supported on your browser or machine.';
		if(options["parent"] === undefined) document.body.appendChild(p); else options["parent"].appendChild(p);
	} else {
		HBCanvas.width = width_ || 100, HBCanvas.height = height_ || 100;
		HBCanvas.id = (options["id"] === undefined) ? "HBCanvas" : options["id"];

		renderer = new Renderer();
	}

	window.addEventListener('keydown', (e) => {
		HB.keysPressed[e.keyCode] = true;
		if(typeof keyPressed === 'function') keyPressed(e);
	});
	window.addEventListener('keyup', (e) => {
		HB.keysPressed[e.keyCode] = false;
		if(typeof keyReleased === 'function') keyReleased(e);
	});
	window.addEventListener('mousemove', (e) => {
		HB.mousePos = getMousePos(e);
		if(typeof mouseMoved === 'function') mouseMoved(e);
	});
	window.addEventListener('mousedown', (e) => {
		HB.mouseIsPressed = true;
		if(typeof mousePressed === 'function') mousePressed(e);
	});
	window.addEventListener('mouseup', (e) => {
		HB.mouseIsPressed = false;
		if(typeof mouseReleased === 'function') mouseReleased(e);
	});
	window.addEventListener('beforeunload', () => {
		renderer.delete();
	});
}

function resizeWindow(width_, height_) {
	HBCanvas.width = width_ || 100, HBCanvas.height = height_ || 100;
	gl.viewport(0, 0, HBCanvas.width, HBCanvas.height);
	camera.projectionMatrix = Mat4.orthographic(0, HBCanvas.width, 0, HBCanvas.height, -1, 1);
}

function HummingbirdUpdate(now) {
	const deltaTime = now-HB.prevTime;
	HB.prevTime = now;
	camera.setMVP();
	update(deltaTime);
	HB.frames++;
	requestAnimationFrame(HummingbirdUpdate);
}