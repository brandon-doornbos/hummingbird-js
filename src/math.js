/**
 * Randomizer class that's seedable with a random integer (mulberry32 by Tommy Ettinger, under public domain).
 * @alias HB.Math.SeededRandom
 * @memberof HB
 */
class SeededRandom {
	/**
	 * Create a new randomizer with a seed to extract values from.
	 * @param {number} seed - Integer to use as seed, defaults to current time in milliseconds.
	 * @param {boolean} integer - Whether to return integers or floats.
	 */
	constructor(seed = new Date().getTime(), integer = false) {
		this.t = seed + 0x6D2B79F;
		this.integer = integer;
	}

	/**
	 * Get a random value.
	 * @param {number} low=0 - The lowest value to return (inclusive).
	 * @param {number} high=1 - The highest value to return (exclusive), if 'integer' is true, this will default to the unsigned 32-bit integer max (4294967296).
	 * @param {boolean} integer=this.integer - Whether to return integers or floats, defaults to the value set in the constructor.
	 * @returns {number}
	 */
	value(low, high, integer = this.integer) {
		this.t = Math.imul(this.t ^ this.t >>> 15, this.t | 1);
		this.t ^= this.t + Math.imul(this.t ^ this.t >>> 7, this.t | 61);
		let res = ((this.t ^ this.t >>> 14) >>> 0);
		if (integer === false) {
			res /= 4294967296;
			if (high !== undefined) {
				return res * (high - low) + low;
			} else if (low !== undefined) {
				return res * low;
			}
		} else {
			if (high !== undefined) {
				return Math.floor(res / 4294967296 * (high - low) + low);
			} else if (low !== undefined) {
				return Math.floor(res / 4294967296 * low);
			}
		}
		return res;
	}
}

/**
 * Simple Noise class, (can't remember where I got it from, however, it seems really similar to [this]{@link https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/procedural-patterns-noise-part-1/creating-simple-1D-noise} and [this]{@link https://www.michaelbromley.co.uk/blog/simple-1d-noise-in-javascript/}).
 * @alias HB.Math.Noise
 * @memberof HB
 */
class Noise {
	/**
	 * Create a new Noise class.
	 * @param {number} amp - The amplitude of the noise.
	 * @param {number} scl - The scale of the noise.
	 * @param {Function} randFunc=Math.random - The random function used for generating the noise. For seeded noise, where srand is an {@link HB.Math.SeededRandom} instance, use '() => { srand.value(); }'.
	 */
	constructor(amp = 1, scl = 0.05, randFunc = Math.random) {
		this.vertices = 256, this.amp = amp, this.scl = scl, this.r = [];
		for (let i = 0; i < this.vertices; i++) this.r.push(randFunc());
	}

	/**
	 * Get the noise value at a specific value.
	 * @param {number} x - The value.
	 * @returns {number}
	 */
	value(x) {
		const sclX = x * this.scl, floorX = Math.floor(sclX), t = sclX - floorX;
		const xMin = floorX & this.vertices - 1, xMax = (xMin + 1) & this.vertices - 1;
		return HBMath.lerp(this.r[xMin], this.r[xMax], t * t * (3 - 2 * t)) * this.amp;
	}
}

/**
 * Method to assign {@link HB.SeededRandom} and {@link HB.Noise} to {@link HB.Math}.
 * @memberof HB
 */
function initMathObjects() {
	HBMath.SeededRandom = SeededRandom;
	HBMath.Noise = Noise;
}

/**
 * The class that encompasses some useful static mathematical methods.
 * @alias HB.Math
 * @memberof HB
 */
class HBMath {
	/**
	 * Method to convert cartesian degrees to radians.
	 * @param {number} degrees - The amount of degrees to convert.
	 * @returns {number}
	 */
	static radians(degrees) {
		return degrees * (Math.PI / 180);
	}
	/**
	 * Method to convert radians to cartesian degrees.
	 * @param {number} degrees - The amount of radians to convert.
	 * @returns {number}
	 */
	static degrees(radians) { // convert radians to degrees
		return radians * (180 / Math.PI);
	}
	/**
	 * Method to get the distance between two 2D points.
	 * @param {number} x1 - X-coordinate of the first point.
	 * @param {number} y1 - Y-coordinate of the first point.
	 * @param {number} x2 - X-coordinate of the second point.
	 * @param {number} y2 - Y-coordinate of the second point.
	 * @returns {number}
	 */
	static dist(x1, y1, x2, y2) { // gets distance between 2 x+y pairs
		return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	}
	/**
	 * Method to map a number to another range.
	 * @param {number} value - The value to map.
	 * @param {number} valLow - The minimum of value.
	 * @param {number} valHigh - The maximum of value.
	 * @param {number} resLow - The minimum value of the result.
	 * @param {number} resHigh - The maximum value of the result.
	 * @returns {number}
	 */
	static map(value, valLow, valHigh, resLow, resHigh) {
		return resLow + (resHigh - resLow) * (value - valLow) / (valHigh - valLow);
	}
	/**
	 * Utility method to get a random floating point value in a range, instead of 'Math.random' which only does 0-1.
	 * @param {number} low=0 - The minimum resulting value (inclusive).
	 * @param {number} high=1 - The maximum resulting value (exclusive).
	 * @returns {number}
	 */
	static random(low, high) {
		if (high !== undefined) {
			return Math.random() * (high - low) + low;
		} else if (low !== undefined) {
			return Math.random() * low;
		} else {
			return Math.random();
		}
	}
	/**
	 * Utility method to get a random integer in a range, instead of 'Math.random' which only does floats 0-1.
	 * @param {number} low=0 - The minimum resulting value (inclusive).
	 * @param {number} high=1 - The maximum resulting value (exclusive).
	 * @returns {number}
	 */
	static randomInt(low, high) {
		return Math.floor(this.random(low, high));
	}
	/**
	 * Linear interpolation method.
	 * @param {number} start - Value to interpolate from.
	 * @param {number} end - Value to interpolate to.
	 * @param {number} amt - Amount to interpolate by.
	 * @returns {number}
	 */
	static lerp(start, end, amt) {
		return start + amt * (end - start);
	}
	/**
	 * Method to constrain a value in a range.
	 * @param {number} value - Value to constrain.
	 * @param {number} min - Minimum to constrain to.
	 * @param {number} max - Maximum to constrain to.
	 * @returns {number} Original value if it is not constrained.
	 */
	static constrain(value, min, max) {
		if (value > max) {
			return max;
		} else if (value < min) {
			return min;
		} else {
			return value;
		}
	}
	/**
	 * Method to wrap a value once it is too big or small.
	 * @param {number} value - Value to wrap.
	 * @param {number} min - Minimum to wrap around.
	 * @param {number} max - Maximum to wrap around.
	 * @returns {number} Original value if it is not wrapped.
	 */
	static wrap(value, min, max) {
		if (value > max) {
			return min;
		} else if (value < min) {
			return max;
		} else {
			return value;
		}
	}
	/**
	 * Method to check for a collision between two axis-aligned rectangles.
	 * @param {glMatrix.vec2} vectorA - Position of the first rectangle.
	 * @param {glMatrix.vec2} sizeA - Size of the first rectangle.
	 * @param {glMatrix.vec2} vectorB - Position of the second rectangle.
	 * @param {glMatrix.vec2} sizeB - Size of the second rectangle.
	 * @returns {boolean} true if colliding.
	 */
	static rectRectCollision(vectorA, sizeA, vectorB, sizeB) {
		return (
			Math.abs((vectorA[0] + sizeA[0] / 2) - (vectorB[0] + sizeB[0] / 2)) * 2 < (sizeA[0] + sizeB[0])
		) && (
				Math.abs((vectorA[1] + sizeA[1] / 2) - (vectorB[1] + sizeB[1] / 2)) * 2 < (sizeA[1] + sizeB[1])
			);
	}
	/**
	 * Method to check for a collision between an axis-aligned rectangle and a circle.
	 * @param {glMatrix.vec2} rectPos - Position of the rectangle.
	 * @param {glMatrix.vec2} rectSize - Size of the rectangle.
	 * @param {glMatrix.vec2} circleCenter - Position of the center of the circle.
	 * @param {number} circleRadius - Radius of the circle.
	 * @returns {boolean} true if colliding.
	 */
	static rectCircleCollision(rectPos, rectSize, circleCenter, circleRadius) {
		const dx = circleCenter[0] - Math.max(rectPos[0], Math.min(circleCenter[0], rectPos[0] + rectSize[0]));
		const dy = circleCenter[1] - Math.max(rectPos[1], Math.min(circleCenter[1], rectPos[1] + rectSize[1]));
		return (dx * dx + dy * dy) < circleRadius * circleRadius;
	}
}

export {
	initMathObjects,
	HBMath as Math,
};
