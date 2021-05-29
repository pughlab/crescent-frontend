import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import createRootReducer from './reducers'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { createBrowserHistory } from 'history'
import { applyMiddleware, compose, createStore } from 'redux'
import { routerMiddleware } from 'connected-react-router'
require('dotenv').config()

export const history = createBrowserHistory()

const persistConfig = {
  key: 'root',
  storage,
}
const persistedReducer = persistReducer(persistConfig, createRootReducer(history))

export default function configureStore(preloadedState) {
  const store = createStore(
    persistedReducer,
    composeWithDevTools(
      applyMiddleware(thunk),
      applyMiddleware(
        routerMiddleware(history), // for dispatching history actions
        // ... other middlewares ...
      ),
    ),
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )

  const persistor = persistStore(store)
  return {store, persistor}
}