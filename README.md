# Using Web Workers for Image Loading

This experiment will spin up a new web worker for each image on the page. Inside of the web worker, the image will be downloaded as a `Blob` via `XMLHttpRequest`, then read as a data URI via the `FileReader` API, and finally passed back to the main UI thread to be injected as the source of the original `img` element.

This works because the `img` element does not have a `src` attribute. Instead, we use `data-src`. This allows us to grab the sources to be passed to the web workers before the browser attempts to download them, preventing their loading from blocking other requests and the UI thread.

# Running the experiment

1. Pull down the repo

  `git clone git@github.com:trezy/web-worker-image-preloading-test.git`

1. Install the server dependencies

  `npm install`

1. Start the server

  `node server.js`

1. Hit the page

  [http://localhost:3000](http://localhost:3000)

# Alternatively

Check out the [demo](http://trezy.github.io/web-worker-image-preloading-test).
