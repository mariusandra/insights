import Popup from 'react-popup'

export default function deletePopup (text) {
  return new Promise((resolve, reject) => {
    Popup.close()
    Popup.create({
      title: null,
      content: text,
      buttons: {
        left: [{
          text: 'Cancel',
          className: '',
          action: () => {
            Popup.close()
          }
        }],
        right: [{
          text: 'Delete',
          className: 'danger',
          action: () => {
            resolve(true)
            Popup.close()
          }
        }]
      }
    })
  })
}
