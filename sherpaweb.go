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
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"bitbucket.org/mjl/httpasset"
	"bitbucket.org/mjl/sherpa"
)

var (
	version = "dev"
	fs      http.FileSystem

	baseURL    = flag.String("baseurl", "http://localhost:8080", "URL at which sherpaweb will be reachable.")
	listenAddr = flag.String("addr", ":8080", "address to listen on")
)

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

// this remains for historic reasons:  an earlier sherpaweb allowed loading /[xX]/<sherpa-baseurl>,
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

	url = *baseURL + "/#" + url
	http.Redirect(w, r, url, http.StatusFound)
}

// used for testing
func delay(fn http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(time.Duration(0) * time.Second)
		fn.ServeHTTP(w, r)
	})
}

func cacheHandler(h http.Handler) http.Handler {
	s := fmt.Sprintf("max-age=%d, public", 7*24*3600)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Cache-Control", s)
		h.ServeHTTP(w, r)
	})
}

func main() {
	log.SetPrefix("sherpaweb: ")
	flag.Parse()
	if len(flag.Args()) != 0 {
		flag.PrintDefaults()
		os.Exit(2)
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

	doc := &sherpa.Doc{}
	f, err := fs.Open("/example.json")
	if err == nil {
		err = json.NewDecoder(f).Decode(doc)
	}
	if err != nil {
		log.Fatal(err)
	}
	f.Close()

	handler, err := sherpa.NewHandler("/example/", version, Example{}, doc, nil)
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/example/", delay(handler))

	log.Printf("listening on %s, open %s", *listenAddr, *baseURL)
	log.Fatal(http.ListenAndServe(*listenAddr, nil))
}
