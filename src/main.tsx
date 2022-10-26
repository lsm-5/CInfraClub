import React from 'react'
import ReactDOM from 'react-dom/client'
import Room from './pages/Room';
import Playlist from './pages/Playlist';
import CreateRoom from './pages/CreateRoom';
import EditRoom from './pages/EditRoom';
import { ChakraProvider } from '@chakra-ui/react'
import { Switch, BrowserRouter, Redirect, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={EditRoom} />
          <Route path="/sala" component={Playlist} />
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)
