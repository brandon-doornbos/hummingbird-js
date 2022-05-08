import { gl, canvas } from './common.js';
import { shader } from './shader.js';
import { vec3, mat4 } from 'gl-matrix';

/**
 * Holds the MVP matrix and methods to manipulate it.
 */
export class Camera {
	constructor() {
		// this.modelMatrix = mat4.create();
		this.viewMatrix = mat4.create();
		this.projectionMatrix = mat4.create();
		this.MVP = mat4.create();

		this.resize(canvas.width, canvas.height);
	}

	/**
	 * Resize the viewport.
	 * @param {number} width=canvas.width
	 * @param {number} height=canvas.height
	 */
	resize(width = this.width, height = this.height) {
		this.width = width, this.height = height;
		gl.viewport(0, 0, width, height);
		mat4.ortho(this.projectionMatrix, 0, width, height, 0, -1, 1);
	}

	/**
	 * Set the ModelViewProjection matrix in the shader.
	 * @param {glMatrix.mat4} mvp - Optional to use instead of the default.
	 */
	setMVP(mvp) {
		if (!mvp) {
			// mat4.multiply(this.MVP, this.viewMatrix, this.modelMatrix);
			mat4.multiply(this.MVP, this.projectionMatrix, this.viewMatrix);
			shader.setUniformMatrix('f', 'uMVP', this.MVP);
		} else {
			shader.setUniformMatrix('f', 'uMVP', mvp);
		}
	}

	/**
	 * Translate the camera.
	 * @param {glMatrix.vec3} vector3 - 3D Vector to move by.
	 */
	translate(vector3) {
		mat4.translate(this.viewMatrix, this.viewMatrix, vector3);
	}
	/**
	 * Zoom the camera from its center.
	 * @param {number} amount - Amount to zoom by (in the order of 0.05), negative values to zoom out.
	 */
	zoom(amount) {
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(this.width * 0.5, this.height * 0.5, 0));
		mat4.scale(this.viewMatrix, this.viewMatrix, vec3.fromValues(1 + amount, 1 + amount, 1 + amount));
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(-this.width * 0.5, -this.height * 0.5, 0));
	}
	/**
	 * Rotate the camera around its center.
	 * @param {number} angle - Amount to rotate by (clockwise) in radians.
	 */
	rotate(angle) {
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(this.width * 0.5, this.height * 0.5, 0));
		mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
		mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(-this.width * 0.5, -this.height * 0.5, 0));
	}
}
