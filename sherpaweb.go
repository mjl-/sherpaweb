package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"bitbucket.org/mjl/sherpaweb/example"
	"bitbucket.org/mjl/sherpaweb/example/hmacapi"

	"bitbucket.org/mjl/httpasset"
	"bitbucket.org/mjl/sherpa"
)

var fs http.FileSystem

func index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}

	f, err := fs.Open("/index.html")
	if err != nil {
		log.Println(err)
		http.Error(w, "Error opening index.html", 500)
		return
	}
	defer f.Close()
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "max-age=0")
	_, err = io.Copy(w, f)
	if err != nil {
		log.Println(err)
	}
}

// this remains for historic reasons:  an earlier sherpaweb allowed loading /[xX]/<sherpa-baseurl,
// for which we would always return the same html.
func docs(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}

	url := r.URL.Path
	if strings.HasPrefix(url, "/x/") {
		url = "https://" + url[len("/x/"):]
	} else {
		url = "http://" + url[len("/X/"):]
	}

	url = config.BaseURL + "/#" + url
	http.Redirect(w, r, url, http.StatusFound)
}

// used for testing
func delay(fn http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(time.Duration(0) * time.Second)
		fn.ServeHTTP(w, r)
	})
}

var config struct {
	BaseURL string
	Addr    string
}

func cacheHandler(h http.Handler) http.Handler {
	s := fmt.Sprintf("max-age=%d, public", 7*24*3600)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Cache-Control", s)
		h.ServeHTTP(w, r)
	})
}


func main() {
	flag.StringVar(&config.BaseURL, "baseurl", "http://localhost:8080", "URL at which this tool will be reachable.")
	flag.StringVar(&config.Addr, "addr", ":8080", "address to listen on")
	flag.Parse()
	if len(flag.Args()) != 0 {
		log.Println("usage: no parameters allowed")
		os.Exit(1)
	}

	fs = httpasset.Fs()
	if err := httpasset.Error(); err != nil {
		log.Println("assets: using local file system...")
		fs = http.Dir("assets")
	}

	http.HandleFunc("/", index)
	http.HandleFunc("/x/", docs)
	http.HandleFunc("/X/", docs)
	http.Handle("/s/", cacheHandler(http.FileServer(fs)))

	_docs, err := sherpa.Documentor(fs.Open("/example.json"))
	if err != nil {
		log.Fatal(err)
	}

	functions := map[string]interface{}{
		"sum":          example.Sum,
		"requestCount": example.RequestCount,
		"echo":         example.Echo,
		"sleep":        example.Sleep,
		"hmacSign":     hmacapi.HmacSign,
		"hmacVerify":   hmacapi.HmacVerify,
		"_docs":        _docs,
	}
	baseURL := fmt.Sprintf("%s/example/", config.BaseURL)
	example, err := sherpa.NewHandler(baseURL, "example", "Example API", "0.0.1", functions)
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/example/", http.StripPrefix("/example/", delay(example)))

	log.Printf("listening on %s, open %s", config.Addr, config.BaseURL)
	log.Fatal(http.ListenAndServe(config.Addr, nil))
}
