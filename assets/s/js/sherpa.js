/* global window */
/* jshint -W097 */
'use strict';

(function(undefined) {

var sherpa = {};

// prepare basic support for promises.
// we return functions with a "then" method only. our "then" isn't chainable. and you don't get other promise-related methods.
// but this "then" is enough so your browser's promise library (or a polyfill) can turn it into a real promise.
function thenable(fn) {
	var settled = false;
	var fulfilled = false;
	var result = null;

	var goods = [];
	var bads = [];

	// promise lib will call the returned function, make it the same as our .then function
	var nfn = function(goodfn, badfn) {
		if(settled) {
			if(fulfilled && goodfn) {
				goodfn(result);
			}
			if(!fulfilled && badfn) {
				badfn(result);
			}
		} else {
			if(goodfn) {
				goods.push(goodfn);
			}
			if(badfn) {
				bads.push(badfn);
			}
		}
	};
	nfn.then = nfn;

	function done() {
		while(fulfilled && goods.length > 0) {
			goods.shift()(result);
		}
		while(!fulfilled && bads.length > 0) {
			bads.shift()(result);
		}
	}

	function makeSettle(xfulfilled) {
		return function(arg) {
			if(settled) {
				return;
			}
			settled = true;
			fulfilled = xfulfilled;
			result = arg;
			done();
		};
	}
	var resolve = makeSettle(true);
	var reject = makeSettle(false);
	try {
		fn(resolve, reject);
	} catch(e) {
		reject(e);
	}
	return nfn;
}

function postJSON(url, param, success, error) {
	var req = new window.XMLHttpRequest();
	req.open('POST', url, true);
	req.onload = function onload() {
		if(req.status >= 200 && req.status < 400) {
			success(JSON.parse(req.responseText));
		} else {
			if(req.status === 404) {
				error({code: 'sherpaBadFunction', message: 'function does not exist'});
			} else {
				error({code: 'sherpaHttpError', message: 'error calling function, HTTP status: '+req.status});
			}
		}
	};
	req.onerror = function onerror() {
		error({code: 'sherpaClientError', message: 'connection failed'});
	};
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(param));
}

function makeFunction(api, name) {
	return function() {
		var params = Array.prototype.slice.call(arguments, 0);
		return api._wrapThenable(thenable(function(resolve, reject) {
			postJSON(api._sherpa.baseurl+name, {params: params}, function(response) {
				if(response && response.error) {
					reject(response.error);
				} else if(response && response.hasOwnProperty('result')) {
					resolve(response.result);
				} else {
					reject({code: 'sherpaBadResponse', message: "invalid sherpa response object, missing 'result'"});
				}
			}, reject);
		}));
	};
}

sherpa.init = function init(_sherpa) {
	var api = {};

	function _wrapThenable(thenable) {
		return thenable;
	}

	function _call(name) {
		return makeFunction(api, name).apply(Array.prototype.slice.call(arguments, 1));
	}

	api._sherpa = _sherpa;
	api._wrapThenable = _wrapThenable;
	api._call = _call;
	for(var i = 0; i < _sherpa.functions.length; i++) {
		var fn = _sherpa.functions[i];
		api[fn] = makeFunction(api, fn);
	}

	return api;
};


// NOTE: if you are creating a sherpa server library, replace the code below with something like:
// var _sherpa = YOUR_SHERPA_JSON;
// window[_sherpa.id] = sherpa.init(_sherpa);


sherpa.load = function load(url) {
	function getJSON(url, success, error) {
		var req = new window.XMLHttpRequest();
		req.open('GET', url, true);
		req.onload = function onload() {
			if(req.status >= 200 && req.status < 400) {
				var result;
				try {
					result = JSON.parse(req.responseText);
				} catch(e) {
					error({code: 'SherpaBadResponse', message: 'invalid JSON in API descriptor'});
					return;
				}
				success(result);
			} else {
				if(req.status === 404) {
					error({code: 'sherpaNoAPI', message: 'no API available at this URL'});
				} else {
					error({code: 'sherpaHttpError', message: 'HTTP response status: '+req.status});
				}
			}
		};
		req.onerror = function onerror() {
			error({code: 'sherpaClientError', message: 'connection failed'});
		};
		req.send();
	}

	return thenable(function(resolve, reject) {
		getJSON(url+'sherpa.json', function success(_sherpa) {

			function validString(value) {
				return typeof value === 'string' && value !== '';
			}

			function isArray(o) {
				return Object.prototype.toString.call(o) === '[object Array]';
			}

			function isObject(o) {
				return o !== null && Object.prototype.toString.call(o) === '[object Object]';
			}

			function validFunctions(fns) {
				if(!isArray(fns)) {
					return false;
				}
				for(var i = 0; i < fns.length; i++) {
					if(!validString(fns[i])) {
						return false;
					}
				}
				return true;
			}

			function badResponse(msg) {
				reject({code: 'sherpaBadResponse', message: msg});
			}

			// verify _sherpa
			if(!isObject(_sherpa)) {
				badResponse('sherpa.json is not an object');
			} else if(_sherpa.sherpaVersion !== 0) {
				badResponse('unsupported sherpa version "'+_sherpa.sherpaVersion+'"');
			} else if(!validString(_sherpa.id)) {
				badResponse('missing/bad field "id" from API descriptor');
			} else if(!validString(_sherpa.title)) {
				badResponse('missing/bad field "title" from API descriptor');
			} else if(!validString(_sherpa.version)) {
				badResponse('missing/bad field "version" from API descriptor');
			} else if(!validString(_sherpa.baseurl)) {
				badResponse('missing/bad field "baseurl" from API descriptor');
			} else if(!validFunctions(_sherpa.functions)) {
				badResponse('missing/bad field "functions" from API descriptor');
			} else {
				var api = sherpa.init(_sherpa);
				resolve(api);
			}
		}, reject);
	});
};

window.sherpa = sherpa;

})();
