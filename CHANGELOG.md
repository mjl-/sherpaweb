# 0.0.8

- Update to latest sherpa library + sherpadoc.

# 0.0.7

- Better responsive page, list with functions now on the right side.
- Add caching headers, and cache buster to generated HTML.

# 0.0.6

- Better HTML title for page, so you can find the right tab for your docs in your browser.
- Make box with functions floating, and (un)collapsable, and the selected function highlighted.
- Rename "exampleapi" to just "example".

# 0.0.5

- Use vendoring of external libraries. We build without the need for "go get" now.
- Bugfix: Uncollapsing JSON output would lose the indenting state, and start at the beginning of the line.
- When loading parameters from localStorage, turn input field into textarea if value has a newline.
- When converting a parameter to a textarea, attempt to pretty-format the JSON.
- Bugfix: loading params from the url didn't work properly, the parameters weren't valid JSON.
- When clicking on a "hash link" (eg function name), ensure we always jump to that funtion, even if that function is already the hash in the current URL.

# 0.0.4

- Implement reading content from a file and inserting it as JSON or base64-encoded data into an input parameter.
- If you enter anything without a leading https?:// in the "API URL box", just prepend https:// instead of complaining about invalid URLs.
- Add a JSON (un)collapser, so big responses are faster to display and maneuver through.
- Parameters for a function can now be saved in localStorage.
- Add shortcuts for adding/removing/saving parameters.

# 0.0.3

- Make sherpaweb really a single static page app.  we don't use the /x/ and /X/ paths in URLs anymore (though for backward compat, these are redirected to their new URLs).
- Make it possible to "share" urls to documentation that include parameters, so full example api calls can be passed around
- Better handle malformed documentation from API's.
- Allow a parameter to be turned into a textarea (when it's an input field).
- Show snippets for calls to js/json(p).
- Make js/sherpa.js easier to reuse in libs for creating sherpa api's (servers).
- Give functions in js/sherpa.js names instead of having them anonymous. should aid in debugging.
- Fix font when serving sherpaweb using plain HTTP on a webserver that redirects all other traffic to HTTPS.

# 0.0.2

- Show an error when response from sherpa server has neither "error" nor "result" field.

# 0.0.1

- First release.
