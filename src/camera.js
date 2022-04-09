import { gl, canvas } from './common.js';
import { shader } from './shader.js';
import { vec3, mat4 } from 'gl-matrix';

/**
 * Class instance with all camera logic.
 * @type {HB.Camera}
 * @memberof HB
 */
let camera = undefined;

/**
 * Class with all of the camera setup and logic.
 * @readonly
 * @memberof HB
 */
class Camera {
	/**
	 * (DO NOT USE) Internal use by Hummingbird only, all methods are available on {@link HB.camera}.
	 * @constructor
	 * @readonly
	 * @memberof HB
	 */
	constructor() {
		gl.viewport(0, 0, canvas.width, canvas.height);

		/**
		 * (DO NOT USE) Internal variable to keep track of the ModelViewProjection matrix.
		 * @readonly
		 */
		this.MVP = mat4.create();
		/**
		 * (DO NOT USE) Internal variable to keep track of the Projection matrix.
		 * @readonly
		 */
		this.projectionMatrix = mat4.create();
		mat4.ortho(this.projectionMatrix, 0, canvas.width, canvas.height, 0, -1, 1);

		/**
		 * (DO NOT USE) Internal variable to keep track of the View matrix.
		 * @readonly
		 */
		this.viewMatrix = mat4.create();
		/**
		 * (DO NOT USE) Internal variable to keep track of the Model matrix.
		 * @ignore
		 * @readonly
		 */
		// this.modelMatrix = mat4.create();
	}

	/**
	 * (DO NOT USE) Internal method for creating the {@link HB.renderer} instance.
	 * @readonly
	 */
	static init() {
		camera = new Camera();
	}

	/**
	 * Method for setting the ModelViewProjection matrix.
	 * @param {glMatrix.mat4} mvp=HB.Camera.MVP - Optional MVP to render with.
	 */
	setMVP(mvp) {
		if (mvp === undefined) {
			// const modelView = mat4.create();
			// mat4.multiply(modelView, this.viewMatrix, this.modelMatrix);
			mat4.multiply(this.MVP, this.projectionMatrix, this.viewMatrix);
			shader.setUniformMatrix('f', 'uMVP', this.MVP);
		} else {
			shader.setUniformMatrix('f', 'uMVP', mvp);
		}
	}

	/**
	 * Method for translating the camera.
	 * @param {glMatrix.vec3} vector3 - 3D Vector to move by.
	 */
	translate(vector3) {
		mat4.translate(this.viewMatrix, this.viewMatrix, vector3);
	}
	/**
	 * Method for zooming the camera to the center.
	 * @param {number} amount - Amount to zoom by (in the order of 0.05) negative values to zoom out.
	 */
	zoom(amount) {
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(canvas.center[0], canvas.center[1], 0));
		mat4.scale(this.viewMatrix, this.viewMatrix, vec3.fromValues(1 + amount, 1 + amount, 1 + amount));
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(-canvas.center[0], -canvas.center[1], 0));
	}
	/**
	 * Method for rotating the camera around the center.
	 * @param {number} angle - Amount to rotate by (clockwise) in radians.
	 */
	rotate(angle) {
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(canvas.center[0], canvas.center[1], 0));
		mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(-canvas.center[0], -canvas.center[1], 0));
	}
}

export {
	Camera,
	camera
};
