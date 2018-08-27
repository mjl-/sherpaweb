// Package sherpadoc is a library with a Main function so you can run it as a command during builds.
package sherpadoc

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"

	"go/ast"
	"go/doc"
)

var (
	packagePath     = flag.String("package-path", ".", "of source code to parse")
	skipImportPaths = flag.String("skip-import-paths", ".", "comma-separated list of import paths to skip when generating type documentation")
	title           = flag.String("title", "", "title of the API, default is the name of the type of the main API")
)

// Field is an entry in a type.
type Field struct {
	Name   string
	Type   string
	Doc    string
	Fields []*Field
}

// Type represents the type of a parameter or return value.
type Type struct {
	Name   string
	Doc    string
	Fields []*Field
}

// Function holds usage information about an exported function.
type Function struct {
	Name     string
	Synopsis string
	Doc      string
}

// Parsed is a package that was parsed, possibly including some of its imports as well, because the package that contains the section references it.
type parsed struct {
	Path    string       // Of import, used for keeping duplicate type names from different packages unique.
	Pkg     *ast.Package // Needed for its files: we need a file to find the package path and identifier used to reference other types.
	Docpkg  *doc.Package
	Imports map[string]*parsed // Package/import path to parsed packages.
}

// Section is an API section with docs, functions and subsections.
// Types are gathered per section, and moved up the section tree to the first common ancestor, so types are only documented once.
type Section struct {
	TypeName  string // Name of the type for this section.
	Name      string // Name of the section. Either same as TypeName, or overridden with a "sherpa" struct tag.
	Doc       string
	Types     []*Type
	Typeset   map[string]struct{}
	Functions []*Function
	Sections  []*Section
}

func check(err error, action string) {
	if err != nil {
		log.Fatalf("%s: %s\n", action, err)
	}
}

// Main runs the sherpadoc program.
func Main() {
	log.SetFlags(0)
	log.SetPrefix("sherpadoc: ")
	flag.Usage = func() {
		fmt.Fprintln(os.Stderr, "usage: sherpadoc main-section-api-type")
		flag.PrintDefaults()
	}
	flag.Parse()
	args := flag.Args()
	if len(args) != 1 {
		flag.Usage()
		os.Exit(2)
	}
	section := parseDoc(args[0], *packagePath)
	if *title != "" {
		section.Name = *title
	}

	moveTypesUp(section)
	doc := sherpaDoc(section)
	writeJSON(doc)
}

func writeJSON(v interface{}) {
	buf, err := json.MarshalIndent(v, "", "\t")
	check(err, "marshal to json")
	_, err = os.Stdout.Write(buf)
	if err == nil {
		_, err = fmt.Println()
	}
	check(err, "writing json to stdout")
}

type typeCount struct {
	t     *Type
	count int
}

// Move types used in multiple sections up to their common ancestor.
func moveTypesUp(section *Section) {
	// First, the process for each child.
	for _, s := range section.Sections {
		moveTypesUp(s)
	}

	// Count how often a type is used from here downwards.
	// If more than once, move the type up to here.
	counts := map[string]*typeCount{}
	countTypes(counts, section)
	for _, tc := range counts {
		if tc.count <= 1 {
			continue
		}
		for _, sub := range section.Sections {
			removeType(sub, tc.t)
		}
		if !hasType(section, tc.t) {
			section.Types = append(section.Types, tc.t)
		}
	}
}

func countTypes(counts map[string]*typeCount, section *Section) {
	for _, t := range section.Types {
		_, ok := counts[t.Name]
		if !ok {
			counts[t.Name] = &typeCount{t, 0}
		}
		counts[t.Name].count++
	}
	for _, subsec := range section.Sections {
		countTypes(counts, subsec)
	}
}

func removeType(section *Section, t *Type) {
	types := make([]*Type, 0, len(section.Types))
	for _, tt := range section.Types {
		if tt.Name != t.Name {
			types = append(types, tt)
		}
	}
	section.Types = types
	for _, sub := range section.Sections {
		removeType(sub, t)
	}
}

func hasType(section *Section, t *Type) bool {
	for _, tt := range section.Types {
		if tt.Name == t.Name {
			return true
		}
	}
	return false
}
