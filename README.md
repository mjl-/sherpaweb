# Sherpaweb

Sherpaweb is a web app that helps you try out & read documentation for a sherpa API:

- Shows the sherpa documentation for any sherpa API.
- Lets you call all API functions. Settings parameters is easy, and success and errors are indicated clearly.

Use this public instance to access any sherpa API your browser has
access to, even local ones:

	https://www.sherpadoc.org/

Sherpa API's are simple HTTP/JSON based RPC API's that are easy to
create, document and consume, especially with JavaScript.  For more
information about sherpa, see:

	https://www.ueber.net/who/mjl/sherpa/


# Download

You can download sherpaweb binaries for Linux, macOS and Windows:

	https://www.ueber.net/who/mjl/sherpa/apidocs/.


# Running

I run it like this:

	./sherpaweb -addr :8080 -baseurl https://www.sherpadoc.org/

Along with a reverse proxy (nginx or similar) to provide HTTPS and gzipped responses.


# License

Released under the MIT license, see LICENSE.


# Contact

Suggestions, improvements, patches, bug reports, new implementations?
Mail to mechiel@ueber.net.


# Todo

- remember call when switching functions/pages
- make example with curl
- incremental ts builds
- have state with params to functions in url?

- implement (un)collapsing sections in nav
- integrate sherpats into sherpaweb, making it easy to download typescript definition for an API
- render markdown again?
- help user to input a dataURI?
- allow file selection and turn the file into base64?
