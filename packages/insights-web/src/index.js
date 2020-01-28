import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import * as serviceWorker from './serviceWorker';

import Scenes from './scenes';
import Popup from 'react-popup'

ReactDOM.render(<Scenes />, document.getElementById('root'))
ReactDOM.render(<Popup />, document.getElementById('popupContainer'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

