import db from './firebase-config'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';

const COLLECTION_SALAS = "Salas";

export type Sala = {
    id?: string;
    name: string;
    senha: string;
    playlist?: any;
};

export const allSalas = async (): Promise<Array<Sala>> => {
    const reference = collection(db, COLLECTION_SALAS);
    const snapshot = await getDocs(reference)
    const data: Array<any> = [];

    snapshot.docs.map((_data) => {
        data.push({
            id: _data.id,
            ..._data.data(),
        });
    });

    return data as Array<Sala>;
};

export const getPlaylist = async (id: string): Promise<Array<any>> => {
    const reference = collection(db, COLLECTION_SALAS + "/" + id + "/" + "playlist");
    const snapshot = await getDocs(reference)
    const data: Array<any> = [];

    snapshot.docs.map((_data) => {
        data.push({
            id: _data.id,
            ..._data.data(),
        });
    });

    return data as Array<any>;
};

export const getSala = async (senha: string): Promise<Sala | null> => {
    const reference = collection(db, COLLECTION_SALAS);
    const q = query(reference, where("senha", "==", senha));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return {
            id: querySnapshot.docs[0].id,
            ...querySnapshot.docs[0].data(),
            playlist: await getPlaylist(querySnapshot.docs[0].id)
        } as Sala
    } else {
        return null
    }

}

export const createSala = async (name: string): Promise<Sala> => {
    const reference = collection(db, COLLECTION_SALAS);
    const sala = { name: name, senha: "" }
    const docRef = await addDoc(reference, sala);
    const playlistRef = collection(db, COLLECTION_SALAS + "/" + docRef.id + "/" + "playlist");
    await addDoc(playlistRef, {});
    const salaUp = { name: sala.name, senha: docRef.id.substring(15) }
    await update(docRef.id, salaUp)

    return {
        id: docRef.id,
        ...salaUp,
    } as Sala;
};

export const update = async (id: string, sala: Sala): Promise<Sala> => {
    const reference = doc(collection(db, COLLECTION_SALAS), id);
    await updateDoc(reference, sala);

    return {
        id: id,
        ...sala,
    } as Sala;
};

export const remove = async (id: string) => {
    const reference = doc(collection(db, COLLECTION_SALAS), id);
    await deleteDoc(reference);
};