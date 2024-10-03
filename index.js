// index.js (ili server.js)

const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Za korišćenje .env datoteke

// Kreiranje Express aplikacije
const app = express();
const port = process.env.PORT || 3000;

// Supabase postavke
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Koristiti Service Role Key za server-side
const supabase = createClient(supabaseUrl, supabaseKey);

// Služenje statičkih fajlova
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Za parsiranje JSON podataka

// Endpoint za preuzimanje informacija o klubovima
app.get("/api/clubs", async (req, res) => {
    try {
        const { data, error } = await supabase.from("clubs").select("*");
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Služenje index.html kao početne stranice
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Indicirani pristup servera
app.listen(port, () => {
    console.log(`Server pokrenut na http://localhost:${port}`);
});
