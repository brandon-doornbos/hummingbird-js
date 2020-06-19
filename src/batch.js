import { renderer } from './renderer.js';
import { vertexStride, vertexBuffer, vertices, indexBuffer, indices } from './buffer.js';
import { textures, font, fontData } from './texture.js';
import { Vec2 } from './math.js';

let batch = undefined;
const maxVertexCount = 4000;
const maxIndexCount = 6000;

class Batch{
	constructor() {
		this.vertexCount = 0;
		this.indexCount = 0;
		this.textureIndex = 1;
		this.textureCache = {};
	}

	static init() {
		batch = new Batch();
	}

	begin() { this.reset(); }
	end() { this.flush(); }

	reset() {
		this.vertexCount = 0;
		this.indexCount = 0;
		this.textureIndex = 1;
		this.textureCache = {};
	}

	drawColoredPoint(pos, size = 1, color) {
		this.pushQuad(pos.x-size/4, pos.y-size/4, size/2, size/2, 0, color);
	}

	drawColoredPolygon(points, color, center = 0) {
		for(let i = 0; i < points.length-1; i++) {
			if(i === center) continue;
			if((this.vertexCount + 3) >= maxVertexCount || (this.indexCount + 3) >= maxIndexCount) this.flush();

			const start = this.vertexCount*vertexStride;
			vertices[start   ] = points[center].x;
			vertices[start+1 ] = points[center].y;
			vertices[start+2 ] = color.x;
			vertices[start+3 ] = color.y;
			vertices[start+4 ] = color.z;
			vertices[start+5 ] = color.w;
			vertices[start+6 ] = 0;
			vertices[start+7 ] = 1;
			vertices[start+8 ] = 0;
			vertices[start+9 ] = 0;

			vertices[start+10] = points[i].x;
			vertices[start+11] = points[i].y;
			vertices[start+12] = color.x;
			vertices[start+13] = color.y;
			vertices[start+14] = color.z;
			vertices[start+15] = color.w;
			vertices[start+16] = 0.5;
			vertices[start+17] = 0.5;
			vertices[start+18] = 0;
			vertices[start+19] = 0;

			vertices[start+20] = points[i+1].x;
			vertices[start+21] = points[i+1].y;
			vertices[start+22] = color.x;
			vertices[start+23] = color.y;
			vertices[start+24] = color.z;
			vertices[start+25] = color.w;
			vertices[start+26] = 1;
			vertices[start+27] = 1;
			vertices[start+28] = 0;
			vertices[start+29] = 0;

			indices[this.indexCount  ] = this.vertexCount;
			indices[this.indexCount+1] = this.vertexCount+1;
			indices[this.indexCount+2] = this.vertexCount+2;

			this.vertexCount += 3, this.indexCount += 3;
		}
	}

	drawColoredRectangle(pos, size, color) {
		this.pushQuad(pos.x, pos.y, size.x, size.y, 0, color);
	}

	drawTexturedRectangle(pos, size, texture) {
		this.pushQuad(pos.x, pos.y, size.x, size.y, this.getTextureIndex(texture));
	}

	drawColoredRectangleWithRotation(pos, size, angle, color) {
		this.drawRectangleWithRotation(pos, size, angle, 0, color);
	}

	drawTexturedRectangleWithRotation(pos, size, angle, texture) {
		this.drawRectangleWithRotation(pos, size, angle, this.getTextureIndex(texture));
	}

	drawRectangleWithRotation(pos, size, angle, texture = 0, color = HB.Vec4.one) {
		angle = HB.Math.radians(angle);
		const cosX = size.x*-0.5*Math.cos(angle), cosY = size.y*-0.5*Math.cos(angle);
		const cosX1 = size.x*0.5*Math.cos(angle), cosY1 = size.y*0.5*Math.cos(angle);
		const sinX = size.x*-0.5*Math.sin(angle), sinY = size.y*-0.5*Math.sin(angle);
		const sinX1 = size.x*0.5*Math.sin(angle), sinY1 = size.y*0.5*Math.sin(angle);

		this.pushArbitraryQuad(
			cosX-sinY+pos.x+size.x/2, sinX+cosY+pos.y+size.y/2,
			cosX1-sinY+pos.x+size.x/2, sinX1+cosY+pos.y+size.y/2,
			cosX1-sinY1+pos.x+size.x/2, sinX1+cosY1+pos.y+size.y/2,
			cosX-sinY1+pos.x+size.x/2, sinX+cosY1+pos.y+size.y/2,
			texture, color
		);
	}

	drawColoredLine(vectorA, vectorB, thickness, color) {
		if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

		const angle0 = Vec2.angleBetweenVec2(vectorA, vectorB);
		const angleA = Vec2.fromAngle(angle0-Math.PI/2, thickness/2);
		const angleB = Vec2.fromAngle(angle0+Math.PI/2, thickness/2);

		this.pushArbitraryQuad(
			vectorA.x-angleA.x, vectorA.y-angleA.y,
			vectorA.x+angleA.x, vectorA.y+angleA.y,
			vectorB.x-angleB.x, vectorB.y-angleB.y,
			vectorB.x+angleB.x, vectorB.y+angleB.y,
			0, color
		);
	}

	drawColoredEllipse(pos, size, color) {
		this.pushQuad(pos.x, pos.y, size.x, size.y, this.getTextureIndex(textures.Hummingbird_Circle), color);
	}

	drawColoredText(string, pos, size = 12, align = 'start-start', color) {
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

		let textureIndex = this.getTextureIndex(font);
		for(let glyph of glyphs) {
			const kerning = kernings[glyph.id];
			if(kerning !== undefined) offsetx += kerning*scalar;

			this.pushQuad(
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

export { Batch, batch, maxVertexCount, maxIndexCount };