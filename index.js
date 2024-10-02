const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config(); // Učitavanje environment varijabli iz .env fajla

// Proveri environment varijable
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error("SUPABASE_URL ili SUPABASE_SERVICE_KEY nisu definisani");
    process.exit(1);
}

// Kreiranje Supabase klijenta sa servisnim ključem (samo na serverskoj strani)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Kreiranje aplikacije
const app = express();
const port = process.env.PORT || 3000;

// CORS postavke
const cors = require('cors');
app.use(cors({
    origin: '*', // Omogućavanje pristupa sa svih domena (podesite prema potrebi)
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Posluži index.html kao početnu stranicu
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Posluži login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// API rute

// Dodavanje igrača
app.post("/api/players", async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "Ime je obavezno i ne može biti prazno" });
    }

    const { data, error } = await supabase.from("players").insert([{ name }]);

    if (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data); // Vraća novog igrača
});

// Preuzimanje svih igrača
app.get("/api/players", async (req, res) => {
    const { data, error } = await supabase.from("players").select();

    if (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message });
    }

    res.json(data); // Vraća sve igrače
});

// Dodavanje treninga za igrača
app.post("/api/players/:id/trening", async (req, res) => {
    const { bacanja, promasaji } = req.body;
    const playerId = req.params.id;

    // Dodaj novi zapis u tabelu treninga
    const { data, error } = await supabase.from('trainings').insert([
        { player_id: playerId, bacanja, promasaji },
    ]);

    if (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Trening uspešno dodat", data });
});

// Brisanje igrača
app.delete("/api/players/:id", async (req, res) => {
    const playerId = req.params.id;

    // Obriši igrača
    const { error } = await supabase.from("players").delete().eq("id", playerId);

    if (error) {
        console.error(error.message);
        return res.status(500).json({ error: error.message });
    }
    res.json({ message: "Igrač uspešno obrisan" });
});

// Postavi catch-all rutu za 404 greške
app.use((req, res) => {
    res.status(404).json({ error: "Ruta nije pronađena" });
});

// Pokretanje servera
app.listen(port, () => {
    console.log(`Server pokrenut na portu ${port}`);
});
