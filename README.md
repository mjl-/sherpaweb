Sherpaweb is a web app that helps you try & read documentation for Sherpa API's:

- Shows the sherpa documentation for any sherpa API.
- Lets you call all API functions. Settings parameters is easy, and success and errors are indicated clearly.

Sherpa API's are simple HTTP/JSON based RPC API's that are easy to
create, document and consume, especially with JavaScript.  For more
information, see

	https://www.ueber.net/who/mjl/sherpa/

You can include the JavaScript library at `assets/s/js/sherpa.js`
in your own project to consume Sherpa API's.


# Download

You can download sherpaweb binaries for Windows, Linux and macOS from https://www.ueber.net/who/mjl/sherpa/apidocs/.

You can also use this public sherpaweb instance:

	https://sherpa.irias.nl

You can even access your private API's: Only your browser is talking to your API. If your browser can reach your API, you can use sherpa.irias.nl to read documentation.

If you want to compile sherpaweb yourself, read below.


# Running

We run it like this:

	./sherpaweb -addr :8080 -baseurl https://sherpa.irias.nl

Typically, you'll run a reverse http proxy server in front of sherpa, to do HTTPS and provide gzipped responses.
At the time of writing, we run the server using Ubuntu's upstart, see etc/init for an example.


# License

Released under the MIT license, see LICENSE.

Sherpaweb includes code (all permissively licensed): bootstrap, lodash, jquery, marked (js markdown parser), promisejs, font-awesome.
Bootstrap and font-awesome have been stripped a bit, of superfluous font formats.


# Contact

If you have suggestions, improvements, patches, bug reports, inform me of new implementations, let me know at mechiel@ueber.net.


# Todo

- wrap lines in json viewer.  long lines now don't wrap...
- ctrl+enter not working to call function on linux?
- json viewer: don't show (un)collapse button for small data
- json viewer: show buttons more in corner, now it can obfuscate data
- somehow highlight the active section/function in the documentation (we already highlight the entry in the table of contents)
- find out/test/fix/document which browsers are supported by sherpa.js

- provide cancel-button next to loader, while busy calling.
- need more structure on the generated page. the list on the side is OK, but the body of the documentation doesn't reflect that structure.
- write tests for sherpa.js
- find a way to publish sherpa.js for use with npm?
- allow input fields to be swapped around (dragged?)
- set a timeout on request for _docs?  should be done at the sherpa-level
- jsonviewer: for arrays with only "simple" values (number/bool/null/string, empty array/object), that fit on a single line (eg 60 chars), draw them on a single line?
- jsonviewer: better colors?
