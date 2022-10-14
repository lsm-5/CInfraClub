import React, { useState , useEffect } from 'react'
import io from "socket.io-client"
import Search from '../Search/Search';
import './styles.css';
import {api,scrapCifra} from '../../services/api'
import parse from 'html-react-parser';

let socket;
const CONNECTION_PORT = "localhost:4000";

function Room() {
  
  const [nome, setNome] = useState('');
  const [sala, setSala] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  
  const connectToRoom = () => {
    // console.log('a')
    // socket = io(CONNECTION_PORT);
    setLoggedIn(true);
    socket.emit('join-room', { roomID: sala, name: nome});
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
    socket.on('update-page', (data) =>{
      setDisplay(data);
    });
    socket.on('update-members', (data) =>{
      setMembers(data);
      console.log(data);
      //Broadcast manda pa geral incluindo a msm pessoa, entao ta recebendo 2 vezes
    });
    socket.on('update-music-list', (data) =>{
      setMusicaList(data);
      console.log(data);
      //Broadcast manda pa geral incluindo a msm pessoa, entao ta recebendo 2 vezes
    });
  
    return () => {
      socket.off('update-page');
      socket.off('update-members');
      //socket.off('pong');
    }
  }, [])
  

  // if(loggedIn){
  //   socket.on('update-page', (data) =>{
  //     setDisplay(data);
  //   });
  //   socket.on('update-members', (data) =>{
  //     setMembers(data);
  //     console.log(data);
  //     //Broadcast manda pa geral incluindo a msm pessoa, entao ta recebendo 2 vezes
  //   })

  // }

  async function getMusicInfo(e) {
    console.log(e)
    setInput('');
    setMusica([]);
    const response = await scrapCifra.get(`/${e.autorB}/${e.nomeB}`);
    setDisplay(response.data);//na resposta do servidor
    socket.emit('changing-music', {roomID: sala, music: response.data});
    //console.log(response.data);
  }

  function addMusicToList(music){
    socket.emit('add-music', {roomID: sala, music: music});
  }

  async function handleSearch(e) {
    if(e.length <=0){
      return;
    }
    if(e.trim() === ''){
      alert("digite algo");
      return;
    }
    try {
      const response = await api.get('/',{params: { q: e }});
      const processed = JSON.parse(response.data.slice(1).slice(0, response.data.length - 3))
      //console.log(processed.response.docs.length);
      //console.log(processed);
      if(processed && processed.response.docs.length > 0){
        let musicList = []
        for (let i = 0; i < processed.response.docs.length && i < 5; i++) {
          //const element = processed.response.docs[i]
          if(processed.response.docs[i].d != null && processed.response.docs[i].u != null){
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
  
  return (
    <div className='inputs'>
      {!loggedIn ? (
        <>
          <input type="text" placeholder='Nome' value={nome} onChange={(e) => {setNome(e.target.value)}}></input>
          <input type="text" placeholder='Sala' value={sala} onChange={(e) => {setSala(e.target.value)}}></input>
          <button onClick={connectToRoom}>Entrar</button>
        </>

      ):(
        <>
            <div className="container">
              <h1 className="title">Buscar música</h1>
              <div className="containerInput">
                <input
                  type="text"
                  placeholder="Digite o nome da música..."
                  style={{ width: "350px" }}
                  value={input}
                  onChange={(e) => { setDisplay(''); setInput(e.target.value); handleSearch(e.target.value) }}
                />
                {/* <button className="buttonSearch" onClick={handleSearch}>
          <FiSearch size={25} color="#000"/>
        </button> */}

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
              <div className='musicList'>
                {/* <li style={{ width: "350px" }} className="membersList" >{nome}</li> */}
                {musicaList.map((msc) => {
                      return (
                        <li style={{ width: "350px" }} className="music" key={msc.key}>{msc.value.nome + " - " + msc.value.autor}</li>
                      )
                })}                            
              </div>
            </div>
        </>
      )}
    </div>
  )
}

export default Room