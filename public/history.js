// history.js

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player');

    if (!playerId) {
        alert('Nije izabran igrač.');
        window.history.back();
        return;
    }

    // Učitavanje podataka o igraču
    const playerSnapshot = await db.collection('players').doc(playerId).get();
    if (!playerSnapshot.exists) {
        alert('Greška prilikom učitavanja igrača.');
        return;
    }

    const player = playerSnapshot.data();
    document.getElementById('player-name').textContent = `Istorija igrača: ${player.name}`;

    // Učitavanje treninga igrača
    const trainingsSnapshot = await db.collection('trainings').where('player_id', '==', playerId).get();

    const dates = [];
    const throws = [];
    const misses = [];

    trainingsSnapshot.forEach(doc => {
        const data = doc.data();
        dates.push(data.date);
        throws.push(data.throws);
        misses.push(data.misses);
    });

    // Kreiranje grafikona
    const ctx = document.getElementById('trainingChart').getContext('2d');
    const trainingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Broj bacanja',
                    data: throws,
                    borderColor: 'blue',
                    fill: false,
                },
                {
                    label: 'Broj promašaja',
                    data: misses,
                    borderColor: 'red',
                    fill: false,
                },
            ],
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Datum',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Broj',
                    },
                },
            },
        },
    });
});
