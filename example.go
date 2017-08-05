package main

import (
	"time"
)

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

// Example API illustrates how to use and implement a Sherpa API. You are probably reading this through sherpaweb, the web app that renders Sherpa API documentation and that lets you call functions with parameters you set.
//
// Below you'll find the functions implemented by this Example API.
type Example struct {
	Signatures Signatures
}

// RequestCount returns the number of requests to this function since it was last restarted.
func (_ Example) RequestCount() int64 {
	return <-count
}

// Echo return the call parameter as its result.
func (_ Example) Echo(s string) string {
	return s
}

// Sum the two parameters.
func (_ Example) Sum(a, b int) int {
	return a + b
}

// Sleep waits for `seconds` seconds, then returns.
func (_ Example) Sleep(seconds int) {
	time.Sleep(time.Duration(seconds) * time.Second)
}
