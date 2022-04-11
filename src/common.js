import { renderer, Renderer } from './renderer.js';
import { camera } from './camera.js';
import { initMathObjects, Math as HBMath } from './math.js';
import { vec2, mat4 } from 'gl-matrix';
import { version } from '../package.json';

/**
 * Overwrite this function to access the built in 'setup' function, which is fired after {@link HB.internalSetup} finishes.
 * @type {Function}
 * @memberof HB
 */
let setup = new Function();
/**
 * Overwrite this function to access the built in 'update' function, which is fired at the VSync rate of the user (for drawing).
 * @type {Function}
 * @memberof HB
 */
let update = new Function();
/**
 * Internal variable to keep track of this from {@link HB.init}.
 * @readonly
 * @memberof HB
 */
let noUpdate = false;
/**
 * Internal variable for {@link HB.fixedUpdate}.
 * @readonly
 * @memberof HB
 */
let deltaTime = 0;
/**
 * Internal variable for {@link HB.fixedUpdate}.
 * @readonly
 * @memberof HB
 */
let accumulator = 0;
/**
 * Overwrite this function to access the built in 'fixedUpdate' function, which is fired consistently at the {@link HB.fixedUpdateFrequency} (for physics).
 * @type {Function}
 * @memberof HB
 */
let fixedUpdate = new Function();
/**
 * Variable to set how many times per second {@link HB.fixedUpdate} is called.
 * @memberof HB
 */
let fixedUpdateFrequency = 50;
/**
 * Increments by 1 everytime {@link HB.update} is called.
 * @memberof HB
 */
let frames = 0;
/**
 * Internal variable for {@link HB.fixedUpdate}.
 * @readonly
 * @memberof HB
 */
let prevTime = 0;
/**
 * Overwrite this function to access the 'mousemove' event. MDN{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event}
 * @param {MouseEvent} event
 * @type {Function}
 * @memberof HB
 */
let mouseMoved = new Function();
/**
 * The current mouse position on the canvas (top-left is 0,0; clamp between 0 and {@link HB.canvas.size}).
 * @type {glMatrix.vec2}
 * @memberof HB
 */
const mousePosition = vec2.create();
/**
 * The current mouse position on the page (top-left of canvas is 0,0; unclamped).
 * @type {glMatrix.vec2}
 * @memberof HB
 */
const mousePositionFree = vec2.create();
/**
 * Overwrite this function to access the 'mousedown' event. MDN{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mousedown_event}
 * @param {MouseEvent} event
 * @type {Function}
 * @memberof HB
 */
let mousePressed = new Function();
/**
 * Overwrite this function to access the 'mouseup' event. MDN{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseup_event}
 * @param {MouseEvent} event
 * @type {Function}
 * @memberof HB
 */
let mouseReleased = new Function();
/**
 * true if any or all of the mouse buttons are currently pressed.
 * @readonly
 * @memberof HB
 */
let mouseIsPressed = false;
/**
 * Empty Object that gets populated by a 'button: boolean' combo when that mouse-button is pressed, [MDN Reference]{@link https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button}.
 * @memberof HB
 */
const buttonsPressed = {};
/**
 * Overwrite this function to access the 'keydown' event. MDN{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event}
 * @param {KeyboardEvent} event
 * @type {Function}
 * @memberof HB
 */
let keyPressed = new Function();
/**
 * Overwrite this function to access the 'keyup' event. MDN{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/keyup_event}
 * @param {KeyboardEvent} event
 * @type {Function}
 * @memberof HB
 */
let keyReleased = new Function();
/**
 * Empty Object that gets populated by a 'key: boolean' combo when that key is pressed, [MDN Reference]{@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key}.
 * @memberof HB
 */
const keysPressed = {};
/**
 * Overwrite this function to access the 'resize' event. MDN{@link https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event}
 * @param {UIEvent} event
 * @type {Function}
 * @memberof HB
 */
let windowResized = new Function();
/**
 * Variable that contains the canvas.
 * @readonly
 * @type HTMLCanvasElement
 * @property {glMatrix.vec2} size - 2D Vector with the canvas width and height.
 * @property {glMatrix.vec2} center - 2D Vector with the canvas center.
 * @memberof HB
 */
let canvas = undefined;
/**
 * Variable that contains the canvas context.
 * @readonly
 * @type WebGLRenderingContext
 * @memberof HB
 */
let gl = undefined;

/**
 * (DO NOT USE) DOM element containing the loading text during engine initialization.
 * @readonly
 * @type HTMLElement
 * @memberof HB
 */
let loadElement = document.createElement('p');
/**
   * Function that is used for the 'noUpdate' mechanism, see {@link HB.init}.
   * @readonly
   * @memberof HB
   */
let start = () => {
	start = () => {
		requestAnimationFrame(internalUpdate);
		start = undefined;
		loadElement.remove();
	}
	if (noUpdate === false) start();
}

/**
   * The main setup function of Hummingbird, initializes math objects, gets called on the window 'load' event. When this finishes, {@link HB.setup} is called.
   * @memberof HB
   */
function internalSetup() {
	console.log("Hummingbird " + version + " by Brandon Doornbos. https://www.brandond.nl/");
	loadElement.innerText = "LOADING...";
	loadElement.style = "margin: 0; position: absolute; top: 50%; left: 50%; font-size: 7em; transform: translate(-50%, -50%); font-family: Arial, Helvetica, sans-serif;";
	document.body.appendChild(loadElement);

	initMathObjects();
	HB.setup();

	start();
}

/**
 * This function creates the canvas and webgl canvas context and initializes the renderer and included event handlers.
 * @memberof HB
 * @param {number} width=100 - The width of the created canvas.
 * @param {number} height=100 - The height of the created canvas.
 * @param {Object} options - An object with options for initialization.
 * @param {boolean} options.noUpdate=false - Stops the built in {@link HB.internalUpdate} function from immediately running if true, start the draw loop by calling {@link HB.start}.
 * @param {HTMLCanvasElement} options.canvas - Supply a canvas to which Hummingbird must hook, instead of creating a new one.
 * @param {HTMLElement} options.parent=document.body - Supply a parent element to create our canvas element under.
 * @param {string} options.id=HummingbirdCanvas - The ID of the canvas in the DOM.
 */
function init(width = 100, height = 100, options = {}) {
	if (options.noUpdate === true) noUpdate = true;
	if (options.canvas === undefined) {
		canvas = document.createElement("CANVAS"), gl = canvas.getContext('webgl');
		if (options.parent === undefined) document.body.appendChild(canvas); else options.parent.appendChild(canvas);
	} else canvas = options.canvas, gl = canvas.getContext('webgl');

	if (gl === null) {
		canvas.parentNode.removeChild(canvas);
		const p = document.createElement('p');
		p.innerText = 'WebGL is not supported on your browser or machine.';
		if (options.parent === undefined) document.body.appendChild(p); else options.parent.appendChild(p);
	} else {
		canvas.width = width, canvas.height = height;
		canvas.size = vec2.fromValues(canvas.width, canvas.height);
		canvas.center = vec2.fromValues(canvas.width * 0.5, canvas.height * 0.5);
		canvas.id = (options.id === undefined) ? "HummingbirdCanvas" : options.id;
		canvas.setAttribute('alt', 'Hummingbird canvas element.');

		Renderer.init();
	}

	window.addEventListener('keydown', (event) => {
		keysPressed[event.key.toLowerCase()] = true;
		HB.keyPressed(event);
	});
	window.addEventListener('keyup', (event) => {
		keysPressed[event.key.toLowerCase()] = false;
		HB.keyReleased(event);
	});
	window.addEventListener('mousemove', (event) => {
		const rect = canvas.getBoundingClientRect();
		vec2.set(mousePosition,
			event.clientX - ((canvas.clientWidth - canvas.width) * 0.5 + HB.canvas.clientLeft + rect.left),
			event.clientY - ((canvas.clientHeight - canvas.height) * 0.5 + HB.canvas.clientTop + rect.top)
		);
		vec2.copy(mousePositionFree, mousePosition);
		vec2.set(mousePosition, HBMath.clamp(mousePosition[0], 0, canvas.width), HBMath.clamp(mousePosition[1], 0, canvas.height));
		HB.mouseMoved(event);
	});
	window.addEventListener('mousedown', (event) => {
		mouseIsPressed = true;
		buttonsPressed[event.button] = true;
		HB.mousePressed(event);
	});
	window.addEventListener('mouseup', (event) => {
		mouseIsPressed = false;
		buttonsPressed[event.button] = false;
		HB.mouseReleased(event);
	});
	window.addEventListener('resize', (event) => {
		HB.windowResized(event);
	});
	window.addEventListener('beforeunload', () => {
		renderer.delete();
		// delete gl;
		canvas.remove();
	});
}

/**
 * This function resizes the canvas element and updates this in the rendering backend.
 * @memberof HB
 * @param {number} width=100 - The width to resize the canvas to.
 * @param {number} height=100 - The height to resize the canvas to.
 */
function resizeCanvas(width = 100, height = 100) {
	canvas.width = width, canvas.height = height;
	vec2.set(canvas.size, canvas.width, canvas.height);
	vec2.set(canvas.center, canvas.width / 2, canvas.height / 2);
	gl.viewport(0, 0, canvas.width, canvas.height);
	mat4.ortho(camera.projectionMatrix, 0, canvas.width, canvas.height, 0, -1, 1);
}

/**
 * The main update function of Hummingbird, updates the camera, starts a render batch and calls public update functions ({@link HB.update} and {@link HB.fixedUpdate}).
 * @memberof HB
 */
function internalUpdate(now) {
	deltaTime = now - prevTime;
	prevTime = now;

	camera.setMVP();
	renderer.startBatch();

	accumulator += deltaTime;
	while (accumulator >= 1000 / fixedUpdateFrequency) {
		if (deltaTime > 1000) {
			accumulator = 0;
			deltaTime = 1;
			HB.fixedUpdate();
			break;
		}
		HB.fixedUpdate();
		accumulator -= 1000 / fixedUpdateFrequency;
	}

	HB.update();

	renderer.endBatch();
	frames++;
	requestAnimationFrame(internalUpdate);
}

window.addEventListener("load", internalSetup);

export {
	setup,
	update,
	noUpdate,
	deltaTime,
	accumulator,
	fixedUpdate,
	fixedUpdateFrequency,
	frames,
	prevTime,
	mouseMoved,
	mousePosition,
	mousePositionFree,
	mousePressed,
	mouseReleased,
	mouseIsPressed,
	buttonsPressed,
	keyPressed,
	keyReleased,
	keysPressed,
	canvas,
	gl,
	internalSetup,
	init,
	start,
	windowResized,
	resizeCanvas,
	internalUpdate
};
