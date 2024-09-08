//go:build tools
// +build tools

package main

import (
	_ "github.com/mjl-/sherpadoc/cmd/sherpadoc"
	_ "golang.org/x/lint/golint"
)
