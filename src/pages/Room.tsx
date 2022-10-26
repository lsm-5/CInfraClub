import React from 'react';

import { Heading, Stack, Input, Button, HStack, VStack } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';

const Room: React.FC = () => {
  const history = useHistory();

  return (
    <Stack align="center" justify="center" flex={1} minH="100vh">
      <Stack w={400} h={400} spacing='24px'>
        <Stack>
          <Heading as='h1' size='4xl'>CInfra</Heading>
          <Heading as='h1' size='4xl'>Club</Heading>
        </Stack>
        
        <VStack>
          <Input placeholder='Digite o nome da sala' size="md" />
          <Input placeholder='Digite a senha da sala' size="md" />
        </VStack>

        <HStack justify="space-between">
          <Button onClick={() => history.push('/sala')} colorScheme='teal' size='md'>
            Entrar na sala
          </Button>

          <Button colorScheme='teal' size='md'>
            Criar sala
          </Button> 
        </HStack>
      </Stack>
    </Stack>
  );
}

export default Room;