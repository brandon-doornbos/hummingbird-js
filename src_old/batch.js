class Batch{
	constructor(maxVertexCount, maxIndexCount) {
		this.maxVertexCount = maxVertexCount, this.vertexCount = 0;
		this.maxIndexCount = maxIndexCount, this.indexCount = 0;
		this.textureIndex = 1;
	}

	begin() { this.reset(); }
	end() { this.flush(); }

	reset() {
		this.vertexCount = 0;
		this.indexCount = 0;
		this.textureIndex = 1;
		renderer.textures.forEach((texture) => { texture.textureIndex = undefined; });
		// renderer.vertices = [];
		// renderer.indices = [];
	}

	drawColoredRect(x, y, w, h, color) {
		if((this.vertexCount + 4) >= this.maxVertexCount || (this.indexCount + 6) >= this.maxIndexCount) this.flush();

		const start = this.vertexCount*10;
		renderer.vertices[start   ] = x;
		renderer.vertices[start+1 ] = y;
		renderer.vertices[start+2 ] = 0;
		renderer.vertices[start+3 ] = color[0];
		renderer.vertices[start+4 ] = color[1];
		renderer.vertices[start+5 ] = color[2];
		renderer.vertices[start+6 ] = color[3];
		renderer.vertices[start+7 ] = 0;
		renderer.vertices[start+8 ] = 0;
		renderer.vertices[start+9 ] = 0;
		renderer.vertices[start+10] = x+w;
		renderer.vertices[start+11] = y;
		renderer.vertices[start+12] = 0;
		renderer.vertices[start+13] = color[0];
		renderer.vertices[start+14] = color[1];
		renderer.vertices[start+15] = color[2];
		renderer.vertices[start+16] = color[3];
		renderer.vertices[start+17] = 1;
		renderer.vertices[start+18] = 0;
		renderer.vertices[start+19] = 0;
		renderer.vertices[start+20] = x+w;
		renderer.vertices[start+21] = y+h;
		renderer.vertices[start+22] = 0;
		renderer.vertices[start+23] = color[0];
		renderer.vertices[start+24] = color[1];
		renderer.vertices[start+25] = color[2];
		renderer.vertices[start+26] = color[3];
		renderer.vertices[start+27] = 1;
		renderer.vertices[start+28] = 1;
		renderer.vertices[start+29] = 0;
		renderer.vertices[start+30] = x;
		renderer.vertices[start+31] = y+h;
		renderer.vertices[start+32] = 0;
		renderer.vertices[start+33] = color[0];
		renderer.vertices[start+34] = color[1];
		renderer.vertices[start+35] = color[2];
		renderer.vertices[start+36] = color[3];
		renderer.vertices[start+37] = 0;
		renderer.vertices[start+38] = 1;
		renderer.vertices[start+39] = 0;
		// renderer.vertices.push(
		// 	  x,   y, 0, color[0], color[1], color[2], color[3], 0, 0, 0,
		// 	x+w,   y, 0, color[0], color[1], color[2], color[3], 1, 0, 0,
		// 	x+w, y+h, 0, color[0], color[1], color[2], color[3], 1, 1, 0,
		// 	  x, y+h, 0, color[0], color[1], color[2], color[3], 0, 1, 0,
		// );

		renderer.indices[this.indexCount  ] = this.vertexCount;
		renderer.indices[this.indexCount+1] = this.vertexCount+1;
		renderer.indices[this.indexCount+2] = this.vertexCount+2;
		renderer.indices[this.indexCount+3] = this.vertexCount+2;
		renderer.indices[this.indexCount+4] = this.vertexCount+3;
		renderer.indices[this.indexCount+5] = this.vertexCount;
		// renderer.indices.push(this.vertexCount, this.vertexCount+1, this.vertexCount+2, this.vertexCount+2, this.vertexCount+3, this.vertexCount);

		this.vertexCount += 4, this.indexCount += 6;
	}

	drawTexturedRect(x, y, w, h, texture) {
		if((this.vertexCount + 4) >= this.maxVertexCount || (this.indexCount + 6) >= this.maxIndexCount) this.flush();

		if(texture.textureIndex === undefined) {
			if((this.textureIndex + 1) >= 16) this.flush();
			texture.bind(this.textureIndex++);
		}

		const start = this.vertexCount*10;
		renderer.vertices[start   ] = x;
		renderer.vertices[start+1 ] = y;
		renderer.vertices[start+2 ] = 0;
		renderer.vertices[start+3 ] = 1;
		renderer.vertices[start+4 ] = 1;
		renderer.vertices[start+5 ] = 1;
		renderer.vertices[start+6 ] = 1;
		renderer.vertices[start+7 ] = 0;
		renderer.vertices[start+8 ] = 0;
		renderer.vertices[start+9 ] = texture.textureIndex;
		renderer.vertices[start+10] = x+w;
		renderer.vertices[start+11] = y;
		renderer.vertices[start+12] = 0;
		renderer.vertices[start+13] = 1;
		renderer.vertices[start+14] = 1;
		renderer.vertices[start+15] = 1;
		renderer.vertices[start+16] = 1;
		renderer.vertices[start+17] = 1;
		renderer.vertices[start+18] = 0;
		renderer.vertices[start+19] = texture.textureIndex;
		renderer.vertices[start+20] = x+w;
		renderer.vertices[start+21] = y+h;
		renderer.vertices[start+22] = 0;
		renderer.vertices[start+23] = 1;
		renderer.vertices[start+24] = 1;
		renderer.vertices[start+25] = 1;
		renderer.vertices[start+26] = 1;
		renderer.vertices[start+27] = 1;
		renderer.vertices[start+28] = 1;
		renderer.vertices[start+29] = texture.textureIndex;
		renderer.vertices[start+30] = x;
		renderer.vertices[start+31] = y+h;
		renderer.vertices[start+32] = 0;
		renderer.vertices[start+33] = 1;
		renderer.vertices[start+34] = 1;
		renderer.vertices[start+35] = 1;
		renderer.vertices[start+36] = 1;
		renderer.vertices[start+37] = 0;
		renderer.vertices[start+38] = 1;
		renderer.vertices[start+39] = texture.textureIndex;
		// renderer.vertices.push(
		// 	  x,   y, 0, 1, 1, 1, 1, 0, 0, this.textureIndex,
		// 	x+w,   y, 0, 1, 1, 1, 1, 1, 0, this.textureIndex,
		// 	x+w, y+h, 0, 1, 1, 1, 1, 1, 1, this.textureIndex,
		// 	  x, y+h, 0, 1, 1, 1, 1, 0, 1, this.textureIndex,
		// );

		renderer.indices[this.indexCount  ] = this.vertexCount;
		renderer.indices[this.indexCount+1] = this.vertexCount+1;
		renderer.indices[this.indexCount+2] = this.vertexCount+2;
		renderer.indices[this.indexCount+3] = this.vertexCount+2;
		renderer.indices[this.indexCount+4] = this.vertexCount+3;
		renderer.indices[this.indexCount+5] = this.vertexCount;
		// renderer.indices.push(this.vertexCount, this.vertexCount+1, this.vertexCount+2, this.vertexCount+2, this.vertexCount+3, this.vertexCount);

		this.vertexCount += 4, this.indexCount += 6;
	}

	flush() {
		// renderer.vertexBuffer.write(renderer.vertices.slice(0, this.vertexCount*10));
		// renderer.indexBuffer.write(renderer.indices.slice(0, this.indexCount));
		renderer.vertexBuffer.partialWrite(renderer.vertices, this.vertexCount*10);
		renderer.indexBuffer.partialWrite(renderer.indices, this.indexCount);
		renderer.draw(this.indexCount);
		this.reset();
	}
}