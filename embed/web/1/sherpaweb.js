var sherpaweb = (function () {
    'use strict';

    class Listener {
        constructor(event, handler) {
            this.event = event;
            this.handler = handler;
        }
    }
    class Style {
        constructor(props) {
            this.props = props;
        }
    }
    const isRooter = (v) => {
        return 'root' in v && v.root instanceof HTMLElement;
    };
    function isClassNamer(v) {
        return 'className' in v && typeof v['className'] === 'string';
    }
    const fill = (e, l) => {
        let haveClass = false;
        l.forEach((c) => {
            if (typeof c === 'string') {
                const n = document.createTextNode(c);
                e.appendChild(n);
            }
            else if (c instanceof Element) {
                e.appendChild(c);
            }
            else if (isClassNamer(c)) {
                if (haveClass) {
                    throw new Error('duplicate className');
                }
                e.className = c.className;
                haveClass = true;
            }
            else if (c instanceof Listener) {
                e.addEventListener(c.event, c.handler);
            }
            else if (c instanceof Style) {
                const st = e.style; // xxx
                for (const key in c.props) {
                    st[key] = c.props[key]; // xxx probably not always correct, eg for array values
                }
            }
            else if (isRooter(c)) {
                e.appendChild(c.root);
            }
            else if (typeof c === 'object' && c !== null && c.constructor === Object) {
                for (const key in c) {
                    e.setAttribute(key, c[key]);
                }
            }
        });
        return e;
    };
    const a = (...l) => fill(document.createElement('a'), l);
    const nav = (...l) => fill(document.createElement('nav'), l);
    const label = (...l) => fill(document.createElement('label'), l);
    const small = (...l) => fill(document.createElement('small'), l);
    const h1 = (...l) => fill(document.createElement('h1'), l);
    const h2 = (...l) => fill(document.createElement('h2'), l);
    const h3 = (...l) => fill(document.createElement('h3'), l);
    const h4 = (...l) => fill(document.createElement('h4'), l);
    const h5 = (...l) => fill(document.createElement('h5'), l);
    const h6 = (...l) => fill(document.createElement('h6'), l);
    const div = (...l) => fill(document.createElement('div'), l);
    const span = (...l) => fill(document.createElement('span'), l);
    const button = (...l) => fill(document.createElement('button'), l);
    const table = (...l) => fill(document.createElement('table'), l);
    const thead = (...l) => fill(document.createElement('thead'), l);
    const tbody = (...l) => fill(document.createElement('tbody'), l);
    const tr = (...l) => fill(document.createElement('tr'), l);
    const th = (...l) => fill(document.createElement('th'), l);
    const td = (...l) => fill(document.createElement('td'), l);
    const input = (...l) => fill(document.createElement('input'), l);
    const form = (...l) => fill(document.createElement('form'), l);
    const fieldset = (...l) => fill(document.createElement('fieldset'), l);
    const strong = (...l) => fill(document.createElement('strong'), l);
    const img = (...l) => fill(document.createElement('img'), l);
    const p = (...l) => fill(document.createElement('p'), l);
    const br = (...l) => fill(document.createElement('br'), l);
    const style = (...l) => fill(document.createElement('style'), l);
    const textarea = (...l) => fill(document.createElement('textarea'), l);
    const select = (...l) => fill(document.createElement('select'), l);
    const option = (...l) => fill(document.createElement('option'), l);
    const ul = (...l) => fill(document.createElement('ul'), l);
    const ol = (...l) => fill(document.createElement('ol'), l);
    const li = (...l) => fill(document.createElement('li'), l);
    const dl = (...l) => fill(document.createElement('dl'), l);
    const dt = (...l) => fill(document.createElement('dt'), l);
    const dd = (...l) => fill(document.createElement('dd'), l);
    const address = (...l) => fill(document.createElement('address'), l);
    const article = (...l) => fill(document.createElement('article'), l);
    const aside = (...l) => fill(document.createElement('aside'), l);
    const footer = (...l) => fill(document.createElement('footer'), l);
    const header = (...l) => fill(document.createElement('header'), l);
    const hgroup = (...l) => fill(document.createElement('hgroup'), l);
    const main = (...l) => fill(document.createElement('main'), l);
    const section = (...l) => fill(document.createElement('section'), l);
    const blockquote = (...l) => fill(document.createElement('blockquote'), l);
    const figcaption = (...l) => fill(document.createElement('figcaption'), l);
    const figure = (...l) => fill(document.createElement('figure'), l);
    const hr = (...l) => fill(document.createElement('hr'), l);
    const abbr = (...l) => fill(document.createElement('abbr'), l);
    const bdi = (...l) => fill(document.createElement('bdi'), l);
    const bdo = (...l) => fill(document.createElement('bdo'), l);
    const cite = (...l) => fill(document.createElement('cite'), l);
    const code = (...l) => fill(document.createElement('code'), l);
    const data = (...l) => fill(document.createElement('data'), l);
    const dfn = (...l) => fill(document.createElement('dfn'), l);
    const em = (...l) => fill(document.createElement('em'), l);
    const i = (...l) => fill(document.createElement('i'), l);
    const kbd = (...l) => fill(document.createElement('kbd'), l);
    const mark = (...l) => fill(document.createElement('mark'), l);
    const q = (...l) => fill(document.createElement('q'), l);
    const sub = (...l) => fill(document.createElement('sub'), l);
    const sup = (...l) => fill(document.createElement('sup'), l);
    const time = (...l) => fill(document.createElement('time'), l);
    const tt = (...l) => fill(document.createElement('tt'), l);
    const u = (...l) => fill(document.createElement('u'), l);
    const audio = (...l) => fill(document.createElement('audio'), l);
    const video = (...l) => fill(document.createElement('video'), l);
    const track = (...l) => fill(document.createElement('track'), l);
    const embed = (...l) => fill(document.createElement('embed'), l);
    const iframe = (...l) => fill(document.createElement('iframe'), l);
    const object = (...l) => fill(document.createElement('object'), l);
    const param = (...l) => fill(document.createElement('param'), l);
    const picture = (...l) => fill(document.createElement('picture'), l);
    const source = (...l) => fill(document.createElement('source'), l);
    const canvas = (...l) => fill(document.createElement('canvas'), l);
    const del = (...l) => fill(document.createElement('del'), l);
    const ins = (...l) => fill(document.createElement('ins'), l);
    const caption = (...l) => fill(document.createElement('caption'), l);
    const col = (...l) => fill(document.createElement('col'), l);
    const colgroup = (...l) => fill(document.createElement('colgroup'), l);
    const datalist = (...l) => fill(document.createElement('datalist'), l);
    const legend = (...l) => fill(document.createElement('legend'), l);
    const meter = (...l) => fill(document.createElement('meter'), l);
    const optgroup = (...l) => fill(document.createElement('optgroup'), l);
    const output = (...l) => fill(document.createElement('output'), l);
    const progress = (...l) => fill(document.createElement('progress'), l);
    const dialog = (...l) => fill(document.createElement('dialog'), l);
    const menu = (...l) => fill(document.createElement('menu'), l);
    const menuitem = (...l) => fill(document.createElement('menuitem'), l);
    const summary = (...l) => fill(document.createElement('summary'), l);
    const createElement = (name, ...l) => fill(document.createElement(name), l);
    function listen(event, handler) {
        return new Listener(event, handler);
    }
    const _style = (props) => {
        return new Style(props);
    };
    const children = (elem, ...kids) => {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
        let ensureElement = (e) => {
            if (typeof e === 'string') {
                return span(e);
            }
            else if (isRooter(e)) {
                return e.root;
            }
            else {
                return e;
            }
        };
        kids.forEach((kid) => elem.appendChild(ensureElement(kid)));
    };

    var dom = /*#__PURE__*/Object.freeze({
        Style: Style,
        isRooter: isRooter,
        isClassNamer: isClassNamer,
        fill: fill,
        a: a,
        nav: nav,
        label: label,
        small: small,
        h1: h1,
        h2: h2,
        h3: h3,
        h4: h4,
        h5: h5,
        h6: h6,
        div: div,
        span: span,
        button: button,
        table: table,
        thead: thead,
        tbody: tbody,
        tr: tr,
        th: th,
        td: td,
        input: input,
        form: form,
        fieldset: fieldset,
        strong: strong,
        img: img,
        p: p,
        br: br,
        style: style,
        textarea: textarea,
        select: select,
        option: option,
        ul: ul,
        ol: ol,
        li: li,
        dl: dl,
        dt: dt,
        dd: dd,
        address: address,
        article: article,
        aside: aside,
        footer: footer,
        header: header,
        hgroup: hgroup,
        main: main,
        section: section,
        blockquote: blockquote,
        figcaption: figcaption,
        figure: figure,
        hr: hr,
        abbr: abbr,
        bdi: bdi,
        bdo: bdo,
        cite: cite,
        code: code,
        data: data,
        dfn: dfn,
        em: em,
        i: i,
        kbd: kbd,
        mark: mark,
        q: q,
        sub: sub,
        sup: sup,
        time: time,
        tt: tt,
        u: u,
        audio: audio,
        video: video,
        track: track,
        embed: embed,
        iframe: iframe,
        object: object,
        param: param,
        picture: picture,
        source: source,
        canvas: canvas,
        del: del,
        ins: ins,
        caption: caption,
        col: col,
        colgroup: colgroup,
        datalist: datalist,
        legend: legend,
        meter: meter,
        optgroup: optgroup,
        output: output,
        progress: progress,
        dialog: dialog,
        menu: menu,
        menuitem: menuitem,
        summary: summary,
        createElement: createElement,
        listen: listen,
        _style: _style,
        children: children
    });

    var __awaiter = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const delay = (ms) => __awaiter("", void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, ms));
    });
    // packState returns the state in a form that can be assigned to location.hash directly.
    const packState = (state) => {
        if (state.length === 0) {
            return '';
        }
        const pack = (st) => {
            if (typeof st === 'string') {
                return encodeURIComponent(st);
            }
            return ['[', ...st.map(w => pack(w)), ']'].join(' ');
        };
        return '#' + state.map(w => pack(w)).join(' ');
    };
    const parseState = (locationHash) => {
        const words = locationHash ? decodeURIComponent(locationHash).substring(1).split(' ') : [];
        const takeArray = () => {
            const r = [];
            while (words.length > 0 && words[0] !== ']') {
                const w = words[0];
                words.shift();
                if (w === '[') {
                    r.push(takeArray());
                    words.shift();
                }
                else {
                    r.push(w);
                }
            }
            return r;
        };
        const r = takeArray();
        return r;
    };
    const fade = (elem, step) => {
        return new Promise(resolve => {
            let opacity = Math.max(0, Math.min(1, parseFloat(elem.style.opacity || '1')));
            let id = window.setInterval(() => {
                opacity += step;
                elem.style.opacity = '' + opacity;
                if (opacity <= 0 || opacity >= 1) {
                    window.clearInterval(id);
                    resolve();
                }
            }, 16);
        });
    };
    const box = (app, ...l) => {
        const e = div({ ui: 'box' }, app.looks.box, ...l);
        e.style.setProperty('height', '100%'); // todo: figure out why this is necessary. same style is in class, but doesn't have the effect this inline style has....
        return e;
    };
    const middleBoxStyle = {
        display: 'flex',
        height: '100%',
        textAlign: 'center',
    };
    const middleStyle = {
        flexGrow: 1,
        alignSelf: 'center',
    };
    const middle = (app, ...kids) => {
        const looksMiddleBox = app.ensureLooks('middle-box', middleBoxStyle);
        const looksMiddle = app.ensureLooks('middle', middleStyle);
        return div(looksMiddleBox, div(looksMiddle, ...kids));
    };

    var PopupSize;
    (function (PopupSize) {
        PopupSize[PopupSize["Small"] = 0] = "Small";
        PopupSize[PopupSize["Medium"] = 1] = "Medium";
        PopupSize[PopupSize["Large"] = 2] = "Large";
    })(PopupSize || (PopupSize = {}));

    var __awaiter$1 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    const splitStyle = {
        display: 'flex',
        height: '100%',
        flexGrow: 1,
        flexDirection: 'row',
    };
    const splitKidStyle = {
        display: 'flex',
        height: '100%',
        overflowY: 'auto',
    };
    const splitBorderStyle = {
        height: '100%',
        width: '1px',
        backgroundColor: '#ddd',
    };
    class Split {
        constructor(app, ...elems) {
            const looksSplit = app.ensureLooks('split', splitStyle);
            const looksSplitKid = app.ensureLooks('split-kid', splitKidStyle);
            const looksSplitBorder = app.ensureLooks('split-border', splitBorderStyle);
            const makeKid = (e) => div(looksSplitKid, e);
            const x = [makeKid(elems[0])];
            elems.slice(1).map(e => {
                x.push(div(looksSplitBorder));
                x.push(makeKid(e));
            });
            if (x.length > 0) {
                x[x.length - 1].style.flexGrow = '1';
            }
            this.root = div({ ui: 'Split' }, looksSplit, ...x);
        }
    }

    var __awaiter$2 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    // reveal fades old content out and new content in, with a similar animation as load(). reveal is simpler, and cannot fail. use it when you have the content to show already available.
    const reveal = (container, ...kids) => __awaiter$2("", void 0, void 0, function* () {
        yield fade(container, -.34);
        children(container, ...kids);
        yield fade(container, .25);
    });
    // like load() but without a separate error handler. on failure, retry just calls fn again. the caller gets the previous error if any to adjust the call (eg first do new auth).
    const load0 = (app, container, action, fn) => __awaiter$2("", void 0, void 0, function* () {
        let prevErr;
        for (;;) {
            let opacity = 1;
            let loadingShow = 0;
            // placeholder, abort to be filled in by fn
            const aborter = {
                abort: () => { }
            };
            // we (slowly) fade out current content.
            // hopefully we're interrupted by a resolved promised with the new content.
            // if so, this interval function is canceled and the new content shown.
            // if not, this interval cancels itself, but first shows a box saying "loading...", along with a button to abort the operation.
            let id = window.setInterval(() => {
                if (opacity > 0) {
                    opacity -= opacity > .5 ? .1 : .05;
                    container.style.opacity = '' + Math.max(0, opacity);
                    return;
                }
                window.clearInterval(id);
                id = 0;
                loadingShow = new Date().getTime();
                container.style.opacity = '1';
                let abortElem = span();
                if (aborter.abort) {
                    abortElem = button(app.looks.btnSecondary, listen('click', ev => {
                        if (aborter.abort) {
                            aborter.abort();
                        }
                    }), 'cancel');
                }
                children(container, middle(app, div(span(action + '...'), span(app.looks.spin)), br(), abortElem));
            }, 16);
            let kids;
            try {
                kids = yield fn(aborter, prevErr);
            }
            catch (err) {
                prevErr = err;
                if (id !== 0) {
                    window.clearInterval(id);
                }
                container.style.opacity = '1';
                yield new Promise((resolve, reject) => {
                    const retryBox = middle(app, div(_style({ whiteSpace: 'pre-wrap' }), action + ': ' + err.message), br(), button(app.looks.btnPrimary, listen('click', e => {
                        e.preventDefault();
                        resolve();
                    }), 'retry'), span(' '), button(app.looks.btnSecondary, listen('click', e => {
                        e.preventDefault();
                        reject();
                    }), 'cancel'));
                    reveal(container, retryBox);
                });
                continue;
            }
            if (id !== 0) {
                window.clearInterval(id);
            }
            // make sure any "still loading" content is visible at least 250ms, to prevent flashing
            let wait = 0;
            if (loadingShow > 0) {
                wait = 250 - (new Date().getTime() - loadingShow);
                if (wait < 0) {
                    wait = 0;
                }
            }
            yield delay(wait);
            yield fade(container, -.34);
            children(container, ...kids);
            fade(container, .25);
            break;
        }
    });

    var __awaiter$3 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    const success = {
        fg: '#fff',
        bg: '#28a745',
        bgHover: '#218838',
        bgActive: '#1e7e34',
        border: '#28a745',
        borderHover: '#1e7e34',
        borderActive: '#1c7430',
    };
    const danger = {
        fg: '#fff',
        bg: '#dc3545',
        bgHover: '#c82333',
        bgActive: '#bd2130',
        border: '#dc3545',
        borderHover: '#bd2130',
        borderActive: '#b21f2d',
    };
    const primary = {
        fg: '#fff',
        bg: '#007bff',
        bgHover: '#0069d9',
        bgActive: '#0062cc',
        border: '#007bff',
        borderHover: '#0062cc',
        borderActive: '#005cbf',
    };
    const secondary = {
        fg: '#fff',
        bg: '#6c757d',
        bgHover: '#5a6268',
        bgActive: '#545b62',
        border: '#6c757d',
        borderHover: '#545b62',
        borderActive: '#4e555b',
    };
    const light = {
        fg: '#212529',
        bg: '#f8f9fa',
        bgHover: '#e2e6ea',
        bgActive: '#dae0e5',
        border: '#f8f9fa',
        borderHover: '#dae0e5',
        borderActive: '#d3d9df',
    };
    class Style$1 {
        constructor(sheet, selectorPrefix, className, ...styles) {
            this.sheet = sheet;
            this.selectorPrefix = selectorPrefix;
            this.className = className;
            this.propsList = [];
            this.pseudoStyles = [];
            for (const style of styles) {
                if (style instanceof Style$1) {
                    for (const props of style.propsList) {
                        this.propsList.push(props);
                    }
                }
                else {
                    this.propsList.push(style);
                }
            }
            this.add('.' + className, this.propsList);
        }
        pseudo(pseudo, ...propsList) {
            this.add('.' + this.className + pseudo, propsList);
            this.pseudoStyles.push({ name: pseudo, propsList: propsList });
            return this;
        }
        add(selector, propsList) {
            const selectorText = this.selectorPrefix + selector;
            const index = this.sheet.cssRules.length;
            this.sheet.insertRule(selectorText + ' {}', index);
            const st = this.sheet.cssRules[index].style; // xxx
            for (const props of propsList) {
                for (const key in props) {
                    st[key] = props[key]; // xxx probably not always correct, eg for array values
                }
            }
        }
    }
    class Looks {
        constructor(app, baseClassName) {
            this.baseClassName = baseClassName;
            this.style = style({ type: 'text/css' });
            document.head.appendChild(this.style); // todo: figure out how to insert this inside mtpt and make it work
            this.uniqueID = ('' + Math.random()).substring(2, 10);
            this.selectorPrefix = '.' + this.baseClassName + '-' + this.uniqueID + ' ';
            const addResetRule = (selector, props) => {
                const sheet = this.style.sheet;
                const selectorText = this.selectorPrefix + selector;
                const index = sheet.cssRules.length;
                sheet.insertRule(selectorText + '{}', index);
                const st = sheet.cssRules[index].style;
                for (const key in props) {
                    st[key] = (props[key]);
                }
            };
            addResetRule('', {
                color: '#333',
                lineHeight: '1.5',
                fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe types.UI",Roboto,"Helvetica Neue",Arial,sans-serif',
                fontSize: '15px',
            });
            addResetRule('*', {
                margin: '0',
                padding: '0',
                border: '0',
                fontSize: '100%',
                font: 'inherit',
                verticalAlign: 'baseline',
                boxSizing: 'border-box',
            });
            addResetRule('ol', { listStyle: 'none' });
            addResetRule('ul', { listStyle: 'none' });
            addResetRule('table', {
                borderCollapse: 'collapse',
                borderSpacing: '0',
            });
            const createLooks = (className, ...styles) => {
                return this.create(false, className, ...styles);
            };
            const copyLooks = (className, ...styles) => {
                return this.create(true, className, ...styles);
            };
            this.header = createLooks('header', {
                fontWeight: 'normal',
                padding: '.25em 0',
                fontSize: '1.5em',
                fontFamily: 'Palatino, Palatino Linotype, Palatino LT STD, Book Antiqua, Georgia, serif',
            });
            this.title = createLooks('title', {
                fontWeight: 'bold',
                padding: '.25em 0',
                marginBottom: '1.5ex',
            });
            this.inlineTitle = createLooks('inline-title', this.title, { display: 'inline-block' });
            const inputStyle = {
                display: 'block',
                fontSize: '1em',
                padding: '.2em .4em',
                borderRadius: '.25em',
                border: '1px solid #ccc',
                width: '100%',
            };
            this.formInput = createLooks('form-input', inputStyle, {
                marginBottom: '.5em',
                marginTop: '.5em',
            });
            this.tableInputSmall = createLooks('table-input-small', inputStyle, {
                display: 'inline',
                width: '3em',
            });
            this.textarea = createLooks('textarea', {
                display: 'block',
                marginBottom: '.5em',
                fontSize: '1em',
                padding: '.2em .4em',
                borderRadius: '.25em',
                border: '1px solid #ccc',
                marginTop: '.5em',
                width: '100%',
            });
            this.searchInput = createLooks('search-input', {
                display: 'block',
                padding: '.2em .4em',
                borderRadius: '.25em',
                border: '1px solid #ccc',
                width: '100%',
            });
            this.searchInputFiltered = createLooks('search-input-filtered', this.searchInput, { backgroundColor: '#28a74540' });
            this.searchInputNoresults = createLooks('search-input-noresults', this.searchInput, { backgroundColor: '#dc354540' });
            for (const c of [this.searchInput, this.searchInputFiltered, this.searchInputNoresults]) {
                c.pseudo(':focus', { borderColor: '#999' });
            }
            const btnStyle = {
                fontSize: '1em',
                border: 'none',
                padding: '0em .6em .15em',
                cursor: 'pointer',
                borderRadius: '.25em',
            };
            const hex2rgba = (hex, alpha) => {
                const parse = (o) => parseInt(hex.substr(1 + o, 2), 16);
                const [r, g, b] = [parse(0), parse(2), parse(4)];
                return 'rgba(' + [r, g, b].map(v => '' + v).join(', ') + ', ' + alpha + ')';
            };
            const buttonLooks = (name, colors) => {
                return createLooks(name, btnStyle, {
                    color: colors.fg,
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                })
                    .pseudo(':active', {
                    backgroundColor: colors.bgActive,
                    borderColor: colors.borderActive,
                })
                    .pseudo(':hover', {
                    backgroundColor: colors.bgHover,
                    borderColor: colors.borderHover,
                })
                    .pseudo(':focus', {
                    boxShadow: '0 0 0 .2em ' + hex2rgba(colors.bg, .5),
                });
            };
            this.btnSuccess = buttonLooks('btn-success', success);
            this.btnDanger = buttonLooks('btn-danger', danger);
            this.btnPrimary = buttonLooks('btn-primary', primary);
            this.btnSecondary = buttonLooks('btn-secondary', secondary);
            this.btnLight = buttonLooks('btn-light', light);
            this.groupBtnSuccess = copyLooks('group-btn-success', this.btnSuccess);
            this.groupBtnDanger = copyLooks('group-btn-danger', this.btnDanger);
            this.groupBtnPrimary = copyLooks('group-btn-primary', this.btnPrimary);
            this.groupBtnSecondary = copyLooks('group-btn-secondary', this.btnSecondary);
            this.groupBtnLight = copyLooks('group-btn-light', this.btnLight);
            for (const v of [this.groupBtnSuccess, this.groupBtnDanger, this.groupBtnPrimary, this.groupBtnSecondary, this.groupBtnLight]) {
                v.pseudo('', { borderRadius: '0' });
                v.pseudo(':first-child', { borderRadius: '.25em 0 0 .25em' });
                v.pseudo(':last-child', { borderRadius: '0 .25em .25em 0' });
            }
            this.cell = createLooks('cell', {
                verticalAlign: 'top',
                padding: '.25em',
            })
                .pseudo(':first-child', { paddingLeft: 0 })
                .pseudo(':last-child', { paddingRight: 0 });
            this.headerCell = createLooks('header-cell', {
                verticalAlign: 'top',
                padding: '.25em',
                fontWeight: 'bold',
                textAlign: 'left',
            })
                .pseudo(':first-child', { paddingLeft: 0 })
                .pseudo(':last-child', { paddingRight: 0 });
            this.dayHeaderCell = createLooks('day-header-cell', {
                verticalAlign: 'top',
                padding: '.25em',
                backgroundColor: '#eee',
            })
                .pseudo(':first-child', { paddingLeft: 0 })
                .pseudo(':last-child', { paddingRight: 0 });
            const spinRotation = this.uniqueName('rotate');
            this.spin = createLooks('spin', {
                display: 'inline-block',
                animation: spinRotation + ' .55s infinite linear',
                textAlign: 'center',
                height: '.7em',
                width: '.7em',
                verticalAlign: 'middle',
                fontSize: '2em',
                lineHeight: '1',
            })
                .pseudo(':after', { content: '"*"' });
            // xxx include in Style?
            this.addRawRule(`
				@keyframes ` + spinRotation + ` {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(359deg);
					}
				}
			`);
            this.box = createLooks('box', {
                flex: '1',
                flexDirection: 'column',
                overflowY: 'auto',
                display: 'flex',
                height: '100%',
            });
            this.listItem = createLooks('list-item', {
                cursor: 'pointer',
                padding: '.2em .25em',
                margin: '.2em .5em',
                borderRadius: '.25em',
            })
                .pseudo(':hover', { backgroundColor: '#eee' })
                .pseudo(':focus', { backgroundColor: '#eee' });
            this.listItemSelected = createLooks('listen-item-selected', {
                cursor: 'pointer',
                padding: '.2em .5em .2em .25em',
                margin: '.2em 0 .2em .5em',
                borderRadius: '.25em 0 0 .25em',
                backgroundColor: '#007bff',
            });
            this.listItemPrimary = createLooks('list-item-primar', {});
            this.listItemSecondary = createLooks('list-item-secondary', { color: '#888' });
            this.listItemSelectedPrimary = createLooks('list-item-selected-primary', { color: 'white' });
            this.listItemSelectedSecondary = createLooks('list-item-selected-primary', { color: '#ddd' });
            this.boxPadding = createLooks('box-padding', { padding: '.25em .5em' });
            this.boxMargin = createLooks('box-margin', { margin: '.25em .5em' });
            this.boxPaddingLast = createLooks('box-padding', { padding: '.25em .5em 1em .5em' });
            this.boxMarginLast = createLooks('box-margin', { margin: '.25em .5em 1em .5em' });
            this.checkmarkSuccess = createLooks('checkmark-success', {
                backgroundColor: '#28a745',
                color: 'white',
                display: 'inline-block',
                height: '1.5em',
                width: '1.5em',
                textAlign: 'center',
                borderRadius: '.75em',
                marginLeft: '.5em',
            })
                .pseudo(':after', { content: '"✓"' });
            this.textWrap = createLooks('text-wrap', { whiteSpace: 'pre-wrap' });
            this.alertDanger = createLooks('alert-danger', {
                color: '#721c24',
                backgroundColor: '#f8d7da',
                borderColor: '#f5c6cb',
                position: 'relative',
                padding: '.75em 1.25em',
                marginBottom: '1em',
                border: '1px solid transparent',
            });
            this.link = createLooks('link', {
                color: primary.bg,
            }).pseudo(':hover', {
                color: primary.bgHover,
            });
        }
        create(copy, className, ...styles) {
            className = className + '-' + this.uniqueID + '-' + this.baseClassName;
            const r = new Style$1(this.style.sheet, this.selectorPrefix, className, ...styles);
            if (copy) {
                for (const style of styles) {
                    if (!(style instanceof Style$1)) {
                        continue;
                    }
                    for (const tup of style.pseudoStyles) {
                        r.pseudo(tup.name, ...tup.propsList);
                    }
                }
            }
            return r;
        }
        uniqueName(name) {
            return this.baseClassName + '-' + name + '-' + this.uniqueID;
        }
        addRawRule(rule) {
            const sheet = this.style.sheet;
            if (!sheet) {
                throw new Error('no sheet in stylesheet?');
            }
            sheet.insertRule(rule, sheet.insertRule(rule, sheet.cssRules.length));
        }
    }

    var __awaiter$4 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    var __awaiter$5 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    var __awaiter$6 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class Intro {
        constructor(app) {
            const exampleBaseURL = location.protocol + '//' + location.host + '/1/example/';
            this.root = middle(app, div(_style({
                padding: '2em',
                maxWidth: '45em',
                margin: 'auto',
            }), h1(app.looks.header, 'Sherpa', small(' – simple http rpc api')), form(listen('submit', (ev) => __awaiter$6(this, void 0, void 0, function* () {
                ev.preventDefault();
                yield app.loadBaseURL(this.baseURL.value);
            })), this.baseURL = input(app.looks.formInput, { placeholder: 'Enter a Sherpa API URL, https://...' }), div(_style({
                textAlign: 'right',
            }), a(app.looks.link, { href: '#' + exampleBaseURL }, listen('click', (ev) => __awaiter$6(this, void 0, void 0, function* () {
                ev.preventDefault();
                try {
                    yield app.loadBaseURL(exampleBaseURL);
                }
                catch (e) {
                    alert('Error loading baseURL: ' + e.message);
                }
            })), 'Example')), br(), div(button(app.looks.btnPrimary, { type: 'submit' }, 'Show documentation!')), br(), br(), div(a(app.looks.link, { href: 'https://www.ueber.net/who/mjl/sherpa/' }, "sherpa api's"), ' | ', a(app.looks.link, { href: 'https://github.com/mjl-/sherpaweb/' }, "sherpaweb code")))));
        }
        focus() {
        }
        loadState(state) {
            return Promise.resolve();
        }
        currentState() {
            return [];
        }
    }

    // NOTE: code below is shared between github.com/mjl-/sherpaweb and github.com/mjl-/sherpats.
    // KEEP IN SYNC.
    const supportedSherpaVersion = 1;
    function isStruct(t) {
        return 'Fields' in t;
    }
    function isStrings(t) {
        return 'Values' in t && typeof t.Values[0].Value === 'string';
    }
    function isInts(t) {
        return 'Values' in t && typeof t.Values[0].Value === 'number';
    }
    // verifyArg typechecks "v" against "typewords", returning a new (possibly modified) value for JSON-encoding.
    // toJS indicate if the data is coming into JS. If so, timestamps are turned into JS Dates. Otherwise, JS Dates are turned into strings.
    // allowUnknownKeys configures whether unknown keys in structs are allowed.
    // types are the named types of the API.
    const verifyArg = (path, v, typewords, toJS, allowUnknownKeys, types) => {
        return new verifier(types, toJS, allowUnknownKeys).verify(path, v, typewords);
    };
    class verifier {
        constructor(types, toJS, allowUnknownKeys) {
            this.types = types;
            this.toJS = toJS;
            this.allowUnknownKeys = allowUnknownKeys;
        }
        verify(path, v, typewords) {
            typewords = typewords.slice(0);
            const ww = typewords.shift();
            const error = (msg) => {
                if (path != '') {
                    msg = path + ': ' + msg;
                }
                throw new Error(msg);
            };
            if (typeof ww !== 'string') {
                error('bad typewords');
                return; // should not be necessary, typescript doesn't see error always throws an exception?
            }
            const w = ww;
            const ensure = (ok, expect) => {
                if (!ok) {
                    error('got ' + JSON.stringify(v) + ', expected ' + expect);
                }
                return v;
            };
            switch (w) {
                case 'nullable':
                    if (v === null || v === undefined) {
                        return null;
                    }
                    return this.verify(path, v, typewords);
                case '[]':
                    ensure(Array.isArray(v), "array");
                    return v.map((e, i) => this.verify(path + '[' + i + ']', e, typewords));
                case '{}':
                    ensure(v !== null || typeof v === 'object', "object");
                    const r = {};
                    for (const k in v) {
                        r[k] = this.verify(path + '.' + k, v[k], typewords);
                    }
                    return r;
            }
            ensure(typewords.length == 0, "empty typewords");
            const t = typeof v;
            switch (w) {
                case 'any':
                    return v;
                case 'bool':
                    ensure(t === 'boolean', 'bool');
                    return v;
                case 'int8':
                case 'uint8':
                case 'int16':
                case 'uint16':
                case 'int32':
                case 'uint32':
                case 'int64':
                case 'uint64':
                    ensure(t === 'number' && Number.isInteger(v), 'integer');
                    return v;
                case 'float32':
                case 'float64':
                    ensure(t === 'number', 'float');
                    return v;
                case 'int64s':
                case 'uint64s':
                    ensure(t === 'number' && Number.isInteger(v) || t === 'string', 'integer fitting in float without precision loss, or string');
                    return '' + v;
                case 'string':
                    ensure(t === 'string', 'string');
                    return v;
                case 'timestamp':
                    if (this.toJS) {
                        ensure(t === 'string', 'string, with timestamp');
                        const d = new Date(v);
                        if (d instanceof Date && !isNaN(d.getTime())) {
                            return d;
                        }
                        error('invalid date ' + v);
                    }
                    else {
                        ensure(t === 'object' && v !== null, 'non-null object');
                        ensure(v.__proto__ === Date.prototype, 'Date');
                        return v.toISOString();
                    }
            }
            // We're left with named types.
            const nt = this.types[w];
            if (!nt) {
                error('unknown type ' + w);
            }
            if (v === null || v === undefined) {
                error('bad value ' + v + ' for named type ' + w);
            }
            if (isStruct(nt)) {
                if (typeof v !== 'object') {
                    error('bad value ' + v + ' for struct ' + w);
                }
                const r = {};
                for (const f of nt.Fields) {
                    r[f.Name] = this.verify(path + '.' + f.Name, v[f.Name], f.Typewords);
                }
                // If going to JSON also verify no unknown fields are present.
                if (!this.allowUnknownKeys) {
                    const known = {};
                    for (const f of nt.Fields) {
                        known[f.Name] = true;
                    }
                    Object.keys(v).forEach((k) => {
                        if (!known[k]) {
                            error('unknown key ' + k + ' for struct ' + w);
                        }
                    });
                }
                return r;
            }
            else if (isStrings(nt)) {
                if (typeof v !== 'string') {
                    error('mistyped value ' + v + ' for named strings ' + nt.Name);
                }
                for (const sv of nt.Values) {
                    if (sv.Value === v) {
                        return v;
                    }
                }
                error('unknown value ' + v + ' for named strings ' + nt.Name);
            }
            else if (isInts(nt)) {
                if (typeof v !== 'number' || !Number.isInteger(v)) {
                    error('mistyped value ' + v + ' for named ints ' + nt.Name);
                }
                for (const sv of nt.Values) {
                    if (sv.Value === v) {
                        return v;
                    }
                }
                error('unknown value ' + v + ' for named ints ' + nt.Name);
            }
            else {
                throw new Error('unexpected named type ' + nt);
            }
        }
    }

    const section$1 = (v) => parseSection(v);
    const JSON$1 = (v) => parseJSON(v);
    function parseError(path, msg) {
        throw new Error('invalid sherpadoc at ' + path + ': ' + msg);
    }
    function basicTypeName(v) {
        const t = typeof v;
        if (v === null || t === 'undefined') {
            return 'null';
        }
        else if (t === 'string' || t === 'number') {
            return t;
        }
        else if (Array.isArray(v)) {
            return 'array';
        }
        else if (t === 'object') {
            return 'struct';
        }
        return 'other';
    }
    function checkEach(path, v, field, fn) {
        const l = v[field];
        if (!Array.isArray(l)) {
            parseError(path, 'expected array');
        }
        path += '.' + field;
        for (const index in l) {
            fn(path + '[' + index + ']', l[index]);
        }
    }
    function checkObject(path, v, pairs) {
        if (typeof v !== 'object') {
            parseError(path, 'not a struct object');
        }
        if (v === null) {
            parseError(path, 'not a struct object, but null');
        }
        for (const [field, expectedType] of pairs) {
            const haveType = basicTypeName(v[field]);
            if (haveType !== expectedType) {
                parseError(path + '.' + field, 'wrong type ' + haveType + ', expected ' + expectedType);
            }
        }
    }
    function checkString(path, v) {
        const t = typeof v;
        if (t !== 'string') {
            parseError(path, 'expected string, saw ' + t);
        }
    }
    function makePath(path, field, index, name) {
        return path + '.' + field + '[' + index + ' (' + name + ')]';
    }
    // NOTE: sherpaweb/ts/parse.ts and sherpadoc/check.go contain the same checking.
    // The code is very similar. Best keep it in sync and modify the implementations in tandem.
    class checker {
        constructor(types = {}, functions = {}) {
            this.types = types;
            this.functions = functions;
        }
        markIdent(path, ident) {
            if (this.types[ident]) {
                parseError(path, 'duplicate type ' + ident);
            }
            this.types[ident] = true;
        }
        walkTypeNames(path, sec) {
            sec.Structs.forEach((t, i) => {
                this.markIdent(makePath(path, 'Structs', i, t.Name), t.Name);
            });
            sec.Ints.forEach((t, i) => {
                const npath = makePath(path, 'Ints', i, t.Name);
                this.markIdent(npath, t.Name);
                t.Values.forEach((v, j) => {
                    this.markIdent(makePath(npath, 'Values', j, v.Name), v.Name);
                });
            });
            sec.Strings.forEach((t, i) => {
                const npath = makePath(path, 'Strings', i, t.Name);
                this.markIdent(npath, t.Name);
                t.Values.forEach((v, j) => {
                    this.markIdent(makePath(npath, 'Values', j, v.Name), v.Name);
                });
            });
            sec.Sections.forEach((subsec, i) => {
                this.walkTypeNames(makePath(path, 'Sections', i, subsec.Name), subsec);
            });
        }
        walkFunctionNames(path, sec) {
            sec.Functions.forEach((fn, i) => {
                const npath = makePath(path, 'Functions', i, fn.Name);
                if (this.functions[fn.Name]) {
                    parseError(npath, 'duplicate function name ' + fn.Name);
                }
                this.functions[fn.Name] = true;
                const paramNames = {};
                fn.Params.forEach((arg, i) => {
                    if (paramNames[arg.Name]) {
                        parseError(makePath(npath, 'Params', i, arg.Name), 'duplicate parameter name');
                    }
                    paramNames[arg.Name] = true;
                });
                const returnNames = {};
                fn.Returns.forEach((arg, i) => {
                    if (returnNames[arg.Name]) {
                        parseError(makePath(npath, 'Returns', i, arg.Name), 'duplicate return name');
                    }
                    returnNames[arg.Name] = true;
                });
            });
            sec.Sections.forEach((subsec, i) => {
                this.walkFunctionNames(makePath(path, 'Sections', i, subsec.Name), subsec);
            });
        }
        checkTypewords(path, tokens, okNullable) {
            tokens = tokens.slice(0);
            const tt = tokens.shift();
            if (tt === undefined) {
                parseError(path, 'unexpected end of typewords');
                return; // should not be needed, but typescript doesn't understand parseError unconditionally throws an exception.
            }
            const t = tt;
            switch (t) {
                case 'nullable':
                    if (!okNullable) {
                        parseError(path, 'repeated nullable in typewords');
                    }
                    if (tokens.length == 0) {
                        parseError(path, 'missing typeword after ' + t);
                    }
                    this.checkTypewords(path, tokens, false);
                    break;
                case 'any':
                case 'bool':
                case 'int8':
                case 'uint8':
                case 'int16':
                case 'uint16':
                case 'int32':
                case 'uint32':
                case 'int64':
                case 'uint64':
                case 'int64s':
                case 'uint64s':
                case 'float32':
                case 'float64':
                case 'string':
                case 'timestamp':
                    if (tokens.length != 0) {
                        parseError(path, 'leftover typewords ' + tokens);
                    }
                    break;
                case '[]':
                case '{}':
                    if (tokens.length == 0) {
                        parseError(path, 'missing typeword after ' + t);
                    }
                    this.checkTypewords(path, tokens, true);
                    break;
                default:
                    if (!this.types[t]) {
                        parseError(path, 'referenced type ' + t + ' does not exist');
                    }
                    if (tokens.length != 0) {
                        parseError(path, 'leftover typewords ' + tokens);
                    }
            }
        }
        walkTypewords(path, sec) {
            sec.Structs.forEach((t, i) => {
                const npath = makePath(path, 'Structs', i, t.Name);
                t.Fields.forEach((f, j) => {
                    this.checkTypewords(makePath(npath, 'Fields', j, f.Name), f.Typewords, true);
                });
            });
            sec.Functions.forEach((fn, i) => {
                const npath = makePath(path, 'Functions', i, fn.Name);
                fn.Params.forEach((arg, j) => {
                    this.checkTypewords(makePath(npath, 'Params', j, arg.Name), arg.Typewords, true);
                });
                fn.Returns.forEach((arg, j) => {
                    this.checkTypewords(makePath(npath, 'Returns', j, arg.Name), arg.Typewords, true);
                });
            });
            sec.Sections.forEach((subsec, i) => {
                this.walkTypewords(makePath(path, 'Sections', i, subsec.Name), subsec);
            });
        }
    }
    function parseSection(v) {
        checkSection('', v);
        const doc = v;
        const c = new checker();
        c.walkTypeNames('', doc);
        c.walkFunctionNames('', doc);
        c.walkTypewords('', doc);
        return doc;
    }
    function checkSection(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Docs', 'string'],
            ['Functions', 'array'],
            ['Sections', 'array'],
            ['Structs', 'array'],
            ['Ints', 'array'],
            ['Strings', 'array'],
        ]);
        checkEach(path, v, 'Functions', checkFunction);
        checkEach(path, v, 'Sections', checkSection);
        checkEach(path, v, 'Structs', checkStruct);
        checkEach(path, v, 'Ints', checkInts);
        checkEach(path, v, 'Strings', checkStrings);
    }
    function checkFunction(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Docs', 'string'],
            ['Params', 'array'],
            ['Returns', 'array'],
        ]);
        checkEach(path, v, 'Params', checkArg);
        checkEach(path, v, 'Returns', checkArg);
    }
    function checkArg(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Typewords', 'array'],
        ]);
        // Contents of typewords are checked in a later stage.
        checkEach(path, v, 'Typewords', checkString);
    }
    function checkStruct(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Docs', 'string'],
            ['Fields', 'array'],
        ]);
        checkEach(path, v, 'Fields', checkField);
    }
    function checkField(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Docs', 'string'],
            ['Typewords', 'array'],
        ]);
        // Contents of typewords are checked in a later stage.
        checkEach(path, v, 'Typewords', checkString);
    }
    function checkInts(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Docs', 'string'],
            ['Values', 'array'],
        ]);
        checkEach(path, v, 'Values', checkIntValue);
    }
    function checkIntValue(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Value', 'number'],
            ['Docs', 'string'],
        ]);
    }
    function checkStrings(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Docs', 'string'],
            ['Values', 'array'],
        ]);
        checkEach(path, v, 'Values', checkStringValue);
    }
    function checkStringValue(path, v) {
        checkObject(path, v, [
            ['Name', 'string'],
            ['Value', 'string'],
            ['Docs', 'string'],
        ]);
    }
    function parseJSON(v) {
        checkJSON('', v);
        return v;
    }
    function checkJSON(path, v) {
        checkObject(path, v, [
            ['id', 'string'],
            ['title', 'string'],
            ['functions', 'array'],
            ['baseurl', 'string'],
            ['version', 'string'],
            ['sherpaVersion', 'number'],
            ['sherpadocVersion', 'number'],
        ]);
        checkEach(path, v, 'functions', checkString);
    }

    function exampleObject(typenameMap, type) {
        const checkDone = () => {
            if (type.length !== 0) {
                throw new Error('leftover token in type');
            }
        };
        if (type.length === 0) {
            throw new Error('empty type');
        }
        let t = type.shift();
        if (t === 'nullable') {
            t = type.shift();
        }
        if (!t) {
            throw new Error('empty type after nullable');
        }
        switch (t) {
            case 'bool':
                checkDone();
                return false;
            case 'int8':
            case 'uint8':
            case 'int16':
            case 'uint16':
            case 'int32':
            case 'uint32':
            case 'int64':
            case 'uint64':
                checkDone();
                return 0;
            case 'int64s':
            case 'uint64s':
                checkDone();
                return '0';
            case 'float32':
            case 'float64':
                checkDone();
                return 0.0;
            case 'string':
                checkDone();
                return '';
            case 'timestamp':
                checkDone();
                return new Date().toISOString();
            case 'any':
                checkDone();
                return '...';
            case '[]':
                const r1 = [exampleObject(typenameMap, type)];
                checkDone();
                return r1;
            case '{}':
                const r2 = { key1: exampleObject(typenameMap, type) };
                checkDone();
                return r2;
            default:
                if (!/[a-zA-Z][a-zA-Z0-9]*/.test(t)) {
                    throw new Error('unknown keyword in type');
                }
                checkDone();
                const tt = typenameMap[t];
                if (!tt) {
                    throw new Error('identifier for unknown type ' + t);
                }
                if (isStruct(tt)) {
                    const r3 = {};
                    for (const f of tt.Fields) {
                        r3[f.Name] = exampleObject(typenameMap, f.Typewords.slice(0));
                    }
                    return r3;
                }
                else if (isStrings(tt) || isInts(tt)) {
                    return tt.Values[0].Value;
                }
                else {
                    throw new Error('unknown named type: ' + JSON.stringify(tt));
                }
        }
    }
    function ParamJSON(typenameMap, type) {
        const o = exampleObject(typenameMap, type.slice(0));
        return JSON.stringify(o, null, '\t');
    }
    // Wrap line on space-boundary, keep lines at most maxLength characters.
    const wrap = (text, maxLength) => {
        const r = [];
        let line = '';
        text.split(' ').forEach((w) => {
            if (line === '' || line.length + 1 + w.length < maxLength) {
                if (line !== '') {
                    line += ' ';
                }
                line += w;
            }
            else {
                r.push(line);
                line = w;
            }
        });
        if (line !== '') {
            r.push(line);
        }
        return r;
    };
    const tabSize = 4;
    const formatComment = (text, indent) => {
        text = text.trim();
        if (!text) {
            return '';
        }
        let r = '';
        const maxLength = Math.max(40, 100 - indent.replace(/\t/g, ' '.repeat(tabSize)).length - '// '.length);
        text.split('\n').forEach((line) => {
            wrap(line, maxLength).forEach((line) => {
                r += indent + '// ' + line + '\n';
            });
        });
        return r;
    };
    function typeJS0(app, typenameMap, typewords, firstIndent, laterIndent) {
        const origTypewords = JSON.stringify(typewords);
        let r = [firstIndent];
        if (typewords.length === 0) {
            throw new Error('invalid empty typewords');
        }
        if (typewords[0] === 'nullable') {
            typewords.shift();
            // xxx should mark this as nullable?
        }
        if (typewords.length === 0) {
            throw new Error('invalid empty nullable typewords');
        }
        const t = typewords.shift();
        switch (t) {
            case 'any':
                r.push('"..."');
                break;
            case 'bool':
                r.push('false');
                break;
            case 'int8':
            case 'uint8':
            case 'int16':
            case 'uint16':
            case 'int32':
            case 'uint32':
            case 'int64':
            case 'uint64':
                r.push('0');
                break;
            case 'int64s':
            case 'uint64s':
                r.push('"0"');
                break;
            case 'float32':
            case 'float64':
                r.push('0.0');
                break;
            case 'string':
                r.push('""');
                break;
            case 'timestamp':
                r.push(JSON.stringify(new Date().toISOString()));
                break;
            case '[]':
                {
                    r.push('[\n');
                    const indent = laterIndent + '\t';
                    r.push(...typeJS0(app, typenameMap, typewords, indent, indent), '\n');
                    r.push(laterIndent + ']');
                }
                break;
            case '{}':
                {
                    r.push('{\n');
                    const indent = laterIndent + '\t';
                    r.push(indent, '"key1": ', ...typeJS0(app, typenameMap, typewords, '', indent), '\n');
                    r.push(laterIndent + '}');
                }
                break;
            default:
                if (!t || !/[a-zA-Z][a-zA-Z0-9]*/.test(t)) {
                    throw new Error('invalid field type: ' + origTypewords);
                }
                const td = typenameMap[t];
                if (!td) {
                    throw new Error('unknown type');
                }
                if (isStruct(td)) {
                    r.push('{\n');
                    const indent = laterIndent + '\t';
                    const maxFieldNameLength = Math.max(...td.Fields.map(f => f.Name.length));
                    let maxValueLength = 'false,\t'.length;
                    for (const f of td.Fields) {
                        if (f.Typewords[f.Typewords.length - 1] === "timestamp") {
                            maxValueLength = JSON.stringify(new Date().toISOString()).length + ',\t'.length;
                            break;
                        }
                    }
                    for (let i = 0; i < td.Fields.length; i++) {
                        const f = td.Fields[i];
                        const isLast = i >= td.Fields.length - 1;
                        const inline = isInline(f.Typewords);
                        const continueIndent = inline ? ' '.repeat(maxFieldNameLength - f.Name.length) : '';
                        const value = typeJS0(app, typenameMap, f.Typewords.slice(0), continueIndent, indent);
                        const comment = formatComment(f.Docs, indent);
                        const multilineComment = comment.trim().split('\n').length > 1;
                        const commentBefore = multilineComment || !inline;
                        let commentPrefix = '';
                        if (commentBefore) {
                            r.push('\n', span(app.style.comment, comment));
                        }
                        else {
                            commentPrefix = ' '.repeat(maxValueLength - ParamJSON(typenameMap, f.Typewords.slice(0)).length - 1);
                        }
                        r.push(indent, '"', f.Name, '": ', ...value);
                        if (!isLast) {
                            r.push(',');
                        }
                        commentPrefix += ' ';
                        if (!commentBefore) {
                            r.push(commentPrefix, span(app.style.comment, comment || '\n'));
                        }
                        else {
                            r.push('\n');
                        }
                    }
                    r.push(laterIndent + '}');
                }
                else if (isStrings(td)) {
                    r.push(JSON.stringify(td.Values[0].Value));
                    r.push('  /* or: ');
                    r.push(td.Values.slice(1).map(v => JSON.stringify(v.Value)).join(', '));
                    r.push(' */');
                }
                else if (isInts(td)) {
                    r.push(JSON.stringify(td.Values[0].Value));
                    r.push('  /* (' + td.Values[0].Name + '), or: ');
                    r.push(td.Values.slice(1).map(v => JSON.stringify(v.Value) + ' (' + v.Name + ')').join(', '));
                    r.push(' */');
                }
                else {
                    throw new Error('unknown named type: ' + JSON.stringify(td));
                }
        }
        if (typewords.length !== 0) {
            throw new Error('leftover tokens in type: ' + origTypewords);
        }
        return r;
    }
    const lowerName = (s) => s.substring(0, 1).toLowerCase() + s.substring(1);
    function TypeJS(app, typenameMap, varName, td) {
        return div(span(app.style.comment, formatComment(td.Docs, '')), 'var ', varName, ' = ', ...typeJS0(app, typenameMap, [td.Name], '', ''), '\n\n');
    }
    const basicTypes = [
        'any',
        'string',
        'bool',
        'int8',
        'uint8',
        'int16',
        'uint16',
        'int32',
        'uint32',
        'int64',
        'uint64',
        'int64s',
        'uint64s',
        'timestamp',
    ];
    function isInline(type) {
        let t = type[0];
        if (t === 'nullable') {
            t = type[1];
        }
        for (const v of basicTypes) {
            if (t === v) {
                return true;
            }
        }
        return false;
    }
    function isIdentifier(token) {
        for (const v of basicTypes) {
            if (v === token) {
                return false;
            }
        }
        switch (token) {
            case '[]':
            case '{}':
                return false;
        }
        return !!token && /[a-zA-Z][a-zA-Z0-9]*/.test(token);
    }
    function VarJS(app, typenameMap, varName, type) {
        let t = type[0];
        if (t === 'nullable') {
            t = type[1];
        }
        if (t && isIdentifier(t)) {
            const tt = typenameMap[t];
            if (!tt) {
                throw new Error('unknown identifier for type');
            }
            return TypeJS(app, typenameMap, varName, tt);
        }
        return div(span('var '), span(varName), span(' = '), span(ParamJSON(typenameMap, type) + ';\n\n'));
    }

    var __awaiter$7 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class NavItem {
        constructor(app, kind, name, fn) {
            this.kind = kind;
            this.name = name;
            const hover = { backgroundColor: '#eee' };
            const style = {
                cursor: 'pointer',
                padding: '0 .35em',
            };
            this.looks = {
                section: app.ensureLooks('nav-section', style, { fontWeight: 'bold', borderRadius: '.25em' }).pseudo(':hover', hover),
                type: app.ensureLooks('nav-type', style, { backgroundColor: 'rgb(232, 235, 232)' }).pseudo(':hover', hover),
                function: app.ensureLooks('nav-function', style, { borderRadius: '.25em' }).pseudo(':hover', hover),
            };
            const active = {
                color: primary.fg,
                backgroundColor: primary.bg,
            };
            const activeHover = {
                color: primary.fg,
                backgroundColor: primary.bgHover,
            };
            this.looksActive = {
                section: app.copyLooks('nav-section-active', this.looks.section, active).pseudo(':hover', activeHover),
                type: app.copyLooks('nav-type-active', this.looks.type, active).pseudo(':hover', activeHover),
                function: app.copyLooks('nav-function-active', this.looks.function, active).pseudo(':hover', activeHover),
            };
            this.root = div(this.looks[kind], name, listen('click', ev => {
                ev.preventDefault();
                fn();
            }));
        }
        select() {
            this.root.className = this.looksActive[this.kind].className;
        }
        deselect() {
            this.root.className = this.looks[this.kind].className;
        }
        currentState() {
            return [this.kind.substring(0, 1) + '=' + this.name];
        }
    }
    class Docs {
        constructor(app) {
            this.app = app;
            this.looksTranscript = app.ensureLooks('transcript', {
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8f8f8',
                padding: '1rem',
                borderRadius: '0.25rem',
                marginRight: '1rem',
            });
            this.looksDuration = app.ensureLooks('duration', this.app.looks.title, {
                fontWeight: 'normal',
            });
            this.looksSubtitle = app.ensureLooks('subtitle', {
                fontWeight: 'bold',
                padding: '0.25em 0',
                marginTop: '1.5ex',
                marginBottom: '0.5ex',
            });
            this.content = box(app, _style({ width: '100%' }));
            this.root = box(app, { ui: 'Docs' });
        }
        focus() {
        }
        select(navItem, saveState) {
            if (!this.state) {
                throw Error('Docs not yet initialized');
            }
            this.state.selectedNav.deselect();
            this.state.selectedNav = navItem;
            this.state.selectedNav.select();
            if (saveState) {
                this.app.saveState();
            }
        }
        loadSection(d) {
            if (!this.state) {
                throw new Error('Docs not yet initalized');
            }
            const e = box(this.app, _style({
                display: 'flex',
                flexDirection: 'column',
            }), div(_style({
                flexGrow: 1,
            }), div(_style({
                padding: '0 2rem 2rem 2rem',
            }), h1(this.app.looks.header, d.Name), div(this.app.looks.textWrap, _style({
                maxWidth: '45rem',
            }), d.Docs))));
            reveal(this.content, e);
        }
        loadFunction(fd) {
            if (!this.state) {
                throw new Error('Docs not yet initalized');
            }
            const inputs = fd.Params.map((p, index) => {
                let typewords = p.Typewords;
                let isNullable = typewords[0] === 'nullable';
                const value = ParamJSON(this.state.typenameMap, typewords);
                const lines = value.trim().split('\n').length;
                if (lines > 1) {
                    const e = textarea(this.app.looks.formInput, isNullable ? {} : { required: '' }, { placeholder: value }, { rows: '' + lines }, listen('keyup', () => updateInput(index)));
                    e.value = value;
                    return e;
                }
                return input(this.app.looks.formInput, isNullable ? {} : { required: '' }, { value: value }, { placeholder: value }, listen('keyup', () => updateInput(index)));
            });
            // We keep parameters up to date with changes to the input fields.
            const parameters = inputs.map((input, index) => verifyArg('', JSON.parse(input.value), fd.Params[index].Typewords, true, false, this.state.typenameMap));
            const parametersValid = inputs.map(() => true);
            const callValid = () => {
                for (const v of parametersValid) {
                    if (!v) {
                        return false;
                    }
                }
                return true;
            };
            let callBusy = false;
            const updateCallButton = () => {
                callButton.disabled = callBusy || !callValid();
            };
            const inputValue = (index) => {
                const input = inputs[index];
                const typewords = fd.Params[index].Typewords;
                input.className = this.app.looks.formInput.className;
                try {
                    if (!input.value) {
                        throw new Error('missing value');
                    }
                    const value = JSON.parse(input.value);
                    parameters[index] = value;
                    verifyArg('', value, typewords, true, false, this.state.typenameMap);
                    parametersValid[index] = true;
                    updateCallButton();
                }
                catch (err) {
                    input.className = this.app.style.formInputError.className;
                    parameters[index] = '/* verify: ' + err.message + ' */';
                    parametersValid[index] = false;
                    updateCallButton();
                }
            };
            const join = (l, sep) => {
                if (l.length === 0) {
                    return [];
                }
                const r = [l[0]];
                for (const e of l.slice(1)) {
                    r.push(sep);
                    r.push(e);
                }
                return r;
            };
            const linkedParam = (p) => {
                const kids = [];
                if (p.Name) {
                    kids.push(p.Name + ' ');
                }
                kids.push(this.linkedType(p.Typewords));
                return span(...kids);
            };
            const linkedSynopsis = div(fd.Name, '(', ...join(fd.Params.map(p => linkedParam(p)), ', '), ')', fd.Returns.length > 0 ? ': ' : '', fd.Returns.length > 1 ? '(' : '', ...join(fd.Returns.map(p => linkedParam(p)), ', '), fd.Returns.length > 1 ? ')' : '');
            const updateInput = (index) => {
                inputValue(index);
                updateRequestBox();
            };
            const updateRequestBox = () => {
                children(requestBox, JSON.stringify({ params: parameters }, null, '\t'));
            };
            const requestBox = div(this.looksTranscript);
            updateRequestBox();
            const responseBox = div(this.looksTranscript);
            const requestDurationBox = span(this.looksDuration);
            const exampleBox = div(this.looksTranscript, _style({
                fontFamily: 'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace',
                tabSize: tabSize,
            }));
            // xxx need to find a better way...
            const badStyle = exampleBox.style;
            badStyle['-moz-tab-size'] = '' + tabSize;
            const exampleVars = fd.Params.map(p => VarJS(this.app, this.state.typenameMap, p.Name, p.Typewords));
            let exampleJS = '';
            exampleJS += this.state.sherpaJSON.id + '.' + fd.Name + '(';
            exampleJS += fd.Params.map(p => p.Name).join(', ');
            exampleJS += ')\n';
            exampleJS += '.then(function(result) {\n';
            exampleJS += '\tconsole.log("success", result);\n';
            exampleJS += '}, function(err) {\n';
            exampleJS += '\tconsole.log("error", err);\n';
            exampleJS += '\talert(err.message);\n';
            exampleJS += '});\n';
            children(exampleBox, ...exampleVars, exampleJS);
            const callButton = button(this.app.looks.btnPrimary, { type: 'submit' }, 'call');
            let aborter;
            const cancelButton = button(this.app.looks.btnDanger, { type: 'button' }, 'cancel', listen('click', ev => {
                aborter.abort();
            }));
            cancelButton.disabled = true;
            const e = box(this.app, _style({
                display: 'flex',
                flexDirection: 'column',
            }), div(_style({
                flexGrow: 1,
            }), div(_style({
                padding: '0 2rem 2rem 2rem',
            }), h1(this.app.looks.header, linkedSynopsis), div(this.app.looks.textWrap, _style({
                maxWidth: '45rem',
            }), fd.Docs), br(), form(listen('submit', ev => {
                ev.preventDefault();
                children(responseBox, '');
                aborter = new AbortController();
                callBusy = true;
                updateCallButton();
                cancelButton.disabled = false;
                // Update duration while calling is in progress. We update every 100ms for the first 10 seconds, then switch to whole seconds. At the end we show the detailed final count.
                children(requestDurationBox);
                let t0 = new Date();
                let millis = 0;
                let intervalID = setInterval(() => {
                    millis += 100;
                    const duration = (millis / 1000).toFixed(1) + 's';
                    children(requestDurationBox, duration);
                    if (millis >= 10 * 1000) {
                        clearInterval(intervalID);
                        intervalID = setInterval(() => {
                            millis += 1000;
                            const duration = (millis / 1000).toFixed(0) + 's';
                            children(requestDurationBox, duration);
                        }, 1000);
                    }
                }, 100);
                const url = this.state.baseURL + fd.Name;
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ params: parameters }),
                    signal: aborter.signal,
                })
                    .then(response => {
                    if (!response.ok) {
                        throw { message: 'http status ' + response.status };
                    }
                    return response.json();
                })
                    .then(json => {
                    children(responseBox, JSON.stringify(json, null, '	'));
                    if (!json.error) {
                        const result = json.result;
                        if (fd.Returns.length == 1) {
                            verifyArg('result', result, fd.Returns[0].Typewords, true, true, this.state.typenameMap);
                        }
                        else {
                            fd.Returns.forEach((arg, index) => {
                                verifyArg('result[' + index + ']', result[index], arg.Typewords, true, true, this.state.typenameMap);
                            });
                        }
                    }
                })
                    .catch(err => {
                    children(responseBox, 'call failed: ' + err.message);
                })
                    .finally(() => {
                    clearInterval(intervalID);
                    children(requestDurationBox);
                    const t = new Date();
                    const duration = ((t.getTime() - t0.getTime()) / 1000).toFixed(3) + 's';
                    children(requestDurationBox, duration);
                    callBusy = false;
                    updateCallButton();
                    cancelButton.disabled = true;
                });
            }), ...fd.Params.map((p, index) => div(label(span(_style({ fontWeight: 'bold' }), p.Name), ' ', this.linkedType(p.Typewords), div(inputs[index])))), div(callButton, ' ', cancelButton)), br(), div(div(_style({ width: '50%', minWidth: '35em', display: 'inline-block', verticalAlign: 'top' }), h2(this.app.looks.title, 'Request'), requestBox), div(_style({ width: '50%', minWidth: '35em', display: 'inline-block', verticalAlign: 'top' }), h2(this.app.looks.title, 'Response', ' ', requestDurationBox), responseBox)), br(), div(h2(this.app.looks.title, 'Example JavaScript'), exampleBox))));
            reveal(this.content, e);
        }
        linkedType(typewords) {
            const kids = [];
            for (const t of typewords) {
                const td = this.state.types[t];
                if (!td) {
                    switch (t) {
                        case 'nullable':
                            kids.push('null or ');
                            break;
                        default:
                            kids.push(t);
                    }
                    continue;
                }
                kids.push(a(this.app.looks.link, { href: '' }, listen('click', (e) => __awaiter$7(this, void 0, void 0, function* () {
                    e.preventDefault();
                    yield this.openType(t);
                    this.app.saveState();
                })), t));
            }
            return span(...kids);
        }
        loadType(td) {
            if (!this.state) {
                throw new Error('Docs not yet initalized');
            }
            const usedParam = [];
            const usedReturn = [];
            const usedType = [];
            const usedInArgs = (args) => {
                for (const arg of args) {
                    for (const w of arg.Typewords) {
                        if (td.Name === w) {
                            return true;
                        }
                    }
                }
                return false;
            };
            const usedInFields = (fl) => {
                for (const f of fl) {
                    for (const s of f.Typewords) {
                        if (s === td.Name) {
                            return true;
                        }
                    }
                }
                return false;
            };
            const walkSection = (d) => {
                for (const f of d.Functions) {
                    if (usedInArgs(f.Params)) {
                        usedParam.push(f);
                    }
                    if (usedInArgs(f.Returns)) {
                        usedReturn.push(f);
                    }
                }
                for (const t of d.Structs) {
                    if (usedInFields(t.Fields)) {
                        usedType.push(t);
                    }
                }
                for (const dd of d.Sections) {
                    walkSection(dd);
                }
            };
            walkSection(this.state.sherpadoc);
            const makeFunctionUse = (title, functions) => {
                if (functions.length === 0) {
                    return '';
                }
                return div(_style({
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginRight: '2rem'
                }), h2(this.looksSubtitle, title), ul(...functions.map(f => li(a(this.app.looks.link, { href: '' }, listen('click', (ev) => __awaiter$7(this, void 0, void 0, function* () {
                    ev.preventDefault();
                    yield this.openFunction(f.Name);
                    this.app.saveState();
                })), f.Name)))));
            };
            const makeTypeUse = (title, types) => {
                if (types.length === 0) {
                    return '';
                }
                return div(_style({
                    display: 'inline-block',
                    verticalAlign: 'top',
                    marginRight: '2rem'
                }), h2(this.looksSubtitle, title), ul(...types.map(t => li(a(this.app.looks.link, { href: '' }, listen('click', (ev) => __awaiter$7(this, void 0, void 0, function* () {
                    ev.preventDefault();
                    yield this.openType(t.Name);
                    this.app.saveState();
                })), t.Name)))));
            };
            const exampleBox = div(this.looksTranscript, _style({
                fontFamily: 'Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace',
                tabSize: tabSize,
            }), TypeJS(this.app, this.state.typenameMap, lowerName(td.Name), td));
            // xxx need to find a better way...
            const badStyle = exampleBox.style;
            badStyle['-moz-tab-size'] = '' + tabSize;
            const e = box(this.app, _style({
                display: 'flex',
                flexDirection: 'column',
            }), div(_style({
                flexGrow: 1,
            }), div(_style({
                padding: '0 2rem 2rem 2rem',
            }), h1(this.app.looks.header, td.Name), div(this.app.looks.textWrap, _style({
                marginBottom: '2rem',
                maxWidth: '45rem',
            }), td.Docs), h1(this.app.looks.title, 'Example JavaScript'), exampleBox, br(), makeFunctionUse('Parameter for...', usedParam), makeFunctionUse('Returned by...', usedReturn), makeTypeUse('Used in type...', usedType))));
            reveal(this.content, e);
        }
        openBaseURL(baseURL) {
            return __awaiter$7(this, void 0, void 0, function* () {
                yield load0(this.app, this.root, 'Opening sherpa API baseURL "' + baseURL + '"', (aborter) => __awaiter$7(this, void 0, void 0, function* () {
                    return yield this.loadBaseURL(baseURL, aborter);
                }));
            });
        }
        loadBaseURL(baseURL, aborter) {
            return __awaiter$7(this, void 0, void 0, function* () {
                if (baseURL === '') {
                    throw new Error('Empty sherpa API baseURL, please fill in a URL.');
                }
                if (!/^https?:\/\//.test(baseURL)) {
                    throw new Error('baseURL must start with https:// or http://.');
                }
                if (!/\/$/.test(baseURL)) {
                    baseURL += '/';
                }
                if (location.protocol == 'https:' && /^http:/.test(baseURL)) {
                    location.href = 'http://' + location.hostname + '/#' + baseURL;
                    // not reached
                }
                const loadJSON = (url, filename) => __awaiter$7(this, void 0, void 0, function* () {
                    url += filename;
                    const abortctl = new AbortController();
                    aborter.abort = () => abortctl.abort();
                    let response;
                    try {
                        response = yield fetch(url, {
                            signal: abortctl.signal,
                        });
                    }
                    catch (err) {
                        throw new Error('Error fetching "' + url + '": ' + err.message + '\n\nCommon causes: no network connectivity, bad URL, server not running, or no CORS configured at URL.');
                    }
                    if (!response.ok) {
                        throw new Error('Error fetching "' + url + '": HTTP	 status ' + response.status);
                    }
                    return yield response.json();
                });
                const sherpaJSON = JSON$1(yield loadJSON(baseURL, 'sherpa.json'));
                if (sherpaJSON.sherpaVersion !== supportedSherpaVersion) {
                    throw new Error('unsupported sherpaVersion ' + sherpaJSON.sherpaVersion + ', expecting ' + supportedSherpaVersion);
                }
                const sherpadocResp = yield loadJSON(baseURL, '_docs');
                if (sherpadocResp.error) {
                    throw sherpadocResp.error;
                }
                const doc = section$1(sherpadocResp.result);
                const sections = {};
                const types = {};
                const functions = {};
                const typenameMap = {};
                const gatherTypenames = (d) => {
                    for (const t of d.Structs) {
                        typenameMap[t.Name] = t;
                    }
                    for (const t of d.Strings) {
                        typenameMap[t.Name] = t;
                    }
                    for (const t of d.Ints) {
                        typenameMap[t.Name] = t;
                    }
                    for (const dd of d.Sections) {
                        gatherTypenames(dd);
                    }
                };
                gatherTypenames(doc);
                const navItems = [];
                const makeNav = (d) => {
                    const sectionTitle = new NavItem(this.app, 'section', d.Name, () => {
                        this.select(sectionTitle, true);
                        this.loadSection(d);
                    });
                    navItems.push(sectionTitle);
                    const nav = div(this.app.looks.boxPadding, sectionTitle, ...([...d.Structs, ...d.Strings, ...d.Ints]).map(t => {
                        const e = new NavItem(this.app, 'type', t.Name, () => {
                            this.select(e, true);
                            this.loadType(t);
                        });
                        types[t.Name] = [e, t];
                        navItems.push(e);
                        return e;
                    }), ...d.Functions.map(f => {
                        const e = new NavItem(this.app, 'function', f.Name, () => {
                            this.select(e, true);
                            this.loadFunction(f);
                        });
                        functions[f.Name] = [e, f];
                        navItems.push(e);
                        return e;
                    }), ...d.Sections.map(s => {
                        const [nav] = makeNav(s);
                        return nav;
                    }));
                    sections[d.Name] = [sectionTitle, d];
                    return [nav, sectionTitle];
                };
                const [nav, sectionItem] = makeNav(doc);
                const navBox = box(this.app, _style({ minWidth: '10rem' }), nav, div(_style({ padding: '2em .5em .5em .5em', fontSize: '.9em' }), div(a(this.app.looks.link, { href: 'https://www.sherpadoc.org/' }, 'sherpadoc.org')), div(a(this.app.looks.link, { href: 'https://github.com/mjl-/sherpaweb' }, 'sherpaweb code')), div(sherpaJSON.version)));
                const top = div(this.app.looks.boxPadding, div(_style({
                    float: 'left',
                }), a(this.app.looks.link, _style({
                    textDecoration: 'none',
                }), { href: '' }, '←', listen('click', (e) => __awaiter$7(this, void 0, void 0, function* () {
                    e.preventDefault();
                    location.href = '/';
                })))), div(_style({
                    borderBottom: '1px solid #ccc',
                    textAlign: 'center',
                }), h1(_style({
                    marginBottom: 0,
                }), this.app.looks.title, baseURL, ' - ', sherpaJSON.version)));
                const ui = box(this.app, top, box(this.app, new Split(this.app, navBox, this.content).root));
                this.state = {
                    baseURL: baseURL,
                    sherpaJSON: sherpaJSON,
                    sherpadoc: doc,
                    selectedNav: sectionItem,
                    sections: sections,
                    types: types,
                    functions: functions,
                    navItems: navItems,
                    typenameMap: typenameMap,
                };
                return [ui];
            });
        }
        loadState(state) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const w = state.shift();
                    if (typeof w !== 'string') {
                        throw new Error('Docs: bad state, expected string token');
                    }
                    if (!this.state || this.state.baseURL !== w) {
                        yield this.openBaseURL(w);
                    }
                    const v = state.shift();
                    if (typeof v === 'string') {
                        if (v.startsWith('s=')) {
                            yield this.openSection(v.substring(2));
                            return;
                        }
                        else if (v.startsWith('t=')) {
                            yield this.openType(v.substring(2));
                            return;
                        }
                        else if (v.startsWith('f=')) {
                            yield this.openFunction(v.substring(2));
                            return;
                        }
                    }
                    if (!this.state) {
                        throw new Error('Docs not yet initialized');
                    }
                    yield this.loadSection(this.state.sherpadoc);
                    this.select(this.state.navItems[0], true);
                }
                catch (err) {
                    reveal(this.content, middle(this.app, div('error: ' + err.message)));
                }
            });
        }
        currentState() {
            if (!this.state) {
                throw new Error('Docs not yet initialized');
            }
            return [this.state.baseURL, ...this.state.selectedNav.currentState()];
        }
        openSection(name) {
            return __awaiter$7(this, void 0, void 0, function* () {
                if (!this.state) {
                    throw new Error('Docs not yet initialized');
                }
                const tup = this.state.sections[name];
                if (!tup) {
                    throw new Error(`cannot find section "${name}"`);
                }
                const [navItem, d] = tup;
                this.loadSection(d);
                this.select(navItem, false);
                return Promise.resolve(d);
            });
        }
        openType(name) {
            if (!this.state) {
                throw new Error('Docs not yet initialized');
            }
            const tup = this.state.types[name];
            if (!tup) {
                throw new Error(`cannot find type "${name}"`);
            }
            const [navItem, t] = tup;
            this.loadType(t);
            this.select(navItem, false);
            return Promise.resolve(t);
        }
        openFunction(name) {
            if (!this.state) {
                throw new Error('Docs not yet initialized');
            }
            const tup = this.state.functions[name];
            if (!tup) {
                throw new Error(`cannot find function "${name}"`);
            }
            const [navItem, f] = tup;
            this.loadFunction(f);
            this.select(navItem, false);
            return Promise.resolve(f);
        }
    }

    var __awaiter$8 = ("" && "".__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class Blank {
        constructor() {
            this.root = div();
        }
        focus() {
        }
        loadState(state) {
            return __awaiter$8(this, void 0, void 0, function* () {
                throw new Error('blank');
            });
        }
        currentState() {
            throw new Error('blank');
        }
    }
    class App {
        constructor(mtpt) {
            this.looks = new Looks(this, 'sherpaweb');
            this.appLooks = {};
            this.style = {
                comment: this.looks.create(false, 'comment', {
                    color: '#660066',
                }),
                formInputError: this.looks.create(false, 'form-input-error', this.looks.formInput, {
                    borderColor: 'red',
                }),
            };
            this.root = box(this, { ui: 'App' }, { class: 'sherpaweb-' + this.looks.uniqueID });
            this.hashChange = () => this.loadState(parseState(location.hash));
            this.currentUI = new Blank();
            children(mtpt, this.root);
            const initState = parseState(location.hash);
            this.loadState(initState)
                .then(() => window.addEventListener('hashchange', this.hashChange));
        }
        focus() {
        }
        loadState(state) {
            return __awaiter$8(this, void 0, void 0, function* () {
                if (state.length === 0) {
                    return this.openIntro();
                }
                const docsUI = yield this.openDocs();
                return docsUI.loadState(state);
            });
        }
        openIntro() {
            return __awaiter$8(this, void 0, void 0, function* () {
                const intro = new Intro(this);
                this.currentUI = intro;
                yield reveal(this.root, intro.root);
            });
        }
        openDocs() {
            if (!(this.currentUI instanceof Docs)) {
                const docs = new Docs(this);
                this.currentUI = docs;
                children(this.root, docs.root);
            }
            return this.currentUI;
        }
        saveState() {
            const state = this.currentUI.currentState();
            window.removeEventListener('hashchange', this.hashChange);
            location.hash = packState(state);
            // without the setTimeout, we would still get the hashchange event on firefox
            setTimeout(() => window.addEventListener('hashchange', this.hashChange), 0);
        }
        _ensureLooks(copy, className, ...styles) {
            let v = this.appLooks[className];
            if (!v) {
                v = this.looks.create(copy, className, ...styles);
                this.appLooks[className] = v;
            }
            return v;
        }
        ensureLooks(className, ...styles) {
            return this._ensureLooks(false, className, ...styles);
        }
        copyLooks(className, ...styles) {
            return this._ensureLooks(true, className, ...styles);
        }
        loadBaseURL(baseURL) {
            return __awaiter$8(this, void 0, void 0, function* () {
                try {
                    const docsUI = yield this.openDocs();
                    yield docsUI.openBaseURL(baseURL);
                    yield docsUI.loadSection(docsUI.state.sherpadoc);
                }
                catch (err) {
                    yield this.openIntro();
                }
                this.saveState();
            });
        }
    }

    var main$1 = { App };

    return main$1;

}());
