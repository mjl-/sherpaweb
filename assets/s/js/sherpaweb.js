/* global window, $, _, marked, Promise, sherpa */

'use strict';

(function() {

var sherpaweb = {};

sherpaweb.error = function(err) {
	var $modal = $('.x-error-modal');
	$modal.find('.x-errormessage').text(''+err);
	$modal.modal('show');
};

var slugify = function(name) {
	var s = name.toLowerCase();
	s = s.replace(/[^a-z0-9-]+/g, '-');
	s = s.replace(/--+/g, '-');
	s = s.replace(/^-*/, '');
	s = s.replace(/-*$/, '');
	return s;
};

var stringStartsWith = function(s, prefix) {
	return s.substring(s, prefix.length) === prefix;
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


$('body').on('click', '.x-form-call .x-remove-param', function(e) {
	e.preventDefault();
	$(this).closest('.x-box').remove();
});

$('body').on('click', '.x-form-call .x-add-param', function(e) {
	e.preventDefault();

	var $form = $(this).closest('.x-form-call');
	var $input = $('<div class="x-box" style="margin-bottom:0.5ex; position:relative"><div style="padding-right:2.5em"><input class="form-control" type="text" /></div><button class="btn btn-danger x-remove-param" style="position:absolute; top:0; right:0">-</button></div>');
	$form.find('.x-params').append($input);
});

$('body').on('click', '.x-form-call .x-call', function(e) {
	e.preventDefault();

	var $form = $(this).closest('.x-form-call');
	$form.find('.x-result, .x-error').hide();
	var fnName = $form.find('input[name=function]').val();
	var params = [];
	var inputs = $form.find('.x-params input');
	for(var i = 0; i < inputs.length; i++) {
		try {
			var v = $(inputs[i]).val();
			params.push(JSON.parse(v));
		} catch(ex) {
			$form.find('.x-error').text('Bad JSON parameter: '+v+'\n\nHint: use JSON syntax, such as: {"list": ["string", true, 1.23, null]}').fadeIn();
			return;
		}
	}
	var $loading = $form.find('.x-loading').show();
	var $timeSpent = $form.find('.x-timespent').text('');
	var timeSpent = function(t0) {
		$timeSpent.text(''+(new Date().getTime()-t0)+'ms');
	};
	var fn = sherpaweb.api[fnName];
	if(!fn) {
		$loading.hide();
		$form.find('.x-error').text("Method not exported through API.").fadeIn();
		return;
	}
	var t0 = new Date().getTime();
	fn.apply(fn, params)
	.then(function(result) {
		timeSpent(t0);
		$loading.hide();
		$form.find('.x-result').text(JSON.stringify(result, null, 4)).fadeIn();
	}, function error(e) {
		timeSpent(t0);
		$loading.hide();
		$form.find('.x-error').text(JSON.stringify(e, null, 4)).fadeIn();
	});
});


sherpaweb.renderDocs = function(docs) {
	var makeFunctions = function(section) {
		var $div = $('<div></div>');

		var $a = $('<a></a>').text(''+section.title).attr('href', '#'+slugify(section.title));
		var $title = $('<h5></h5>').append($a);
		$div.append($title);

		var $ul = $('<ul class="functionlist"></ul>');
		var appendLi = function(content) {
			var $li = $('<li></li>');
			$li.append(content);
			$ul.append($li);
		};
		_.each(section.functions, function(fn) {
			var $a = $('<a></a>').text(fn.name).attr('href', '#'+slugify(fn.name));
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
		var $title = $('<h'+(2+indent)+' class="page-header titlelink"><span class="x-title"></span> <small><a class="link x-link">¶</a></small></h'+(2+indent)+'>');
		$title.attr('id', slug);
		$title.find('.x-title').text(section.title);
		$title.find('.x-link').attr('href', '#'+slug);

		var $body = $('<div></div>');
		$body[0].innerHTML = renderMarkdown(section.text, 2);

		var functions = [];
		_.each(section.functions, function(fn) {
			var slug = slugify(fn.name);

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
			h += '  <a class="link x-link">¶</a>';
			h += ' </div>';
			h += ' <div class="panel-body x-body">';
			h += ' </div>';
			h += '</div>';
			var $panel = $(h);
			$panel.attr('id', slug);
			$panel.find('.x-title').text(fnSig);
			$panel.find('.x-link').attr('href', '#'+slug);

			$panel.find('.x-body')[0].innerHTML = renderMarkdown(fnDoc, 3);

			var f = '';
			f += '<form class="x-form-call form-call">';
			f += ' <input type="hidden" name="function" value="">';
			f += ' <div class="x-params"></div>';
			f += ' <button class="btn btn-default btn-sm x-add-param">+ param</button>';
			f += ' <button class="btn btn-default btn-sm x-call">Call</button>';
			f += ' <span class="fa fa-cog fa-spin x-loading" style="margin-left:1rem; display:none"></span>';
			f += ' <small class="x-timespent" style="margin-left:1rem"></small>';
			f += ' <pre class="x-result alert alert-success" style="display:none; margin-top:1ex; margin-bottom:0; white-space:pre-wrap"></pre>';
			f += ' <pre class="x-error alert alert-danger" style="display:none; margin-top:1ex; margin-bottom:0; white-space:pre-wrap"></pre>';
			f += '</form>';
			var $form = $(f);
			$form.find('[name=function]').val(fn.name);
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

	var $docs = $('.x-apidocs');
	$docs.find('.x-functions').empty().append(makeFunctions(docs));

	$docs.find('.x-title').text(''+sherpaweb.api._sherpa.title);
	$docs.find('.x-version').text(''+sherpaweb.api._sherpa.version);
	$docs.find('.x-baseurl').text(''+sherpaweb.api._sherpa.baseurl);
	$docs.find('.x-documentation').empty().append(makeDocs(docs, 0));

	$('.x-apiform').hide();
	$docs.show();
};

sherpaweb.load = function(url) {
	$('.x-fullpageloader').fadeIn();

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

		var includes = function(list, elem) {
			for(var i = 0; i < list.length; i++) {
				if(list[i] === elem) {
					return true;
				}
			}
			return false;
		};

		api._call('_docs')
		.then(function success(docs) {

			// add missing functions
			var functions = [];
			documentedFunctions(docs, functions);
			var functionsMissing = [];
			for(var i = 0; i < api._sherpa.functions.length; i++) {
				var fn = api._sherpa.functions[i];
				if(fn && fn[0] !== '_' && !includes(functions, fn)) {
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
			$('.x-fullpageloader').hide();
		}, function error(err) {
			$('.x-fullpageloader').hide();
			if(err.code == 'sherpaBadFunction') {

				// let user call functions nonetheless
				sherpaweb.renderDocs({
					title: 'No documentation :(',
					text: "Unfortunately, this API does not provide documentation. We've listed the available functions for you to try. Enjoy!",
					functions: fakeFunctionDocs(api._sherpa.functions),
					sections: []
				});
			} else {
				sherpaweb.error('Error from API while fetching documentation: '+err.message);
			}
		});
	}, function error(err) {
		$('.x-fullpageloader').hide();
		sherpaweb.error('Error: '+err.message);
	});
};

$('body').on('submit', '.x-form-api', function(e) {
	e.preventDefault();

	var url = $(this).find('[name=url]').val();
	
	if(stringStartsWith(url, 'http://')) {
		window.location.href = '/X/'+url.substr('http://'.length);
	} else if(stringStartsWith(url, 'https://')) {
		window.location.href = '/x/'+url.substr('http://'.length);
	} else {
		sherpaweb.error('Bad URL, should start with "http://" or "https://".');
	}
});

window.sherpaweb = sherpaweb;

})();
