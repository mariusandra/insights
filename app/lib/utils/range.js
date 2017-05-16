export default function (start, end, step) {
  var range = []
  var typeofStart = typeof start
  var typeofEnd = typeof end

  if (step === 0) {
    throw new TypeError('Step cannot be zero.')
  }

  if (typeofStart === 'undefined' || typeofEnd === 'undefined') {
    throw new TypeError('Must pass start and end arguments.')
  } else if (typeofStart !== typeofEnd) {
    throw new TypeError('Start and end arguments must be of same type.')
  }

  if (typeof step === 'undefined') {
    step = 1
  }

  if (end < start) {
    step = -step
  }

  if (typeofStart === 'number') {
    while (step > 0 ? end >= start : end <= start) {
      range.push(start)
      start += step
    }
  } else if (typeofStart === 'string') {
    if (start.length !== 1 || end.length !== 1) {
      throw new TypeError('Only strings with one character are supported.')
    }

    start = start.charCodeAt(0)
    end = end.charCodeAt(0)

    while (step > 0 ? end >= start : end <= start) {
      range.push(String.fromCharCode(start))
      start += step
    }
  } else {
    throw new TypeError('Only string and number types are supported')
  }

  return range
}
