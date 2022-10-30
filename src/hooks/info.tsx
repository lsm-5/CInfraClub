import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
const COLLECTION_SALAS = "Salas";
import { useToast } from '@chakra-ui/react';
import db from '../firebase-config';

type Sala = {
  id?: string;
  name: string;
  senha: string;
};

type Music = {
  id?: string;
  name: string;
  author: string;
  cifra: string;
  tom: string;
}

interface InfoContext {
  room: Sala | null;
  getSala: (senha: string) => Promise<void>;
  createSala: (name: string) => Promise<void>;
  removeSala: (id: string | undefined) => Promise<void>;
  updateSala: (name: string) => Promise<void>;
  logOut: () => void;
  playlist: Music[];
  addMusic: (music: Music) => Promise<void>;
  removeMusic: (id: string | undefined) => Promise<void>;
}

const InfoContext = createContext<InfoContext | null>(null);

interface Props {
  children: React.ReactNode;
}

const InfoProvider = ({ children }: Props) => {
  const [room, setRoom] = useState<Sala | null>(null);
  const [playlist, setPlaylist] = useState<Music[]>([])
  const toast = useToast()

  useEffect(() => {
    if (room !== null) {
      // todo: pegar playlist (a coleção toda) e armazenar na variável playlist
      // ficou dentro de getSala
    }
  }, [room])

  const addMusic = async (music: Music): Promise<void> => {
    // todo: vai pegar esse dados, criar um objeto e armazenar na coleção playlist dentro da sala como um documento novo
    // todo: vai atualizar a variavel playlist daqui

    GenerateToast("Sucesso", "A música foi adicionada", "success");
  }

  const removeMusic = async (id: string | undefined): Promise<void> => {
    if (id === undefined) {
      GenerateToast("Erro", "Id da sala inválido", "error");
      return;
    }
    // todo: vai pegar o id recebido como parametro e o id da variavel room daqui e vai remover a musica da playlist
    // todo: vai atualizar a variavel playlist daqui

    GenerateToast("Sucesso", "A música foi removida", "success");
  }

  function GenerateToast(title: string, desc: string, status: 'success' | 'error' | 'warning') {
    toast({
      title,
      description: desc,
      status: status,
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    })
  }

  const getSala = async (senha: string): Promise<void> => {
    const reference = collection(db, COLLECTION_SALAS);
    const q = query(reference, where("senha", "==", senha));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const playlistId = (await getDocs(
        collection(db, COLLECTION_SALAS + "/" + querySnapshot.docs[0].id + "/playlist")
      )).docs[0].id
      const playlistSnapshot = await getDocs(
        collection(db, COLLECTION_SALAS + "/" + querySnapshot.docs[0].id + "/playlist/" + playlistId + "/Musica")
      )
      const musicas: Array<Music> = [];
      playlistSnapshot.docs.map((_data) => {
        musicas.push({
          id: _data.id,
          ..._data.data()
        } as Music);
      });
      setPlaylist(musicas)
      setRoom({
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      } as Sala)
      GenerateToast('Sucesso', 'Bem-vindo ao CInfraClub', 'success')
    } else {
      setRoom(null);
      GenerateToast('Erro', 'Sala não encontrada', 'error')
    }
  }

  const updateSala = async (name: string): Promise<void> => {
    if (name === '') {
      GenerateToast("Erro", "Nome de sala inválido", "error");
      return;
    }

    const reference = doc(collection(db, COLLECTION_SALAS), room?.id);
    await updateDoc(reference, { name });

    getSala(room!.senha)
    GenerateToast("Sucesso", "Sua sala foi atualizada", "success");

  };

  function generatePassword() {
    var length = 6,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  const createSala = async (name: string): Promise<void> => {
    if (name === '') {
      GenerateToast("Erro", "Nome de sala inválido", "error");
      return;
    }

    const reference = collection(db, COLLECTION_SALAS);
    const sala = { name: name, senha: generatePassword() }
    const docRef = await addDoc(reference, sala);
    const playlistRef = collection(db, COLLECTION_SALAS + "/" + docRef.id + "/" + "playlist");
    await addDoc(playlistRef, {});
    GenerateToast("Sucesso", "Sua sala foi criada", "success");

    console.log('senha', sala.senha)

    getSala(sala.senha);


  };

  const removeSala = async (id: string | undefined) => {
    if (removeSala === undefined) {
      GenerateToast("Erro", "Id da sala inválido", "error");
      return;
    }

    const reference = doc(collection(db, COLLECTION_SALAS), id);
    await deleteDoc(reference);

    GenerateToast("Sucesso", "A sala foi excluída", "success");

    setRoom(null);
  };

  const logOut = () => {
    setRoom(null);
  }

  const value = React.useMemo(
    () => ({
      room,
      createSala,
      getSala,
      removeSala,
      logOut,
      updateSala,
      playlist,
      removeMusic,
      addMusic,
    }),
    [
      room,
      createSala,
      getSala,
      removeSala,
      logOut,
      updateSala,
      playlist,
      removeMusic,
      addMusic,
    ],
  );

  return <InfoContext.Provider value={value}>{children}</InfoContext.Provider>;
};

function useInfo(): InfoContext {
  const context = useContext(InfoContext);

  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }

  return context;
}

export { InfoProvider, useInfo };