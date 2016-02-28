Sherpaweb is a web app that helps you use Sherpa API's. Sherpaweb's functionality:

- Display a list of functions the Sherpa API exports.
- Render the Sherpa API documentation. Both introductory texts
  and per-function documentation.
- Let you call API functions through the web app, with parameters
  you pick, and displaying the result.

Sherpa API's are simple HTTP/JSON based RPC API's that are easy to
create, document and consume, especially with JavaScript.  For more
information, see

	https://www.ueber.net/who/mjl/sherpa/

You can include the JavaScript library at `assets/s/js/sherpa.js`
in your own project to consume Sherpa API's.


# Compiling

First compile it:

	go get
	go build

You should generate the documentation API:

	sherpadocs exampleapi/ 'Introduction to Example API' '' exampleapi/hmacapi/ 'Signatures' '' >assets/exampleapi.json

Next, we recommend you create a stand-alone binary. One that includes files like css & javascript:

	(cd assets && zip -r0 ../assets.zip .) && sh -c 'cat assets.zip >>sherpaweb'

Now run sherpaweb, we run it like this (we have nginx in front, proxying requests from port 80 to port 8080):

	./sherpaweb -addr :8080 -baseurl https://sherpa.irias.nl


# License

Released under the MIT license, see LICENSE.

Sherpaweb includes code (all permissively licensed): bootstrap, lodash, jquery, marked (js markdown parser), promisejs, font-awesome.
Bootstrap and font-awesome have been stripped a bit, of superfluous font formats.

# Contact

If you have suggestions, improvements, patches, bug reports, inform me of new implementations, let me know at mechiel@ueber.net.


# Todo

- better error message when documentation is malformed.

- provide cancel-button next to loader, while busy calling.
- need more structure on the generated page. the list on the side is OK, but the body of the documentation doesn't reflect that structure.
- make the function list affix.
- write tests for sherpa.js
- find a way to publish sherpa.js for use with npm?
