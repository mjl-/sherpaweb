package sherpa

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"mime"
	"net/http"
	"reflect"
	"strings"
)

// Sherpa version this package implements. Note that Sherpa is at version 0 and still in development and will probably change.
const SherpaVersion = 0

// handler that responds to all Sherpa-related requests.
type handler struct {
	baseURL    string
	id         string
	title      string
	version    string
	functions  map[string]interface{}
	docsURL    string
	json       []byte
	javascript []byte
}

// Sherpa API error object.
// Message is a human-readable error message.
// Code is optional, it can be used to handle errors programmatically.
type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e *Error) Error() string {
	return e.Message
}

// Sherpa API response type
type response struct {
	Result interface{} `json:"result"`
	Error  *Error      `json:"error,omitempty"`
}

var htmlTemplate *template.Template

func init() {
	var err error
	htmlTemplate, err = template.New("html").Parse(`<!doctype html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>{{.title}}</title>
		<style>
body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; line-height:1.4; font-size:16px; color: #333; }
a { color: #327CCB; }
.code { padding: 2px 4px; font-size: 90%; color: #c7254e; background-color: #f9f2f4; border-radius: 4px; }
		</style>
	</head>
	<body>
		<div style="margin:1em auto 1em; max-width:45em">
			<h1>{{.title}} <span style="font-weight:normal; font-size:0.7em">- version {{.version}}</span></h1>
			<p>
				This is the base URL for {{.title}}. The API has been loaded on this page, under variable <span class="code">{{.id}}</span>. So open your browser's developer console and start calling functions!
			</p>
			<p>
				You can also the <a href="{{.docsURL}}">read documentation</a> for this API.</p>
			</p>
			<p style="text-align: center; font-size:smaller; margin-top:8ex;">
				<a href="https://bitbucket.org/mjl/sherpa/">go sherpa code</a> |
				<a href="https://www.ueber.net/who/mjl/sherpa/">sherpa api's</a> |
				<a href="https://bitbucket.org/mjl/sherpaweb/">sherpaweb code</a>
			</p>
		</div>
		<script src="{{.jsURL}}"></script>
	</body>
</html>`)
	if err != nil {
		panic(err)
	}
}

func respondJson(w http.ResponseWriter, status int, r *response, _ string) {
	w.Header().Add("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	err := json.NewEncoder(w).Encode(r)
	if err != nil {
		log.Println("error writing json response:", err)
	}
}

func respondJsonp(w http.ResponseWriter, status int, r *response, callback string) {
	w.Header().Add("Content-Type", "text/javascript; charset=utf-8")
	w.WriteHeader(status)
	_, err := fmt.Fprintf(w, "%s(\n\t", callback)
	if err == nil {
		err = json.NewEncoder(w).Encode(r)
	}
	if err == nil {
		_, err = fmt.Fprint(w, ");")
	}
	if err != nil {
		log.Println("error writing json response:", err)
	}
}

// call function fn with a json body read from r.
// on success, the returned interface contains:
// - nil, if fn has no return value
// - single value, if fn had a single return value
// - slice of values, if fn had multiple return values
//
// on error, we always return an Error with the Code field set.
func call(fn interface{}, r io.Reader) (ret interface{}, ee *Error) {
	defer func() {
		e := recover()
		if e == nil {
			return
		}

		se, ok := e.(*Error)
		if ok {
			ee = se
			return
		}
		panic(se)
	}()

	var request struct {
		Params json.RawMessage `json:"params"`
	}

	err := json.NewDecoder(r).Decode(&request)
	if err != nil {
		return nil, &Error{Code: SherpaBadRequest, Message: "invalid JSON request body: " + err.Error()}
	}

	fnt := reflect.TypeOf(fn)

	var params []interface{}
	err = json.Unmarshal(request.Params, &params)
	if err != nil {
		return nil, &Error{Code: SherpaBadRequest, Message: "invalid JSON request body: " + err.Error()}
	}

	need := fnt.NumIn()
	if fnt.IsVariadic() {
		if len(params) != need-1 && len(params) != need {
			return nil, &Error{Code: SherpaBadParams, Message: fmt.Sprintf("bad number of parameters, got %d, want %d or %d", len(params), need-1, need)}
		}
	} else {
		if len(params) != need {
			return nil, &Error{Code: SherpaBadParams, Message: fmt.Sprintf("bad number of parameters, got %d, want %d", len(params), need)}
		}
	}

	values := make([]reflect.Value, fnt.NumIn())
	args := make([]interface{}, fnt.NumIn())
	for i := range values {
		n := reflect.New(fnt.In(i))
		values[i] = n.Elem()
		args[i] = n.Interface()
	}

	err = json.Unmarshal(request.Params, &args)
	if err != nil {
		return nil, &Error{Code: SherpaBadParams, Message: fmt.Sprintf("could not parse parameters: " + err.Error())}
	}

	errorType := reflect.TypeOf((*error)(nil)).Elem()
	checkError := fnt.NumOut() > 0 && fnt.Out(fnt.NumOut()-1).Implements(errorType)

	var results []reflect.Value
	if fnt.IsVariadic() {
		results = reflect.ValueOf(fn).CallSlice(values)
	} else {
		results = reflect.ValueOf(fn).Call(values)
	}
	if len(results) == 0 {
		return nil, nil
	}

	rr := make([]interface{}, len(results))
	for i, v := range results {
		rr[i] = v.Interface()
	}
	if !checkError {
		if len(rr) == 1 {
			return rr[0], nil
		}
		return rr, nil
	}
	rr, rerr := rr[:len(rr)-1], rr[len(rr)-1]
	var rv interface{} = rr
	switch len(rr) {
	case 0:
		rv = nil
	case 1:
		rv = rr[0]
	}
	if rerr == nil {
		return rv, nil
	}
	switch r := rerr.(type) {
	case *Error:
		return nil, r
	case error:
		return nil, &Error{Message: r.Error()}
	default:
		panic("checkError while type is not error")
	}
}

// NewHandler returns a new http.Handler that serves all Sherpa API-related requests.
//
// baseURL must be the URL this API is available at.
// id is the variable name for the API object the JavaScript client library.
// title should be a human-readable name of the API.
// functions are the functions you want to make available through this handler.
//
// This handler expects to be called with any path elements stripped using http.StripPrefix.
//
// If the last return value (if any) is an error (i.e. has an "Error() string"-function,
// that error field is taken to indicate whether the call succeeded.
// Functions can also panic with an *Error to indicate a failed function call.
//
// Variadic functions can be called, but in the call (from the client), the variadic parameter must be passed in as an array.
func NewHandler(baseURL, id, title, version string, functions map[string]interface{}) (http.Handler, error) {
	docsURL := "https://sherpa.irias.nl/#" + baseURL

	names := make([]string, 0, len(functions))
	for name, fn := range functions {
		if reflect.TypeOf(fn).Kind() != reflect.Func {
			return nil, fmt.Errorf("sherpa handler: %#v is not of type function", name)
		}
		names = append(names, name)
	}

	xjson, err := json.Marshal(map[string]interface{}{
		"id":            id,
		"title":         title,
		"functions":     names,
		"baseurl":       baseURL,
		"version":       version,
		"sherpaVersion": SherpaVersion,
	})
	if err != nil {
		log.Panicf("marshal json: %s", err)
	}

	js := bytes.Replace(sherpaJS, []byte("SHERPA_JSON"), xjson, -1)

	h := &handler{
		baseURL:    baseURL,
		id:         id,
		title:      title,
		functions:  functions,
		version:    version,
		docsURL:    docsURL,
		json:       xjson,
		javascript: js}
	return h, nil
}

func badMethod(w http.ResponseWriter) {
	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}

// return whether callback js snippet is valid.
// this is a coarse test.  we disallow some valid js identifiers, like "\u03c0",
// and we allow many invalid ones, such as js keywords, "0intro" and identifiers starting/ending with ".", or having multiple dots.
func validCallback(cb string) bool {
	if cb == "" {
		return false
	}
	for _, c := range cb {
		if c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c == '_' || c == '$' || c == '.' {
			continue
		}
		return false
	}
	return true
}

// Serve a HTTP request for this Sherpa API.
// ServeHTTP expects the request path is stripped from the path it was mounted at with the http package.
//
// The following endpoints are handled:
// 	- sherpa.json, describing this API.
// 	- sherpa.js, a small stand-alone client JavaScript library that makes it trivial to start using this API from a browser.
// 	- functionName, for function invocations on this API.
//
// HTTP response will have CORS-headers set, and support the OPTIONS HTTP method.
func (h *handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	hdr := w.Header()
	hdr.Set("Access-Control-Allow-Origin", "*")
	hdr.Set("Access-Control-Allow-Methods", "GET, POST")
	hdr.Set("Access-Control-Allow-Headers", "Content-Type")

	switch {
	case r.URL.Path == "":
		err := htmlTemplate.Execute(w, map[string]interface{}{
			"id":      h.id,
			"title":   h.title,
			"version": h.version,
			"docsURL": h.docsURL,
			"jsURL":   h.baseURL + "sherpa.js",
		})
		if err != nil {
			log.Println(err)
		}

	case r.URL.Path == "sherpa.json":
		switch r.Method {
		case "OPTIONS":
			w.WriteHeader(204)
		case "GET":
			hdr.Set("Content-Type", "application/json; charset=utf-8")
			hdr.Set("Cache-Control", "no-cache")
			_, err := w.Write(h.json)
			if err != nil {
				log.Println("writing sherpa.json response:", err)
			}
		default:
			badMethod(w)
		}

	case r.URL.Path == "sherpa.js":
		if r.Method != "GET" {
			badMethod(w)
			return
		}
		hdr.Set("Content-Type", "text/javascript; charset=utf-8")
		hdr.Set("Cache-Control", "no-cache")
		_, err := w.Write(h.javascript)
		if err != nil {
			log.Println("writing sherpa.js response:", err)
		}

	default:
		name := r.URL.Path
		fn, ok := h.functions[name]
		switch r.Method {
		case "OPTIONS":
			w.WriteHeader(204)

		case "POST":
			hdr.Set("Cache-Control", "no-store")

			respond := respondJson

			if !ok {
				respond(w, 404, &response{Error: &Error{Code: SherpaBadFunction, Message: fmt.Sprintf("function %q does not exist", name)}}, "")
				return
			}

			// xxx check file upload?

			ct := r.Header.Get("Content-Type")
			if ct == "" {
				respond(w, 200, &response{Error: &Error{Code: SherpaBadRequest, Message: fmt.Sprintf("missing content-type")}}, "")
				return
			}
			mt, mtparams, err := mime.ParseMediaType(ct)
			if err != nil {
				respond(w, 200, &response{Error: &Error{Code: SherpaBadRequest, Message: fmt.Sprintf("invalid content-type %q", ct)}}, "")
				return
			}
			if mt != "application/json" {
				respond(w, 200, &response{Error: &Error{Code: SherpaBadRequest, Message: fmt.Sprintf(`unrecognized content-type %q, expecting "application/json"`, mt)}}, "")
				return
			}
			charset, ok := mtparams["charset"]
			if ok && strings.ToLower(charset) != "utf-8" {
				respond(w, 200, &response{Error: &Error{Code: SherpaBadRequest, Message: fmt.Sprintf(`unexpected charset %q, expecting "utf-8"`, charset)}}, "")
				return
			}

			r, xerr := call(fn, r.Body)
			if xerr != nil {
				respond(w, 200, &response{Error: xerr}, "")
			} else {
				respond(w, 200, &response{Result: r}, "")
			}

		case "GET":
			hdr.Set("Cache-Control", "no-store")

			respond := respondJson
			if !ok {
				respond(w, 404, &response{Error: &Error{Code: SherpaBadFunction, Message: fmt.Sprintf("function %q does not exist", name)}}, "")
				return
			}

			err := r.ParseForm()
			if err != nil {
				respond(w, 200, &response{Error: &Error{Code: SherpaBadRequest, Message: fmt.Sprintf("could not parse query string")}}, "")
				return
			}

			callback := r.Form.Get("callback")
			_, ok := r.Form["callback"]
			if ok {
				if !validCallback(callback) {
					respond(w, 200, &response{Error: &Error{Code: SherpaBadRequest, Message: fmt.Sprintf(`invalid callback name %q`, callback)}}, "")
					return
				}
				respond = respondJsonp
			}

			// we allow an empty list to be missing to make it cleaner & easier to call health check functions (no ugly urls)
			body := r.Form.Get("body")
			_, ok = r.Form["body"]
			if !ok {
				body = `{"params": []}`
			}

			r, xerr := call(fn, strings.NewReader(body))
			if xerr != nil {
				respond(w, 200, &response{Error: xerr}, callback)
			} else {
				respond(w, 200, &response{Result: r}, callback)
			}

		default:
			badMethod(w)
		}
	}
}
