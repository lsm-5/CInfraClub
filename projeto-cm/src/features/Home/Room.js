import React, { useState, useEffect } from 'react'
import io from "socket.io-client"
import './styles.css';
import { api, scrapCifra } from '../../services/api'
import parse from 'html-react-parser';
import Popup from 'reactjs-popup';
import Reorder, {
  reorder,
  reorderImmutable,
  reorderFromTo,
  reorderFromToImmutable
} from 'react-reorder';
import move from "lodash-move";
import {MdOutlineClose} from 'react-icons/md'

let socket;
const CONNECTION_PORT = "localhost:4000";

function Room() {

  const [nome, setNome] = useState('');
  const [sala, setSala] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const connectToRoom = () => {
    setLoggedIn(true);
    socket.emit('join-room', { roomID: sala, name: nome });
  }

  useEffect(() => {
    socket = io(CONNECTION_PORT);
  }, [CONNECTION_PORT])




  //Logic for search part
  const [input, setInput] = useState('');
  const [musica, setMusica] = useState([]);
  const [display, setDisplay] = useState('');
  const [members, setMembers] = useState([]);
  const [musicaList, setMusicaList] = useState([]);


  useEffect(() => {
    socket.on('update-page', (data) => {
      setDisplay(data);
    });
    socket.on('update-members', (data) => {
      setMembers(data);
    });
    socket.on('update-music-list', (data) => {
      setMusicaList(data);
    });

    return () => {
      socket.off('update-page');
      socket.off('update-members');
      socket.off('update-music-list');
    }
  }, [])

  async function getMusicInfo(e) {
    console.log(e)
    setInput('');
    setMusica([]);
    const response = await scrapCifra.get(`/${e.autorB}/${e.nomeB}`);
    setDisplay(response.data);//na resposta do servidor
    socket.emit('changing-music', { roomID: sala, music: response.data });
    //console.log(response.data);
  }

  function addMusicToList(music) {
    socket.emit('add-music', { roomID: sala, music: music });
  }

  function removeMusic(music){
    console.log('first')
    socket.emit('remove-music', {roomID: sala, music: music})
  }

  async function handleSearch(e) {
    if (e.length <= 0) {
      return;
    }
    if (e.trim() === '') {
      alert("digite algo");
      return;
    }
    try {
      const response = await api.get('/', { params: { q: e } });
      const processed = JSON.parse(response.data.slice(1).slice(0, response.data.length - 3))
      //console.log(processed.response.docs.length);
      //console.log(processed);
      if (processed && processed.response.docs.length > 0) {
        let musicList = []
        for (let i = 0; i < processed.response.docs.length && i < 5; i++) {
          //const element = processed.response.docs[i]
          if (processed.response.docs[i].d != null && processed.response.docs[i].u != null) {
            let musica = {
              autor: processed.response.docs[i].a,
              nome: processed.response.docs[i].m,
              autorB: processed.response.docs[i].d,
              nomeB: processed.response.docs[i].u
            }
            musicList.push(musica);
          }
        }

        //console.log(musicList)
        setMusica(musicList);
        //setInput("");
      }
    } catch (error) {
      alert("erro ao buscar");
      setInput("");
    }
  }

  const styles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  };

  function onReorder(event, previousIndex, nextIndex, fromId, toId) {
    setMusicaList(reorder(musicaList, previousIndex, nextIndex));
  }

  function print() {
    console.log(musicaList);
  }

  return (
    <div className='everything'>
      {!loggedIn ? (
        <div className='centered' style={styles}>
          <div className='divInputs'>
            <input type="text" placeholder='Nome' value={nome} onChange={(e) => { setNome(e.target.value) }}></input>
            <input type="text" placeholder='Sala' value={sala} onChange={(e) => { setSala(e.target.value) }}></input>
            <button className="button-61" onClick={connectToRoom}>Entrar</button>
          </div>
        </div>
      ) : (
        <>
          <Popup
            trigger={<button className="button-61"> Adicionar musica </button>}
            modal
            nested
          >
            {close => (
              <div className="modal">
                <button className="close" onClick={close}>
                  &times;
                </button>
                <div className="header"> Buscar música </div>
                <div className="content">
                  {/* <div className="container"> */}
                  {/* <h1 className="title">Buscar música</h1> */}
                  <div className="containerInput">
                    <input
                      type="text"
                      placeholder="Digite o nome da música..."
                      style={{ width: "350px" }}
                      value={input}
                      onChange={(e) => { setDisplay(''); setInput(e.target.value); handleSearch(e.target.value) }}
                    />

                  </div>
                  {Object.keys(input).length > 0 && (
                    <div>
                      {musica.map((msc) => {
                        return (
                          <li style={{ width: "350px" }} className="dropdown" key={msc.nome + " - " + msc.autor} onClick={addMusicToList.bind(this, msc)}>{msc.nome + " - " + msc.autor}</li>
                        )
                      })}
                    </div>
                  )}
                  {/* </div> */}
                </div>
                <div className="actions">
                  <button
                    className="button"
                    onClick={() => {
                      console.log('modal closed ');
                      close();
                    }}
                  >
                    close modal
                  </button>
                </div>
              </div>
            )}
          </Popup>

          {Object.keys(display).length > 0 && (
            <div className='musicInfo'>
              {parse(display)}
            </div>
          )}

          <div className='members'>
            {/* <li style={{ width: "350px" }} className="membersList" >{nome}</li> */}
            {members.map((mem) => {
              return (
                <li style={{ width: "350px" }} className="membersList" key={mem.key}>{mem.key + " - " + mem.value}</li>
              )
            })}
          </div>

          <button className="button-61" onClick={print}> show </button>
            <ul className='music-container'>
              <Reorder
                reorderId="my-list" // Unique ID that is used internally to track this list (required)
                reorderGroup="reorder-group" // A group ID that allows items to be dragged between lists of the same group (optional)              
                component="ul" // Tag name or Component to be used for the wrapping element (optional), defaults to 'div'
                placeholderClassName="placeholder" // Class name to be applied to placeholder elements (optional), defaults to 'placeholder'
                draggedClassName="dragged" // Class name to be applied to dragged elements (optional), defaults to 'dragged'
                lock="horizontal"
                holdTime={110}
                onReorder={onReorder.bind(this)}
                autoScroll={true}
              >
                {/* <div className='musicList'> */}
                {/* <li style={{ width: "350px" }} className="membersList" >{nome}</li> */}
                {musicaList.map((obj) => {
                  return (
                    <li style={{ width: "350px" }} className="music" key={obj.music.nome + " - " + obj.music.autor}>
                      <span>{obj.music.nome + " - " + obj.music.autor}</span>
                      <MdOutlineClose onClick={removeMusic.bind(this, obj)} className='delete-button' />
                    </li>
                  )
                })}
                {/* </div> */}
              </Reorder>

            </ul>
        </>
      )}
    </div>
  )
}

export default Room