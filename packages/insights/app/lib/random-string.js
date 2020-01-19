let az09 = 'abcdefghijklmnopqrstuvwxyz0123456789'

module.exports = function randomString (len, charset = az09) {
  let text = ''
  for (let i = 0; i < len; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return text
}
