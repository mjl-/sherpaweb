Sherpa is a Go library for creating Sherpa API's.

This library makes it trivial to export Go functions as a Sherpa
API with an http.Handler.

API you create will automatically be documented: The sherpadoc
command reads your Go source, and exports function and type comments
as API documentation.


# Sherpa

Sherpa is a simple mechanism for providing web API's, typically for
creating web applications and providing fully documented API's at
the same time. Details:

	https://www.ueber.net/who/mjl/sherpa/


# Examples

A public sherpa API:

	https://sherpa.irias.nl/#https://sherpa.irias.nl/example/

That web application is sherpaweb. It exports an API called Example.
The code for sherpaweb is available at:

	https://bitbucket.org/mjl/sherpaweb/

Look for "type Example" and "type Signatures" for the API implementation.
Sherpaweb is a web application that lets your "discover" (read docs
and call functions) any sherpa API your browser can connect it,
including your local development environment.

A more elaborate web application built on a Sherpa API:

	https://github.com/irias/ding/


# Documentation

	https://godoc.org/bitbucket.org/mjl/sherpa


# About

Written by Mechiel Lukkien, mechiel@ueber.net.
Bug fixes, patches, comments are welcome.
MIT-licensed, see LICENSE.

cmd/sherpadoc/gopath.go originates from the Go project, see LICENSE-go.


# todo

- handler: write tests
- sherpadoc: write tests
- client: write tests

- when reading types from other packages (imported packages), we only look at GOPATH. vendor and modules are not taking into account, but we should.
