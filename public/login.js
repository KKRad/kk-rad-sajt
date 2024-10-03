// login.js

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrKQZL9m8-aupCgBZquJ8e2kPjIOTQlNo", // Vaš API ključ
    authDomain: "kk-rad.firebaseapp.com", // Vaš projekt ID
    projectId: "kk-rad", // Vaš projekt ID
    storageBucket: "kk-rad.appspot.com", // Vaš storage bucket
    messagingSenderId: "704912800301", // Vaš sender ID
    appId: "1:704912800301:web:828d786d31f7aad15756a4", // Vaš app ID
    measurementId: "G-7LFZWW07G6" // Vaš measurement ID
};

// Inicijalizacija Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Firebase Auth instanca

// Funkcija za prijavu
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log("Prijava uspešna:", user);
        // Preusmeravanje na stranicu kluba ili na početnu stranu
        window.location.href = "index.html"; // Preusmeravanje na izbor kluba
    } catch (error) {
        console.error("Greška prilikom prijave:", error);
        alert("Greška: " + error.message);
    }
}

// Dodajte event listener za dugme za prijavu
document.getElementById('loginButton').addEventListener('click', login);
