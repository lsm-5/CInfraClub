import React, { useState, useEffect, useRef, Children } from 'react';
import { ReactDOM } from 'react-dom';
import { createRoot } from 'react-dom/client';
import {
  Heading, Stack, Box, Input, VStack, HStack, Image, Button, Text,
  Menu, MenuButton, MenuList, MenuItem, useDisclosure, Modal, ModalOverlay,
  ModalContent, ModalCloseButton, ModalBody, Slider, SliderTrack, SliderFilledTrack,
  SliderThumb, SliderMark
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { useHistory } from 'react-router-dom';
import { useInfo } from '../hooks/info';
import { FiLogOut, FiPlay } from 'react-icons/fi';
import { MdGraphicEq } from 'react-icons/md';
//import $ from 'jquery';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import { MdOutlineClose } from 'react-icons/md'
import parse from 'html-react-parser';
import './Cifra.css';
import A from '../assets/acordes/Amaior.jpg';
import B from '../assets/acordes/Bmaior.jpg';
import C from '../assets/acordes/Cmaior.jpg';
import D from '../assets/acordes/Dmaior.jpg';
import E from '../assets/acordes/Emaior.jpg';
import F from '../assets/acordes/Fmaior.jpg';
import G from '../assets/acordes/Gmaior.jpg';
import Am from '../assets/acordes/Amenor.jpg';
import Bm from '../assets/acordes/Bmenor.jpg';
import Cm from '../assets/acordes/Cmenor.jpg';
import Dm from '../assets/acordes/Dmenor.jpg';
import Em from '../assets/acordes/Emenor.jpg';
import Fm from '../assets/acordes/Fmenor.jpg';
import Gm from '../assets/acordes/Gmenor.jpg';
import As_Bb from '../assets/acordes/As_Bb.jpg';
import Asm_Bbm from '../assets/acordes/Asm_Bbm.jpg';
import Cs_Db from '../assets/acordes/Cs_Db.jpg';
import Csm_Dbm from '../assets/acordes/Csm_Dbm.jpg';
import Ds_Eb from '../assets/acordes/Ds_Eb.jpg';
import Dsm_Ebm from '../assets/acordes/Dsm_Ebm.jpg';
import Fs_Gb from '../assets/acordes/Fs_Gb.jpg';
import Fsm_Gbm from '../assets/acordes/Fsm_Gbm.jpg';
import Gs_Ab from '../assets/acordes/Gs_Ab.jpg';
import Gsm_Abm from '../assets/acordes/Gsm_Abm.jpg';
import { doc, onSnapshot } from "firebase/firestore";
import db from '../firebase-config';

const Cifra = () => {
  const history = useHistory();
  const { room, logOut, musicSelected, playlist, setMusicSelected, updateCifra, getMusicCifra, updateTom } = useInfo();
  const ModalDisclosure = useDisclosure()
  const [sliderValue, setSliderValue] = useState(0);
  const [urlAudio, setUrlAudio] = useState('');
  const [chordSelected, setChordSelected] = useState(null);
  const maxLength = useRef(0);
  const minLength = useRef(0);
  const stepSize = useRef(0);
  const currentEl = useRef(null);
  const [acordeAtual, setAcordeAtual] = useState(null);
  const newMovedCypher = useRef(new Map())
  useEffect(() => {
    console.log('musicSelected', musicSelected)
  },[musicSelected])

  useEffect(() => {
    if(musicSelected !== null){
      setInterval(() => {
        console.log('ping cifra')
        getMusicCifra(musicSelected.id)
      }, 1000)
    }
  },[musicSelected.id])

  
  function reviver(key, value) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  useEffect(() => {
    if (musicSelected.cifraFormatted !== null){
      //const newMovedCypher = new Map();
      let bArr = refContainer.current.getElementsByTagName('b');
      console.log('rodou o useEffect', musicSelected)
      
    for (let i = 0; i < bArr.length; i++) {
      if (musicSelected.refLyricObj.current) {
        let obj = musicSelected.refLyricObj.current.find(item => item.id === bArr[i].getAttribute('id'));
        if (obj && obj.palavra) {
          let temp = document.createElement('div');
          temp.textContent = obj.palavra;
          //setChordSelected(obj);
          temp.style.display = 'initial';
          //$('el').append(temp)
          let dim = temp.getBoundingClientRect();
          let dimEl = bArr[i].getBoundingClientRect();
          
          currentEl.current = bArr[i];
          //temp.remove();
          //if (!movedCypher.current.has(i)) {
            //movedCypher.current.set(i, true);
            newMovedCypher.current = JSON.parse(musicSelected.movedCypher, reviver)
            console.log('newMovedCypher', newMovedCypher.current)
            let hasEl = newMovedCypher.current.get(i);
            if (!hasEl) {
              let letterW = getTextWidth('a', bArr[i]) * 2;
              let widR = obj.palavra.length - (obj.pos + 1);
              if (widR < 0) {
                widR = 0;
              }
              let widL = obj.pos;
              let offsetR = widR * letterW;
              let offsetL = widL * letterW;
              let leeWay = 0.3;
              $(bArr[i]).draggable({
                axis: "x",
                grid: [letterW, 0],
                containment: [dimEl.x - offsetL - leeWay, dimEl.y, dimEl.x + offsetR + leeWay, dimEl.y + dim.height],
                cursor: "grabbing"
              });
              newMovedCypher.current.set(i, { grid: letterW, axis: "x", cursor: "grabbing", x1: dimEl.x - offsetL - leeWay, y1: dimEl.y, x2: dimEl.x + offsetR + leeWay, y2: dimEl.y + dim.height });
            } else {
              console.log('setting new draggable');
              $(bArr[i]).draggable({
                axis: hasEl.axis,
                grid: [hasEl.grid, 0],
                containment: [hasEl.x1, hasEl.y1, hasEl.x2, hasEl.y2],
                cursor: hasEl.cursor
              });
            }
            //}
            bArr[i].addEventListener("click", bindClick(i, obj));
          }  
        }
      }

      updateCifra(musicSelected.id, refContainer.current.getElementsByTagName('pre')[0].outerHTML, musicSelected.refLyricObj, newMovedCypher.current)

    }

    },[musicSelected.cifraFormatted])

  useEffect(() => {
    if (chordSelected !== null) {
      getAcorde(chordSelected.cifra)
      ModalDisclosure.onOpen();
    }
  }, [chordSelected])

  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }

  const acordes = ["A", "B", "C", "D", "E", "F", "G"]

  function getAcorde(acorde) {
    if (acorde.includes("A#m") || acorde.includes("Bbm")) {
      setAcordeAtual(Asm_Bbm);
    } else if (acorde.includes("C#m") || acorde.includes("Dbm")) {
      setAcordeAtual(Csm_Dbm);
    } else if (acorde.includes("D#m") || acorde.includes("Ebm")) {
      setAcordeAtual(Dsm_Ebm);
    } else if (acorde.includes("F#m") || acorde.includes("Gbm")) {
      setAcordeAtual(Fsm_Gbm);
    } else if (acorde.includes("G#m") || acorde.includes("Abm")) {
      setAcordeAtual(Gsm_Abm);
    } else if (acorde.includes("A#") || acorde.includes("Bb")) {
      setAcordeAtual(As_Bb);
    } else if (acorde.includes("C#") || acorde.includes("Db")) {
      setAcordeAtual(Cs_Db);
    } else if (acorde.includes("D#") || acorde.includes("Eb")) {
      setAcordeAtual(Ds_Eb);
    } else if (acorde.includes("F#") || acorde.includes("Gb")) {
      setAcordeAtual(Fs_Gb);
    } else if (acorde.includes("G#") || acorde.includes("Ab")) {
      setAcordeAtual(Gs_Ab);
    } else if (acorde.includes("Am")) {
      setAcordeAtual(Am);
    } else if (acorde.includes("Bm")) {
      setAcordeAtual(Bm);
    } else if (acorde.includes("Cm")) {
      setAcordeAtual(Cm);
    } else if (acorde.includes("Dm")) {
      setAcordeAtual(Dm);
    } else if (acorde.includes("Em")) {
      setAcordeAtual(Em);
    } else if (acorde.includes("Fm")) {
      setAcordeAtual(Fm);
    } else if (acorde.includes("Gm")) {
      setAcordeAtual(Gm);
    } else if (acorde.includes("A")) {
      setAcordeAtual(A);
    } else if (acorde.includes("B")) {
      setAcordeAtual(B);
    } else if (acorde.includes("C")) {
      setAcordeAtual(C);
    } else if (acorde.includes("D")) {
      setAcordeAtual(D);
    } else if (acorde.includes("E")) {
      setAcordeAtual(E);
    } else if (acorde.includes("F")) {
      setAcordeAtual(F);
    } else if (acorde.includes("G")) {
      setAcordeAtual(G);
    }
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
   
   const movedCypher = useRef(new Map());
   const refContainer = useRef(null);
   const refLyricObj = useRef([]);
   const regex = /id=\"([\s\S]*?)\"/g;
   const regexDrag = /class=\"([\s\S]*?)ive\;\"/g
   useEffect(() => {
    if (refContainer.current !== null && musicSelected.cifraFormatted === null) {
      print();
      //Parsing
      let yo = (refContainer.current.getElementsByTagName('pre')[0].innerHTML)
      //console.log(yo)
      yo = yo.replaceAll('<b ', '').replaceAll('</b>', '').replaceAll('<pre>', '').replaceAll('</pre>', '').replaceAll('>', '');
      let arrayLines = yo.split('\n');
      //console.log(arrayLines)
      let idCyphers = [];
      for (let a = 0; a < arrayLines.length; a++) {
        idCyphers.push([...arrayLines[a].matchAll(regex)]);
        arrayLines[a] = arrayLines[a].replaceAll(regex, '');
        arrayLines[a] = arrayLines[a].replaceAll(regexDrag, '');
      }
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

                  if (y <= totalLength || j + 1 === words.length) {
                    let obj = {
                      palavra: words[j],
                      cifra: getCypher(cifras, y),
                      y: y,
                      pastWordLength: pastWordLength,
                      pos: y - pastWordLength,
                      id: idCyphers[i][counter - 1][1]
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
      addDragFunc();
    }
  }, [musicSelected?.cifra])

  function getCypher(array, pos) {
    let cypher = '';
    let found = false;
    for (let i = pos; i < array.length && !found; i++) {
      if (array[i] !== ' ') {
        cypher += array[i]
      } else {
        found = true;
      }
    }
    return cypher;
  }

  function bindClick(i, el) {
    return function () {
      if (refLyricObj.current) {
        setChordSelected(el);
      }
    };

  }

 function print() {
    //refContainer.current.getElementsByTagName('pre')[0].style.position ='absolute';
    let bArr = refContainer.current.getElementsByTagName('b');
    let counter = 0;
    for (let i = 0; i < bArr.length; i++) {
      bArr[i].setAttribute('id', counter);
      counter++; 
    }
  }

function addDragFunc() {
  let bArr = refContainer.current.getElementsByTagName('b');
  for (let i = 0; i < bArr.length; i++) {    
    if (refLyricObj.current) {
      let obj = refLyricObj.current.find(item => item.id === bArr[i].getAttribute('id'));
      if (obj && obj.palavra) {
        let temp = document.createElement('div');
        temp.textContent = obj.palavra;
        //setChordSelected(obj);
        temp.style.display = 'initial';
        //$('el').append(temp)
        let dim = temp.getBoundingClientRect();
        let dimEl = bArr[i].getBoundingClientRect();
        
        currentEl.current = bArr[i];
        //temp.remove();
        let hasEl = movedCypher.current.get(i);
        if (!hasEl) {
          let letterW = getTextWidth('a', bArr[i])*2;
          let widR = obj.palavra.length - (obj.pos + 1);
          if(widR < 0){
            widR = 0;
          }
          let widL = obj.pos;
          let offsetR = widR * letterW;
          let offsetL = widL * letterW;
          let leeWay = 0.3;
          $(bArr[i]).draggable({
            axis: "x",
            grid: [letterW,0],
            containment: [dimEl.x - offsetL - leeWay, dimEl.y, dimEl.x + offsetR + leeWay, dimEl.y + dim.height],
            cursor: "grabbing"
          });
          movedCypher.current.set(i, {grid: letterW, axis: "x", cursor: "grabbing", x1: dimEl.x - offsetL - leeWay, y1: dimEl.y, x2: dimEl.x + offsetR + leeWay, y2: dimEl.y + dim.height});
        }else{
          $(bArr[i]).draggable({
            axis: hasEl.axis,
            grid: [hasEl.grid,0],
            containment: [hasEl.x1, hasEl.y1, hasEl.x2, hasEl.y2],
            cursor: hasEl.cursor
          });
        }
        bArr[i].addEventListener("click", bindClick(i, obj));
      }  
    }

  }
}

  function changeElPos(el) {
    //el.setAttribute('z-index', -1);
    el.setAttribute('style', `position: absolute; left: ${sliderValue}px;`)
    //el.setAttribute('style', `transform: translate(${sliderValue}px);`)
    // el.style.removeProperty("z-index");
    //el.style.removeProperty("position");
  }

  function testing() {
    let aux = refContainer.current.getElementsByTagName('pre')[0];
    let wrapper = document.createElement('pre');
    wrapper.innerHTML = aux.innerHTML;
    aux.parentNode.replaceChild(wrapper,aux);
    let bArr = refContainer.current.getElementsByTagName('b');

    if (musicSelected.cifraFormatted === null){
      updateCifra(musicSelected.id, refContainer.current.getElementsByTagName('pre')[0].outerHTML, refLyricObj, movedCypher.current)
    } else {
      updateCifra(musicSelected.id, refContainer.current.getElementsByTagName('pre')[0].outerHTML, musicSelected.refLyricObj, newMovedCypher.current)

    }
  }
  

  
  return (
    <Stack align="center" justify="start" flex={1} minH="100vh" p="5%" minW="90vw">
      <Box position="absolute" top={10} right={100}>
        <HStack>
          <EditIcon cursor={"pointer"} w={5} h={5} color="red.500" onClick={() => history.push('/editar_sala')} />
          <Heading as='h3' size='sm'>{`Sala ${room?.senha}`}</Heading>
        </HStack>
      </Box>

      <Box position="absolute" top={8} right={260} onClick={() => { history.push('/sala'); setMusicSelected(null) }}>
        <HStack cursor={"pointer"}>
          <ArrowBackIcon cursor={"pointer"} w={5} h={5} color="purple.500" />
          <Heading as='h3' size='sm'>Voltar</Heading>
        </HStack>
      </Box>

      <Box position="absolute" top={6} left={100} borderWidth={2} borderColor="purple.500" p="2">
        <HStack cursor={"pointer"} onClick={() => logOut()}>
          <FiLogOut style={{ width: 20, height: 20 }} color="#805AD5" />
          <Heading as='h3' size='sm'>Sair</Heading>
        </HStack>
      </Box>

      <HStack>
        <Heading as='h1' size='xl'>{musicSelected?.name}</Heading>
        <Text>-</Text>
        <Heading as='h1' size='xl'>{musicSelected?.author}</Heading>
      </HStack>

      <Stack w="100%">
        <HStack>
          <Stack w="66%">
            <Text fontWeight={"bold"}>Cifra</Text>

            <HStack>
              <Text fontWeight={"bold"}>Tom</Text>
              <Input value={musicSelected.tom} w="60px" onChange={e => updateTom(musicSelected.id, e.target.value)} />
            </HStack>
          </Stack>
          <Stack w="33%" justify={"start"} align={"start"} flex="1" minH={"100%"}>
            <Text fontWeight={"bold"}>Repertório</Text>
            <Menu>
              {({ isOpen }) => (
                <>
                  <MenuButton isActive={isOpen} as={Button} rightIcon={<ChevronDownIcon />}>
                    {musicSelected?.name}
                  </MenuButton>
                  <MenuList>
                    {playlist.map(item => (
                      <MenuItem onClick={() => setMusicSelected(item)}>{item.name}</MenuItem>
                    ))}
                  </MenuList>
                </>
              )}
            </Menu>
          </Stack>
        </HStack>

        <Stack w="100%" align={"start"} justify="start">
          <VStack>
            {Object.keys(musicSelected?.cifra).length > 0 && musicSelected.cifraFormatted === null && (
              <span ref={refContainer} className='musicInfo'>
                <Button onClick={() => testing()} colorScheme='teal' size='md'>
                  Salvar atualização
                </Button>
                {parse(musicSelected?.cifra)}
              </span>
              
            )}
            {Object.keys(musicSelected?.cifra).length > 0 && musicSelected.cifraFormatted !== null && (
              <span ref={refContainer} className='musicInfo'>
                <Button onClick={() => testing()} colorScheme='teal' size='md'>
                Salvar atualização
                </Button>
                {parse(musicSelected?.cifraFormatted)}
              </span>
            )}
          </VStack>
        </Stack>

      </Stack>

      {chordSelected !== null && (<Modal isOpen={ModalDisclosure.isOpen} onClose={() => {ModalDisclosure.onClose; setChordSelected(null)}}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p="8" minH="500px" display={"flex"} flexDirection={'column'} alignItems={"center"} justifyContent={"start"}>
            <Stack align={"center"} justify={"start"}>
              <Box w="250px" position={"relative"}>               
                <Slider aria-label='slider-ex-4' min={minLength.current} max={maxLength.current} step={stepSize.current} mt="20px" defaultValue={sliderValue} onChange={(val) => {setSliderValue(val);}}>
                  <SliderMark
                    value={sliderValue}
                    textAlign='center'
                    bg='white'
                    color='purple.500'
                    mt='-10'
                    ml='-6'
                    w='12'
                  >
                    {chordSelected.cifra}
                  </SliderMark>
                  <SliderMark fontSize='sm' mt="20px" textAlign='center' w="100%">
                    <HStack minW={"100%"} justifyContent={"space-between"} bg="purple.100">
                      {chordSelected.palavra.split('').map(item => (
                        <Heading as='h6' size='2xl'  textAlign={"center"}>{item}</Heading>

                      ))}
                    </HStack>
                  </SliderMark>

                  <SliderTrack bg='purple.100'>
                    <SliderFilledTrack bg='purple' />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box color='purple' as={MdGraphicEq} />
                  </SliderThumb>
                </Slider>       
              </Box>
            </Stack>
            <Stack mt="16">
              <Stack borderWidth={"2px"} borderColor="purple.100" w="150px" h="200px">
                <Image src={acordeAtual} />
              </Stack>

              <Menu>
                {({ isOpen }) => (
                  <>
                    <MenuButton isActive={isOpen} as={Button} rightIcon={<ChevronDownIcon />}>
                      {chordSelected.cifra}
                    </MenuButton>
                    <MenuList>
                      {acordes.map(item => (
                        <MenuItem onClick={() => {}}>{item}</MenuItem>
                      ))}
                    </MenuList>
                  </>
                )}
              </Menu>

              <Button onClick={() => changeElPos(currentEl.current)} colorScheme='teal' size='md'>
                Salvar
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>)}

    </Stack>
  );
}

export default Cifra;