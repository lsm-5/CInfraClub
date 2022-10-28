import db from './firebase-config'
import { collection, getDocs, CollectionReference, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const COLLECTION_NAME = "Salas";

export type Sala = {
    id?: string;
    name: string;
    repertorio: CollectionReference|null;
    senha: string;
};

export const all = async (): Promise<Array<Sala>> => {
    const reference = collection(db, COLLECTION_NAME);
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

export const create = async (sala: Sala): Promise<Sala> => {
    const reference = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(reference, sala);

    return {
        id: docRef.id,
        ...sala,
    } as Sala;
};

export const update = async (id: string, sala: Sala): Promise<Sala> => {
    const reference = doc(collection(db, COLLECTION_NAME), id);
    await updateDoc(reference, sala);

    return {
        id: id,
        ...sala,
    } as Sala;
};

export const remove = async (id: string) => {
    const reference = doc(collection(db, COLLECTION_NAME), id);
    await deleteDoc(reference);
};