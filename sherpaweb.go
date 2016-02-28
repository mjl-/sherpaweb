package main

import (
	"bitbucket.org/mjl/asset"
	"bitbucket.org/mjl/httpvfs"
	"bitbucket.org/mjl/sherpa"
	"flag"
	"fmt"
	"golang.org/x/tools/godoc/vfs"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"bitbucket.org/mjl/sherpaweb/exampleapi"
	"bitbucket.org/mjl/sherpaweb/exampleapi/hmacapi"
)

const VERSION = "0.0.1"

var fs vfs.FileSystem

func makeApiUrl(url string) string {
	if strings.HasPrefix(url, "http://") {
		return fmt.Sprintf("%s/X/%s", config.BaseURL, url[len("http://"):])
	} else if strings.HasPrefix(url, "https://") {
		return fmt.Sprintf("%s/x/%s", config.BaseURL, url[len("https://"):])
	} else {
		panic("Bad configuration, invalid BaseURL.")
	}
}

func renderTemplate(w http.ResponseWriter, args map[string]interface{}, templatePaths ...string) {
	args["exampleApiUrl"] = makeApiUrl(config.BaseURL + "/exampleapi/")
	args["version"] = VERSION

	check := func(err error) {
		if err != nil {
			log.Panic(err)
		}
	}

	t := template.New("x")
	for _, path := range templatePaths {
		f, err := fs.Open("/" + path)
		check(err)
		defer f.Close()
		templ, err := ioutil.ReadAll(f)
		check(err)
		t, err = t.Parse(string(templ))
		check(err)
	}

	check(t.ExecuteTemplate(w, "html", args))
}

func index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", 405)
		return
	}

	args := map[string]interface{}{}
	renderTemplate(w, args, "t/base.html", "t/index.html")
}

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
	if r.URL.RawQuery != "" {
		url += "?" + r.URL.RawQuery
	}

	args := map[string]interface{}{
		"sherpaUrl": url,
	}
	renderTemplate(w, args, "t/base.html", "t/docs.html")
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

func main() {
	flag.StringVar(&config.BaseURL, "baseurl", "http://localhost:8080", "URL at which this tool will be reachable.")
	flag.StringVar(&config.Addr, "addr", ":8080", "address to listen on")
	flag.Parse()
	if len(flag.Args()) != 0 {
		log.Println("usage: no parameters allowed")
		os.Exit(1)
	}

	fs = asset.Fs()
	if err := asset.Error(); err != nil {
		log.Println("assets: using local file system...")
		fs = vfs.OS("assets")
	}
	exampleapi.Fs = fs

	http.HandleFunc("/", index)
	http.HandleFunc("/x/", docs)
	http.HandleFunc("/X/", docs)
	http.Handle("/s/", http.FileServer(httpvfs.New(fs)))

	functions := map[string]interface{}{
		"requestCount": exampleapi.RequestCount,
		"echo":         exampleapi.Echo,
		"sleep":        exampleapi.Sleep,
		"_docs":        exampleapi.Documentation,
		"hmacSign":     hmacapi.HmacSign,
		"hmacVerify":   hmacapi.HmacVerify,
	}
	baseURL := fmt.Sprintf("%s/exampleapi/", config.BaseURL)
	exampleapi, err := sherpa.NewHandler(baseURL, "exampleapi", "Example API", "0.0.1", functions)
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/exampleapi/", http.StripPrefix("/exampleapi/", delay(exampleapi)))

	log.Printf("listening on %s, open %s", config.Addr, config.BaseURL)
	log.Fatal(http.ListenAndServe(config.Addr, nil))
}
