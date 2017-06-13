// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

let charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
function stringGen (len) {
  let text = ''
  for (let i = 0; i < len; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return text
}

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations
    hook.data.code = stringGen(10)

    return Promise.resolve(hook)
  }
}
