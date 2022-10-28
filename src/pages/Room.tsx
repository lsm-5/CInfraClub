import React from 'react';

import { Heading, Stack, Input, Button, HStack, VStack } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import background from "../assets/bg2.jpg";

const Room: React.FC = () => {
  const history = useHistory();

  return (
    <div style={{ backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
      <Stack align="center" justify="center" flex={1} minH="100vh">

        <Stack w={400} h={400} spacing='24px'>
          <Stack>
            <Heading as='h1' size='4xl'>CInfra</Heading>
            <Heading as='h1' size='4xl'>Club</Heading>
          </Stack>
          
          <VStack>
            <Input placeholder='Digite o código da sala' size="md" />
          </VStack>

          <HStack justify="space-between">
            <Button onClick={() => history.push('/sala')} colorScheme='teal' size='md'>
              Entrar na sala
            </Button>

            <Button onClick={() => history.push('/criar_sala')} colorScheme='teal' size='md'>
              Criar sala
            </Button> 
          </HStack>
        </Stack>
      </Stack>
    </div>
  );
}

export default Room;