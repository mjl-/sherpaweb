package sherpa

import (
	"encoding/json"
	"io"
)

// Documentation object, to be returned by a Sherpa API "_docs" function.
type Docs struct {
	Title     string          `json:"title"`
	Text      string          `json:"text"`
	Functions []*FunctionDocs `json:"functions"`
	Sections  []*Docs         `json:"sections"`
}

// Documentation for a single function Name.
// Text should be in markdown. The first line should be a synopsis showing parameters including types, and the return types.
type FunctionDocs struct {
	Name string `json:"name"`
	Text string `json:"text"`
}

// Documentor turns a documentation source (JSON file containing Docs) into a function returning those docs, parsed.
// This function is suitable for use as a "_docs" function.
func Documentor(docSrc io.ReadCloser, err error) (func() *Docs, error) {
	if err != nil {
		return nil, err
	}
	defer docSrc.Close()
	var docs Docs
	err = json.NewDecoder(docSrc).Decode(&docs)
	if err != nil {
		return nil, err
	}
	return func() *Docs {
		return &docs
	}, nil
}
