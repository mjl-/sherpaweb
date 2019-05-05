# Tuit

NOTE: *experimental*. subject to change. a lot.

Tuit is an experimental typescript ui toolkit library. The goal is
a UI toolkit helps you create applications that are small, fast,
reliable and easy to develop, specially the aim is to prevent whole
classes of programming errors by extensively using the typing support
provided by typescript.

Concepts that make it different from the popular frameworks:

- Use typescript as possible, including for styling. No need for
  CSS (or processors), HTML or special DSLs and their compilers. Use
  typesafety to prevent bugs.
- No virtual DOM and diffing. You create classes that manage their
  own DOM and typically export one root DOM element. This probably
  means a bit more work for you as programmer, but does prevent
  unwanted surprises.
- Provide user-friendly user interfaces: Use transition animations
  to show data is being loaded (first a slow fade out, then quick
  fade in when content is ready, if it takes too long a loader with
  cancel-button is shown). On failure to load, show an error message
  and give user the option to retry. This is all provided by duit.
- Use modern browser layout engine techniques like flex to render
  UI "widgets", especially nested scrollable UI elements.
- Store UI state in the URL (hash) so URL sharing, page refreshes
  and standard browser back/forward buttons work as expected.

Tuit only works in the major evergreen browsers.


## Todo

- make a quickstart app to show how to use this.
- list: mention there are no items if that's the case
- list: remember the UI's that were created. need to invalidate on change of the object.
- find a way to make this somewhat responsive. eg splits turning vertical and fixed-size when below certain screen width. turn lists of items into tables when the space allows.
- implement date-picker
- more standard components. tables, with search, file uploads, quick forms, etc. look at bootstrap, semantic-ui and material design for inspiration.
- turn more components into ts ui? like button.
- more demo's. like a mail client, sql client.
- show proper errors on invalid forms, eg missing required fields.
- add possibility to add form validation function that results in clear error messages.
- expand form fields with help explanation.
- think about how to use icons. web fonts are nice but too big. can we convert font to something in js? eg svg, or drawn on canvas. then we need a build tool that generates the file with just what we need, and we include that in the ts build.
- :hover pseudostyles get recreated many times
- add disabled style for buttons
- use typescripts strictBindCallApply
- make another test app and see how hard this is to use, and especially how much the types actually help you.
- figure out how to do icons. svg? colors? ideally in a dynamically loaded js?
