import React, { useState } from 'react';
import { Heading, Stack, Box, SimpleGrid, Text, HStack, Modal,
  ModalOverlay, ModalContent, ModalBody, Button, Input,
  ModalCloseButton, useDisclosure, VStack, 
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons'

const Playlist: React.FC = () => {
  const [playlist, setPlaylist] = useState([
    {
      id: "1",
      name_music: "Foi Pá Pum",
      author_music: "Simone & Simaria",
    },
    {
      id: "2",
      name_music: "Arranhão",
      author_music: "Henrique & Juliano",
    },
    {
      id: "3",
      name_music: "Batom de Cereja",
      author_music: "Israel & Rodolffo",
    },
    {
      id: "4",
      name_music: "Lençol Dobrado",
      author_music: "João Gustavo e Murilo",
    }
  ]);

  const [searchMusic, setSearchMusic] = useState([
    {
      id: "5",
      name_music: "musica sugestão 1",
      author_music: "Autor 1",
    },
    {
      id: "6",
      name_music: "musica sugestão 2",
      author_music: "Autor 2",
    },
    {
      id: "7",
      name_music: "musica sugestão 3",
      author_music: "Autor 3",
    },
    {
      id: "8",
      name_music: "musica sugestão 4",
      author_music: "Autor 4",
    }
  ])

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Stack align="center" justify="start" flex={1} minH="100vh" p="5%" minW="90vw">
       <Box position="absolute" top={10} right={100}>
        <HStack>
          <EditIcon w={5} h={5} color="red.500" />
          <Heading  as='h3' size='sm'>Sala #12345</Heading>
        </HStack>
      </Box>
      
      <Heading as='h1' size='4xl'>Noitada</Heading>
      <Heading as='h2' size='lg'>Repertório</Heading>
        
      <SimpleGrid columns={1} spacing={10}>
        {playlist.map(item => (
          <HStack>
            <Stack onClick={() => {}} borderWidth={2} borderColor="#cecece" h={"80px"} minW={"100%"} p="2" align="center" justify="center" cursor="pointer">
              <HStack>
                <Text>{item.author_music}</Text>
                <Text>-</Text>
                <Text>{item.name_music}</Text>
              </HStack>
            </Stack>
            
            <DeleteIcon w={8} h={8} color="red.500" cursor={"pointer"} onClick={() => setPlaylist(prev => (prev.filter(itemP => itemP.id !== item.id)))} />
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
                      setPlaylist(prev => [...prev, item]);
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
                        <Text>{item.author_music}</Text>
                        <Text>-</Text>
                        <Text>{item.name_music}</Text>
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