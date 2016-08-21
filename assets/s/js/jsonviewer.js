var css = document.createElement('style');
css.type = 'text/css';
css.innerHTML = '' +
	'.jsonviewer-whitespace	{white-space:pre-wrap}' +
	'.jsonviewer-string     {color:green}' +
	'.jsonviewer-key        {color:brown}' +
	'.jsonviewer-boolean    {color:orange}' +
	'.jsonviewer-number     {color:blue}' +
	'.jsonviewer-null       {color:red}' +
	'.jsonviewer-token      {color:gray}' + 
	'.jsonviewer-token-toggle       {color:gray; cursor:pointer}' + 
	'.jsonviewer-token-toggle:hover {color:gray; text-decoration:underline}' + 
	'.jsonviewer-collapsed          {color:#444; cursor:pointer}' +
	'.jsonviewer-collapsed:hover    {text-decoration:underline}' +
	'';
document.body.appendChild(css);

function JSONViewer(root, maxLines, _uncollapseFunctions, _collapseFunctions, _indent) {
	this._stack = [root];           // div elements holding sub-elements.  last element is currently active.
	this._maxLines = maxLines;      // max number of lines we are allowed to render before starting to collapse. if < 0, never collapse.
	this._lines = 0;                // how many lines we've rendered
	this._indent = _indent || 0;		// current indentation level
	this._uncollapseFunctions = _uncollapseFunctions || []; // functions to call to uncollapse all
	this._collapseFunctions = _collapseFunctions || [];     // functions to call to collapse all
}

JSONViewer.prototype.render = function render(value) {
	this._object = value;
	this._render(value, false);
};

JSONViewer.prototype.JSON = function JSON() {
	return window.JSON.stringify(this._object, null, 2);
};


JSONViewer.prototype._push = function _push() {
	var e = document.createElement('div');
	// e.style = 'padding-left: 1em';
	this._stack[this._stack.length-1].appendChild(e);
	this._stack.push(e);
	this._lines += 1;
	this._indent += 1;
};

JSONViewer.prototype._pop = function _pop() {
	this._stack.pop();
	this._indent -= 1;
};

JSONViewer.prototype._group = function _group() {
	var e = document.createElement('div');
	this._stack[this._stack.length-1].appendChild(e);
	this._stack.push(e);
};

JSONViewer.prototype._ungroup = function _ungroup(collapsed, collapse, uncollapse, hideCollapsed, renderFn) {
	var that = this;

	function ensureRendered() {
		if(renderFn) {
			renderFn.call(that);
			renderFn = null;
		}
		if(collapsed) {
			div.style.display = '';
			if(uncollapse) {
				uncollapse.style.display = 'none';
			}
			if(hideCollapsed) {
				hideCollapsed.style.display = '';
			}
		}
		collapsed = false;
	}

	function toggle(e) {
		if(e) {
			e.preventDefault();
		}
		if(collapsed) {
			ensureRendered();
		} else {
			div.style.display = 'none';
			if(uncollapse) {
				uncollapse.style.display = '';
			}
			if(hideCollapsed) {
				hideCollapsed.style.display = 'none';
			}
			collapsed = true;
		}
	}

	if(collapse.length > 0) {
		for(var i = 0; i < collapse.length; i++) {
			collapse[i].addEventListener('click', toggle);
		}
	}
	if(uncollapse) {
		uncollapse.addEventListener('click', toggle);
	}

	var div;
	if(!collapsed) {
		ensureRendered();
		div = this._stack.pop();
		if(uncollapse) {
			uncollapse.style.display = 'none';
		}
	} else {
		div = this._stack.pop();
		div.style.display = 'none';
		if(hideCollapsed) {
			hideCollapsed.style.display = 'none';
		}
		that = new JSONViewer(div, this.maxLines, this._uncollapseFunctions, this._collapseFunctions, this._indent);
	}
	this._uncollapseFunctions.push(function() {
		that.maxLines = -1;
		ensureRendered();
	});
	this._collapseFunctions.push(function() {
		if(!collapsed) {
			toggle();
		}
	});
};

JSONViewer.prototype._render = function _render(value) {
	var i, n, collapsed, collapse, uncollapse, col, indent, whitespace;

	if(value === null) {
		this._add(JSON.stringify(value), 'null');
		return;
	}
	var t = typeof value;
	if(t === 'boolean') {
		this._add(JSON.stringify(value), 'boolean');
	} else if(t === 'number') {
		this._add(JSON.stringify(value), 'number');
	} else if(t === 'string') {
		this._add(JSON.stringify(value), 'string');
	} else if(Array.isArray(value)) {
		n = value.length;
		if(n === 0) {
			this._add('[]', 'token');
			return;
		}

		collapse = [this._add('[', 'token-toggle')];
		col = this._text(']', 'token-toggle');
		collapse.push(col);

		uncollapse = this._add('...', 'collapsed');
		this._group();
		collapsed = this._lines > this._maxLines || this._maxLines < 0;
		indent = this._indent;
		whitespace = this._text(' '.repeat(2*indent), 'whitespace');
		this._ungroup(collapsed, collapse, uncollapse, whitespace, function() {
			// note: the caller sets "this" properly
			for(i = 0; i < n; i++) {
				this._push();
				this._add(' '.repeat(2*(indent+1)), 'whitespace');
				this._render(value[i]);
				if(i < n-1) {
					this._add(',', 'token');
				}
				this._pop();
			}
		});
		this._addText(whitespace);
		this._addText(col);
	} else if(t === 'object') {
		var pairs = [];
		for(var k in value) {
			if(value.hasOwnProperty(k)) {
				pairs.push([k, value[k]]);
			}
		}
		n = pairs.length;
		if(n === 0) {
			this._add('{}', 'token');
			return;
		}

		collapse = [this._add('{', 'token-toggle')];
		col = this._text('}', 'token-toggle');
		collapse.push(col);

		uncollapse = this._add('...', 'collapsed');
		this._group();
		collapsed = this._lines > this._maxLines || this._maxLines < 0;
		indent = this._indent;
		whitespace = this._text(' '.repeat(2*indent), 'whitespace');
		this._ungroup(collapsed, collapse, uncollapse, whitespace, function() {
			// note: the caller sets "this" properly
			for(i = 0; i < n; i++) {
				this._push();
				this._add(' '.repeat(2*(indent+1)), 'whitespace');
				this._add(JSON.stringify(pairs[i][0]), 'key');
				this._add(': ', 'token');
				this._render(pairs[i][1]);
				if(i < n-1) {
					this._add(',', 'token');
				}
				this._pop();
			}
		});
		this._addText(whitespace);
		this._addText(col);
	} else {
		alert('unknown json element type', t);
		return;
	}
};

JSONViewer.prototype._text = function _text(s, what) {
	var e = document.createElement('span');
	e.className = 'jsonviewer-'+what;
	e.appendChild(document.createTextNode(s));
	return e;
};

JSONViewer.prototype._add = function _add(s, what) {
	var e = this._text(s, what);
	this._stack[this._stack.length-1].appendChild(e);
	return e;
};

JSONViewer.prototype._addText = function _addText(e) {
	this._stack[this._stack.length-1].appendChild(e);
};

JSONViewer.prototype.uncollapseAll = function uncollapseAll() {
	for(var i = 0; i < this._uncollapseFunctions.length; i++) {
		this._uncollapseFunctions[i]();
	}
};

JSONViewer.prototype.collapseAll = function collapseAll() {
	for(var i = 0; i < this._collapseFunctions.length; i++) {
		this._collapseFunctions[i]();
	}
};
