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
		this.pushQuad(pos[0]-size/4, pos[1]-size/4, size/2, size/2, 0, color);
	}

	drawColoredPolygon(points, color, center = 0) {
		for(let i = 0; i < points.length-1; i++) {
			if(i === center) continue;
			if((this.vertexCount + 3) >= maxVertexCount || (this.indexCount + 3) >= maxIndexCount) this.flush();

			const start = this.vertexCount*vertexStride;
			vertices[start   ] = points[center][0];
			vertices[start+1 ] = points[center][1];
			vertices[start+2 ] = color[0];
			vertices[start+3 ] = color[1];
			vertices[start+4 ] = color[2];
			vertices[start+5 ] = color[3];
			vertices[start+6 ] = 0;
			vertices[start+7 ] = 1;
			vertices[start+8 ] = 0;
			vertices[start+9 ] = 0;
			vertices[start+10] = points[i][0];
			vertices[start+11] = points[i][1];
			vertices[start+12] = color[0];
			vertices[start+13] = color[1];
			vertices[start+14] = color[2];
			vertices[start+15] = color[3];
			vertices[start+16] = 0.5;
			vertices[start+17] = 0.5;
			vertices[start+18] = 0;
			vertices[start+19] = 0;
			vertices[start+20] = points[i+1][0];
			vertices[start+21] = points[i+1][1];
			vertices[start+22] = color[0];
			vertices[start+23] = color[1];
			vertices[start+24] = color[2];
			vertices[start+25] = color[3];
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

	drawColoredRect(pos, size, color) {
		this.pushQuad(pos[0], pos[1], size[0], size[1], 0, color);
	}

	drawTexturedRect(pos, size, texture) {
		this.pushQuad(pos[0], pos[1], size[0], size[1], this.getTextureIndex(texture));
	}

	drawColoredRectWithRotation(pos, size, angle, color) {
		this.drawRectWithRotation(pos, size, angle, 0, color);
	}

	drawTexturedRectWithRotation(pos, size, angle, texture) {
		this.drawRectWithRotation(pos, size, angle, this.getTextureIndex(texture));
	}

	drawRectWithRotation(pos, size, angle, texture = 0, color = HB.Vec4.one) {
		angle = HB.Math.radians(angle);
		const cosX = size[0]*-0.5*Math.cos(angle), cosY = size[1]*-0.5*Math.cos(angle);
		const cosX1 = size[0]*0.5*Math.cos(angle), cosY1 = size[1]*0.5*Math.cos(angle);
		const sinX = size[0]*-0.5*Math.sin(angle), sinY = size[1]*-0.5*Math.sin(angle);
		const sinX1 = size[0]*0.5*Math.sin(angle), sinY1 = size[1]*0.5*Math.sin(angle);

		this.pushArbitraryQuad(
			cosX-sinY+pos[0]+size[0]/2, sinX+cosY+pos[1]+size[1]/2,
			cosX1-sinY+pos[0]+size[0]/2, sinX1+cosY+pos[1]+size[1]/2,
			cosX1-sinY1+pos[0]+size[0]/2, sinX1+cosY1+pos[1]+size[1]/2,
			cosX-sinY1+pos[0]+size[0]/2, sinX+cosY1+pos[1]+size[1]/2,
			texture, color
		);
	}

	drawColoredLine(vectorA, vectorB, thickness, color) {
		if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

		const angle0 = Vec2.angleBetweenVec2(vectorA, vectorB);
		const angleA = Vec2.fromAngle(angle0-Math.PI/2, thickness/2);
		const angleB = Vec2.fromAngle(angle0+Math.PI/2, thickness/2);

		this.pushArbitraryQuad(
			vectorA[0]-angleA[0], vectorA[1]-angleA[1],
			vectorA[0]+angleA[0], vectorA[1]+angleA[1],
			vectorB[0]-angleB[0], vectorB[1]-angleB[1],
			vectorB[0]+angleB[0], vectorB[1]+angleB[1],
			0, color
		);
	}

	drawColoredEllipse(pos, size, color) {
		this.pushQuad(pos[0], pos[1], size[0], size[1], this.getTextureIndex(textures['Hummingbird_Circle']), color);
	}

	drawColoredText(string, pos, size = 12, align = 'start-start', color) {
		const glyphs = [], kernings = {};
		size = size/fontData.info.size;
		let width = 0;
		const height = fontData.info.size*size;

		let prevGlyphId;
		for(let char of string) {
			for(let glyph of fontData.chars) {
				if(glyph.char === char) {
					if(prevGlyphId !== undefined) {
						for(let kerning of fontData.kernings) {
							if(kerning[0] === prevGlyphId && kerning[1] === glyph.id) {
								width += kerning.amt*size;
								kernings[glyph.id] = kerning;
								break;
							}
						}
					}
					prevGlyphId = glyph.id;
					glyphs.push(glyph);
					width += glyph.xadv*size;
					break;
				}
			}
		}

		let offsetx = 0, offsety = 0;
		align = align.split('-');
		switch(align[0]) {
			case 'start': break;
			case 'center': offsetx = -width/2; break;
			case 'end': offsetx = -width; break;
		}
		switch(align[1]) {
			case 'start': break;
			case 'center': offsety = -height/2; break;
			case 'end': offsety = -height; break;
		}

		let textureIndex = this.getTextureIndex(font);
		for(let glyph of glyphs) {
			if(kernings[glyph.id] !== undefined) offsetx += kernings[glyph.id].amt*size;

			this.pushQuad(
				pos[0]+glyph.xoff*size+offsetx, pos[1]+glyph.yoff*size+offsety,
				glyph.w*size, glyph.h*size,
				textureIndex, color, size,
				glyph.x/fontData.common.scaleW, glyph.y/fontData.common.scaleH,
				glyph.w/fontData.common.scaleW, glyph.h/fontData.common.scaleH,
			);

			offsetx += glyph.xadv*size;
		}
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
		vertices[start+2 ] = col[0];
		vertices[start+3 ] = col[1];
		vertices[start+4 ] = col[2];
		vertices[start+5 ] = col[3];
		vertices[start+6 ] = sx;
		vertices[start+7 ] = sy;
		vertices[start+8 ] = tex;
		vertices[start+9 ] = textSize;

		vertices[start+10] = x1;
		vertices[start+11] = y1;
		vertices[start+12] = col[0];
		vertices[start+13] = col[1];
		vertices[start+14] = col[2];
		vertices[start+15] = col[3];
		vertices[start+16] = sx+sw;
		vertices[start+17] = sy;
		vertices[start+18] = tex;
		vertices[start+19] = textSize;

		vertices[start+20] = x2;
		vertices[start+21] = y2;
		vertices[start+22] = col[0];
		vertices[start+23] = col[1];
		vertices[start+24] = col[2];
		vertices[start+25] = col[3];
		vertices[start+26] = sx+sw;
		vertices[start+27] = sy+sh;
		vertices[start+28] = tex;
		vertices[start+29] = textSize;

		vertices[start+30] = x3;
		vertices[start+31] = y3;
		vertices[start+32] = col[0];
		vertices[start+33] = col[1];
		vertices[start+34] = col[2];
		vertices[start+35] = col[3];
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