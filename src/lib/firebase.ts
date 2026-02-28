import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Nahraď tento objekt tvojou skutočnou Firebase konfiguráciou,
// ktorú získaš v nastaveniach tvojho Firebase projektu.
const firebaseConfig = {
    apiKey: "AIzaSyBwHD5dep-BQCTGLg7bsskxH1iHg9cIYq4",
    authDomain: "studio-7012942372-7ea9a.firebaseapp.com",
    projectId: "studio-7012942372-7ea9a",
    storageBucket: "studio-7012942372-7ea9a.firebasestorage.app",
    messagingSenderId: "96336560670",
    appId: "1:96336560670:web:83767c0780d0cf776ce40f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
