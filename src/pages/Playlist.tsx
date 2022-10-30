import React, { useState } from 'react';
import { Heading, Stack, Box, SimpleGrid, Text, HStack, Modal,
  ModalOverlay, ModalContent, ModalBody, Button, Input,
  ModalCloseButton, useDisclosure, VStack, 
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons'
import { useHistory } from 'react-router-dom';
import {useInfo} from '../hooks/info';
import { FiLogOut } from 'react-icons/fi';

const Playlist: React.FC = () => {
  const history = useHistory();
  const { room, logOut, playlist, removeMusic, addMusic } = useInfo();

  const [searchMusic, setSearchMusic] = useState([
    {
      name: "musica sugestão 1",
      author: "Autor 1",
      tom: "",
      cifra: "",
    },
    {
      name: "musica sugestão 2",
      author: "Autor 2",
      tom: "",
      cifra: "",
    },
    {
      name: "musica sugestão 3",
      author: "Autor 3",
      tom: "",
      cifra: "",
    },
    {
      name: "musica sugestão 4",
      author: "Autor 4",
      tom: "",
      cifra: "",
    }
  ])

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Stack align="center" justify="start" flex={1} minH="100vh" p="5%" minW="90vw">
      <Box position="absolute" top={10} right={100}>
        <HStack>
          <EditIcon cursor={"pointer"} w={5} h={5} color="red.500" onClick={() => history.push('/editar_sala')} />
          <Heading  as='h3' size='sm'>{`Sala ${room?.senha}`}</Heading>
        </HStack>
      </Box>

      <Box position="absolute" top={6} left={100} borderWidth={2} borderColor="purple.500" p="2">
        <HStack cursor={"pointer"} onClick={() => logOut()}>
          <FiLogOut style={{width: 20, height: 20}} color="#805AD5" />
          <Heading  as='h3' size='sm'>Sair</Heading>
        </HStack>
      </Box>
      
      <Heading as='h1' size='4xl'>{room?.name}</Heading>
      <Heading as='h2' size='lg'>Repertório</Heading>
        
      <SimpleGrid columns={1} spacing={10}>
        {playlist.map(item => (
          <HStack>
            <Stack onClick={() => {}} borderWidth={2} borderColor="#cecece" h={"80px"} minW={"100%"} p="2" align="center" justify="center" cursor="pointer">
              <HStack>
                <Text>{item.author}</Text>
                <Text>-</Text>
                <Text>{item.name}</Text>
              </HStack>
            </Stack>
            
            <DeleteIcon w={8} h={8} color="red.500" cursor={"pointer"} onClick={() => removeMusic(item.id)} />
          </HStack>
        ))}
      </SimpleGrid>

      <Box onClick={onOpen} position={"fixed"} bottom={10} right={"20%"} borderColor="green.500" borderWidth={3} borderRadius={"50%"} p="4" cursor={"pointer"} >
        <AddIcon w={8} h={8} color="green.500" />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p="8">
              <Text>Digite o nome da música</Text>
              <HStack marginY={2}>
                <Input placeholder='Digite a senha da sala' size="md" />
                <Button colorScheme='teal' size='md'>
                  Buscar
                </Button>
              </HStack>
              <VStack mt="8">
                <Text alignSelf="start">Resultados:</Text>
                {searchMusic.map(item => (
                  <HStack>
                    <Stack 
                    onClick={() => {
                      addMusic(item);
                      onClose();
                    }} 
                    borderWidth={2} 
                    borderColor="#cecece" 
                    h={"80px"} 
                    minW={350} 
                    p="2" 
                    align="center" 
                    justify="center" 
                    cursor="pointer">
                      <HStack>
                        <Text>{item.author}</Text>
                        <Text>-</Text>
                        <Text>{item.name}</Text>
                      </HStack>
                    </Stack>
                  </HStack>
                ))}
              </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
     
    </Stack>
  );
}

export default Playlist;