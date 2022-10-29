import React, { useState } from 'react';
import { Heading, Stack, Box, Text, Input, VStack, HStack, Image, Button, useToast } from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons'
import ImgCreateRoom from '../assets/Authentication-pana.svg'
import { useHistory } from 'react-router-dom';
import {useInfo} from '../hooks/info';

const CreateRoom: React.FC = () => {
  const history = useHistory();
  const [value, setValue] = React.useState('')
  const handleChange = (event: { target: { value: React.SetStateAction<string>; }; }) => setValue(event.target.value)
  const { createSala } = useInfo();
  const toast = useToast()

  async function onHandleCreateRoom(name: string){
    await createSala(name);
  }
  
  function ToastExample(title: string, desc: string, status: 'success' | 'error' | 'warning') {
    toast({
      title,
      description: desc,
      status: status,
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    })
  }

  return (
    <Stack align="center" justify="start" flex={1} minH="100vh" p="5%" minW="90vw">
      <Box onClick={() => history.goBack()} position="absolute" top={10} right={100} borderColor="purple.400" borderWidth={2} p="2" cursor="pointer">
        <Heading as='h3' size='sm' color="purple.400">Voltar</Heading>
      </Box>

      <Box>
        <VStack>
          <Heading as='h1' size='2xl'>Cadastrar Sala</Heading>
          <Box bg="purple.400" h="1" w={"120%"} />
        </VStack>
      </Box>

      <HStack>
        <Image src={ImgCreateRoom} alt="Create Room" w="300" h="300" />
        <Box bg="purple.500" w="300" h="300" p="4">
          <VStack h={'100%'} justifyContent={"center"} alignItems="start">
            <Text color="white">Nome da Sala:</Text>
            <Input color="white" placeholder='Digite o nome' size="md" _placeholder={{ color: 'white' }} value={value} onChange={handleChange} />

            <Button onClick={() => { createSala(value) }} colorScheme='cyan' size='md' alignSelf={'flex-end'} justifySelf="flex-end">
              Criar
            </Button>
          </VStack>
        </Box>
      </HStack>


    </Stack>
  );
}

export default CreateRoom;