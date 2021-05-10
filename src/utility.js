import { gl } from './common.js';

// gives byte amount of different WebGL types
function bytes(type) {
	switch(type) {
		case gl.FLOAT: case gl.UNSIGNED_INT: return 4;
		case gl.BYTE: return 1;
	}
}

// load a file, give type(from link below) and supply callback that takes 1 i.e. data argument loadFile('path_to.file', (data) => console.log(data));
// https://developer.mozilla.org/en-US/docs/Web/API/Body#Methods
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

// function for generating an id, i.e. for keeping objects seperate
// there are arguments for length, inclusion of specific character sets and an idList in which you can give previous ids to prevent duplicates
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

export { bytes, loadFile, generateId };