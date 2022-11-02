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
import {scrapCifra, api} from '../service/api';

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
  cifraFormatted: null | string;
  tom: string;
  searchAuthor: string;
  searchName: string;
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
  setMusicSelected: (music: Music | null) => void;
  musicSelected: Music | null;
  handleSearch: (input: string) => void;
  searchMusic: Music[];
  updateCifra: (playlistId: string, cifra: string) => Promise<void>
  updateTom: (playlistId: string, tom: string) => Promise<void>
}

const InfoContext = createContext<InfoContext | null>(null);

interface Props {
  children: React.ReactNode;
}

const InfoProvider = ({ children }: Props) => {
  const [room, setRoom] = useState<Sala | null>(null);
  const [playlist, setPlaylist] = useState<Music[]>([])
  const [musicSelected, setMusicSelected] = useState<Music | null>(null)
  const [searchMusic, setSearchMusic] = useState<Music[]>([])
  const toast = useToast()

  useEffect(() => {
    if (room !== null) {
      getPlaylist(room?.id);
    }
  }, [room])

  const addMusic = async (music: Music): Promise<void> => {
    // todo(done): vai pegar esse dados, criar um objeto e armazenar na coleção playlist dentro da sala como um documento novo
    // todo(done): vai atualizar a variavel playlist daqui
    const musicWithCifra = {...music}
    const cifra = await getMusicInfo(musicWithCifra.searchAuthor, musicWithCifra.searchName);
    musicWithCifra.cifra = cifra;
    const musicasRef = collection(db, COLLECTION_SALAS + "/" + room?.id + "/playlist/");
    await addDoc(musicasRef, musicWithCifra);
    await getPlaylist(room?.id)

    GenerateToast("Sucesso", "A música foi adicionada", "success");
  }

  const removeMusic = async (id: string | undefined): Promise<void> => {
    if (id === undefined) {
      GenerateToast("Erro", "Id da sala inválido", "error");
      return;
    }
    // todo(done): vai pegar o id recebido como parametro e o id da variavel room daqui e vai remover a musica da playlist
    // todo(done): vai atualizar a variavel playlist daqui
    const musicRef = doc(collection(db, COLLECTION_SALAS + "/" + room?.id + "/playlist/"), id);
    await deleteDoc(musicRef);
    await getPlaylist(room?.id)

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
      setRoom({
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data(),
      } as Sala)
      await getPlaylist(querySnapshot.docs[0].id)
      GenerateToast('Sucesso', 'Bem-vindo ao CInfraClub', 'success')
    } else {
      setRoom(null);
      GenerateToast('Erro', 'Sala não encontrada', 'error')
    }
  }

  const getPlaylist = async (id: string | undefined): Promise<void> => {
    if (id === undefined) {
      GenerateToast("Erro", "Id da sala inválido", "error");
      return;
    }
    
    const playlistSnapshot = await getDocs(
      collection(db, COLLECTION_SALAS + "/" + id + "/playlist/")
    )

    const musicas: Array<Music> = [];
    playlistSnapshot.docs.map((_data) => {
      musicas.push({
        id: _data.id,
        ..._data.data()
      } as Music);
    });

    setPlaylist(musicas)
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
    // const playlistRef = collection(db, COLLECTION_SALAS + "/" + docRef.id + "/" + "playlist");
    // await addDoc(playlistRef, {});
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

  async function getMusicInfo(author: string, music: string) {
    const response = await scrapCifra.get(`/${author}/${music}`);
    console.log('response', response.data);//na resposta do servidor
    return response.data;
  }

  async function handleSearch(input: string) {
    if (input === '') {
      GenerateToast('Atenção', 'Digite algo antes de pesquisar', 'warning');
      return;
    }

    try {
      const response = await api.get('/', { params: { q: input } });
      const processed = JSON.parse(response.data.slice(1).slice(0, response.data.length - 3))
      if (processed && processed.response.docs.length > 0) {
        let musicList: Music[] = []
        for (let i = 0; i < processed.response.docs.length && i < 5; i++) {
          if (processed.response.docs[i].d != null && processed.response.docs[i].u != null) {
            let musica = {
              author: processed.response.docs[i].a,
              name: processed.response.docs[i].m,
              searchAuthor: processed.response.docs[i].d,
              searchName: processed.response.docs[i].u,
              cifra: '',
              tom: '',
              cifraFormatted: null,
            }
            musicList.push(musica);
          }
        }
        setSearchMusic(musicList);
      }
    } catch (error) {
      alert("erro ao buscar");
    }
  }

  async function updateCifra(playlistId: string, cifra: string){
    if (playlistId === '') {
      GenerateToast('Atenção', 'Insira uma playlist válida', 'error');
      return;
    }

    if (cifra === '') {
      GenerateToast('Atenção', 'Insira uma cifra válida', 'error');
      return;
    }

    console.log("chamou updateCifra")
    console.log("salvou")
    console.log("cifra", cifra)
    const reference = doc(db,COLLECTION_SALAS + "/" + room?.id + "/playlist/" + playlistId);
    await updateDoc(reference, {cifraFormatted: cifra})

    GenerateToast('Sucesso', 'Cifra atualizada', 'success');
  }

  async function updateTom(playlistId: string, tom: string){
    if (playlistId === '') {
      GenerateToast('Atenção', 'Insira uma playlist válida', 'error');
      return;
    }

    if (tom === '') {
      GenerateToast('Atenção', 'Insira um tom válido', 'error');
      return;
    }

    const reference = doc(db,COLLECTION_SALAS + "/" + room?.id + "/playlist/" + playlistId);
    await updateDoc(reference, {tom})
    //GenerateToast('Sucesso', 'Tom atualizado', 'success');
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
      musicSelected,
      setMusicSelected,
      handleSearch,
      searchMusic,
      updateCifra,
      updateTom,
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
      musicSelected,
      setMusicSelected,
      handleSearch,
      searchMusic,
      updateCifra,
      updateTom,
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