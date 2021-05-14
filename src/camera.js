import { gl, canvas } from './common.js';
import { shader } from './shader.js';
import { Vec3, Mat4 } from './math.js';

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
class Camera{
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
		this.MVP = Mat4.new();
		/**
		 * (DO NOT USE) Internal variable to keep track of the Projection matrix.
		 * @readonly
		 */
		this.projectionMatrix = Mat4.new();
		Mat4.orthographic(this.projectionMatrix, 0, canvas.width, 0, canvas.height, -1, 1);
		// Mat4.perspective(this.projectionMatrix);

		/**
		 * (DO NOT USE) Internal variable to keep track of the View matrix.
		 * @readonly
		 */
		this.viewMatrix = Mat4.new(1);
		/**
		 * (DO NOT USE) Internal variable to keep track of the Model matrix.
		 * @ignore
		 * @readonly
		 */
		// this.modelMatrix = Mat4.new(1);
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
	 * @param {HB.Mat4} mvp=HB.Camera.MVP - Optional MVP to render with.
	 */
	setMVP(mvp) {
		if(mvp === undefined) {
			// const modelView = Mat4.new(1);
			// Mat4.multMat4(modelView, this.modelMatrix, this.viewMatrix);
			Mat4.multMat4(this.MVP, this.viewMatrix, this.projectionMatrix);
			Mat4.transpose(this.MVP, this.MVP);
			shader.setUniformMatrix('f', 'uMVP', this.MVP);
		} else {
			Mat4.transpose(mvp, mvp);
			shader.setUniformMatrix('f', 'uMVP', mvp);
		}
	}

	/**
	 * Method for translating the camera.
	 * @param {HB.Vec3} vector3 - 3D Vector to move by.
	 */
	translate(vector3) { Mat4.translate(this.viewMatrix, this.viewMatrix, vector3); }
	/**
	 * Method for zooming the camera to the center.
	 * @param {number} amount - Amount to zoom by (in the order of 0.05) negative values to zoom out.
	 */
	zoom(amount) {
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-canvas.center.x, -canvas.center.y));
		Mat4.scale(this.viewMatrix, this.viewMatrix, 1+amount);
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(canvas.center.x, canvas.center.y));
	}
	/**
	 * Method for rotating the camera around the center.
	 * @param {number} angle - Amount to rotate by (clockwise) in radians.
	 */
	rotate(angle) {
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-canvas.center.x, -canvas.center.y));
		Mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(canvas.center.x, canvas.center.y));
	}
}

export { Camera, camera };