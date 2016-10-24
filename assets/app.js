// Gather all of the image elements on the page
let images = document.querySelectorAll('img')

// Create a store for the progress values of each image
let progress = {}

// Grab the progress bar so we can update it when necessary
let progressBar = document.querySelector('progress')





// Math the progress values of each image and update the progress bar accordingly
let updateProgress = function updateProgress () {
  let files = Object.keys(progress)
  let value = 0

  for (let i = 0, length = files.length; i < length; i++) {
    let status = progress[files[i]]

    value += status.file
    value += status.load
  }

  progressBar.setAttribute('max', files.length * 2)
  progressBar.setAttribute('value', value)
}





// Loop over the images, spin up web workers to handle downloading them, and
// dump the web worker when it's done
for (let i = 0; i < images.length; i++) {
  // Grab the current time from the performance API for high definition
  // performance tracking
  let started = performance.now()

  // Memoize the current image
  let image = images[i]

  // Grab the URL where the image lives
  let imageSource = image.getAttribute('data-src')

  // Spin up a new worker
  let worker = new Worker('/assets/workers/img-loader.js')

  // Add the image's progress hash to the global progress hash so it can be
  // used for progress calculations
  progress[imageSource] = {
    file: 0,
    load: 0
  }

  // Tell the worker to start handling the image
  worker.postMessage(imageSource)

  // Listen for messages from the worker
  worker.addEventListener('message', event => {
    // The worker will always respond with JSON payloads, so we'll parse that
    let data = JSON.parse(event.data)

    // Memoize the value that's returned
    let value = data.value

    // Figure out what type of message this is
    switch (data.type) {

      // Update the progress of reading the file to a data URI
      case 'progress-file':
        progress[imageSource].file = value
        updateProgress()
        break

      // Update the progress of loading the file
      case 'progress-load':
        progress[imageSource].load = value
        updateProgress()
        break

      // We receive a result message when the file has been downloaded and read
      // to a data URI
      case 'result':
        // Set the src of the img element so the image finally loads into the page
        image.src = value

        // Tell the worker it should close when appropriate
        worker.postMessage('close')

        // Log out how long the load took for benchmarking purposes
        console.log('Loaded ' + imageSource + ';', 'Load took ' + (performance.now() - started) + 'ms')
        break
    }
  })
}
