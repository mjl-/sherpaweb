package sherpa

// Collector facilitates collection of metrics. Functions are called by the library as such events or errors occur.
// See https://github.com/irias/sherpa-prometheus-collector for an implementation for prometheus.
type Collector interface {
	ProtocolError()                                                              // When a request is invalid at protocol-level, e.g. wrong mimetype or request body.
	BadFunction()                                                                // When called function does not exist.
	JavaScript()                                                                 // When sherpa.js is requested.
	JSON()                                                                       // When sherpa.json is requested.
	FunctionCall(name string, error bool, serverError bool, durationSec float64) // When function "name" is called, and whether that caused an "error" at all, and a "serverError" in particular, and how long the call took.
}

type ignoreCollector struct{}

func (ignoreCollector) ProtocolError()                                                              {}
func (ignoreCollector) BadFunction()                                                                {}
func (ignoreCollector) JavaScript()                                                                 {}
func (ignoreCollector) JSON()                                                                       {}
func (ignoreCollector) FunctionCall(name string, error bool, serverError bool, durationSec float64) {}
