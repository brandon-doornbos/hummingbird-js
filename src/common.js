import { renderer, Renderer } from './renderer.js';
import { camera } from './camera.js';
import { Texture } from './texture.js';
import { initMathObjects, Vec2, Mat4 } from './math.js';

const version = "v0.5.43";
let noUpdate = false;
let deltaTime = 0;
let accumulator = 0;
let fixedUpdateFrequency = 50;
let frames = 0;
let prevTime = 0;
const mousePosition = { x: 0, y: 0 };
const mousePositionFree = { x: 0, y: 0 };
let mouseIsPressed = false;
const buttonsPressed = {};
const keysPressed = {};
let canvas = undefined;
let gl = undefined;

function HBsetup() {
	console.log("Hummingbird "+version+" by SantaClausNL. https://www.santaclausnl.ga/");
	const loading = document.createElement('p');
	loading.innerText = "LOADING...";
	loading.style = "margin: 0; position: absolute; top: 50%; left: 50%; font-size: 7em; transform: translate(-50%, -50%); font-family: Arial, Helvetica, sans-serif;";
	document.body.appendChild(loading);

	initMathObjects();
	if(typeof setup === 'function') setup();

	Texture.init(loading);
}

function init(width = 100, height = 100, options = {}) {
	if(options.noUpdate === true) noUpdate = true;
	if(options.canvas === undefined) {
		canvas = document.createElement("CANVAS"), gl = canvas.getContext('webgl');
		if(options.parent === undefined) document.body.appendChild(canvas); else options.parent.appendChild(canvas);
	} else canvas = options.canvas, gl = canvas.getContext('webgl');

	if(gl === null) {
		canvas.parentNode.removeChild(canvas);
		const p = document.createElement('p');
		p.innerText = 'WebGL is not supported on your browser or machine.';
		if(options.parent === undefined) document.body.appendChild(p); else options.parent.appendChild(p);
	} else {
		canvas.width = width, canvas.height = height;
		canvas.size = Vec2.new(canvas.width, canvas.height);
		canvas.center = Vec2.new(canvas.width/2, canvas.height/2);
		canvas.id = (options.id === undefined) ? "HummingbirdCanvas" : options.id;
		canvas.setAttribute('alt', 'Hummingbird canvas element.');

		Renderer.init();
	}

	window.addEventListener('keydown', (event) => {
		keysPressed[event.key.toLowerCase()] = true;
		if(typeof keyPressed === 'function') keyPressed(event);
	});
	window.addEventListener('keyup', (event) => {
		keysPressed[event.key.toLowerCase()] = false;
		if(typeof keyReleased === 'function') keyReleased(event);
	});
	window.addEventListener('mousemove', (event) => {
		const rect = canvas.getBoundingClientRect();
		Vec2.set(mousePosition,
			event.clientX-((canvas.clientWidth-canvas.width)*0.5+HB.canvas.clientLeft+rect.left),
			event.clientY-((canvas.clientHeight-canvas.height)*0.5+HB.canvas.clientTop+rect.top)
		);
		Vec2.copy(mousePositionFree, mousePosition);
		Vec2.constrain(mousePosition, 0, canvas.width, 0, canvas.height);
		if(typeof mouseMoved === 'function') mouseMoved(event);
	});
	window.addEventListener('mousedown', (event) => {
		mouseIsPressed = true;
		buttonsPressed[event.button] = true;
		if(typeof mousePressed === 'function') mousePressed(event);
	});
	window.addEventListener('mouseup', (event) => {
		mouseIsPressed = false;
		buttonsPressed[event.button] = false;
		if(typeof mouseReleased === 'function') mouseReleased(event);
	});
	if(typeof windowResized === 'function') {
		window.addEventListener('resize', (event) => {
			windowResized(event);
		});
	}
	window.addEventListener('beforeunload', () => {
		renderer.delete();
		// delete gl;
		canvas.remove();
	});
}

function resizeCanvas(width = 100, height = 100) {
	canvas.width = width, canvas.height = height;
	Vec2.set(canvas.size, canvas.width, canvas.height);
	Vec2.set(canvas.center, canvas.width/2, canvas.height/2);
	gl.viewport(0, 0, canvas.width, canvas.height);
	Mat4.orthographic(camera.projectionMatrix, 0, canvas.width, 0, canvas.height);
}

let start = () => {
	start = () => {
		requestAnimationFrame(HBupdate);
		start = undefined;
	}
	if(noUpdate === false) start();
}

function HBupdate(now) {
	deltaTime = now-prevTime;
	prevTime = now;

	camera.setMVP();
	renderer.startBatch();

	if(typeof fixedUpdate === 'function') {
		accumulator += deltaTime;
		while(accumulator >= 1000/fixedUpdateFrequency) {
			if(deltaTime > 1000) {
				accumulator = 0;
				deltaTime = 1;
				fixedUpdate();
				break;
			}
			fixedUpdate();
			accumulator -= 1000/fixedUpdateFrequency;
		}
	}

	if(typeof update === 'function') update();

	renderer.endBatch();
	frames++;
	requestAnimationFrame(HBupdate);
}

window.addEventListener("load", HBsetup);

export { version, noUpdate, deltaTime, accumulator, fixedUpdateFrequency, frames, prevTime, mousePosition, mousePositionFree, mouseIsPressed, buttonsPressed, keysPressed, canvas, gl, HBsetup as setup, init, start, resizeCanvas, HBupdate as update };