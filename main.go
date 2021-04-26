/*
Sherpaweb is a web app that helps you try & read documentation for Sherpa API's:

- Shows the sherpa documentation for any sherpa API.
- Lets you call all API functions. Settings parameters is easy, and success and errors are indicated clearly.

Example:

	sherpaweb

Now open:

	http://localhost:8080/
*/
package main

import (
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	_ "net/http/pprof"
	"os"
	"strings"
	"time"

	"github.com/mjl-/httpinfo"
	"github.com/mjl-/sherpa"
	"github.com/mjl-/sherpadoc"
	"github.com/mjl-/sherpaprom"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

//go:embed embed/*
var _embedFS embed.FS
var embedFS = localFS(_embedFS)
var webFS = mustSubFS(embedFS, "embed/web")

var (
	baseURL         = flag.String("baseurl", "http://localhost:8080", "URL at which sherpaweb will be reachable.")
	listenAddr      = flag.String("addr", "localhost:8080", "address to serve sherpaweb on")
	adminListenAddr = flag.String("admin-addr", "localhost:8081", "address to serve admin endpoints on like prometheus metrics and pprof")
)

var (
	version       = "dev"
	vcsCommitHash = ""
	vcsTag        = ""
	vcsBranch     = ""
)

func localFS(fsys fs.FS) fs.FS {
	if _, err := os.Stat("embed"); err == nil {
		log.Printf("serving embed files from file system")
		return os.DirFS(".")
	}
	return fsys
}

func mustSubFS(fsys fs.FS, dir string) fs.FS {
	r, err := fs.Sub(fsys, dir)
	if err != nil {
		log.Fatalf("subfs %q: %v", dir, err)
	}
	return r
}

func init() {
	// Since we set vcs* variables with ldflags -X, we cannot read them in the vars section.
	// So we combine them into a CodeVersion during init, and add the handler while we're at it.
	info := httpinfo.CodeVersion{
		CommitHash: vcsCommitHash,
		Tag:        vcsTag,
		Branch:     vcsBranch,
		Full:       version,
	}
	http.Handle("/info", httpinfo.NewHandler(info, nil))
}

// used for testing
func delay(fn http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(time.Duration(0) * time.Second)
		fn.ServeHTTP(w, r)
	})
}

func check(err error, action string) {
	if err != nil {
		log.Fatalf("%s: %s\n", action, err)
	}
}

func main() {
	log.SetPrefix("sherpaweb: ")
	log.SetFlags(0)
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "usage: %s [flags]\n", os.Args[0])
		flag.PrintDefaults()
	}
	flag.Parse()
	if len(flag.Args()) != 0 {
		flag.Usage()
		os.Exit(2)
	}

	var doc sherpadoc.Section
	ff, err := embedFS.Open("embed/example.json")
	check(err, "opening sherpa docs")
	err = json.NewDecoder(ff).Decode(&doc)
	check(err, "parsing sherpa docs")
	err = ff.Close()
	check(err, "closing sherpa docs after parsing")

	collector, err := sherpaprom.NewCollector("sherpaweb", nil)
	check(err, "creating sherpa prometheus collector")

	exampleHandler, err := sherpa.NewHandler("/1/example/", version, Example{}, &doc, &sherpa.HandlerOpts{Collector: collector})
	check(err, "making sherpa handler")

	mux := http.NewServeMux()
	mux.HandleFunc("/", serveAsset)
	mux.Handle("/1/example/", delay(exampleHandler))
	http.Handle("/metrics", promhttp.Handler())

	log.Printf("sherpaweb, version %s, listening on %s (public) and %s (admin), open %s", version, *listenAddr, *adminListenAddr, *baseURL)
	go func() {
		log.Fatal(http.ListenAndServe(*adminListenAddr, nil))
	}()
	log.Fatal(http.ListenAndServe(*listenAddr, mux))
}

func serveAsset(w http.ResponseWriter, r *http.Request) {
	if strings.HasSuffix(r.URL.Path, "/") {
		r.URL.Path += "index.html"
	}
	f, err := webFS.Open(r.URL.Path[1:])
	if err != nil {
		if os.IsNotExist(err) {
			http.NotFound(w, r)
			return
		}
		log.Printf("serving asset %s: %s", r.URL.Path, err)
		http.Error(w, "500 - Server error", 500)
		return
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil {
		log.Printf("serving asset %s: %s", r.URL.Path, err)
		http.Error(w, "500 - Server error", 500)
		return
	}

	if info.IsDir() {
		http.NotFound(w, r)
		return
	}

	_, haveCacheBuster := r.URL.Query()["v"]
	cache := "no-cache, max-age=0"
	if haveCacheBuster {
		cache = fmt.Sprintf("public, max-age=%d", 31*24*3600)
	}
	w.Header().Set("Cache-Control", cache)

	http.ServeContent(w, r, r.URL.Path, info.ModTime(), f.(io.ReadSeeker))
}
