import { gl } from './common.js';
import { Camera } from "./camera.js";
import { Batch } from "./batch.js";
import { shader, Shader } from "./shader.js";
import { VertexArray, vertexArray, vertexBuffer, indexBuffer } from "./buffer.js";
import { textures } from "./texture.js";

let renderer = undefined;

class Renderer{
	constructor() {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.cullFace(gl.FRONT);
		gl.enable(gl.CULL_FACE);

		Shader.init();
		shader.bind();

		Batch.init();

		VertexArray.init();

		Camera.init();
	}

	static init() {
		renderer = new Renderer();
	}

	clear(color = undefined) {
		if(color !== undefined) gl.clearColor(color.x, color.y, color.z, color.w);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	draw(indexCount) {
		shader.bind();
		vertexArray.bind();

		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
	}

	delete() {
		Object.values(textures).forEach((texture) => { texture.delete(); });
		shader.delete();
		vertexArray.delete();
		vertexBuffer.delete();
		indexBuffer.delete();
	}
}

export { renderer, Renderer };