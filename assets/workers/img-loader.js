// Create our FileReader and XHR in the global scope of the worker so they're
// easily available to all of the functions below
let reader = new FileReader
let xhr = new XMLHttpRequest





// Perform our own cleanup on the worker to force garbage collection
let cleanup = function cleanup () {
  reader.removeEventListener('load', handleFileLoad, false)
  reader.removeEventListener('progress', handleFileProgress, false)
  xhr.removeEventListener('load', handleXHRLoad, false)
  xhr.removeEventListener('progress', handleXHRProgress, false)
  self.removeEventListener('message', handleMessage, false)

  delete reader
  delete xhr
}





// Let the UI thread know that this worker is done loading it's image
let handleFileLoad = function handleFileLoad () {
  self.postMessage(JSON.stringify({
    type: 'result',
    value: reader.result
  }))
}





// Prep the XHR when the worker officially receives a file to load
let handleImage = function handleImage (img) {
  // Tell the XHR to expect a Blob response so that we can later read the image
  // with FileReader
  xhr.responseType = 'blob'
  xhr.open('GET', img, true)
  xhr.send()
}





// Determine what kind of message we've received
let handleMessage = function handleMessage (event) {
  let data = event.data

  switch (data) {
    // Using the worker's own close method allows us to keep the worker open if
    // certain conditions are met
    case 'close':
      cleanup()
      self.close()
      break

    // Assume that messages are image URLs by default
    default:
      handleImage(data)
      break
  }
}





// This is just to help with displaying progress back in the UI thread
let handleFileProgress = function handleProgress (event) {
  if (event.lengthComputable) {
    self.postMessage(JSON.stringify({
      type: 'progress-file',
      value: event.loaded / event.total
    }))
  }
}





// When the XHR finishes loading, pass the Blob response to our FileReader
let handleXHRLoad = function handleXHRLoad () {
  reader.readAsDataURL(xhr.response)
}





// This is just to help with displaying progress back in the UI thread
let handleXHRProgress = function handleProgress (event) {
  if (event.lengthComputable) {
    self.postMessage(JSON.stringify({
      type: 'progress-load',
      value: event.loaded / event.total
    }))
  }
}





// Bind events to the FileReader
reader.addEventListener('load', handleFileLoad)
reader.addEventListener('progress', handleFileProgress)

// Bind events to the XHR
xhr.addEventListener('load', handleXHRLoad)
xhr.addEventListener('progress', handleXHRProgress)

// Bind an event to the worker itself to handle any messages passed in
self.addEventListener('message', handleMessage)
