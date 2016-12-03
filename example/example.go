// Example API illustrates how to use and implement a Sherpa API. You are probably reading this through sherpaweb, the web app that renders Sherpa API documentation and that lets you call functions with parameters you set.
//
// Below you'll find the functions implemented by this Example API.
package example

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

// requestCount(): int64
//
// RequestCount returns the number of requests to this function since it was last restarted.
// sherpa: requestCount
func RequestCount() int64 {
	return <-count
}

// echo(s string) string
//
// Echo return the call parameter as its result.
// sherpa: echo
func Echo(s string) string {
	return s
}

// Sum(a, b int) int
//
// Sum the two parameters.
// sherpa: sum
func Sum(a, b int) int {
	return a + b
}

// sleep(seconds int)
//
// Sleep waits for `seconds` seconds, then returns.
// sherpa: sleep
func Sleep(seconds int) {
	time.Sleep(time.Duration(seconds) * time.Second)
}
