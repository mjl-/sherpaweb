package main

import (
	"crypto/md5"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"regexp"
)

func check(err error, action string) {
	if err != nil {
		log.Fatalf("%s: %s\n", action, err)
	}
}

func main() {
	log.SetPrefix("build: ")
	log.SetFlags(0)
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "usage: build\n")
		flag.PrintDefaults()
	}
	flag.Parse()
	args := flag.Args()
	if len(args) != 0 {
		flag.PrintDefaults()
		os.Exit(2)
	}

	buf, err := ioutil.ReadFile("index1.html")
	check(err, "reading index1.html")
	html := string(buf)
	html = revrepl(html, "embed/web/1")
	err = ioutil.WriteFile("embed/web/1/index.html", []byte(html), 0644)
	check(err, "writing embed/web/1/index.html")
}

func makehash(path string) string {
	buf, err := ioutil.ReadFile(path)
	check(err, "reading file")
	return fmt.Sprintf("%x", md5.Sum(buf))[:12]
}

// revrepl from github.com/irias/ding, released under MIT license, copyright Irias Informatiemanagement
func revrepl(contents, dest string) string {
	re1 := regexp.MustCompile(`\s(href|src)="([^"]+)\?v=[a-zA-Z0-9]+"`)
	contents = re1.ReplaceAllStringFunc(contents, func(s string) string {
		l := re1.FindStringSubmatch(s)
		filename := l[2]
		v := makehash(dest + "/" + filename)
		return fmt.Sprintf(` %s="%s?v=%s"`, l[1], filename, v)
	})
	re2 := regexp.MustCompile(`url\('([^']+)\?v=[a-zA-Z0-9]+'\)`)
	contents = re2.ReplaceAllStringFunc(contents, func(s string) string {
		l := re2.FindStringSubmatch(s)
		filename := l[1]
		v := makehash(dest + "/" + filename)
		return fmt.Sprintf(`url('%s?v=%s')`, filename, v)
	})
	return contents
}
