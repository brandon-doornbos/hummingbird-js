import { gl, canvas } from './common.js';
import { shader } from './shader.js';
import { /*Math, */Vec3, Mat4 } from './math.js';

let camera = undefined;

class Camera{
	constructor() {
		gl.viewport(0, 0, canvas.width, canvas.height);

		this.projectionMatrix = Mat4.new(1);
		Mat4.orthographic(this.projectionMatrix, 0, canvas.width, 0, canvas.height, -1, 1);
		// Mat4.perspective(this.projectionMatrix, Math.radians(60));
		this.viewMatrix = Mat4.new(1);
		this.modelMatrix = Mat4.new(1);
	}

	static init() {
		camera = new Camera();
	}

	setMVP(mvp = undefined) {
		if(mvp === undefined) {
			const modelView = Mat4.new(1);
			Mat4.multMat4(modelView, this.modelMatrix, this.viewMatrix);
			mvp = Mat4.new(1);
			Mat4.multMat4(mvp, modelView, this.projectionMatrix);
		}
		shader.bind();
		shader.setUniformMatrix('f', 'uMVP', mvp);
	}

	translate(vector3) { Mat4.translate(this.viewMatrix, this.viewMatrix, vector3); }
	zoom(amount) {
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-canvas.center[0], -canvas.center[1]));
		Mat4.scale(this.viewMatrix, this.viewMatrix, amount);
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(canvas.center[0], canvas.center[1]));
	}
	rotate(angle) {
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(-canvas.center[0], -canvas.center[1]));
		Mat4.rotateZ(this.viewMatrix, this.viewMatrix, angle);
		Mat4.translate(this.viewMatrix, this.viewMatrix, Vec3.new(canvas.center[0], canvas.center[1]));
	}
}

export { Camera, camera };