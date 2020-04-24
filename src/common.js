import { Renderer } from './renderer.js';
import { camera } from './camera.js';
import { batch } from './batch.js';
import { Texture } from './texture.js';
import { Math, Vec2, Mat4 } from './math.js';

const version = "v0.5.5";
let noUpdate = false;
let deltaTime = 0;
let accumulator = 0;
let fixedUpdateFrequency = 50;
let frames = 0;
let prevTime = 0;
const mousePos = {x: 0, y: 0};
let mouseIsPressed = false;
const keysPressed = {};
let canvas = undefined;
//let mode = 'webgl2';
let gl = undefined;

function HBsetup() {
	console.log("Hummingbird "+version+" by SantaClausNL. https://www.santaclausnl.ga/");
	const loading = document.createElement('p');
	loading.innerText = "LOADING...";
	loading.style = "margin: 0; position: absolute; top: 50%; left: 50%; font-size: 7em; transform: translate(-50%, -50%); font-family: Arial, Helvetica, sans-serif;";
	document.body.appendChild(loading);

	new Math();
	if(typeof setup === 'function') setup();

	Texture.init(loading);
}

function init(width = 100, height = 100, options) {
	if(options === undefined) options = {};
	if(options["noUpdate"] === true) noUpdate = true;
	if(options["canvas"] === undefined) {
		canvas = document.createElement("CANVAS"), gl = canvas.getContext('webgl2');
		if(options["parent"] === undefined) document.body.appendChild(canvas); else options["parent"].appendChild(canvas);
	} else canvas = options["canvas"], gl = canvas.getContext('webgl2');

	// if(gl === null) {
	// 	canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
	// 	mode = 'webgl';
	// }

	// if(gl === null) {
	// 	canvas.getContext('webgl');
	// 	mode = 'webgl';
	// }

	if(gl === null) {
		canvas.parentNode.removeChild(canvas);
		const p = document.createElement('p');
		p.innerText = 'WebGL2 is not supported on your browser or machine.';
		if(options["parent"] === undefined) document.body.appendChild(p); else options["parent"].appendChild(p);
	} else {
		canvas.width = width, canvas.height = height;
		canvas.size = Vec2.new(canvas.width, canvas.height);
		canvas.center = Vec2.new(canvas.width/2, canvas.height/2);
		canvas.id = (options["id"] === undefined) ? "HummingbirdCanvas" : options["id"];
		canvas.setAttribute('alt', 'Hummingbird canvas element.');

		Renderer.init();
	}

	window.addEventListener('keydown', (event) => {
		keysPressed[event.keyCode] = true;
		if(typeof keyPressed === 'function') keyPressed(event);
	});
	window.addEventListener('keyup', (event) => {
		keysPressed[event.keyCode] = false;
		if(typeof keyReleased === 'function') keyReleased(event);
	});
	window.addEventListener('mousemove', (event) => {
		const rect = canvas.getBoundingClientRect();
		Vec2.set(mousePos,
			event.clientX-rect.left-document.body.scrollLeft,
			event.clientY-rect.top-document.body.scrollTop
		);
		if(typeof mouseMoved === 'function') mouseMoved(event);
	});
	window.addEventListener('mousedown', (event) => {
		mouseIsPressed = true;
		if(typeof mousePressed === 'function') mousePressed(event);
	});
	window.addEventListener('mouseup', (event) => {
		mouseIsPressed = false;
		if(typeof mouseReleased === 'function') mouseReleased(event);
	});
	if(typeof windowResized === 'function') {
		window.addEventListener('resize', (event) => {
			windowResized(event);
		});
	}
	// window.addEventListener('beforeunload', () => {
	// 	renderer.delete();
	// 	delete gl;
	// 	canvas.remove();
	// });
}

function resizeCanvas(width = 100, height = 100) {
	canvas.width = width, canvas.height = height;
	Vec2.set(canvas.size, canvas.width, canvas.height);
	Vec2.set(canvas.center, canvas.width/2, canvas.height/2);
	gl.viewport(0, 0, canvas.width, canvas.height);
	Mat4.orthographic(camera.projectionMatrix, 0, canvas.width, 0, canvas.height);
}

function HBupdate(now) {
	deltaTime = now-prevTime;
	prevTime = now;

	camera.setMVP();
	batch.begin();

	if(typeof fixedUpdate === 'function') {
		accumulator += deltaTime;
		while(accumulator >= 1000/fixedUpdateFrequency) {
			fixedUpdate();
			accumulator -= 1000/fixedUpdateFrequency;
		}
	}

	update();

	batch.end();
	frames++;
	requestAnimationFrame(HBupdate);
}

window.addEventListener("load", HBsetup);

export { version, noUpdate, deltaTime, accumulator, fixedUpdateFrequency, frames, prevTime, mousePos, mouseIsPressed, keysPressed, canvas, gl, HBsetup as setup, init, resizeCanvas, HBupdate as update };