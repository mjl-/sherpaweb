package sherpa

// Errors generated by both clients and servers
const (
	SherpaBadFunction = "sherpaBadFunction" // function does not exist at server
)

// Errors generated by clients
const (
	SherpaClientError = "sherpaClientError" // error from client library when calling an API function
	SherpaBadResponse = "sherpaBadResponse" // bad response from server, e.g. JSON response body could not be parsed
	SherpaHttpError   = "sherpaHttpError"   // unexpected http response status code from server
	SherpaNoAPI       = "sherpaNoAPI"       // no API was found at this URL
)

// Errors generated by servers
const (
	SherpaBadRequest = "sherpaBadRequest" // error parsing JSON request body
	SherpaBadParams  = "sherpaBadParams"  // wrong number of parameters in function call
)