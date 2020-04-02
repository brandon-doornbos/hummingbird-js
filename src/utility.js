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
function loadFile(path, type, callback) {
	let returnValue = {data: "", path};

	const options = {method: 'GET'};
	fetch(path, options).then((res) => {
		return res[type]();
	}).then((data) => {
		callback(data);
	}).catch();

	return returnValue;
}

export { bytes, loadFile };