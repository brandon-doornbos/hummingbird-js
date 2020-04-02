import { renderer } from './renderer.js';
import { vertexStride, vertexBuffer, vertices, indexBuffer, indices } from './buffer.js';
import { font, fontData } from './texture.js';
import { Vec2 } from './math.js';

let batch = undefined;
const maxVertexCount = 2000;
const maxIndexCount = 3000;

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

	// drawColoredPolygon(points, color) {
	// 	const triangles = Math.floor(points.length/3);
	// 	for(let i = 0; i < triangles*3; i += 3) drawColoredTriangle(i);
	// 	if(points.length%3 > 0) drawColoredTriangle(points.length-3);

	// 	function drawColoredTriangle(startIndex) {
	// 		if((batch.vertexCount + 3) >= maxVertexCount || (batch.indexCount + 3) >= maxIndexCount) batch.flush();

	// 		const start = batch.vertexCount*vertexStride;
	// 		vertices[start   ] = points[startIndex][0];
	// 		vertices[start+1 ] = points[startIndex][1];
	// 		vertices[start+2 ] = 0;
	// 		vertices[start+3 ] = color[0];
	// 		vertices[start+4 ] = color[1];
	// 		vertices[start+5 ] = color[2];
	// 		vertices[start+6 ] = color[3];
	// 		vertices[start+7 ] = 0;
	// 		vertices[start+8 ] = 1;
	// 		vertices[start+9 ] = 0;
	// 		vertices[start+10] = 0;
	// 		vertices[start+11] = points[startIndex+1][0];
	// 		vertices[start+12] = points[startIndex+1][1];
	// 		vertices[start+13] = 0;
	// 		vertices[start+14] = color[0];
	// 		vertices[start+15] = color[1];
	// 		vertices[start+16] = color[2];
	// 		vertices[start+17] = color[3];
	// 		vertices[start+18] = 0.5;
	// 		vertices[start+19] = 0.5;
	// 		vertices[start+20] = 0;
	// 		vertices[start+21] = 0;
	// 		vertices[start+22] = points[startIndex+2][0];
	// 		vertices[start+23] = points[startIndex+2][1];
	// 		vertices[start+24] = 0;
	// 		vertices[start+25] = color[0];
	// 		vertices[start+26] = color[1];
	// 		vertices[start+27] = color[2];
	// 		vertices[start+28] = color[3];
	// 		vertices[start+29] = 1;
	// 		vertices[start+30] = 1;
	// 		vertices[start+31] = 0;
	// 		vertices[start+32] = 0;

	// 		indices[batch.indexCount  ] = batch.vertexCount;
	// 		indices[batch.indexCount+1] = batch.vertexCount+1;
	// 		indices[batch.indexCount+2] = batch.vertexCount+2;

	// 		batch.vertexCount += 3, batch.indexCount += 3;
	// 	}
	// }

	drawColoredRect(pos, size, color) {
		if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

		const start = this.vertexCount*vertexStride;
		vertices[start   ] = pos[0];
		vertices[start+1 ] = pos[1];
		vertices[start+2 ] = 0;
		vertices[start+3 ] = color[0];
		vertices[start+4 ] = color[1];
		vertices[start+5 ] = color[2];
		vertices[start+6 ] = color[3];
		vertices[start+7 ] = 0;
		vertices[start+8 ] = 0;
		vertices[start+9 ] = 0;
		vertices[start+10] = 0;
		vertices[start+11] = pos[0]+size[0];
		vertices[start+12] = pos[1];
		vertices[start+13] = 0;
		vertices[start+14] = color[0];
		vertices[start+15] = color[1];
		vertices[start+16] = color[2];
		vertices[start+17] = color[3];
		vertices[start+18] = 1;
		vertices[start+19] = 0;
		vertices[start+20] = 0;
		vertices[start+21] = 0;
		vertices[start+22] = pos[0]+size[0];
		vertices[start+23] = pos[1]+size[1];
		vertices[start+24] = 0;
		vertices[start+25] = color[0];
		vertices[start+26] = color[1];
		vertices[start+27] = color[2];
		vertices[start+28] = color[3];
		vertices[start+29] = 1;
		vertices[start+30] = 1;
		vertices[start+31] = 0;
		vertices[start+32] = 0;
		vertices[start+33] = pos[0];
		vertices[start+34] = pos[1]+size[1];
		vertices[start+35] = 0;
		vertices[start+36] = color[0];
		vertices[start+37] = color[1];
		vertices[start+38] = color[2];
		vertices[start+39] = color[3];
		vertices[start+40] = 0;
		vertices[start+41] = 1;
		vertices[start+42] = 0;
		vertices[start+43] = 0;

		indices[this.indexCount  ] = this.vertexCount;
		indices[this.indexCount+1] = this.vertexCount+1;
		indices[this.indexCount+2] = this.vertexCount+2;
		indices[this.indexCount+3] = this.vertexCount+2;
		indices[this.indexCount+4] = this.vertexCount+3;
		indices[this.indexCount+5] = this.vertexCount;

		this.vertexCount += 4, this.indexCount += 6;
	}

	drawTexturedRect(pos, size, texture) {
		if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

		let textureIndex = this.textureCache[texture.name];
		if(textureIndex === undefined) {
			if((this.textureIndex + 1) >= 16) this.flush();
			this.textureCache[texture.name] = textureIndex = this.textureIndex;
			texture.bind(this.textureIndex++);
		}

		const start = this.vertexCount*vertexStride;
		vertices[start   ] = pos[0];
		vertices[start+1 ] = pos[1];
		vertices[start+2 ] = 0;
		vertices[start+3 ] = 1;
		vertices[start+4 ] = 1;
		vertices[start+5 ] = 1;
		vertices[start+6 ] = 1;
		vertices[start+7 ] = 0;
		vertices[start+8 ] = 0;
		vertices[start+9 ] = textureIndex;
		vertices[start+10] = 0;
		vertices[start+11] = pos[0]+size[0];
		vertices[start+12] = pos[1];
		vertices[start+13] = 0;
		vertices[start+14] = 1;
		vertices[start+15] = 1;
		vertices[start+16] = 1;
		vertices[start+17] = 1;
		vertices[start+18] = 1;
		vertices[start+19] = 0;
		vertices[start+20] = textureIndex;
		vertices[start+21] = 0;
		vertices[start+22] = pos[0]+size[0];
		vertices[start+23] = pos[1]+size[1];
		vertices[start+24] = 0;
		vertices[start+25] = 1;
		vertices[start+26] = 1;
		vertices[start+27] = 1;
		vertices[start+28] = 1;
		vertices[start+29] = 1;
		vertices[start+30] = 1;
		vertices[start+31] = textureIndex;
		vertices[start+32] = 0;
		vertices[start+33] = pos[0];
		vertices[start+34] = pos[1]+size[1];
		vertices[start+35] = 0;
		vertices[start+36] = 1;
		vertices[start+37] = 1;
		vertices[start+38] = 1;
		vertices[start+39] = 1;
		vertices[start+40] = 0;
		vertices[start+41] = 1;
		vertices[start+42] = textureIndex;
		vertices[start+43] = 0;

		indices[this.indexCount  ] = this.vertexCount;
		indices[this.indexCount+1] = this.vertexCount+1;
		indices[this.indexCount+2] = this.vertexCount+2;
		indices[this.indexCount+3] = this.vertexCount+2;
		indices[this.indexCount+4] = this.vertexCount+3;
		indices[this.indexCount+5] = this.vertexCount;

		this.vertexCount += 4, this.indexCount += 6;
	}

	drawColoredLine(vectorA, vectorB, thickness, color) {
		if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

		const angle0 = Vec2.angleBetweenVec2(vectorA, vectorB);
		const angleA = Vec2.fromAngle(angle0-Math.PI/2, thickness/2);
		const angleB = Vec2.fromAngle(angle0+Math.PI/2, thickness/2);

		const start = this.vertexCount*vertexStride;
		vertices[start   ] = vectorA[0]-angleA[0];
		vertices[start+1 ] = vectorA[1]-angleA[1];
		vertices[start+2 ] = 0;
		vertices[start+3 ] = color[0];
		vertices[start+4 ] = color[1];
		vertices[start+5 ] = color[2];
		vertices[start+6 ] = color[3];
		vertices[start+7 ] = 0;
		vertices[start+8 ] = 0;
		vertices[start+9 ] = 0;
		vertices[start+10] = 0;
		vertices[start+11] = vectorA[0]+angleA[0];
		vertices[start+12] = vectorA[1]+angleA[1];
		vertices[start+13] = 0;
		vertices[start+14] = color[0];
		vertices[start+15] = color[1];
		vertices[start+16] = color[2];
		vertices[start+17] = color[3];
		vertices[start+18] = 1;
		vertices[start+19] = 0;
		vertices[start+20] = 0;
		vertices[start+21] = 0;
		vertices[start+22] = vectorB[0]-angleB[0];
		vertices[start+23] = vectorB[1]-angleB[1];
		vertices[start+24] = 0;
		vertices[start+25] = color[0];
		vertices[start+26] = color[1];
		vertices[start+27] = color[2];
		vertices[start+28] = color[3];
		vertices[start+29] = 1;
		vertices[start+30] = 1;
		vertices[start+31] = 0;
		vertices[start+32] = 0;
		vertices[start+33] = vectorB[0]+angleB[0];
		vertices[start+34] = vectorB[1]+angleB[1];
		vertices[start+35] = 0;
		vertices[start+36] = color[0];
		vertices[start+37] = color[1];
		vertices[start+38] = color[2];
		vertices[start+39] = color[3];
		vertices[start+40] = 0;
		vertices[start+41] = 1;
		vertices[start+42] = 0;
		vertices[start+43] = 0;

		indices[this.indexCount  ] = this.vertexCount;
		indices[this.indexCount+1] = this.vertexCount+1;
		indices[this.indexCount+2] = this.vertexCount+2;
		indices[this.indexCount+3] = this.vertexCount+2;
		indices[this.indexCount+4] = this.vertexCount+3;
		indices[this.indexCount+5] = this.vertexCount;

		this.vertexCount += 4, this.indexCount += 6;
	}

	drawColoredText(string, pos, size = 12, align = 'start-start', color) {
		let textureIndex = this.textureCache[font.name];
		if(textureIndex === undefined) {
			if((this.textureIndex + 1) >= 16) this.flush();
			this.textureCache[font.name] = textureIndex = this.textureIndex;
			font.bind(this.textureIndex++);
		}

		const glyphs = [], kernings = {};
		size = size/fontData.info.size;
		let width = 0;
		const height = fontData.info.size*size;

		let prevGlyphId;
		for(const char of string) {
			for(const glyph of Object.values(fontData.chars)) {
				if(glyph.char === char) {
					if(prevGlyphId !== undefined) {
						for(const kerning of Object.values(fontData.kernings)) {
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

		glyphs.forEach((glyph) => {
			if((this.vertexCount + 4) >= maxVertexCount || (this.indexCount + 6) >= maxIndexCount) this.flush();

			if(kernings[glyph.id] !== undefined) pos[0] += kernings[glyph.id].amt*size;

			const start = this.vertexCount*vertexStride;
			vertices[start   ] = pos[0]+glyph.xoff*size+offsetx;
			vertices[start+1 ] = pos[1]+glyph.yoff*size+offsety;
			vertices[start+2 ] = 0;
			vertices[start+3 ] = color[0];
			vertices[start+4 ] = color[1];
			vertices[start+5 ] = color[2];
			vertices[start+6 ] = color[3];
			vertices[start+7 ] = glyph.x/fontData.common.scaleW;
			vertices[start+8 ] = glyph.y/fontData.common.scaleH;
			vertices[start+9 ] = textureIndex;
			vertices[start+10] = size;
			vertices[start+11] = pos[0]+(glyph.w+glyph.xoff)*size+offsetx;
			vertices[start+12] = pos[1]+glyph.yoff*size+offsety;
			vertices[start+13] = 0;
			vertices[start+14] = color[0];
			vertices[start+15] = color[1];
			vertices[start+16] = color[2];
			vertices[start+17] = color[3];
			vertices[start+18] = (glyph.x+glyph.w)/fontData.common.scaleW;
			vertices[start+19] = glyph.y/fontData.common.scaleH;
			vertices[start+20] = textureIndex;
			vertices[start+21] = size;
			vertices[start+22] = pos[0]+(glyph.w+glyph.xoff)*size+offsetx;
			vertices[start+23] = pos[1]+(glyph.h+glyph.yoff)*size+offsety;
			vertices[start+24] = 0;
			vertices[start+25] = color[0];
			vertices[start+26] = color[1];
			vertices[start+27] = color[2];
			vertices[start+28] = color[3];
			vertices[start+29] = (glyph.x+glyph.w)/fontData.common.scaleW;
			vertices[start+30] = (glyph.y+glyph.h)/fontData.common.scaleH;
			vertices[start+31] = textureIndex;
			vertices[start+32] = size;
			vertices[start+33] = pos[0]+glyph.xoff*size+offsetx;
			vertices[start+34] = pos[1]+(glyph.h+glyph.yoff)*size+offsety;
			vertices[start+35] = 0;
			vertices[start+36] = color[0];
			vertices[start+37] = color[1];
			vertices[start+38] = color[2];
			vertices[start+39] = color[3];
			vertices[start+40] = glyph.x/fontData.common.scaleW;
			vertices[start+41] = (glyph.y+glyph.h)/fontData.common.scaleH;
			vertices[start+42] = textureIndex;
			vertices[start+43] = size;

			indices[this.indexCount  ] = this.vertexCount;
			indices[this.indexCount+1] = this.vertexCount+1;
			indices[this.indexCount+2] = this.vertexCount+2;
			indices[this.indexCount+3] = this.vertexCount+2;
			indices[this.indexCount+4] = this.vertexCount+3;
			indices[this.indexCount+5] = this.vertexCount;

			this.vertexCount += 4, this.indexCount += 6;

			pos[0] += glyph.xadv*size;
		});
	}

	flush() {
		vertexBuffer.partialWrite(vertices, this.vertexCount*vertexStride);
		indexBuffer.partialWrite(indices, this.indexCount);
		renderer.draw(this.indexCount);
		this.reset();
	}
}

export { Batch, batch, maxVertexCount, maxIndexCount };