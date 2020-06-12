import { gl, canvas } from './common.js';
import { shader } from './shader.js';
import { Vec3, Mat4 } from './math.js';

let camera = undefined;

class Camera{
	constructor() {
		gl.viewport(0, 0, canvas.width, canvas.height);

		this.MVP = Mat4.new();
		this.projectionMatrix = Mat4.new();
		Mat4.orthographic(this.projectionMatrix, 0, canvas.width, 0, canvas.height, -1, 1);
		// Mat4.perspective(this.projectionMatrix);

		this.viewMatrix = Mat4.new(1);
		// this.modelMatrix = Mat4.new(1);
	}

	static init() {
		camera = new Camera();
	}

	setMVP(mvp = undefined) {
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

	translate(vector3) { Mat4.translate(this.viewMatrix, this.viewMatrix, vector3); }
	zoom(amount) {
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-canvas.center.x, -canvas.center.y));
		Mat4.scale(this.viewMatrix, this.viewMatrix, 1+amount);
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(canvas.center.x, canvas.center.y));
	}
	rotate(angle) {
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-canvas.center.x, -canvas.center.y));
		Mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(canvas.center.x, canvas.center.y));
	}
}

export { Camera, camera };