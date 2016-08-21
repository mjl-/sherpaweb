Sherpa is a library in Go for providing and consuming Sherpa API's.

The Sherpa specification can be found at:

	https://www.ueber.net/who/mjl/sherpa/

This library makes it trivial to export Go functions as a Sherpa API, including documentation.

Use the sherpaweb tool to read API documentation and call methods (for testing purposes).

Use the CLI tool sherpaclient to inspect API's through the command-line:

	# the basics of the API
	$ sherpaclient -info https://sherpa.irias.nl/exampleapi/

	# call a function
	$ sherpaclient http://localhost:8080/exampleapi/ echo '["test", 123, [], {"a": 123.34, "b": null}]'
	["test",123,[],{"a":123.34,"b":null}]

	# all documentation
	$ sherpaclient -docs https://sherpa.irias.nl/exampleapi/
	...

	# documentation for just one function
	$ sherpaclient -docs https://sherpa.irias.nl/exampleapi/ echo
	...

Use the CLI tool sherpadocs to generate Sherpa documentation from the comments in the Go source files.

	$ sherpadocs path/to/myapi 'My API' 'goFunctionName:sherpaFunctionName,...' >myapi.json

See https://bitbucket.org/mjl/sherpaweb/ with its Example API for an example.


# Documentation

https://godoc.org/bitbucket.org/mjl/sherpa

# Compiling

	go get bitbucket.org/mjl/sherpa

# About

Written by Mechiel Lukkien, mechiel@ueber.net. Bug fixes, patches, comments are welcome.
MIT-licensed, see LICENSE.


# todo

- check if we need to set more headers, and if cors headers are correct
- allow more fields in error response objects?
- more strict with incoming parameters: error for unrecognized field in objects
- sherpadocs: attempt to automatically generate the synopsis line?
- sherpadocs: investigate if struct definitions can be used in docs
- say something about variadic parameters

- handler: write tests
- handler: write documentation
- handler: run jshint on the js code in sherpajs.go

- client: write tests
