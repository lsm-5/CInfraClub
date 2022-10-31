//All libraries
import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom';
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
import $ from 'jquery';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';

//Code start

let socket;
const CONNECTION_PORT = "localhost:4000";

function Room() {
  //auxiliar functions

  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  
  function getCssStyle(element, prop) {
      return window.getComputedStyle(element, null).getPropertyValue(prop);
  }
  
  function getCanvasFont(el = document.body) {
    const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
    const fontSize = getCssStyle(el, 'font-size') || '16px';
    const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';
    
    return `${fontWeight} ${fontSize} ${fontFamily}`;
  }






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
  const movedCypher = useRef(new Map());
  const refContainer = useRef(null);
  const refLyricObj = useRef([]);
  const regex = /id=\"([\s\S]*?)\">/g;


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

  useEffect(() => {
    if (refContainer.current !== null) {
      print();
      //Parsing
      let yo = (refContainer.current.getElementsByTagName('pre')[0].innerHTML)
      //console.log(yo)
      yo = yo.replaceAll('<b ', '').replaceAll('</b>', '').replaceAll('<pre>', '').replaceAll('</pre>', '');
      let arrayLines = yo.split('\n');
      //console.log(arrayLines)
      let idCyphers = [];
      for (let a = 0; a < arrayLines.length; a++) {
        idCyphers.push([...arrayLines[a].matchAll(regex)]);
        arrayLines[a] = arrayLines[a].replaceAll(regex, '');
        
      }
      // yo = yo.replaceAll(regex,'');

      // let s = JSON.stringify(yo);
      // s = s.replaceAll('<b>', '').replaceAll('</b>', '').replaceAll('<pre>', '').replaceAll('</pre>', '');
      // let arrayLines = s.split('\\n');

      let mapLetra = []

      for (let i = 0; i < arrayLines.length; i++) {
        if (!arrayLines[i].includes('[Intro]') && arrayLines[i].trim() !== '' && arrayLines[i + 1]) {
          //console.log(arrayLines[i].split(/(\s+)/).filter(element => element));
          let cifras = arrayLines[i].split('');
          //console.log(arrayLines[i].split(''))
          let counter = 0;
          let cifrasLength = 0;
          let wordI = false;
          for (let x = 0; x < cifras.length; x++) {
            if (cifras[x] !== ' ') {
              wordI = true;
              if (x + 1 >= cifras.length) {
                cifrasLength++;
              }
            } else {
              if (wordI) {
                cifrasLength++;
              }
              wordI = false
            }

          }
          // console.log(cifrasLength)
          let passI = false;
          for (let y = 0; y < cifras.length; y++) {

            //const firstCharIndex = arrayLines[i].match('[a-zA-Z]').index;
            if (cifras[y] !== ' ') {
              if (!passI) {

                passI = true;
                //let firstCharIndex = cifras[y].match('[a-zA-Z]').index;
                counter++;
                // console.log(counter)         
                let words = arrayLines[i + 1].split(' ');
                //console.log(words)
                let totalLength = 0;
                let pastWordLength = 0;
                let skip = false;
                for (let j = 0; j < words.length && !skip; j++) {
                  if (words.length > 1 && (j + 1 < words.length)) {
                    pastWordLength = totalLength;
                    totalLength += words[j].length + 1;
                  } else {
                    pastWordLength = totalLength;
                    totalLength += words[j].length
                  }

                  if (/*firstCharIndex*/y <= totalLength || j + 1 === words.length) {
                    let obj = {
                      palavra: words[j],
                      cifra: getCypher(cifras, y),
                      y: y,
                      pastWordLength: pastWordLength,
                      pos: y - pastWordLength,
                      id: idCyphers[i][counter-1][1]
                    }
                    mapLetra.push(obj);
                    skip = true;
                    if (counter >= cifrasLength) {
                      i++;
                    }
                  }
                }

              }

            } else {
              passI = false;
            }

          }
        }
      }
      refLyricObj.current = mapLetra;
      // console.log(refLyricObj.current)
      // //console.log(mapLetra)
      // setLyricObj(mapLetra);
    }
  }, [display])
  

  function getCypher(array, pos){
    let cypher = '';
    let found = false;
    for (let i = pos; i < array.length && !found; i++) {
      if(array[i] !== ' '){
        cypher += array[i]
      }else{
        found = true;
      }
    }
    return cypher;
  }

  async function getMusicInfo(e) {
    //console.log(e)
    setInput('');
    setMusica([]);
    const response = await scrapCifra.get(`/${e.music.autorB}/${e.music.nomeB}`);
    setDisplay(response.data);//na resposta do servidor
    //print()
    //console.log(parse(response.data).props.children)
    // console.log(JSON.stringify(response.data))
    // console.log(parse(response.data))
    
    
    
    //let processed = parse(response.data).props.children
    //console.log(processed);
    // let counter = 0;
    // let parada = false;
    // for (let k = 0; k < processed.length && !parada; k++) {
    //   if(processed[k].type !== 'b'){
    //     let clean = processed[k].trim();
    //     if((clean !== '\n') && (clean !== '') && !(clean.includes('Primeira Parte')) && !(clean.includes('Intro'))){
    //       counter = k;
    //       parada = true;
    //     }
    //   }
    // }
    // let rows = 0;
    // for (let z = 0; z < counter + 1; z++) {
    //   if(processed[z].type !== 'b'){    
      //     let temp = (processed[z].match(new RegExp(/(\r\n|\r|\n)/g, "g")) || []).length
      //     //console.log(JSON.stringify(processed[z]))
      //     rows += temp;
      //   }
      // }
      // console.log(rows)
      // console.log(counter)      
      
     
    //console.log(mapLetra)
    //console.log(parse(display))
    //socket.emit('changing-music', { roomID: sala, music: response.data });
    //console.log(response);
  }

  function addMusicToList(music) {
    socket.emit('add-music', { roomID: sala, music: music });
  }

  function removeMusic(music, event){
    event.stopPropagation();
    //console.log('first')
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

  function resetDisplay(){
    setDisplay('');
    //console.log(display)
  }

  const styles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  };

  function onReorder(event, previousIndex, nextIndex, fromId, toId) {
    // setDraggin(true);
    setMusicaList(reorder(musicaList, previousIndex, nextIndex));
  }

  function bindClick(i, el) {
    return function() {
        //console.log("you clicked region number " + i);
        //console.log(ReactDOM.findDOMNode($(`#${i}`)))
        //console.log(refLyricObj.current)
      if(!movedCypher.current.has(i)){
        movedCypher.current.set(i,true)
        let dim;
        let dimEl;
        let obj;
        if(refLyricObj.current){
          obj = refLyricObj.current.find(item => item.id === `${i}`);          
          if(obj){
            let temp = document.createElement('div');
            temp.textContent = obj.palavra;
            console.log(obj.palavra)
            console.log(obj)
            temp.style.display ='initial';
            $(el).append(temp)
            dim = temp.getBoundingClientRect();
            temp.remove();
            //temp.style.display = 'none';
          }        
          
        }
        dimEl = el.getBoundingClientRect();
        // let stringR = '';
        // for (let j = obj.pos; j < obj.palavra.length; j++) {
        //   stringR += obj.palavra.charAt(j);
        // }
        // let stringL = '';
        // for (let u = 0; u <= obj.pos; u++) {
        //   console.log(u)
        //   console.log(obj.palavra.charAt(u))
        //   stringL += obj.palavra.charAt(u);
        // }
        // console.log(stringL)
        // let textWR = getTextWidth(stringR,el);
        // let textWL = getTextWidth(stringL,el);
        // let offsetR = textWR
        // let offsetL = textWL;

        let letterW = getTextWidth('a', el)*2;
        let widR = obj.palavra.length - (obj.pos + 1);
        let widL = obj.pos;
        let offsetR = widR * letterW;
        let offsetL = widL * letterW;


        // if(obj.pos > 0){
        //   offsetL += getTextWidth('a',el);
        // }
        $(el).draggable({
          axis: "x",
          grid: [letterW,0],
          containment: [dimEl.x - offsetL, dimEl.y, dimEl.x + offsetR, dimEl.y + dim.height]
        });
      }
        //console.log($(`#${i}`))
        // $(`#${i}`).draggable({
        //   axis: "x"
        // });
    };
 }

  function print() {
    //console.log('print')
    let bArr = refContainer.current.getElementsByTagName('b');
    let counter = 0;
    for (let i = 0; i < bArr.length; i++) {
      //console.log(bArr[i]);     
      bArr[i].setAttribute('id', counter)
      bArr[i].addEventListener("click", bindClick(i, bArr[i]));
      counter++; 
    }
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
            onOpen={resetDisplay}
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
            <span ref={refContainer} className='musicInfo'>
              {parse(display)}
            </span>
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
            <div className='music-container'>
              <Reorder
                reorderId="my-list" // Unique ID that is used internally to track this list (required)
                reorderGroup="reorder-group" // A group ID that allows items to be dragged between lists of the same group (optional)              
                component="ul" // Tag name or Component to be used for the wrapping element (optional), defaults to 'div'
                placeholderClassName="placeholder" // Class name to be applied to placeholder elements (optional), defaults to 'placeholder'
                draggedClassName="dragged" // Class name to be applied to dragged elements (optional), defaults to 'dragged'
                lock="horizontal"
                holdTime={150}
                onReorder={onReorder.bind(this)}
                autoScroll={true}
              >
                {/* <div className='musicList'> */}
                {/* <li style={{ width: "350px" }} className="membersList" >{nome}</li> */}
                {musicaList.map((obj) => {
                  return (  
                    <div className='temp' key={obj.music.nome + " - " + obj.music.autor}>
                      <li className="music" onClick={getMusicInfo.bind(this, obj)}>
                        <span>{obj.music.nome + " - " + obj.music.autor}</span>
                        <MdOutlineClose onClick={removeMusic.bind(this, obj)} className='delete-button' />
                      </li>
                      
                    </div>                 
                  )
                })}
                {/* </div> */}
              </Reorder>

            </div>
        </>
      )}
    </div>
  )
}

export default Room