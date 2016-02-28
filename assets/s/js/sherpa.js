/* global window */
'use strict';

(function(undefined) {

var sherpa = {};

// prepare basic support for promises.
// we return functions with a "then" method only. our "then" isn't chainable. and you don't get other promise-related methods.
// but this "then" is enough so your browser's promise library (or a polyfill) can turn it into a real promise.
var thenable = function(fn) {
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

	var done = function() {
		while(fulfilled && goods.length > 0) {
			goods.shift()(result);
		}
		while(!fulfilled && bads.length > 0) {
			bads.shift()(result);
		}
	};

	var makeSettle = function(xfulfilled) {
		return function(arg) {
			if(settled) {
				return;
			}
			settled = true;
			fulfilled = xfulfilled;
			result = arg;
			done();
		};
	};
	var resolve = makeSettle(true);
	var reject = makeSettle(false);
	try {
		fn(resolve, reject);
	} catch(e) {
		reject(e);
	}
	return nfn;
};

var getJSON = function(url, success, error) {
	var req = new window.XMLHttpRequest();
	req.open('GET', url, true);
	req.onload = function() {
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
				error({code: 'sherpaHttpError', message: "HTTP response status: "+req.status});
			}
		}
	};
	req.onerror = function() {
		error({code: 'sherpaClientError', message: "connection failed"});
	};
	req.send();
};

var postJSON = function(url, param, success, error) {
	var req = new window.XMLHttpRequest();
	req.open('POST', url, true);
	req.onload = function() {
		if(req.status >= 200 && req.status < 400) {
			success(JSON.parse(req.responseText));
		} else {
			if(req.status === 404) {
				error({code: 'sherpaBadFunction', message: 'function does not exist'});
			} else {
				error({code: 'sherpaHttpError', message: "http status: "+req.status});
			}
		}
	};
	req.onerror = function() {
		error({code: 'sherpaClientError', message: "connection failed"});
	};
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify(param));
};

var make = function(api, name) {
	return function() {
		var params = Array.prototype.slice.call(arguments, 0);
		return api._wrapThenable(thenable(function(resolve, reject) {
			postJSON(api._sherpa.baseurl+name, {params: params}, function(response) {
				if(response.error) {
					reject(response.error);
				} else {
					resolve(response.result);
				}
			}, reject);
		}));
	};
};

sherpa.init = function(url, _sherpa) {
	var api = {};

	var fallback = {
		sherpaVersion: 0,
		id: 'api',
		title: 'API',
		version: '0.0.0',
		baseurl: url,
		functions: []
	};
	for(var key in fallback) {
		_sherpa[key] = _sherpa[key] || fallback[key];
	}
	api._sherpa = _sherpa;

	api._wrapThenable = function(thenable) {
		return thenable;
	};

	api._call = function(name) {
		return make(api, name).apply(Array.prototype.slice.call(arguments, 1));
	};

	for(var i = 0; i < _sherpa.functions.length; i++) {
		var fn = _sherpa.functions[i];
		api[fn] = make(api, fn);
	}

	return api;
};

sherpa.load = function(url) {
	return thenable(function(resolve, reject) {
		getJSON(url+'sherpa.json', function success(_sherpa) {

			var validString = function(value) {
				return typeof value === 'string' && value !== '';
			};

			var isArray = function(o) {
				return Object.prototype.toString.call(o) === "[object Array]";
			};

			var isObject = function(o) {
				return o !== null && Object.prototype.toString.call(o) === '[object Object]';
			};

			var validFunctions = function(fns) {
				if(!isArray(fns)) {
					return false;
				}
				for(var i = 0; i < fns.length; i++) {
					if(!validString(fns[i])) {
						return false;
					}
				}
				return true;
			};

			var badResponse = function(msg) {
				reject({code: 'sherpaBadResponse', message: msg});
			};

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
				var api = sherpa.init(url, _sherpa);
				resolve(api);
			}
		}, reject);
	});
};

window.sherpa = sherpa;

})();
