// login.js

// Vaš Supabase URL i Anon Public Key
const supabaseUrl = 'https://piykumcyaqnyxwndozhb.supabase.co'; // Vaš Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWt1bWN5YXFueXh3bmRvemhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2OTk2MTMsImV4cCI6MjA0MzI3NTYxM30.eqh0FPRGtqD3A9DLeJv6yZKXP6pnaygDTaaa2bgz3Xs'; // Ovdje ubacite vaš Anon Public Key

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Funkcija za registraciju
async function signup() {
    console.log("Registracija započeta...");

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (password.length < 6) {
        alert("Lozinka mora imati najmanje 6 karaktera.");
        return;
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("Greška prilikom registracije:", error);
        alert("Greška: " + error.message);
    } else {
        alert("Registracija uspešna! Molimo proverite vašu e-poštu.");
        // Prebacivanje na formu za prijavu nakon uspešne registracije
        showLoginForm();
    }
}

// Funkcija za prijavu
async function login() {
    console.log("Prijava započeta...");

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error("Greška prilikom prijave:", error);
        alert("Greška: " + error.message);
    } else {
        console.log("Prijava uspešna", data.user);
        window.location.href = "club.html";
    }
}

// Funkcije za prikazivanje odgovarajuće forme
function showSignupForm() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('signup-container').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('signup-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

// Povezivanje dugmadi sa funkcijama
document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('signupButton').addEventListener('click', signup);

// Povezivanje linkova za prebacivanje između formi
document.getElementById('show-signup').addEventListener('click', function (e) {
    e.preventDefault();
    showSignupForm();
});

document.getElementById('show-login').addEventListener('click', function (e) {
    e.preventDefault();
    showLoginForm();
});
