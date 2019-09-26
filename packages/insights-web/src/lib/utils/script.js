let promises = {}
let loaded = {}

export default function script (url) {
  if (Array.isArray(url)) {
    var prom = []
    url.forEach(item => {
      prom.push(script(item))
    })
    return Promise.all(prom)
  }

  if (promises[url]) {
    return promises[url]
  } else if (loaded[url]) {
    return Promise.resolve()
  } else {
    promises[url] = new Promise(function (resolve, reject) {
      var r = false
      var t = document.getElementsByTagName('script')[0]
      var s = document.createElement('script')

      s.type = 'text/javascript'
      s.src = url
      s.async = true
      s.onload = s.onreadystatechange = function () {
        if (!r && (!this.readyState || this.readyState === 'complete')) {
          r = true
          promises[url] = false
          loaded[url] = true
          resolve(this)
        }
      }
      s.onerror = s.onabort = reject
      t.parentNode.insertBefore(s, t)
    })
    return promises[url]
  }
}
