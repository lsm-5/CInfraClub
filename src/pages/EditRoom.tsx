import React, { useState } from 'react';
import { Heading, Stack, Box, Text, Input,VStack, HStack, Image, Button } from '@chakra-ui/react';
import { DeleteIcon, AddIcon, EditIcon } from '@chakra-ui/icons'
import ImgEditRoom from '../assets/Instagram-Video-Streaming-pana.svg' 
import { useHistory } from 'react-router-dom';

const EditRoom: React.FC = () => {
  const history = useHistory();

  return (
    <Stack align="center" justify="start" flex={1} minH="100vh" p="5%" minW="90vw">
      <Box onClick={() => history.goBack()} position="absolute" top={10} right={100} borderColor="purple.400" borderWidth={2} p="2" cursor="pointer">
          <Heading  as='h3' size='sm' color="purple.400">Voltar</Heading>
      </Box>
      
      <Box>
        <VStack>
          <Heading as='h1' size='2xl'>Editar Sala</Heading>
          <Box bg="purple.400" h="1" w={"120%"} />
        </VStack>
      </Box>
        
      <HStack>
        <Box bg="purple.500" w="500" h="500" p="4">
          <VStack h={'100%'} justifyContent={"center"} alignItems="start">
            <Text color="white">Nome da Sala:</Text>
            <Input color="white" placeholder='Digite o nome' size="md" _placeholder={{ color: 'white' }}/>

            <Button onClick={() => {}} colorScheme='cyan' size='md' alignSelf={'flex-end'} justifySelf="flex-end">
              Atualizar
            </Button>
          </VStack>
        </Box>
        <Image src={ImgEditRoom} alt="Edit Room" w="300" h="500" />
      </HStack>
      
     
    </Stack>
  );
}

export default EditRoom;