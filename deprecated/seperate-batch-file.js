import { renderer } from './renderer.js';
import { vertexStride, vertexBuffer, vertices, indexBuffer, indices } from './buffer.js';

const maxVertexCount = 4000;
const maxIndexCount = 6000;

class Batch{
	constructor() {
		this.reset();
	}

	begin() { this.reset(); }
	end() { this.flush(); }

	reset() {
		this.vertexCount = 0;
		this.indexCount = 0;
		this.textureIndex = 1;
		this.textureCache = {};
	}

	pushQuad(x, y, w, h, tex, col, textSize, sx, sy, sw, sh) {
		this.pushArbitraryQuad(
			x, y,
			x+w, y,
			x+w, y+h,
			x, y+h,
			tex, col, textSize,
			sx, sy,
			sw, sh
		)
	}

	pushArbitraryQuad(x0, y0, x1, y1, x2, y2, x3, y3, tex = 0, col = HB.Vec4.one, textSize = 0, sx = 0, sy = 0, sw = 1, sh = 1) {
		if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

		const start = this.vertexCount*vertexStride;
		vertices[start   ] = x0;
		vertices[start+1 ] = y0;
		vertices[start+2 ] = col.x;
		vertices[start+3 ] = col.y;
		vertices[start+4 ] = col.z;
		vertices[start+5 ] = col.w;
		vertices[start+6 ] = sx;
		vertices[start+7 ] = sy;
		vertices[start+8 ] = tex;
		vertices[start+9 ] = textSize;

		vertices[start+10] = x1;
		vertices[start+11] = y1;
		vertices[start+12] = col.x;
		vertices[start+13] = col.y;
		vertices[start+14] = col.z;
		vertices[start+15] = col.w;
		vertices[start+16] = sx+sw;
		vertices[start+17] = sy;
		vertices[start+18] = tex;
		vertices[start+19] = textSize;

		vertices[start+20] = x2;
		vertices[start+21] = y2;
		vertices[start+22] = col.x;
		vertices[start+23] = col.y;
		vertices[start+24] = col.z;
		vertices[start+25] = col.w;
		vertices[start+26] = sx+sw;
		vertices[start+27] = sy+sh;
		vertices[start+28] = tex;
		vertices[start+29] = textSize;

		vertices[start+30] = x3;
		vertices[start+31] = y3;
		vertices[start+32] = col.x;
		vertices[start+33] = col.y;
		vertices[start+34] = col.z;
		vertices[start+35] = col.w;
		vertices[start+36] = sx;
		vertices[start+37] = sy+sh;
		vertices[start+38] = tex;
		vertices[start+39] = textSize;

		indices[this.indexCount  ] = this.vertexCount;
		indices[this.indexCount+1] = this.vertexCount+1;
		indices[this.indexCount+2] = this.vertexCount+2;
		indices[this.indexCount+3] = this.vertexCount+2;
		indices[this.indexCount+4] = this.vertexCount+3;
		indices[this.indexCount+5] = this.vertexCount;

		this.vertexCount += 4, this.indexCount += 6;
	}

	getTextureIndex(texture) {
		let textureIndex = this.textureCache[texture.name];
		if(textureIndex === undefined) {
			if((this.textureIndex + 1) >= 16) this.flush();
			this.textureCache[texture.name] = textureIndex = this.textureIndex;
			texture.bind(this.textureIndex++);
		}
		return textureIndex;
	}

	flush() {
		vertexBuffer.partialWrite(vertices, this.vertexCount*vertexStride);
		indexBuffer.partialWrite(indices, this.indexCount);
		renderer.draw(this.indexCount);
		this.reset();
	}
}

export { Batch, maxVertexCount, maxIndexCount };