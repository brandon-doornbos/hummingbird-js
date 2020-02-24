class Meth{
	static radians(degrees) { return degrees*(Math.PI/180); }
	static degrees(radians) { return radians*(180/Math.PI); }
}

class Mat4{
	static new(v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15) {
		return [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15];
	}

	static identity() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }

	static orthographic(left, right, top, bottom, near = -1, far = 1) {
		return [
			2/(right-left),              0,             0, -((right+left)/(right-left)),
									 0, 2/(top-bottom),             0, -((top+bottom)/(top-bottom)),
									 0,              0, -2/(far-near),     -((far+near)/(far-near)),
									 0,              0,             0,                            1,
		];
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

	static multMat4(matrixA, matrixB) {
		const row1 = Vec4.multMat4([matrixB[ 0], matrixB[ 1], matrixB[ 2], matrixB[ 3]], matrixA);
		const row2 = Vec4.multMat4([matrixB[ 4], matrixB[ 5], matrixB[ 6], matrixB[ 7]], matrixA);
		const row3 = Vec4.multMat4([matrixB[ 8], matrixB[ 9], matrixB[10], matrixB[11]], matrixA);
		const row4 = Vec4.multMat4([matrixB[12], matrixB[13], matrixB[14], matrixB[15]], matrixA);

		return [row1[0], row1[1], row1[2], row1[3], row2[0], row2[1], row2[2], row2[3], row3[0], row3[1], row3[2], row3[3], row4[0], row4[1], row4[2], row4[3]];
	}

	static scale(matrix, vector) { return Mat4.multMat4(matrix, [vector[0], 0, 0, 0, 0, vector[1], 0, 0, 0, 0, vector[2], 0, 0, 0, 0, 1]); }
	static translate(matrix, vector) { return Mat4.multMat4(matrix, [1, 0, 0, vector[0], 0, 1, 0, vector[1], 0, 0, 1, vector[2], 0, 0, 0, 1]); }
	static rotateX(matrix, angle) { return Mat4.multMat4(matrix, [1, 0, 0, 0, 0, Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateY(matrix, angle) { return Mat4.multMat4(matrix, [Math.cos(-angle), 0, Math.sin(-angle), 0, 0, 1, 0, 0, Math.sin(angle), 0, Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateZ(matrix, angle) { return Mat4.multMat4(matrix, [Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
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