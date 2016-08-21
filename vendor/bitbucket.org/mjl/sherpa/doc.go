// Package sherpa is a server and client library for Sherpa API's.
//
// NOTE: this is work in progress and will likely change.
//
// Sherpa API's are similar to JSON-RPC, but discoverable and self-documenting.
// Sherpa is defined at https://www.ueber.net/who/mjl/sherpa/.
//
// Use sherpa.NewHandler to export Go functions using a http.Handler.
// sherpa.NewClient creates an API client for calling remote functions.
package sherpa
