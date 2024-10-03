const express = require("express");
const path = require("path");
const supabase = require("./supabase");  // Importovan klijent iz supabase.js
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Parsiranje JSON podataka

// Rute
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ error: "Ruta nije pronađena" });
});

app.listen(port, () => {
    console.log(`Server pokrenut na portu ${port}`);
});
