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

First compile it.  Make sure you set the version number in assets/index.html:

	go get
	go build

You should generate the documentation API:

	sherpadocs exampleapi/ 'Example API' '' exampleapi/hmacapi/ 'Signatures' '' >assets/exampleapi.json

Next, we recommend you create a stand-alone binary. One that includes files like css & javascript:

	(rm assets.zip; cd assets && zip -r0 ../assets.zip .) && sh -c 'cat assets.zip >>sherpaweb'

Now run sherpaweb, we run it like this:

	./sherpaweb -addr :8080 -baseurl https://sherpa.irias.nl

Typically, you'll run a reverse http proxy server in front of sherpa, to do HTTPS and provide gzipped responses.
At the time of writing, we run the server using Ubuntu's upstart, see etc/init for an example.

Note to self: don't forget to tag a release.  Build releases:

	(rm assets.zip; cd assets && zip -r0 ../assets.zip .)
	VERSION=0.0.4 GOOS=linux GOARCH=amd64 sh -c 'go build && cat assets.zip >>sherpaweb && mv sherpaweb release/sherpaweb-$VERSION-$GOOS-$GOARCH'
	VERSION=0.0.4 GOOS=darwin GOARCH=amd64 sh -c 'go build && cat assets.zip >>sherpaweb && mv sherpaweb release/sherpaweb-$VERSION-$GOOS-$GOARCH'
	VERSION=0.0.4 GOOS=windows GOARCH=amd64 sh -c 'go build && cat assets.zip >>sherpaweb.exe && mv sherpaweb.exe release/sherpaweb-$VERSION-$GOOS-$GOARCH.exe && (cd release && zip sherpaweb-$VERSION.zip sherpaweb-$VERSION-$GOOS-$GOARCH.exe)'

# License

Released under the MIT license, see LICENSE.

Sherpaweb includes code (all permissively licensed): bootstrap, lodash, jquery, marked (js markdown parser), promisejs, font-awesome.
Bootstrap and font-awesome have been stripped a bit, of superfluous font formats.

# Contact

If you have suggestions, improvements, patches, bug reports, inform me of new implementations, let me know at mechiel@ueber.net.


# Todo

- find out/test/fix/document which browsers are supported by sherpa.js

- provide cancel-button next to loader, while busy calling.
- need more structure on the generated page. the list on the side is OK, but the body of the documentation doesn't reflect that structure.
- make the function list affix.
- write tests for sherpa.js
- find a way to publish sherpa.js for use with npm?
- allow input fields to be swapped around (dragged?)
- set a timeout on request for _docs?  should be done at the sherpa-level
- jsonviewer: for arrays with only "simple" values (number/bool/null/string, empty array/object), that fit on a single line (eg 60 chars), draw them on a single line?
- jsonviewer: better colors?
