class HBMath{
	constructor() {
		new Vec2();
		new Vec3();
		new Vec4();
	}

	static radians(degrees) { // convert degrees to radians
		return degrees*(Math.PI/180);
	}
	static degrees(radians) { // convert radians to degrees
		return radians*(180/Math.PI);
	}
	static map(value, valLow, valHigh, resLow, resHigh) { // map a number to another range
		return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow);
	}
	static random(low, high) { // a random float between 2 numbers
		if(high !== undefined) {
			return Math.random() * (high-low) + low;
		} else if(low !== undefined) {
			return Math.random() * low;
		} else {
			return Math.random();
		}
	}
	static randomInt(low, high) { // a random integer between 2 numbers
		return Math.floor(this.random(low, high));
	}
	static lerp(start, end, amt) { // linear interpolation
		return start+amt*(end-start);
	}
	static constrain(value, min, max) { // constrain a value
		if(value > max) {
			return max;
		} else if(value < min) {
			return min;
		} else {
			return value;
		}
	}
	static wrap(value, min, max) { // wrap a value if it is too high or low
		if(value > max) {
			return min;
		} else if(value < min) {
			return max;
		} else {
			return value;
		}
	}
	static rectRectCollision(vectorA, sizeA, vectorB, sizeB) { // check for AABB collision between two rectangles
		return (Math.abs((vectorA[0]+sizeA[0]/2) - (vectorB[0]+sizeB[0]/2)) * 2 < (sizeA[0] + sizeB[0]))
				&& (Math.abs((vectorA[1]+sizeA[1]/2) - (vectorB[1]+sizeB[1]/2)) * 2 < (sizeA[1] + sizeB[1]));
	}
}

// Perlin Noise class, create 1 instance and get values via noise.value(x); function
class Noise{
	constructor(amp_ = 1, scl_ = 0.05) {
		this.vertices = 256, this.amp = amp_, this.scl = scl_, this.r = [];
		for(let i = 0; i < this.vertices; i++) this.r.push(Math.random());
	}

	value(x) {
		const sclX = x*this.scl, floorX = Math.floor(sclX), t = sclX-floorX;
		const xMin = floorX & this.vertices-1, xMax = (xMin + 1) & this.vertices-1;
		return HBMath.lerp(this.r[xMin], this.r[xMax], t*t*(3-2*t)) * this.amp;
	}
}

class Vec2{
	constructor() {
		Vec2.zero = [0, 0];
		Vec2.one = [1, 1];
	}

	static new(x = 0, y = 0) { return [x, y]; }
	static fromVec2(vector) { return [vector[0], vector[1]]; }
	static fromAngle(angle, radius = 1) { return this.new(Math.cos(angle) * radius, Math.sin(angle) * radius); }
	static copy(out, vector) { out[0] = vector[0], out[1] = vector[1]; }
	static set(out, x, y) { out[0] = x, out[1] = y; }

	static add(out, x, y) { out[0] += x, out[1] += y; }
	static addVec2(out, vector) { out[0] += vector[0], out[1] += vector[1]; }
	static addScalar(out, scalar) { out[0] += scalar, out[1] += scalar; }

	static subtract(out, x, y) { out[0] -= x, out[1] -= y; }
	static subtractVec2(out, vector) { out[0] -= vector[0], out[1] -= vector[1]; }
	static subtractScalar(out, scalar) { out[0] -= scalar, out[1] -= scalar; }

	static multiply(out, x, y) { out[0] *= x, out[1] *= y; }
	static multiplyVec2(out, vector) { out[0] *= vector[0], out[1] *= vector[1]; }
	static multiplyScalar(out, scalar) { out[0] *= scalar, out[1] *= scalar; }

	static divide(out, x, y) { out[0] /= x, out[1] /= y; }
	static divideVec2(out, vector) { out[0] /= vector[0], out[1] /= vector[1]; }
	static divideScalar(out, scalar) { out[0] /= scalar, out[1] /= scalar; }

	static constrain(out, lowX, hiX, lowY, hiY) {
		out[0] = HBMath.constrain(out[0], lowX, hiX);
		out[1] = HBMath.constrain(out[1], lowY, hiY);
	}

	static angleBetweenVec2(vectorA, vectorB) {
		return Math.atan2(vectorB[1] - vectorA[1], vectorB[0] - vectorA[0]);
	}

	static distBetweenVec2(vectorA, vectorB) {
		return Math.sqrt((vectorB[0]-vectorA[0])*(vectorB[0]-vectorA[0]) + (vectorB[1]-vectorA[1])*(vectorB[1]-vectorA[1]));
	}

	static collidesRect(vector, rectPos, rectSize) {
		return (
				 vector[0] < rectPos[0]+rectSize[0]
			&& vector[0] > rectPos[0]
			&& vector[1] < rectPos[1]+rectSize[1]
			&& vector[1] > rectPos[1]
		);
	}
}

class Vec3{
	constructor() {
		Vec3.zero = [0, 0, 0];
		Vec3.one = [1, 1, 1];
	}

	static new(x = 0, y = 0, z = 0) { return [x, y, z]; }
}

class Vec4{
	constructor() {
		Vec4.zero = [0, 0, 0, 0];
		Vec4.one = [1, 1, 1, 1];

		Vec4.colors = {};
		Vec4.colors['white'] = [1, 1, 1, 1];
		Vec4.colors['black'] = [0, 0, 0, 1];
		Vec4.colors['red'] = [1, 0, 0, 1];
		Vec4.colors['green'] = [0, 1, 0, 1];
		Vec4.colors['blue'] = [0, 0, 1, 1];
		Vec4.colors['yellow'] = [1, 1, 0, 1];
		Vec4.colors['cyan'] = [0, 1, 1, 1];
		Vec4.colors['magenta'] = [1, 0, 1, 1];
	}

	static new(x = 0, y = 0, z = 0, w = 0) { return [x, y, z, w]; }

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

class Mat4{
	static new(identity = 0) { return [identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity, 0, 0, 0, 0, identity]; }

	static orthographic(out, left, right, top, bottom, near = -1, far = 1) {
		const rl = right-left, tb = top-bottom, fn = far-near;

		out[0 ] = 2/rl, out[1 ] =    0, out[2 ] =     0, out[3 ] = -(right+left)/rl;
		out[4 ] =    0, out[5 ] = 2/tb, out[6 ] =     0, out[7 ] = -(top+bottom)/tb;
		out[8 ] =    0, out[9 ] =    0, out[10] = -2/fn, out[11] =   -(far+near)/fn;
		out[12] =    0, out[13] =    0, out[14] =     0, out[15] =                1;
	}

	// static perspective(out, FoV, aspect, near = 0.01, far = 1000) {
	// 	const f = Math.tan(Math.PI * 0.5 - 0.5 * FoV);
	// 	const invRange = 1.0 / (near - far);

	// 	out[0] = f/aspect, out[4] = 0, out[ 8] =                   0, out[12] =  0;
	// 	out[1] =        0, out[5] = f, out[ 9] =                   0, out[13] =  0;
	// 	out[2] =        0, out[6] = 0, out[10] = (near+far)*invRange, out[14] = -1;
	// 	out[3] =        0, out[7] = 0, out[11] = near*far*invRange*2, out[15] =  0;
	// }

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

	static scale(out, matrix, scale) { this.multMat4(out, matrix, [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1]); }
	static translate(out, matrix, vector3) { this.multMat4(out, matrix, [1, 0, 0, vector3[0], 0, 1, 0, vector3[1], 0, 0, 1, vector3[2], 0, 0, 0, 1]); }
	static rotate(out, matrix, up, angle) {
		const x = up[0] * Math.sin(angle/2);
		const y = up[1] * Math.sin(angle/2);
		const z = up[2] * Math.sin(angle/2);
		const w = Math.cos(angle/2);

		const x2 = x + x, y2 = y + y, z2 = z + z;

		const xx = x * x2;
		const yx = y * x2, yy = y * y2;
		const zx = z * x2, zy = z * y2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;

		this.multMat4(out, matrix, [1-yy-zz, yx+wz, zx-wy, 0, yx-wz, 1-xx-zz, zy+wx, 0, zx+wy, zy+wx, 1-xx-yy, 0, 0, 0, 0, 1]);
	}
	static rotateX(out, matrix, angle) { this.multMat4(out, matrix, [1, 0, 0, 0, 0, Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateY(out, matrix, angle) { this.multMat4(out, matrix, [Math.cos(-angle), 0, Math.sin(-angle), 0, 0, 1, 0, 0, Math.sin(angle), 0, Math.cos(-angle), 0, 0, 0, 0, 1]); }
	static rotateZ(out, matrix, angle) { this.multMat4(out, matrix, [Math.cos(-angle), Math.sin(angle), 0, 0, Math.sin(-angle), Math.cos(-angle), 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
}

export { HBMath as Math, Noise, Vec2, Vec3, Vec4, Mat4 };