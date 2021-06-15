import { gl } from './common.js';

/**
 * Gives byte amount of different WebGL types.
 * @memberof HB
 * @param {number} type - WebGL enum value (gl.FLOAT, gl.BYTE, gl.UNSIGNED_INT are currently supported).
 * @returns {number} amount of bytes.
 */
function bytes(type) {
	switch(type) {
		case gl.FLOAT: case gl.UNSIGNED_INT: return 4;
		case gl.BYTE: return 1;
	}
}

/**
 * Load a file.
 * @memberof HB
 * @param {string} path - Path of the file.
 * @param {string} type="text" - Type of the file [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/API/Body#Methods}.
 * @param {Function} callback - Callback with 1 argument which will receive data.
 * @fires loadFile:callback
 * @returns {Object} Object with 'data' and 'path' string properties.
 */
function loadFile(path, type = 'text', callback) {
	let returnValue = {data: "", path};

	const options = {method: 'GET'};
	fetch(path, options).then((res) => {
		return res[type]();
	}).then((data) => {
		callback(data);
	}).catch();

	return returnValue;
}

/**
 * Function for generating an ID, i.e. for keeping objects seperate.
 * @memberof HB
 * @param {number} length - Length of the identifier.
 * @param {boolean} lowercase - Whether to include the lowercase latin alphabet.
 * @param {boolean} uppercase - Whether to include the uppercase latin alphabet.
 * @param {boolean} numbers - Whether to include numbers 0-9.
 * @param {Array} idList - Optional array with previously generated IDs to prevent duplicates.
 * @returns {string} Unique identifier constructed according to the arguments.
 */
function generateId(length = 8, lowercase = true, uppercase = false, numbers = false, idList) {
	let id = '', vocab = [];
	if(lowercase) vocab.push('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z');
	if(uppercase) vocab.push('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z');
	if(numbers) vocab.push(0,1,2,3,4,5,6,7,8,9);

	if(idList !== undefined) {
		do {
			id = '';
			generate();
		} while(idList.every((listId) => listId !== id) === false);
	} else generate();

	return id;

	function generate() { for(let i = 0; i < length; i++) id += vocab[Math.floor(Math.random() * vocab.length)]; }
}

export {
	bytes,
	loadFile,
	generateId
};