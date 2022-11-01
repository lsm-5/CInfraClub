import React, { useState, useEffect, useRef } from 'react';
import { Heading, Stack, Box, Input,VStack, HStack, Image, Button, Text,
Menu, MenuButton, MenuList, MenuItem, useDisclosure, Modal, ModalOverlay,
ModalContent, ModalCloseButton, ModalBody, Slider, SliderTrack, SliderFilledTrack,
SliderThumb, SliderMark } from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { useHistory } from 'react-router-dom';
import {useInfo} from '../hooks/info';
import { FiLogOut, FiPlay } from 'react-icons/fi';
import { MdGraphicEq } from 'react-icons/md';
import $ from 'jquery';
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import {MdOutlineClose} from 'react-icons/md'
import parse from 'html-react-parser';
import './Cifra.css';

const Cifra = () => {
  const history = useHistory();
  const { room, logOut, musicSelected, playlist, setMusicSelected } = useInfo();
  const ModalDisclosure = useDisclosure()
  const [sliderValue, setSliderValue] = useState(0);
  const [urlAudio, setUrlAudio] = useState('');
  const [chordSelected, setChordSelected] = useState(null);
  const maxLength = useRef(0);
  const minLength = useRef(0);
  const stepSize = useRef(0);
  const currentEl = useRef(null);

  useEffect(() => {
    if(chordSelected !== null){
      ModalDisclosure.onOpen();
    }
  }, [chordSelected])

  useEffect(() => {
    console.log('sliderValue', sliderValue)
  },[sliderValue])

  
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

   
   const movedCypher = useRef(new Map());
   const refContainer = useRef(null);
   const refLyricObj = useRef([]);
   const regex = /id=\"([\s\S]*?)\">/g;
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
    }
  }, [musicSelected?.cifra])

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

  function bindClick(i, el) {
    return function () {
      //console.log(el);
      // el.style.zIndex="-1";
      // el.style.position = "absolute";
      let dim;
      let dimEl;
      let obj;
      let temp;
      if (refLyricObj.current) {
        obj = refLyricObj.current.find(item => item.id === `${i}`);
        if (obj) {
          temp = document.createElement('div');
          temp.textContent = obj.palavra;
          setChordSelected(obj);
          temp.style.display = 'initial';
          $('el').append(temp)
          dim = temp.getBoundingClientRect();
          //temp.remove();
        }

      }
      dimEl = el.getBoundingClientRect();

      currentEl.current = el;
      let letterW = 8.7;
      if (!movedCypher.current.has(i)) {
        let widR = obj.palavra.length - (obj.pos + 1);
        let widL = obj.pos;
        let offsetR = widR * letterW;
        let offsetL = widL * letterW;
        
        maxLength.current = dimEl.x + offsetR;
        minLength.current = dimEl.x - offsetL;
        stepSize.current = letterW;
        console.log(maxLength.current);
        console.log(minLength.current);
        movedCypher.current.set(i, {maxLength: maxLength.current, minLength: minLength.current, stepSize: stepSize.current});
      }else{
        let aux = movedCypher.current.get(i);
        maxLength.current = aux.maxLength;
        minLength.current = aux.minLength;
        stepSize.current = aux.stepSize;

      }
      setSliderValue(dimEl.x);

      // $(el).draggable({
      //   axis: "x",
      //   grid: [letterW,0],
      //   containment: [dimEl.x - offsetL, dimEl.y, dimEl.x + offsetR, dimEl.y + dim.height]
      // });
    };
  }

 function print() {
  //refContainer.current.getElementsByTagName('pre')[0].style.position ='absolute';
  let bArr = refContainer.current.getElementsByTagName('b');
  let counter = 0;
  for (let i = 0; i < bArr.length; i++) {
    bArr[i].setAttribute('id', counter);
    bArr[i].addEventListener("click", bindClick(i, bArr[i]));
    counter++; 
  }
}

function changeElPos(el) {
  //el.setAttribute('z-index', -1);
  el.setAttribute('style', `position: absolute; left: ${sliderValue}px;`)
  //el.setAttribute('style', `transform: translate(${sliderValue}px);`)
  // el.style.removeProperty("z-index");
  //el.style.removeProperty("position");
}


  return (
    <Stack align="center" justify="start" flex={1} minH="100vh" p="5%" minW="90vw">
      <Box position="absolute" top={10} right={100}>
        <HStack>
          <EditIcon cursor={"pointer"} w={5} h={5} color="red.500" onClick={() => history.push('/editar_sala')} />
          <Heading  as='h3' size='sm'>{`Sala ${room?.senha}`}</Heading>
        </HStack>
      </Box>

      <Box position="absolute" top={8} right={260} onClick={() => {history.push('/sala'); setMusicSelected(null)}}>
        <HStack cursor={"pointer"}>
        <ArrowBackIcon cursor={"pointer"} w={5} h={5} color="purple.500"  />          
        <Heading  as='h3' size='sm'>Voltar</Heading>
        </HStack>
      </Box>

      <Box position="absolute" top={6} left={100} borderWidth={2} borderColor="purple.500" p="2">
        <HStack cursor={"pointer"} onClick={() => logOut()}>
          <FiLogOut style={{width: 20, height: 20}} color="#805AD5" />
          <Heading  as='h3' size='sm'>Sair</Heading>
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
              <Input defaultValue={"B"} w="60px"/>
            </HStack>
          </Stack>
          <Stack w="33%" justify={"start"} align={"start"} flex="1" minH={"100%"}>
            <Text  fontWeight={"bold"}>Repertório</Text>
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
            {Object.keys(musicSelected?.cifra).length > 0 && (
              <span ref={refContainer} className='musicInfo'>
                {parse(musicSelected?.cifra)}
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
                <Slider aria-label='slider-ex-4' min={minLength.current} max={maxLength.current} step={stepSize.current} mt="20px" defaultValue={sliderValue} onChange={(val) => {setSliderValue(val); console.log(val);}}>
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
                <Text>Lucas 2</Text>
              </Stack>

              <Menu>
                {({ isOpen }) => (
                  <>
                    <MenuButton isActive={isOpen} as={Button} rightIcon={<ChevronDownIcon />}>
                      G
                    </MenuButton>
                    <MenuList>
                      {playlist.map(item => (
                        <MenuItem onClick={() => setMusicSelected(item)}>{item.name}</MenuItem>
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