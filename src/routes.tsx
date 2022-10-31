import React, { useEffect } from 'react';
import {useInfo} from './hooks/info';
import Room from './pages/Room';
import Playlist from './pages/Playlist';
import CreateRoom from './pages/CreateRoom';
import EditRoom from './pages/EditRoom';
import Cifra from './pages/Cifra';
import { Switch, BrowserRouter, Redirect, Route } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

const Routes: React.FC = () => {
  const { room } = useInfo();
  const history = useHistory();

  useEffect(() => {
    if(room === null){
      history.push('/')
    } else {
      history.push('/sala')
    }
  }, [room])

  return (
    <>
      <Route exact path="/" component={Room} />
      <Route path="/sala" component={Playlist} />
      <Route path="/criar_sala" component={CreateRoom} />
      <Route path="/editar_sala" component={EditRoom} />
      <Route path="/cifra" component={Cifra} />
    </>
  );
}

export default Routes;