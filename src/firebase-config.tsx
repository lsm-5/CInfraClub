import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from 'firebase/firestore'

const config = {
    apiKey: "AIzaSyDsQV2ykYxkmDHEiz2ApzhBRaOqnQqrX-s",
    authDomain: "projeto-comp-musical.firebaseapp.com",
    databaseURL: "https://projeto-comp-musical-default-rtdb.firebaseio.com",
    projectId: "projeto-comp-musical",
    storageBucket: "projeto-comp-musical.appspot.com",
    messagingSenderId: "632514255850",
    appId: "1:632514255850:web:e113172310cd6c71347093",
    measurementId: "G-1B8SP91DWC"
};

const db: Firestore = getFirestore(initializeApp(config))

export default db