// Example API illustrates how to use and implement a Sherpa API. You are probably reading this through sherpaweb, the web app that renders Sherpa API documentation and that lets you call functions with parameters you set.
//
// Below you'll find the functions implemented by this Example API.
package exampleapi

import (
	"encoding/json"
	"time"

	"golang.org/x/tools/godoc/vfs"

	"bitbucket.org/mjl/sherpa"
)

var Fs vfs.FileSystem

var count chan int64

func init() {
	count = make(chan int64)
	go func() {
		i := int64(0)
		for {
			i += 1
			count <- i
		}
	}()
}

// requestCount(): int64
//
// RequestCount returns the number of requests to this API since it was last restarted.
// sherpa: requestCount
func RequestCount() int64 {
	return <-count
}

// echo(...) ...
//
// Echo return the call parameters as its result.
// sherpa: echo
func Echo(args ...interface{}) interface{} {
	return args
}

// sleep(seconds int)
//
// Sleep waits for `seconds` seconds, then returns.
// sherpa: sleep
func Sleep(seconds int) {
	time.Sleep(time.Duration(seconds) * time.Second)
}

// return sherpa api documentation
func Documentation() (*sherpa.Docs, error) {
	f, err := Fs.Open("/exampleapi.json")
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var docs sherpa.Docs
	err = json.NewDecoder(f).Decode(&docs)
	if err != nil {
		return nil, err
	}
	return &docs, nil
}
