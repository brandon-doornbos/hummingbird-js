import { gl } from './common.js';
import { Camera } from "./camera.js";
import { shader, Shader } from "./shader.js";
import { VertexArray, vertexArray, vertexStride, vertexBuffer, vertices, indexBuffer, indices } from "./buffer.js";
import { textures, font, fontData } from "./texture.js";
import { Vec2 } from './math.js';

let renderer = undefined;

class Renderer{
	constructor() {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.cullFace(gl.FRONT);
		gl.enable(gl.CULL_FACE);

		Shader.init();
		shader.bind();

		this.maxVertexCount = 4000;
		this.maxIndexCount = 6000;

		this.resetBatch();

		VertexArray.init(this.maxVertexCount, this.maxIndexCount);

		Camera.init();
	}

	static init() {
		renderer = new Renderer();
	}

	startBatch() { this.resetBatch(); }
	endBatch() { this.flushBatch(); }

	resetBatch() {
		this.batchedVertexCount = 0;
		this.batchedIndexCount = 0;
		this.batchTextureIndex = 1;
		this.batchTextureCache = {};
	}

	clear(color = undefined) {
		if(color !== undefined) gl.clearColor(color.x, color.y, color.z, color.w);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	colorPoint(pos, size = 1, color) {
		this.flushBatchIfBufferFilled();
		this.drawBatchedQuad(pos.x-size/4, pos.y-size/4, size/2, size/2, 0, color);
	}

	colorPolygon(points, color, center = 0) {
		for(let i = 0; i < points.length-1; i++) {
			if(i === center) continue;

			this.flushBatchIfBufferFilled(3, 3);

			this.drawBatchedTriangle(
				points[center].x, points[center].y,
				points[i].x, points[i].y,
				points[i+1].x, points[i+1].y,
				color
			);
		}
	}

	colorRectangle(pos, size, color) {
		this.flushBatchIfBufferFilled();
		this.drawBatchedQuad(pos.x, pos.y, size.x, size.y, 0, color);
	}

	textureRectangle(pos, size, texture) {
		this.flushBatchIfBufferFilled();
		this.drawBatchedQuad(pos.x, pos.y, size.x, size.y, this.getBatchTextureIndex(texture));
	}

	rotatedColorRectangle(pos, size, angle, color) {
		this.flushBatchIfBufferFilled();
		this.drawRectangleWithRotation(pos, size, angle, 0, color);
	}

	rotatedTextureRectangle(pos, size, angle, texture) {
		this.flushBatchIfBufferFilled();
		this.drawRectangleWithRotation(pos, size, angle, this.getBatchTextureIndex(texture));
	}

	drawRectangleWithRotation(pos, size, angle, texture = 0, color = HB.Vec4.one) {
		angle = HB.Math.radians(angle);
		const cosX = size.x*-0.5*Math.cos(angle), cosY = size.y*-0.5*Math.cos(angle);
		const cosX1 = size.x*0.5*Math.cos(angle), cosY1 = size.y*0.5*Math.cos(angle);
		const sinX = size.x*-0.5*Math.sin(angle), sinY = size.y*-0.5*Math.sin(angle);
		const sinX1 = size.x*0.5*Math.sin(angle), sinY1 = size.y*0.5*Math.sin(angle);

		this.drawArbitraryBatchedQuad(
			cosX-sinY+pos.x+size.x/2, sinX+cosY+pos.y+size.y/2,
			cosX1-sinY+pos.x+size.x/2, sinX1+cosY+pos.y+size.y/2,
			cosX1-sinY1+pos.x+size.x/2, sinX1+cosY1+pos.y+size.y/2,
			cosX-sinY1+pos.x+size.x/2, sinX+cosY1+pos.y+size.y/2,
			texture, color
		);
	}

	colorLine(vectorA, vectorB, thickness, color) {
		const angle0 = Vec2.angleBetweenVec2(vectorA, vectorB);
		const angleA = Vec2.fromAngle(angle0-Math.PI/2, thickness/2);
		const angleB = Vec2.fromAngle(angle0+Math.PI/2, thickness/2);

		this.flushBatchIfBufferFilled();

		this.drawArbitraryBatchedQuad(
			vectorA.x-angleA.x, vectorA.y-angleA.y,
			vectorA.x+angleA.x, vectorA.y+angleA.y,
			vectorB.x-angleB.x, vectorB.y-angleB.y,
			vectorB.x+angleB.x, vectorB.y+angleB.y,
			0, color
		);
	}

	colorEllipse(pos, size, color) {
		this.flushBatchIfBufferFilled();
		this.drawBatchedQuad(pos.x, pos.y, size.x, size.y, this.getBatchTextureIndex(textures.Hummingbird_Circle), color);
	}

	colorText(string, pos, size = 12, align = 'start-start', color) {
		const glyphs = [], kernings = {};
		const scalar = size/fontData.info.size;
		let width = 0;
		const height = fontData.common.lineh*scalar;

		let prevKerns;
		for(let i = 0; i < string.length; i++) {
			const glyph = fontData.chars[string[i]] || fontData.chars['?'];
			width += glyph.xadv*scalar;
			glyphs.push(glyph);

			if(prevKerns !== undefined) {
				const kerning = prevKerns[glyph.id];
				if(kerning !== undefined) {
					width += kerning*scalar;
					kernings[glyph.id] = kerning;
				}
			}
			prevKerns = glyph.kerns;
		}

		let offsetx = 0, offsety = 0;
		const alignTo = align.split('-');
		switch(alignTo[0]) {
			case 'start': break;
			case 'center': offsetx = -width/2; break;
			case 'end': offsetx = -width; break;
		}
		switch(alignTo[1]) {
			case 'start': break;
			case 'center': offsety = -height/2; break;
			case 'end': offsety = -height; break;
		}

		let textureIndex = this.getBatchTextureIndex(font);
		for(let glyph of glyphs) {
			const kerning = kernings[glyph.id];
			if(kerning !== undefined) offsetx += kerning*scalar;

			if(this.flushBatchIfBufferFilled()) textureIndex = this.getBatchTextureIndex(font);

			this.drawBatchedQuad(
				pos.x+glyph.xoff*scalar+offsetx, pos.y+glyph.yoff*scalar+offsety,
				glyph.w*scalar, glyph.h*scalar,
				textureIndex, color, scalar,
				glyph.x/fontData.common.scaleW, glyph.y/fontData.common.scaleH,
				glyph.w/fontData.common.scaleW, glyph.h/fontData.common.scaleH
			);

			offsetx += glyph.xadv*scalar;
		}

		return width;
	}

	drawBatchedTriangle(x1, y1, x2, y2, x3, y3, color) {
		const start = this.batchedVertexCount*vertexStride;
		vertices[start   ] = x1;
		vertices[start+1 ] = y1;
		vertices[start+2 ] = color.x;
		vertices[start+3 ] = color.y;
		vertices[start+4 ] = color.z;
		vertices[start+5 ] = color.w;
		vertices[start+6 ] = 0;
		vertices[start+7 ] = 1;
		vertices[start+8 ] = 0;
		vertices[start+9 ] = 0;

		vertices[start+10] = x2;
		vertices[start+11] = y2;
		vertices[start+12] = color.x;
		vertices[start+13] = color.y;
		vertices[start+14] = color.z;
		vertices[start+15] = color.w;
		vertices[start+16] = 0.5;
		vertices[start+17] = 0.5;
		vertices[start+18] = 0;
		vertices[start+19] = 0;

		vertices[start+20] = x3;
		vertices[start+21] = y3;
		vertices[start+22] = color.x;
		vertices[start+23] = color.y;
		vertices[start+24] = color.z;
		vertices[start+25] = color.w;
		vertices[start+26] = 1;
		vertices[start+27] = 1;
		vertices[start+28] = 0;
		vertices[start+29] = 0;

		indices[this.batchedIndexCount  ] = this.batchedVertexCount;
		indices[this.batchedIndexCount+1] = this.batchedVertexCount+1;
		indices[this.batchedIndexCount+2] = this.batchedVertexCount+2;

		this.batchedVertexCount += 3, this.batchedIndexCount += 3;
	}

	drawBatchedQuad(x, y, w, h, tex, col, textSize, sx, sy, sw, sh) {
		this.drawArbitraryBatchedQuad(
			x, y,
			x+w, y,
			x+w, y+h,
			x, y+h,
			tex, col, textSize,
			sx, sy,
			sw, sh
		)
	}

	drawArbitraryBatchedQuad(x0, y0, x1, y1, x2, y2, x3, y3, tex = 0, col = HB.Vec4.one, textSize = 0, sx = 0, sy = 0, sw = 1, sh = 1) {
		const start = this.batchedVertexCount*vertexStride;
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

		indices[this.batchedIndexCount  ] = this.batchedVertexCount;
		indices[this.batchedIndexCount+1] = this.batchedVertexCount+1;
		indices[this.batchedIndexCount+2] = this.batchedVertexCount+2;
		indices[this.batchedIndexCount+3] = this.batchedVertexCount+2;
		indices[this.batchedIndexCount+4] = this.batchedVertexCount+3;
		indices[this.batchedIndexCount+5] = this.batchedVertexCount;

		this.batchedVertexCount += 4, this.batchedIndexCount += 6;
	}

	getBatchTextureIndex(texture) {
		let textureIndex = this.batchTextureCache[texture.name];
		if(textureIndex === undefined) {
			if((this.batchTextureIndex + 1) >= 16) this.flushBatch();
			this.batchTextureCache[texture.name] = textureIndex = this.batchTextureIndex;
			texture.bind(this.batchTextureIndex++);
		}
		return textureIndex;
	}

	flushBatchIfBufferFilled(vertices = 4, indices = 6) {
		if((this.batchedVertexCount + vertices) >= this.maxVertexCount || (this.batchedIndexCount + indices) >= this.maxIndexCount) {
			this.flushBatch();
			return true;
		}
		return false;
	}

	flushBatch() {
		vertexBuffer.partialWrite(vertices, this.batchedVertexCount*vertexStride);
		indexBuffer.partialWrite(indices, this.batchedIndexCount);
		this.drawIndexedTriangles(this.batchedIndexCount);
		this.resetBatch();
	}

	drawIndexedTriangles(indexCount) {
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