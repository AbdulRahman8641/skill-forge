// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6LGeSaI4x9GLOBTKfpIkp9lB6muVDTNI",
  authDomain: "skill-forge-32dfe.firebaseapp.com",
  projectId: "skill-forge-32dfe",
  storageBucket: "skill-forge-32dfe.firebasestorage.app",
  messagingSenderId: "989630345222",
  appId: "1:989630345222:web:761cbcde2691a8f161d387",
  measurementId: "G-SLGFGXX1FH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

// Function to sign in with Google and save user data
export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Save user data in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          uid: user.uid,
          joined: new Date(),
        });
      }
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };