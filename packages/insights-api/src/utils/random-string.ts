let az09 = 'abcdefghijklmnopqrstuvwxyz0123456789'

export default function randomString (len: number, charset = az09) {
  let text = ''
  for (let i = 0; i < len; i++) {
    text += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return text
}
