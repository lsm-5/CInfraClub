import React from 'react'
import ReactDOM from 'react-dom/client'

import { ChakraProvider } from '@chakra-ui/react'
import { Switch, BrowserRouter, Redirect, Route } from 'react-router-dom';
import InfoContainer from './hooks';
import Routes from './routes';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <InfoContainer>
        <BrowserRouter>
          <Switch>
            <Routes />
          </Switch>
        </BrowserRouter>
      </InfoContainer>
    </ChakraProvider>
  </React.StrictMode>
)
