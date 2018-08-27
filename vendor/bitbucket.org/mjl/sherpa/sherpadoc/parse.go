package sherpadoc

import (
	"fmt"
	"log"
	"os"
	"reflect"
	"sort"
	"strconv"
	"strings"

	"go/ast"
	"go/doc"
	"go/parser"
	"go/token"
)

func parseDoc(apiName, packagePath string) *Section {
	fset := token.NewFileSet()
	pkgs, firstErr := parser.ParseDir(fset, packagePath, nil, parser.ParseComments)
	check(firstErr, "parsing code")
	for _, pkg := range pkgs {
		docpkg := doc.New(pkg, "", doc.AllDecls)

		for _, t := range docpkg.Types {
			if t.Name == apiName {
				par := &parsed{
					Path:    packagePath,
					Pkg:     pkg,
					Docpkg:  docpkg,
					Imports: make(map[string]*parsed),
				}
				return parseSection(t, par)
			}
		}
	}
	log.Fatalf("type %q not found\n", apiName)
	return nil
}

func (par *parsed) lookupType(name string) *doc.Type {
	for _, t := range par.Docpkg.Types {
		if t.Name == name {
			return t
		}
	}
	return nil
}

func parseSection(t *doc.Type, par *parsed) *Section {
	section := &Section{
		t.Name,
		t.Name,
		strings.TrimSpace(t.Doc),
		nil,
		map[string]struct{}{},
		nil,
		nil,
	}
	methods := make([]*doc.Func, len(t.Methods))
	copy(methods, t.Methods)
	sort.Slice(methods, func(i, j int) bool {
		return methods[i].Decl.Name.NamePos < methods[j].Decl.Name.NamePos
	})
	for _, fn := range methods {
		parseMethod(fn, section, par)
	}

	ts := t.Decl.Specs[0].(*ast.TypeSpec)
	expr := ts.Type
	st := expr.(*ast.StructType)
	for _, f := range st.Fields.List {
		ident, ok := f.Type.(*ast.Ident)
		if !ok {
			continue
		}
		name := ident.Name
		if f.Tag != nil {
			name = reflect.StructTag(parseStringLiteral(f.Tag.Value)).Get("sherpa")
		}
		subt := par.lookupType(ident.Name)
		if subt == nil {
			log.Fatalf("subsection %q not found\n", ident.Name)
		}
		subsection := parseSection(subt, par)
		subsection.Name = name
		section.Sections = append(section.Sections, subsection)
	}
	return section
}

func gatherFieldType(typeName string, f *Field, e ast.Expr, section *Section, par *parsed) string {
	switch t := e.(type) {
	case *ast.Ident:
		tt := par.lookupType(t.Name)
		if tt != nil {
			ensureNamedType(tt, section, par)
		}
		return t.Name
	case *ast.ArrayType:
		return "[]" + gatherFieldType(typeName, f, t.Elt, section, par)
	case *ast.MapType:
		kt := gatherFieldType(typeName, f, t.Key, section, par)
		vt := gatherFieldType(typeName, f, t.Value, section, par)
		return fmt.Sprintf("map[%s]%s", kt, vt)
	case *ast.StructType:
		for _, ft := range t.Fields.List {
			name := nameList(ft.Names, ft.Tag)
			if name == "" {
				continue
			}
			subf := &Field{
				name,
				"",
				fieldDoc(ft),
				[]*Field{},
			}
			subf.Type = gatherFieldType(typeName, subf, ft.Type, section, par)
			f.Fields = append(f.Fields, subf)
		}
		return "object"
	case *ast.InterfaceType:
		if t.Methods != nil && len(t.Methods.List) > 0 {
			log.Fatalf("unsupported non-empty interface param/return type %T\n", t)
		}
		return "?"
	case *ast.StarExpr:
		return "*" + gatherFieldType(typeName, f, t.X, section, par)
	case *ast.SelectorExpr:
		return parseSelector(t, typeName, section, par)
	}
	log.Fatalf("unsupported type in struct %q, field %q: %T\n", typeName, f.Name, e)
	return ""
}

func fieldDoc(f *ast.Field) string {
	s := ""
	if f.Doc != nil {
		s += strings.Replace(strings.TrimSpace(f.Doc.Text()), "\n", " ", -1)
	}
	if f.Comment != nil {
		if s != "" {
			s += "; "
		}
		s += strings.TrimSpace(f.Comment.Text())
	}
	return s
}

// parse type of param/return type used in one of the functions
func ensureNamedType(t *doc.Type, section *Section, par *parsed) {
	typePath := par.Path + "." + t.Name
	if _, have := section.Typeset[typePath]; have {
		return
	}

	tt := &Type{
		t.Name,
		strings.TrimSpace(t.Doc),
		[]*Field{},
	}
	// add it early, so self-referencing types can't cause a loop
	section.Types = append(section.Types, tt)
	section.Typeset[typePath] = struct{}{}

	ts := t.Decl.Specs[0].(*ast.TypeSpec)
	st, ok := ts.Type.(*ast.StructType)
	if !ok {
		log.Fatalf("unsupported param/return type %T\n", ts.Type)
	}
	for _, field := range st.Fields.List {
		name := nameList(field.Names, field.Tag)
		if name == "" {
			continue
		}

		f := &Field{
			name,
			"",
			fieldDoc(field),
			[]*Field{},
		}
		f.Type = gatherFieldType(t.Name, f, field.Type, section, par)
		tt.Fields = append(tt.Fields, f)
	}
}

// Parse string literal. Errors are fatal.
func parseStringLiteral(s string) string {
	r, err := strconv.Unquote(s)
	check(err, "parsing string literal")
	return r
}

func jsonName(tag string, name string) string {
	s := reflect.StructTag(tag).Get("json")
	if s == "" {
		return name
	} else if s == "-" {
		return s
	} else {
		return strings.Split(s, ",")[0]
	}
}

func nameList(names []*ast.Ident, tag *ast.BasicLit) string {
	if names == nil {
		return ""
	}
	l := []string{}
	for _, name := range names {
		if ast.IsExported(name.Name) {
			l = append(l, name.Name)
		}
	}
	if len(l) == 1 && tag != nil {
		return jsonName(parseStringLiteral(tag.Value), l[0])
	}
	return strings.Join(l, ", ")
}

func parseArgType(e ast.Expr, section *Section, par *parsed) string {
	switch t := e.(type) {
	case *ast.Ident:
		tt := par.lookupType(t.Name)
		if tt != nil {
			ensureNamedType(tt, section, par)
		}
		return t.Name
	case *ast.ArrayType:
		return "[]" + parseArgType(t.Elt, section, par)
	case *ast.Ellipsis:
		return "..." + parseArgType(t.Elt, section, par)
	case *ast.MapType:
		kt := parseArgType(t.Key, section, par)
		vt := parseArgType(t.Value, section, par)
		return fmt.Sprintf("map[%s]%s", kt, vt)
	case *ast.StructType:
		l := []string{}
		for _, ft := range t.Fields.List {
			name := nameList(ft.Names, ft.Tag)
			if name == "" {
				continue
			}
			l = append(l, fmt.Sprintf("%s %s", name, parseArgType(ft.Type, section, par)))
		}
		return fmt.Sprintf("struct{%s}", strings.Join(l, ", "))
	case *ast.InterfaceType:
		if t.Methods != nil && len(t.Methods.List) > 0 {
			log.Fatalf("unsupported non-empty interface param/return type %T\n", t)
		}
		return "?"
	case *ast.StarExpr:
		return "*" + parseArgType(t.X, section, par)
	case *ast.SelectorExpr:
		return parseSelector(t, section.TypeName, section, par)
	}
	log.Fatalf("unsupported param/return type %T\n", e)
	return ""
}

func parseSelector(t *ast.SelectorExpr, sourceTypeName string, section *Section, par *parsed) string {
	packageIdent, ok := t.X.(*ast.Ident)
	if !ok {
		log.Fatalf("unexpected non-ident for SelectorExpr.X\n")
	}
	pkgName := packageIdent.Name
	typeName := t.Sel.Name

	if testSkipImportPath(pkgName, typeName) {
		return typeName
	}
	importPath := par.lookupPackageImportPath(sourceTypeName, pkgName)
	if importPath == "" {
		log.Fatalf("cannot find source for %q (perhaps try -skip-import-paths)\n", fmt.Sprintf("%s.%s", pkgName, typeName))
	}
	if testSkipImportPath(importPath, typeName) {
		return typeName
	}

	imppar := par.ensurePackageParsed(importPath)
	tt := imppar.lookupType(typeName)
	if tt == nil {
		log.Fatalf("could not find type %q in package %q\n", typeName, importPath)
	}
	ensureNamedType(tt, section, imppar)
	return typeName
}

func testSkipImportPath(importPath, typeName string) bool {
	// context.Context is often the first parameter to a function. Don't fail on not being able to find its source.
	if importPath == "context" && typeName == "Context" {
		return true
	}

	for _, e := range strings.Split(*skipImportPaths, ",") {
		if e == importPath {
			return true
		}
	}
	return false
}

func (par *parsed) ensurePackageParsed(importPath string) *parsed {
	r := par.Imports[importPath]
	if r != nil {
		return r
	}

	// todo: should also attempt to look at vendor/ directory, and modules
	localPath := os.Getenv("GOPATH")
	if localPath == "" {
		localPath = defaultGOPATH()
	}
	localPath += "/src/" + importPath

	fset := token.NewFileSet()
	pkgs, firstErr := parser.ParseDir(fset, localPath, nil, parser.ParseComments)
	check(firstErr, "parsing code")
	if len(pkgs) != 1 {
		log.Fatalf("need exactly one package parsed for import path %q, but saw %d\n", importPath, len(pkgs))
	}
	for _, pkg := range pkgs {
		docpkg := doc.New(pkg, "", doc.AllDecls)
		npar := &parsed{
			Path:    localPath,
			Pkg:     pkg,
			Docpkg:  docpkg,
			Imports: make(map[string]*parsed),
		}
		par.Imports[importPath] = npar
		return npar
	}
	return nil
}

// LookupPackageImportPath returns the import/package path for pkgName as used as a selector in this section.
func (par *parsed) lookupPackageImportPath(sectionTypeName, pkgName string) string {
	file := par.lookupTypeFile(sectionTypeName)
	for _, imp := range file.Imports {
		if imp.Name != nil && imp.Name.Name == pkgName || imp.Name == nil && strings.HasSuffix(parseStringLiteral(imp.Path.Value), "/"+pkgName) {
			return parseStringLiteral(imp.Path.Value)
		}
	}
	return ""
}

// LookupTypeFile returns the go source file that containst he definition of the type named typeName.
func (par *parsed) lookupTypeFile(typeName string) *ast.File {
	for _, file := range par.Pkg.Files {
		for _, decl := range file.Decls {
			switch d := decl.(type) {
			case (*ast.GenDecl):
				for _, spec := range d.Specs {
					switch s := spec.(type) {
					case *ast.TypeSpec:
						if s.Name.Name == typeName {
							return file
						}
					}
				}
			}
		}
	}
	log.Fatalf("could not find type named %q in package %q\n", typeName, par.Path)
	return nil
}

func parseArgs(isParams bool, fields *ast.FieldList, section *Section, par *parsed) string {
	if fields == nil {
		return ""
	}
	args := []string{}
	for _, f := range fields.List {
		names := []string{}
		for _, name := range f.Names {
			names = append(names, name.Name)
		}
		typeStr := parseArgType(f.Type, section, par)

		var arg string
		if isParams {
			arg = fmt.Sprintf("%s %s", strings.Join(names, ", "), typeStr)
		} else {
			arg = typeStr
		}
		args = append(args, arg)

	}
	if !isParams && len(args) > 0 && args[len(args)-1] == "error" {
		args = args[:len(args)-1]
	}
	return strings.Join(args, ", ")
}

func lowerFirst(s string) string {
	return strings.ToLower(s[:1]) + s[1:]
}

func parseMethod(fn *doc.Func, section *Section, par *parsed) {
	name := lowerFirst(fn.Name)
	params := parseArgs(true, fn.Decl.Type.Params, section, par)
	results := parseArgs(false, fn.Decl.Type.Results, section, par)
	synopsis := fmt.Sprintf("%s(%s)", name, params)
	if results != "" {
		synopsis += " " + results
	}
	f := &Function{
		name,
		synopsis,
		fn.Doc,
	}
	section.Functions = append(section.Functions, f)
}
