package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"

	"bitbucket.org/mjl/sherpa"
)

func fail(s string) {
	fmt.Fprintln(os.Stderr, s)
	os.Exit(1)
}

func usage() {
	fail("usage: sherpaclient [-docs] [-info] url [function [args...]]")
}

func main() {
	printDocs := flag.Bool("docs", false, "show documentation for all functions or single function if specified")
	printInfo := flag.Bool("info", false, "show the API descriptor")
	flag.Parse()
	args := flag.Args()
	if len(args) < 1 {
		usage()
	}

	url := args[0]
	args = args[1:]

	if *printDocs {
		if len(args) > 1 {
			usage()
		}
		docs(url, args)
		return
	}
	if *printInfo {
		if len(args) != 0 {
			usage()
		}
		info(url)
		return
	}

	function := args[0]
	args = args[1:]
	params := make([]interface{}, len(args))
	for i, arg := range args {
		err := json.Unmarshal([]byte(arg), &params[i])
		if err != nil {
			fail(fmt.Sprintf("error parsing parameter %v: %s\n", arg, err))
		}
	}

	c, err := sherpa.NewClient(url, []string{})
	if err != nil {
		fail(err.Error())
	}
	var result interface{}
	serr := c.Call(&result, function, params...)
	if serr != nil {
		if serr.Code == "" {
			fail(fmt.Sprintf("error: %s", err))
		} else {
			fail(fmt.Sprintf("error %v: %s", serr.Code, serr.Message))
		}
	}
	err = json.NewEncoder(os.Stdout).Encode(&result)
	if err != nil {
		fail(err.Error())
	}
}

func info(url string) {
	c, err := sherpa.NewClient(url, nil)
	if err != nil {
		fail(err.Error())
	}

	fmt.Printf("Id: %s\n", c.Id)
	fmt.Printf("Title: %s\n", c.Title)
	fmt.Printf("Version: %s\n", c.Version)
	fmt.Printf("BaseURL: %s\n", c.BaseURL)
	fmt.Printf("SherpaVersion: %d\n", c.SherpaVersion)
	fmt.Printf("Functions:\n")
	for _, fn := range c.Functions {
		fmt.Printf("- %s\n", fn)
	}
}

func docs(url string, args []string) {
	c, err := sherpa.NewClient(url, nil)
	if err != nil {
		fail(err.Error())
	}

	var docs sherpa.Docs
	cerr := c.Call(&docs, "_docs")
	if cerr != nil {
		fail(fmt.Sprintf("fetching documentation: %s", cerr))
	}

	if len(args) == 1 {
		printFunction(&docs, args[0])
	} else {
		printDocs(&docs)
	}
}

func printFunction(docs *sherpa.Docs, function string) {
	for _, fn := range docs.Functions {
		if fn.Name == function {
			fmt.Println(fn.Text)
		}
	}
	for _, subDocs := range docs.Sections {
		printFunction(subDocs, function)
	}
}

func printDocs(docs *sherpa.Docs) {
	fmt.Printf("# %s\n\n%s\n\n", docs.Title, docs.Text)
	for _, fnDoc := range docs.Functions {
		fmt.Printf("# %s()\n%s\n\n", fnDoc.Name, fnDoc.Text)
	}
	for _, subDocs := range docs.Sections {
		printDocs(subDocs)
	}
	fmt.Println("")
}
