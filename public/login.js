// login.js

// Vaš Supabase URL i Anon Public Key
const supabaseUrl = 'https://piykumcyaqnyxwndozhb.supabase.co'; // Vaš Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWt1bWN5YXFueXh3bmRvemhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2OTk2MTMsImV4cCI6MjA0MzI3NTYxM30.eqh0FPRGtqD3A9DLeJv6yZKXP6pnaygDTaaa2bgz3Xs'; // Ovdje ubacite vaš Anon Public Key

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Funkcija za prijavu
async function login() {
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
        window.location.href = "club.html?club=KK_RAD";
    }
}

document.getElementById('loginButton').addEventListener('click', login);
