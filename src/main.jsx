import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import reducers from './reducers';

// CREATE THE STORE
const store = createStore(reducers, compose(applyMiddleware(thunk)));

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
