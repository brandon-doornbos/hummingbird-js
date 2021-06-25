import { gl } from './common.js';
import { Camera } from "./camera.js";
import { shader, Shader } from "./shader.js";
import { VertexArray, vertexArray, vertexStride, vertexBuffer, vertices, indexBuffer, indices } from "./buffer.js";
import { textures, font, fontData } from "./texture.js";
import { Vec2 } from './math.js';

/**
 * This class instance includes all rendering methods.
 * @readonly
 * @type {HB.Renderer}
 * @memberof HB
 */
let renderer = undefined;

/**
 * Class with all of the essential rendering setup and methods.
 * @readonly
 * @memberof HB
 */
class Renderer{
	/**
	 * (DO NOT USE) Internal use by Hummingbird only, all methods are available on {@link HB.renderer}.
	 * @constructor
	 * @readonly
	 * @memberof HB
	 */
	constructor() {
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.cullFace(gl.FRONT);
		gl.enable(gl.CULL_FACE);

		/**
		 * (DO NOT USE) This is the amount of texture units available, for increased compatibility/performance.
		 * @readonly
		 */
		this.textureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) || 8;
		Shader.init(this.textureUnits);
		shader.bind();
		const textureSamplers = [];
		for(let i = 0; i < this.textureUnits; i++) { textureSamplers[i] = i; }
		shader.setUniformArray('i', 'uTextureIds', textureSamplers);

		/**
		 * (DO NOT USE) Internal variable to keep track of max vertices in one batch, default is 4000.
		 * @readonly
		 */
		this.maxVertexCount = 4000;
		/**
		 * (DO NOT USE) Internal variable to keep track of max indices in one batch, default is 6000.
		 * @readonly
		 */
		this.maxIndexCount = 6000;

		this.resetBatch();

		VertexArray.init(this.maxVertexCount, this.maxIndexCount);

		Camera.init();
	}

	/**
	 * (DO NOT USE) Internal method for creating the {@link HB.renderer} instance.
	 * @readonly
	 */
	static init() {
		renderer = new Renderer();
	}

	/**
	 * Method for starting a new rendering batch, is automatically called in {@link HB.internalUpdate}.
	 */
	startBatch() { this.resetBatch(); }
	/**
	 * Method for ending the rendering batch, is automatically called in {@link HB.internalUpdate}.
	 */
	endBatch() { this.flushBatch(); }

	/**
	 * (DO NOT USE) Internal method for resetting the rendering batch's variables, is automatically called by {@link HB.Renderer#startBatch}.
	 * @readonly
	 */
	resetBatch() {
		this.batchedVertexCount = 0;
		this.batchedIndexCount = 0;
		this.batchTextureIndex = 1;
		this.batchTextureCache = {};
	}

	/**
	 * Method for clearing the screen with a certain color, can only be called when a batch has been started.
	 * @param {HB.Vec4} color - Color to clear the screen with.
	 */
	clear(color) {
		if(color !== undefined) gl.clearColor(color.x, color.y, color.z, color.w);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	/**
	 * Method for drawing a colored point on screen, can only be called when a batch has been started.
	 * @param {HB.Vec2} pos - Center position at which to draw the point.
	 * @param {number} size=1 - Size of the point, the point is a square defaulting to 1 pixel.
	 * @param {HB.Vec4} color - Color of the point.
	 */
	colorPoint(pos, size = 1, color) {
		this.flushBatchIfBufferFilled();
		const halfSize = size*0.5;
		this.drawBatchedQuad(pos.x-halfSize, pos.y-halfSize, size, size, 0, color);
	}

	/**
	 * Method for drawing a colored polygon on screen, can only be called when a batch has been started.
	 * @param {Array} points - Array of {@link HB.Vec2}s with positions of all points.
	 * @param {HB.Vec4} color - Color of the polygon.
	 * @param {number} center=0 - Element of points Array which indicates the center of the polygon, only needed occasionally for concave polygons.
	 */
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

	/**
	 * Method for drawing a colored rectangle on screen, can only be called when a batch has been started.
	 * @param {HB.Vec2} pos - Top-left position of the rectangle.
	 * @param {HB.Vec2} size - Size of the rectangle.
	 * @param {HB.Vec4} color - Color of the rectangle.
	 */
	colorRectangle(pos, size, color) {
		this.flushBatchIfBufferFilled();
		this.drawBatchedQuad(pos.x, pos.y, size.x, size.y, 0, color);
	}

	/**
	 * Method for drawing a textured rectangle on screen, can only be called when a batch has been started.
	 * @param {HB.Vec2} pos - Top-left position of the rectangle.
	 * @param {HB.Vec2} size - Size of the rectangle.
	 * @param {HB.Texture} texture - {@link HB.Texture} instance to texture with.
	 */
	textureRectangle(pos, size, texture) {
		this.flushBatchIfBufferFilled();
		this.drawBatchedQuad(pos.x, pos.y, size.x, size.y, this.getBatchTextureIndex(texture));
	}

	/**
	 * Method for drawing a rotated colored rectangle on screen, can only be called when a batch has been started.
	 * @param {HB.Vec2} pos - Top-left position of the rectangle.
	 * @param {HB.Vec2} size - Size of the rectangle.
	 * @param {number} angle - Angle in radians with which the rectangle gets rotated around its center (pos.x+size.x/2, pos.y+size.y/2).
	 * @param {HB.Vec4} color - Color of the rectangle.
	 */
	rotatedColorRectangle(pos, size, angle, color) {
		this.flushBatchIfBufferFilled();
		this.drawRectangleWithRotation(pos, size, angle, 0, color);
	}

	/**
	 * Method for drawing a rotated textured rectangle on screen, can only be called when a batch has been started.
	 * @param {HB.Vec2} pos - Top-left position of the rectangle.
	 * @param {HB.Vec2} size - Size of the rectangle.
	 * @param {number} angle - Angle in radians with which the rectangle gets rotated around its center (pos.x + (size.x / 2), pos.y + (size.y / 2)).
	 * @param {HB.Texture} texture - {@link HB.Texture} instance to texture with.
	 */
	rotatedTextureRectangle(pos, size, angle, texture) {
		this.flushBatchIfBufferFilled();
		this.drawRectangleWithRotation(pos, size, angle, this.getBatchTextureIndex(texture));
	}

	/**
	 * (DO NOT USE) Internal method for drawing a rotated rectangle on screen. Use {@link HB.Renderer#rotatedColorRectangle} or {@link HB.Renderer#rotatedTextureRectangle} instead. Can only be called when a batch has been started.
	 * @readonly
	 * @param {HB.Vec2} pos - Top-left position of the rectangle.
	 * @param {HB.Vec2} size - Size of the rectangle.
	 * @param {number} angle - Angle in radians with which the rectangle gets rotated around its center (pos.x + (size.x / 2), pos.y + (size.y / 2)).
	 * @param {HB.Texture} texture=0 - If available, {@link HB.Texture} instance to texture with.
	 * @param {HB.Vec4} color={@link HB.Vec4.one} - If available, color of the rectangle.
	 */
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

	/**
	 * Method for drawing a colored line on screen from one point to another, can only be called when a batch has been started.
	 * @param {HB.Vec2} vectorA - First point of the line.
	 * @param {HB.Vec2} vectorB - Second point of the line.
	 * @param {number} thickness - The thickness of the line in pixels.
	 * @param {HB.Vec4} color - Color of the rectangle.
	 */
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

	/**
	 * Method for drawing a colored ellipse on screen, can only be called when a batch has been started.
	 * @param {HB.Vec2} pos - Top-left position of the ellipse.
	 * @param {HB.Vec2} size - Size of the ellipse's individual axes.
	 * @param {HB.Vec4} color - Color of the ellipse.
	 */
	colorEllipse(pos, size, color) {
		this.flushBatchIfBufferFilled();
		this.drawBatchedQuad(pos.x, pos.y, size.x, size.y, this.getBatchTextureIndex(textures.Hummingbird_Circle), color);
	}

	/**
	 * Method for drawing colored text on screen, can only be called when a batch has been started.
	 * @param {string} string - ASCII text to be rendered, see the charset in {@link https://projects.brandond.nl/Hummingbird/assets/arial_pretty.json} for all characters.
	 * @param {HB.Vec2} pos - Position of the text, anchor-point determined by the align parameter.
	 * @param {number} size=12 - Pixel size (height) of the text.
	 * @param {string} align="start-start" - Where to place the anchor-point, this is a string formatted as "'x-anchor'-'y-anchor'", e.g. "end-center". Possible values are [start, center, end], modelled after [this]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign#options}.
	 * @param {HB.Vec4} color - Color of the text.
	 * @returns {number} Final width of the rendered text.
	 */
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
			case 'start': offsety = -fontData.info.padding[3]*0.5; break;
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

	/**
	 * (DO NOT USE) Internal method for drawing a triangle on screen. Use {@link HB.Renderer#colorPolygon} instead. Can only be called when a batch has been started.
	 * @readonly
	 * @param {number} x1 - X-coordinate of the first point.
	 * @param {number} y1 - Y-coordinate of the first point.
	 * @param {number} x2 - X-coordinate of the second point.
	 * @param {number} y2 - Y-coordinate of the second point.
	 * @param {number} x3 - X-coordinate of the third point.
	 * @param {number} y3 - Y-coordinate of the third point.
	 * @param {HB.Vec4} color - Color of the triangle.
	 */
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

	/**
	 * (DO NOT USE) Internal method for drawing a quad on screen. Use any of the quad methods instead ({@link HB.Renderer#colorRectangle}, {@link HB.Renderer#textureRectangle}, etc.). Can only be called when a batch has been started.
	 * @readonly
	 * @param {number} x - X-coordinate of the quad.
	 * @param {number} y - Y-coordinate of the quad.
	 * @param {number} w - Width of the quad.
	 * @param {number} h - Height of the quad.
	 * @param {number} tex - Optional internal batch-specific texture ID.
	 * @param {HB.Vec4} col - Optional color of the quad.
	 * @param {number} textSize - Optional size of text to identify when text is being rendered.
	 * @param {number} sx - UV x-coordinate of the texture, 0-1.
	 * @param {number} sy - UV y-coordinate of the texture, 0-1.
	 * @param {number} sw - UV width of the texture, 0-1.
	 * @param {number} sh - UV height of the texture, 0-1.
	 */
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

	/**
	 * (DO NOT USE) Internal, most basic method for drawing a quad on screen. Use any of the quad methods instead ({@link HB.Renderer#colorRectangle}, {@link HB.Renderer#textureRectangle}, etc.). Can only be called when a batch has been started.
	 * @readonly
	 * @param {number} x0 - Top-left x-coordinate.
	 * @param {number} y0 - Top-left y-coordinate.
	 * @param {number} x1 - Top-right x-coordinate.
	 * @param {number} y1 - Top-right y-coordinate.
	 * @param {number} x2 - Bottom-right x-coordinate.
	 * @param {number} y2 - Bottom-right y-coordinate.
	 * @param {number} x3 - Bottom-left x-coordinate.
	 * @param {number} y3 - Bottom-left y-coordinate.
	 * @param {number} tex=0 - Optional internal batch-specific texture ID.
	 * @param {HB.Vec4} col={@link HB.Vec4.one} - Optional color of the quad.
	 * @param {number} textSize=0 - Optional size of text to identify when text is being rendered.
	 * @param {number} sx=0 - UV x-coordinate of the texture, 0-1.
	 * @param {number} sy=0 - UV y-coordinate of the texture, 0-1.
	 * @param {number} sw=1 - UV width of the texture, 0-1.
	 * @param {number} sh=1 - UV height of the texture, 0-1.
	 */
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

	/**
	 * (DO NOT USE) Internal method to get a batch-specific texture ID. Can only be called when a batch has been started.
	 * @param {HB.Texture} texture - {@link HB.Texture} instance to texture with.
	 * @returns {number} Internal batch-specific texture ID.
	 */
	getBatchTextureIndex(texture) {
		let textureIndex = this.batchTextureCache[texture.name];
		if(textureIndex === undefined) {
			if((this.batchTextureIndex + 1) >= this.textureUnits) this.flushBatch();
			this.batchTextureCache[texture.name] = textureIndex = this.batchTextureIndex;
			texture.bind(this.batchTextureIndex++);
		}
		return textureIndex;
	}

	/**
	 * (DO NOT USE) Internal method to test whether the batch has to rendered to the screen, this happens whenever either the Vertex- or IndexBuffer is filled. Can only be called when a batch has been started.
	 * @param {number} vertices - Amount of vertices to add to buffer for check.
	 * @param {number} indices - Amount of indices to add to buffer for check.
	 * @returns {boolean} Whether the batch had to be rendered.
	 */
	flushBatchIfBufferFilled(vertices = 4, indices = 6) {
		if((this.batchedVertexCount + vertices) >= this.maxVertexCount || (this.batchedIndexCount + indices) >= this.maxIndexCount) {
			this.flushBatch();
			return true;
		}
		return false;
	}

	/**
	 * (DO NOT USE) Internal method for rendering the current batch's contents, is automatically called by {@link HB.Renderer#endBatch} or {@link HB.Renderer#flushBatchIfBufferFilled}.
	 * @readonly
	 */
	flushBatch() {
		vertexBuffer.partialWrite(vertices, this.batchedVertexCount*vertexStride);
		indexBuffer.partialWrite(indices, this.batchedIndexCount);
		this.drawIndexedTriangles(this.batchedIndexCount);
		this.resetBatch();
	}

	/**
	 * (DO NOT USE) Internal method with the final draw call, is automatically called by {@link HB.Renderer#flushBatch}.
	 * @readonly
	 * @param {number} indexCount - Amount of indices to be rendered.
	 */
	drawIndexedTriangles(indexCount) {
		shader.bind();
		vertexArray.bind();

		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
	}

	/**
	 * (DO NOT USE) Internal method for cleaning up all renderer related objects (textures, shader, buffers, etc.), is automatically called when the window is closed.
	 * @readonly
	 */
	delete() {
		for(let tex in textures) textures[tex].delete();
		shader.delete();
		vertexArray.delete();
		vertexBuffer.delete();
		indexBuffer.delete();
	}
}

export {
	renderer,
	Renderer
};