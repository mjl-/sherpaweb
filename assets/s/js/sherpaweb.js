/* global window, location, console, document, $, _, marked, Promise, sherpa, setTimeout, JSONViewer */
/* jshint -W097 */
'use strict';

(function() {

var sherpaweb = {};

sherpaweb.error = function(err) {
	var $modal = $('.x-error-modal');
	$modal.find('.x-errormessage').text(''+err);
	$modal.modal('show');
	setTimeout(function() {
		$modal.find('.modal-footer').find('.btn').last().focus();
	}, 500);
};

var slugify = function(name) {
	var s = name.toLowerCase();
	s = s.replace(/[^a-z0-9-]+/g, '-');
	s = s.replace(/--+/g, '-');
	s = s.replace(/^-*/, '');
	s = s.replace(/-*$/, '');
	return s;
};

var renderMarkdown = function(text, indent) {
	var escapeHTML = function(s) {
		return s.replace(/[&"<>]/g, function (c) {
			return {
				'&': "&amp;",
				'"': "&quot;",
				'<': "&lt;",
				'>': "&gt;"
			}[c];
		});
	};

	var renderer = new marked.Renderer();
	renderer.heading = function(text, level) {
		var s = '';
		s += '<h'+(level+indent)+'>';
		s += escapeHTML(text);
		s += '</h'+(level+indent)+'>';
		return s;
	};
	var options = {
		renderer: renderer
	};
	return marked(text, options);
};


// intercept clicks on elements with class x-hash.  their href is supposed to contain just a hash, like #some-section-name
$('body').on('click', '.x-hash', function(e) {
	e.preventDefault();

	var ns = _.cloneDeep(sherpaweb.state);
	ns.hash = $(this).attr('href').substr(1);
	if(ns.hash !== ns.invoke.fn) {
		ns.invoke = {
			fn: '',
			params: [],
			call: false
		};
	}
	var newLocationHash = packState(ns);
	if(location.hash === newLocationHash) {
		scrollToHash(ns.hash);
	} else {
		location.hash = packState(ns);
	}
});

$('body').on('submit', '.x-form-api', function(e) {
	e.preventDefault();

	var baseURL = $(this).find('[name=url]').val();
	if(!/^https?:/.test(baseURL)) {
		baseURL = 'https://'+baseURL;
	}
	location.hash = '#'+baseURL;
	// onhashchange is triggered...
});


function removeParam($box) {
	$box.prev('.x-box').find(':input').first().focus();
	$box.remove();
}

$('body').on('click', '.x-form-call .x-remove-param', function(e) {
	e.preventDefault();

	var $box = $(this).closest('.x-box');
	removeParam($box);
});


function handleCtrlPlus(e, $form)  {
	// ctrl-+
	if(e.which === 61 && e.ctrlKey) {
		e.preventDefault();
		formAddParam($form, undefined, true);
		return true;
	}
	return false;
}

function handleCtrlS(e, $form) {
	// ctrl-s
	if(e.which === 115 && e.ctrlKey || e.which === 19) {
		e.preventDefault();
		saveParams($form);
		return true;
	}
	return false;
}

function handleCtrlMinus(e, $box) {
	// ctrl-minus
	if(e.which === 31 && e.ctrlKey) {
		e.preventDefault();
		removeParam($box);
		return true;
	}
	return false;
}

function handleKeys(e, $form, $box) {
	return handleCtrlPlus(e, $form) || handleCtrlMinus(e, $box) || handleCtrlS(e, $form);
}


var formAddParam = function($form, value, focus) {
	var placeholder = '"string" or {"key": "value"} or 123 or null"';
	var $inputbox = $('<div class="x-box" style="clear:both; margin-bottom:0.5ex; position:relative"><div style="padding-right:5rem"><input class="form-control" type="text" /></div><div style="position:absolute; top:0; right:0"><a class="btn btn-danger x-remove-param" title="Remove parameter"><i class="fa fa-minus-circle"></i></a></div></div>');
	var $input = $inputbox.find(':input');
	$input.attr('placeholder', placeholder);
	if(value !== undefined) {
		$input.val(value);
	}
	$input.on('keypress', function(e) {
		if(handleKeys(e, $form, $inputbox)) {
			return;
		}

		// enter
		if(e.which === 13) {
			e.preventDefault();

			if(!e.ctrlKey) {
				$input.closest('form').submit();
				return;
			}

			// ctrl-enter
			var $box = $('<div><textarea rows="5" class="form-control"></textarea><span style="float:right; font-style:italic">Set content from file if JSON, or base64 dataURI-encoded.</span><input style="display:inline-block" type="file" /></div>');
			var $textarea = $box.find('textarea').val($input.val());
			$textarea.attr('placeholder', placeholder);
			$input.replaceWith($box);
			$textarea.focus();
			$textarea.on('keypress', function(e) {
				if(handleKeys(e, $form, $inputbox)) {
					return;
				}
				if(e.which === 13 && e.altKey) {
					e.preventDefault();
					$textarea.closest('form').submit();
				}
			});
			var $fileinput = $box.find('input');
			$fileinput.on('change', function(e) {
				if(!window.FileReader) {
					sherpaweb.error('Your browser does not support JavaScript file manipulation.');
					return;
				}
				if($fileinput[0].files.length !== 1) {
					sherpaweb.error('Only one file at a time is supported.');
					return;
				}

				function readDataURI() {
					var fr = new window.FileReader();
					fr.onload = function onload(e) {
						$textarea.val('"'+e.target.result+'"');
					};
					fr.onerror = function onerror(e) {
						sherpaweb.error('Error loading file');
					};
					fr.readAsDataURL($fileinput[0].files[0]);
				}
				
				var fr = new window.FileReader();
				fr.onload = function onload(e) {
					try {
						var s = JSON.parse(e.target.result);
						$textarea.val(e.target.result);
					} catch(ex) {
						readDataURI();
					}
				};
				fr.onerror = function onerror(e) {
					sherpaweb.error('Error loading file');
				};
				fr.readAsText($fileinput[0].files[0]);
			});
		}
	});
	$form.find('.x-params').append($inputbox);
	if(focus) {
		$input.focus();
	}
	$form.find('.x-tips').show();
};

$('body').on('click', '.x-form-call .x-add-param', function(e) {
	e.preventDefault();

	var $form = $(this).closest('.x-form-call');
	formAddParam($form, undefined, true);
});

$('body').on('click', '.x-form-call .x-clear-params', function(e) {
	e.preventDefault();

	var $form = $(this).closest('.x-form-call');
	$form.find('.x-box').remove();
});

function saveParams($form) {
	var call = formGather($form, true);
	var key = JSON.stringify([sherpaweb.state.baseURL, call.fn]);
	var value = JSON.stringify(call.params);
	try {
		window.localStorage.setItem(key, value);
	} catch(ex) {
		// will error if no localStorage support, when storage is full, or for some browsers when in private mode
	}
}

$('body').on('click', '.x-form-call .x-save-params', function(e) {
	e.preventDefault();

	var $form = $(this).closest('.x-form-call');
	saveParams($form);
});

$('body').on('click', '.x-form-call .x-export-call', function(e) {
	e.preventDefault();

	var $form = $(this).closest('.x-form-call');
	var call = formGather($form, false);
	if(!call) {
		return;
	}

	var $modal = $('.x-export-modal');

	var docsUrl = location.protocol+'//'+location.host+'/#'+sherpaweb.api._sherpa.baseurl+'?fn='+call.fn;
	if(call.params.length > 0) {
		docsUrl += '&params='+encodeURIComponent(JSON.stringify(call.params));
	}
	var docsUrlCall = docsUrl+'&call';
	docsUrl += '#'+call.fn;
	docsUrlCall += '#'+call.fn;
	$modal.find('.x-docs-url').text(docsUrl).attr('href', docsUrl);
	$modal.find('.x-docs-url-call').text(docsUrlCall).attr('href', docsUrlCall);
	$modal.find('.x-export-id').text(sherpaweb.api._sherpa.id);
	$modal.find('.x-export-baseurl').text(sherpaweb.api._sherpa.baseurl);
	$modal.find('.x-export-fn').text(call.fn);
	var paramsCall = JSON.stringify(call.params);
	paramsCall = paramsCall.substring(1, paramsCall.length-1); // drop []
	$modal.find('.x-export-params-call').text(paramsCall);
	var jsonUrl = sherpaweb.api._sherpa.baseurl+call.fn;
	$modal.find('.x-export-json-url').text(jsonUrl);
	var bodyQs = encodeURIComponent(JSON.stringify({params: call.params}));
	$modal.find('.x-export-body-qs').text(bodyQs);
	var paramsCLI = JSON.stringify(call.params).replace("'", '\\u0027');
	$modal.find('.x-export-params-cli').text(paramsCLI);

	$modal.on('click', '.x-export-show', function(e) {
		e.preventDefault();
		var what = $(this).data('export');
		$modal.find('.x-export-show').removeClass('active');
		$(this).addClass('active');
		$modal.find('.x-export-content').hide();
		$modal.find('.x-export-content[data-export='+what+']').show();
	});

	$modal.modal('show');
});

// gather function & params from form
var formGather = function($form, just_text) {
	var fn = $form.find('input[name=function]').val();
	var params = [];
	var inputs = $form.find('.x-params :input').not('input[type=file]');
	for(var i = 0; i < inputs.length; i++) {
		try {
			var v = $(inputs[i]).val();
			if(!just_text) {
				v = JSON.parse(v);
			}
			params.push(v);
		} catch(ex) {
			$form.find('.x-error').empty().append($('<p>Bad JSON parameter: '+v+'</p><p>Hint: use JSON syntax, such as: {"list": ["string", true, 1.23, null]}</p>'));
			$form.find('.x-response, .x-error').fadeIn();
			return null;
		}
	}
	return {
		fn: fn,
		params: params
	};
};

var formCall = function($form) {
	$form.find('.x-response, .x-response-buttons, .x-result, .x-error').hide();

	function setButtons(viewer) {
		$form.find('.x-response-buttons').show();
		$form.find('.x-response-buttons .x-response-collapse')[0].onclick = function(e) {
			e.preventDefault();
			viewer.collapseAll();
		};
		$form.find('.x-response-buttons .x-response-uncollapse')[0].onclick = function(e) {
			e.preventDefault();
			viewer.uncollapseAll();
		};
	}

	var call = formGather($form, false);
	if(!call) {
		return;
	}
	var $loading = $form.find('.x-loading').show();
	var $timeSpent = $form.find('.x-timespent').text('');
	var timeSpent = function(t0) {
		$timeSpent.text(''+(new Date().getTime()-t0)+'ms');
	};
	var fn = sherpaweb.api[call.fn];
	if(!fn) {
		$loading.hide();
		$form.find('.x-error').text("Method not exported through API.");
		$form.find('.x-response, .x-error').fadeIn();
		return;
	}
	var t0 = new Date().getTime();
	fn.apply(fn, call.params)
	.then(function(result) {
		timeSpent(t0);
		$loading.hide();
		var $result = $form.find('.x-result').empty();
		var viewer = new JSONViewer($result[0], 50);
		viewer.render(result);
		$form.find('.x-response, .x-result').fadeIn();
		setButtons(viewer);
	}, function error(e) {
		timeSpent(t0);
		$loading.hide();
		var $error = $form.find('.x-error').empty();
		var viewer = new JSONViewer($error[0], 10);
		viewer.render(e);
		$form.find('.x-response, .x-error').fadeIn();
		setButtons(viewer);
	});
};

function makeCallForm(fnname, params) {
	var f = '';
	f += '<form class="x-form-call form-call">';
	f += ' <input type="hidden" name="function" value="">';
	f += ' <div style="float:right">';
	f += '  <button class="btn btn-default btn-sm x-export-call" style="margin-bottom:0.5rem" title="Export"><i class="fa fa-share-square"></i> </button>';
	f += '  <button class="btn btn-default btn-sm x-save-params" style="margin-bottom:0.5rem" title="Save parameters to local storage"><i class="fa fa-save"></i> </button>';
	f += '  <button class="btn btn-default btn-sm x-clear-params" style="margin-bottom:0.5rem" title="Clear all parameters"><i class="fa fa-close"></i> </button>';
	f += '  <button class="btn btn-default btn-sm x-add-param" style="margin-bottom:0.5rem" title="Add parameter"><i class="fa fa-plus-circle"></i> param</button>';
	f += ' </div>';
	f += ' <div class="x-params"></div>';
	f += ' <button type="submit" class="btn btn-primary btn-sm x-call"><i class="fa fa-play-circle"></i> Call</button>';
	f += ' <span class="fa fa-cog fa-spin x-loading" style="margin-left:1rem; display:none"></span>';
	f += ' <small class="x-timespent" style="margin-left:1rem"></small>';
	f += ' <div class="x-response" style="position:relative; display:none">';
	f += '  <div class="btn-group x-response-buttons" style="top:0.5rem; right:0.5rem; position:absolute; display:none">';
	f += '   <button class="btn btn-default btn-sm x-response-collapse">collapse all</button>';
	f += '   <button class="btn btn-default btn-sm x-response-uncollapse">uncollapse all</button>';
	f += '  </div>';
	f += '  <div class="x-result alert alert-success" style="display:none; margin-top:1ex; margin-bottom:0; font-family:monospace"></div>';
	f += '  <div class="x-error alert alert-danger" style="display:none; margin-top:1ex; margin-bottom:0; font-family:monospace"></div>';
	f += ' </div>';
	f += ' <div class="text-muted x-tips" style="margin-top:1rem; font-style:italic; display:none">Tips: Turn input field into textarea with ctrl+enter. Submit call from textarea with alt+enter. Save parameters to local storage using ctlr-s. Add parameter with ctrl-plus, remove with ctrl-minus.</div>';
	f += '</form>';
	var $form = $(f);
	$form.find('[name=function]').val(fnname);
	_.each(params, function(param) {
		formAddParam($form, param, false);
	});

	$form.on('submit', function(e) {
		e.preventDefault();

		var $form = $(this).closest('.x-form-call');
		formCall($form);
	});

	return $form;
}


sherpaweb.renderDocs = function(docs) {
	var makeFunctions = function(section) {
		var $div = $('<div></div>');

		var $a = $('<a class="x-hash"></a>').text(''+section.title).attr('href', '#'+slugify(section.title));
		var $title = $('<h5></h5>').append($a);
		$div.append($title);

		var $ul = $('<ul class="functionlist"></ul>');
		var appendLi = function(content) {
			var $li = $('<li></li>');
			$li.append(content);
			$ul.append($li);
		};
		_.each(section.functions, function(fn) {
			var $a = $('<a class="x-hash"></a>').text(fn.name).attr('href', '#'+fn.name);
			$ul.append(appendLi($a));
		});
		$div.append($ul);

		_.each(section.sections, function(subsection) {
			var $subsection = makeFunctions(subsection);
			$subsection.addClass('subsection');
			$div.append($subsection);
		});

		return $div;
	};

	var makeDocs = function(section, indent) {
		var slug = slugify(section.title);
		var $title = $('<h'+(1+indent)+' class="page-header titlelink"><span class="x-title"></span> <small><a class="link x-link x-hash">¶</a></small></h'+(1+indent)+'>');
		$title.attr('id', slug);
		$title.find('.x-title').text(section.title);
		$title.find('.x-link').attr('href', '#'+slug);

		// in first level, add baseurl & version
		if(indent === 0) {
			var $subline = $('<div><small><span class="x-baseurl"></span> - <span class="x-version"></span></small></div>');
			$subline.find('.x-baseurl').text(sherpaweb.api._sherpa.baseurl);
			$subline.find('.x-version').text(sherpaweb.api._sherpa.version);
			$title.append($subline);
		}

		var $body = $('<div></div>');
		$body[0].innerHTML = renderMarkdown(section.text, 2);

		var functions = [];
		_.each(section.functions, function(fn) {
			var fnSig = fn.name;
			var fnDoc = '';
			if(fn.text) {
				fnSig = fn.text.split('\n', 1)[0];
				fnDoc = fn.text.substring(fnSig.length+1);
			}

			var h = '';
			h += '<div class="panel panel-default function-panel">';
			h += ' <div class="panel-heading titlelink">';
			h += '  <span style="font-size:1.2em; font-weight:bold" class="x-title"></span>';
			h += '  <a class="link x-link x-hash">¶</a>';
			h += ' </div>';
			h += ' <div class="panel-body x-body">';
			h += ' </div>';
			h += '</div>';
			var $panel = $(h);
			$panel.attr('id', fn.name);
			$panel.find('.x-title').text(fnSig);
			$panel.find('.x-link').attr('href', '#'+fn.name);

			$panel.find('.x-body')[0].innerHTML = renderMarkdown(fnDoc, 3);

			var call = {
				fn: fn.name,
				params: []
			};
			var key = JSON.stringify([sherpaweb.api._sherpa.baseurl, fn.name]);
			try {
				var value = window.localStorage.getItem(key) || '[]';
				call.params = JSON.parse(value);
			} catch(ex) {
				// will fail if localStorage isn't supported
			}
			var $form = makeCallForm(call.fn, call.params);
			$panel.find('.x-body').append($form);

			functions.push($panel);
		});

		var sections = [];
		_.each(section.sections, function(subsection) {
			sections.push(makeDocs(subsection, indent+1));
		});

		var $div = $('<div></div>');
		$div.append([$title, $body]);
		$div.append(functions);
		$div.append(sections);

		return $div;
	};

	var $docs = $('.x-docs');
	$docs.find('.x-functions').empty().append(makeFunctions(docs));

	$docs.find('.x-title').text(''+sherpaweb.api._sherpa.title);
	$docs.find('.x-version').text(''+sherpaweb.api._sherpa.version);
	$docs.find('.x-baseurl').text(''+sherpaweb.api._sherpa.baseurl);
	$docs.find('.x-documentation').empty().append(makeDocs(docs, 0));

	$docs.show();
};

function loadBaseURL(url) {
	return new Promise(function(resolve, reject) {
		sherpa.load(url)
		.then(function success(api) {
			sherpaweb.api = api;

			api._wrapThenable = function(thenable) {
				return new Promise(thenable);
			};

			var fakeFunctionDocs = function(functions) {
				var l = [];
				for(var i = 0; i < functions.length; i++) {
					var fn = functions[i];
					l.push({
						name: fn,
						text: ''+fn+'()'
					});
				}
				return l;
			};

			var documentedFunctions = function(doc, functions) {
				var i;
				for(i = 0; i < doc.functions.length; i++) {
					functions.push(doc.functions[i].name);
				}
				for(i = 0; i < doc.sections.length; i++) {
					documentedFunctions(doc.sections[i], functions);
				}
			};

			api._call('_docs')
			.then(function success(docs) {

				// add missing functions
				var functions = [];
				documentedFunctions(docs, functions);
				var functionsMissing = [];
				for(var i = 0; i < api._sherpa.functions.length; i++) {
					var fn = api._sherpa.functions[i];
					if(fn && fn[0] !== '_' && !_.includes(functions, fn)) {
						functionsMissing.push({name: fn, text: ''+fn+'()'});
					}
				}
				if(functionsMissing.length > 0) {
					docs.sections.push({
						title: 'Undocumented functions',
						text: 'The functions below have no documentation.',
						functions: functionsMissing,
						sections: []
					});
				}

				sherpaweb.renderDocs(docs);
				resolve();
			}, function error(err) {
				var noDocs = err.code === 'sherpaBadFunction';
				sherpaweb.renderDocs({
					title: noDocs ? 'No documentation :(' : 'Broken documentation :(',
					text: "Unfortunately, this API does not provide proper documentation. We've listed the available functions for you to try. Enjoy!",
					functions: fakeFunctionDocs(api._sherpa.functions),
					sections: []
				});
				resolve(noDocs ? undefined : "Error from API while fetching documentation. You can call the functions nonetheless.  Details of the error: "+err.message);
			});
		}, function error(err) {
			reject('Error: '+err.message);
		});
	});
}

function cleanState() {
	return {
		baseURL: '',
		hash: '',       // without leading '#'
		invoke: {
			fn: '',
			params: [],
			call: false
		}
	};
}


// determine new state based on location.hash
function newState() {
	var a = document.createElement('a');
	a.href = location.hash.substr(1);
	var baseURL = a.protocol+'//'+a.host+a.pathname;

	var qs = {};
	_.each(a.search.substr(1).split('&'), function(pair) {
		var kv = pair.split('=');
		qs[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
	});
	var fn = qs.fn || '';
	var params = [];
	if(qs.hasOwnProperty('params')) {
		params = JSON.parse(qs.params);
	}
	var call = qs.hasOwnProperty('call');
	var hash = a.hash.substr(1);

	// if we are calling, don't allow scrolling elsewhere
	if(fn && call) {
		hash = fn;
	}

	return {
		baseURL: baseURL,
		hash: hash,
		invoke: {
			fn: fn,
			params: params,
			call: call
		}
	};
}

function packState(s) {
	var r = '#'+s.baseURL;
	var params = [];
	if(s.invoke.fn) {
		params.push(['fn', s.invoke.fn].join('='));
	}
	if(s.invoke.params.length > 0) {
		params.push(['params', encodeURIComponent(JSON.stringify(s.invoke.params))].join('='));
	}
	if(s.invoke.call) {
		params.push('call');
	}
	if(params.length > 0) {
		r += '?'+params.join('&');
	}
	if(s.hash) {
		r += '#'+s.hash;
	}
	return r;
}

function toNewInvocation(invoke) {
	if(!invoke.fn) {
		sherpaweb.state.invoke = invoke;
		return;
	}

	var $form = $('.x-form-call input[name=function]').filter(function(_, e) {
		return $(e).val() === invoke.fn;
	}).closest('.x-form-call');
	if($form.length === 0) {
		sherpaweb.error('Could not find function "'+invoke.fn+'"');
		return;
	}
	var $newForm = makeCallForm(invoke.fn, invoke.params);
	$form.replaceWith($newForm);
	if(invoke.call) {
		$('html, body').scrollTop($(document.getElementById(invoke.fn)).offset().top);
		sherpaweb.state.hash = invoke.fn;
		formCall($newForm);
	}
	sherpaweb.state.invoke = invoke;
}

function scrollToHash(hash) {
	var e = document.getElementById(hash);
	if(e) {
		$('html, body').scrollTop($(e).offset().top);
	}
}

function toNewState(ns) {
	// might have to load new api first (async)
	if(sherpaweb.state.baseURL !== ns.baseURL) {
		if(/^http:\/\//.test(ns.baseURL) && location.protocol === 'https:') {
			// need to redirect to plain http, or our calls will fail
			location.href = 'http://'+location.host+'/'+packState(ns);
			return;
		}
		if(/^https:\/\//.test(ns.baseURL) && location.protocol === 'http:' && location.host === 'sherpa.irias.nl') {
			// should take advantage of https when available
			location.href = 'https://'+location.host+'/'+packState(ns);
			return;
		}

		$('.x-fullpageloader').fadeIn();
		$('.x-docs .x-functions, .x-docs .x-documentation').empty();

		loadBaseURL(ns.baseURL)
		.then(function(warning) {
			$('.x-fullpageloader').hide();

			if(warning) {
				sherpaweb.error(warning);
			}

			// state is now a clean page with the API loaded.  but we might have to (re)load the invoke or hash.
			sherpaweb.state = cleanState();
			sherpaweb.state.baseURL = ns.baseURL;
			toNewState(ns);
		}, function(error) {
			$('.x-fullpageloader').hide();

			sherpaweb.error(error);
		});
		return;
	}

	if(!_.isEqual(sherpaweb.state.invoke, ns.invoke)) {
		toNewInvocation(ns.invoke);
	}

	// doesn't matter enough if we fail, pretend we got there
	sherpaweb.state.hash = ns.hash;
	scrollToHash(ns.hash);
}

function go() {
	if(location.hash === '' || location.hash === '#') {
		$('.x-docs').hide();
		$('.x-index').show();
		sherpaweb.state = newState();
		return;
	}

	$('.x-index').hide();
	$('.x-docs').show();
	var ns = newState();
	toNewState(ns);
}

window.sherpaweb = sherpaweb;

$(function() {
	var base = location.protocol+'//'+location.host;
	var exampleapiUrl = base+'#'+base+'/exampleapi/';
	$('.x-exampleapi-url').attr('href', exampleapiUrl);

	window.onhashchange = go;
	sherpaweb.state = cleanState();
	go();
});

})();
