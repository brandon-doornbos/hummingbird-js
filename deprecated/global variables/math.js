class Meth{
	static radians(degrees) { return degrees*(Math.PI/180); }
	static degrees(radians) { return radians*(180/Math.PI); }
	static map(value, valLow, valHigh, resLow, resHigh) { return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow); }
	static random(low, high) { if(high !== undefined) return Math.random() * (high-low) + low; else if(low !== undefined) return Math.random() * low; else return Math.random(); }
	static randomInt(low, high) { return Math.floor(random(low, high)); }
}

class Mat4{
	static new(identity = 0) { return [identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity]; }

	static orthographic(out, left, right, top, bottom, near = -1, far = 1) {
		const rl = right-left, tb = top-bottom, fn = far-near;

		out[0 ] = 2/rl, out[1 ] =    0, out[2 ] =     0, out[3 ] = -(right+left)/rl;
		out[4 ] =    0, out[5 ] = 2/tb, out[6 ] =     0, out[7 ] = -(top+bottom)/tb;
		out[8 ] =    0, out[9 ] =    0, out[10] = -2/fn, out[11] =   -(far+near)/fn;
		out[12] =    0, out[13] =    0, out[14] =     0, out[15] =                1;
	}

	// static perspective(aspectRatio, fieldOfView, near = 1, far = 100) {
	// 	return [
	// 		1/(aspectRatio*Math.tan(fieldOfView/2)),                         0,                        0,                          0,
	// 		                                      0, 1/Math.tan(fieldOfView/2),                        0,                          0,
	// 		                                      0,                         0, -((far+near)/(far-near)), -((2*far*near)/(far-near)),
	// 		                                      0,                         0,                       -1,                          0,
	// 	];
	// }
	// static perspective(left, right, top, bottom, near, far) {
	// 	return [
	// 		(2*near)/(right-left), 0, (right+left)/(right-left), 0,
	// 		0, (2*near)/(top-bottom), (top+bottom)/(top-bottom), 0,
	// 		0, 0, -(far+near)/(far-near), -(2*far*near)/(far-near),
	// 		0, 0, -1, 0,
	// 	];
	// }
	static perspective(fovy, aspect, near, far) {
		let f = 1/Math.tan(fovy/2), nf =  1/(near-far);
		return [f/aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far+near)*nf, -1, 0, 0, 2*far*near*nf, 0];
	}

	static multMat4(out, matrixA, matrixB) {
		const row0 = Vec4.multMat4([matrixB[ 0], matrixB[ 1], matrixB[ 2], matrixB[ 3]], matrixA);
		const row1 = Vec4.multMat4([matrixB[ 4], matrixB[ 5], matrixB[ 6], matrixB[ 7]], matrixA);
		const row2 = Vec4.multMat4([matrixB[ 8], matrixB[ 9], matrixB[10], matrixB[11]], matrixA);
		const row3 = Vec4.multMat4([matrixB[12], matrixB[13], matrixB[14], matrixB[15]], matrixA);

		out[0 ] = row0[0], out[1 ] = row0[1], out[2 ] = row0[2], out[3 ] = row0[3];
		out[4 ] = row1[0], out[5 ] = row1[1], out[6 ] = row1[2], out[7 ] = row1[3];
		out[8 ] = row2[0], out[9 ] = row2[1], out[10] = row2[2], out[11] = row2[3];
		out[12] = row3[0], out[13] = row3[1], out[14] = row3[2], out[15] = row3[3];
	}

	static scale(out, matrix, scale) { Mat4.multMat4(out, matrix, [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1]); }
	static translate(out, matrix, vector) { Mat4.multMat4(out, matrix, [1, 0, 0, vector[0], 0, 1, 0, vector[1], 0, 0, 1, vector[2], 0, 0, 0, 1]); }
	static rotateX(out, matrix, angle) { Mat4.multMat4(out, matrix, [1, 0, 0, 0, 0, Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateY(out, matrix, angle) { Mat4.multMat4(out, matrix, [Math.cos(-angle), 0, Math.sin(-angle), 0, 0, 1, 0, 0, Math.sin(angle), 0, Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateZ(out, matrix, angle) { Mat4.multMat4(out, matrix, [Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
}

class Vec2{
	static new(x, y) { return [x, y]; }
}

class Vec3{
	static new(x, y, z) { return [x, y, z]; }
}

class Vec4{
	static new(x, y, z, w) { return [x, y, z, w]; }

	static multVec4(vectorA, vectorB) { return [vectorA[0] * vectorB[0], vectorA[1] * vectorB[1], vectorA[2] * vectorB[2], vectorA[3] * vectorB[3]]; }

	static multMat4(vector, matrix) {
		return [
			(vector[0] * matrix[ 0]) + (vector[1] * matrix[ 4]) + (vector[2] * matrix[ 8]) + (vector[3] * matrix[12]),
			(vector[0] * matrix[ 1]) + (vector[1] * matrix[ 5]) + (vector[2] * matrix[ 9]) + (vector[3] * matrix[13]),
			(vector[0] * matrix[ 2]) + (vector[1] * matrix[ 6]) + (vector[2] * matrix[10]) + (vector[3] * matrix[14]),
			(vector[0] * matrix[ 3]) + (vector[1] * matrix[ 7]) + (vector[2] * matrix[11]) + (vector[3] * matrix[15])
		];
	}
}