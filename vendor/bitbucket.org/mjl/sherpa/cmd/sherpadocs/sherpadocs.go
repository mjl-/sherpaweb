// Sherpadocs reads your Go source code and generates sherpa API documentation.
//
// Sherpadocs takes a multiple of 3 arguments.
// 	- package directory with source code
// 	- title of the documentation (section)
//	- mapping of Go function names to sherpa API function names, in comma-separated pairs of the form "goFunctionName:sherpaFucntionname"
//
// All packages after the first will be a subsection of the first package.
// The package documentation will be the main body of sherpa documentation.
// The mapping of go functions to sherpa functions can be empty. If the last line of documentation for
// a Go function starts with "sherpa:", the function name following it will be added to the generated documentation.
//
// For example:
//
//	sherpadocs exampleapi/ 'Introduction to Example API' '' exampleapi/hmacapi/ 'Signatures' '' >assets/exampleapi.json
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"go/doc"
	"go/parser"
	"go/token"
	"os"
	"strings"

	"bitbucket.org/mjl/sherpa"
)

func fail(s string) {
	fmt.Fprintln(os.Stderr, s)
	os.Exit(1)
}

func parseFunc(fn *doc.Func, functions map[string]string, docs *sherpa.Docs) {
	text := strings.Trim(fn.Doc, "\r\n")
	lines := strings.Split(text, "\n")
	var sherpaFn string
	if len(lines) > 0 {
		s := strings.Trim(lines[len(lines)-1], " \t\r\n")
		if strings.HasPrefix(s, "sherpa:") {
			sherpaFn = s[len("sherpa:"):]
			sherpaFn = strings.Trim(sherpaFn, " \t\r\n")
			text = strings.Join(lines[:len(lines)-1], "\n")
		}
	}
	name, ok := functions[fn.Name]
	if !ok && sherpaFn != "" {
		name = sherpaFn
	}
	if name != "" {
		fd := &sherpa.FunctionDocs{Name: name, Text: text}
		docs.Functions = append(docs.Functions, fd)
	}
}

func makeDocs(path string, functions map[string]string) (*sherpa.Docs, error) {
	fset := token.NewFileSet()
	pkgs, first := parser.ParseDir(fset, path, nil, parser.ParseComments)
	if first != nil {
		return nil, fmt.Errorf("parsing code: %s", first)
	}
	docs := &sherpa.Docs{
		Functions: []*sherpa.FunctionDocs{},
		Sections:  []*sherpa.Docs{},
	}

	for _, pkg := range pkgs {
		docpkg := doc.New(pkg, "", doc.AllDecls)
		docs.Title = docpkg.Name
		docs.Text = strings.Trim(docpkg.Doc, "\r\n")

		for _, fn := range docpkg.Funcs {
			parseFunc(fn, functions, docs)
		}

		// functions that return a type defined in the same file are in that type's .Funcs
		for _, typ := range docpkg.Types {
			for _, fn := range typ.Funcs {
				parseFunc(fn, functions, docs)
			}
		}
	}
	return docs, nil
}

func usage() {
	fail("usage: sherpadocs [packagepath title [gofunction:sherpafunction,...]] ...")
}

func main() {
	flag.Parse()
	args := flag.Args()
	if len(args) < 3 || len(args)%3 != 0 {
		usage()
	}

	var rootDocs *sherpa.Docs

	for i := 0; i < len(args); i += 3 {
		path := args[i+0]
		title := args[i+1]
		functions := map[string]string{}
		for _, pair := range strings.Split(args[i+2], ",") {
			if pair == "" {
				continue
			}
			l := strings.Split(pair, ":")
			if len(l) != 2 {
				fail(fmt.Sprintf("invalid function mapping: %q", pair))
			}
			// xxx verify valid identifier?
			functions[l[0]] = l[1]
		}

		docs, err := makeDocs(path, functions)
		if err != nil {
			fail(err.Error())
		}
		docs.Title = title

		if rootDocs == nil {
			rootDocs = docs
		} else {
			rootDocs.Sections = append(rootDocs.Sections, docs)
		}
	}

	buf, err := json.MarshalIndent(rootDocs, "", "\t")
	if err != nil {
		fail(err.Error())
	}
	_, err = os.Stdout.Write(buf)
	if err == nil {
		_, err = fmt.Println()
	}
	if err != nil {
		fail(err.Error())
	}
}
