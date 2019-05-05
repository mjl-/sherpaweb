package main

import (
	"context"
	"time"

	"github.com/mjl-/sherpa"
)

var count chan int64

// Status is an example for a string enum.
type Status string

// Values for the Status string constants.
const (
	StatusNew       Status = "new"
	StatusPending   Status = "pending"
	StatusActive    Status = "active"
	StatusCompleted Status = "completed"
	StatusFailed    Status = "failed"
)

// Flags are an example for int enums.
type Flags int

// Values for the Flags int constants.
const (
	FlagRead  Flags = 1 // Read
	FlagWrite Flags = 2 // Write
)

func init() {
	count = make(chan int64)
	go func() {
		i := int64(0)
		for {
			i++
			count <- i
		}
	}()
}

// Example API illustrates how to use and implement a Sherpa API. You are probably reading this through sherpaweb, the web app that renders Sherpa API documentation and that lets you call functions with parameters you set.
type Example struct {
	Signatures Signatures
}

// RequestCount returns the number of requests to this function since it was last restarted.
func (Example) RequestCount(ctx context.Context) int64 {
	return <-count
}

// Echo return the call parameter as its result.
func (Example) Echo(ctx context.Context, s string) string {
	return s
}

// Sum the two parameters.
func (Example) Sum(ctx context.Context, a, b int) int {
	return a + b
}

// Sleep waits for `seconds` seconds, then returns.
func (Example) Sleep(ctx context.Context, seconds int) {
	t := time.NewTimer(time.Duration(seconds) * time.Second)
	select {
	case <-t.C:
	case <-ctx.Done():
		t.Stop()
	}
}

// NestedType is used in MyType.
// In sherpa API, if you want to include a non-basic type in another type, it must
// be named. So while you can have an array of string (string is a basic type), you
// cannot have an array of inline-type-with-several-fields. You must give that
// inline-type-with-several-fields a name, like NestedType.
type NestedType struct {
	ID   int
	Name string
}

// ExampleType is an example type that contains other types, also non-basic types.
type ExampleType struct {
	ID     int
	Nested NestedType
	Array  []string
	Map    map[string]interface{}
	Any    interface{}
}

// Identity shows parameters and return values of user created types.
func (Example) Identity(ctx context.Context, t ExampleType, intptr *int, array []string) (ExampleType, *int, []string, error) {
	return t, intptr, array, nil
}

// Explain returns string repretations for its parameters.
func (Example) Explain(ctx context.Context, status Status, flag Flags) (sm string, fm string) {
	switch status {
	case StatusNew, StatusPending, StatusActive, StatusCompleted, StatusFailed:
		sm = string(sm)
	default:
		panic(&sherpa.Error{Code: "user:error", Message: "unknown status value"})
	}

	switch flag {
	case FlagRead:
		fm = "read"
	case FlagWrite:
		fm = "write"
	default:
		panic(&sherpa.Error{Code: "user:error", Message: "unknown flag value"})
	}
	return
}

// Now returns the current time.
func (Example) Now(ctx context.Context) time.Time {
	return time.Now()
}

// Add adds nanoseconds to time t and returns the new timestamp.
func (Example) Add(ctx context.Context, t time.Time, nanoseconds sherpa.Int64s) time.Time {
	return t.Add(time.Duration(nanoseconds))
}

// Sub calculates t - u and returns the difference in nanoseconds.
func (Example) Sub(ctx context.Context, t, u time.Time) (nanoseconds sherpa.Int64s) {
	return sherpa.Int64s(t.Sub(u))
}
