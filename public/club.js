// club.js

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
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const clubName = urlParams.get('club');

    if (!clubName) {
        alert('Nije izabran klub.');
        window.location.href = 'index.html'; // Preusmerite korisnika nazad na index
        return;
    }

    document.getElementById('club-name').textContent = `Statistika za klub: ${clubName}`;

    // Učitavanje kluba iz Firestore
    const clubSnapshot = await db.collection('clubs').where('name', '==', clubName).get();
    if (clubSnapshot.empty) {
        alert('Greška prilikom učitavanja kluba.');
        return;
    }

    const clubId = clubSnapshot.docs[0].id; // uzimamo ID kluba za kasniju upotrebu

    // Proveri da li je korisnik prijavljen
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user && user.email === 'kkradbrcko9@gmail.com') {
            // Prikaži administratorske funkcije
            document.getElementById('add-match-section').classList.remove('hidden');
            document.getElementById('logoutButton').classList.remove('hidden');

            // Poveži dugme za odjavu
            document.getElementById('logoutButton').addEventListener('click', async () => {
                await firebase.auth().signOut();
                window.location.reload();
            });
        }

        // Učitaj igrače i statistike
        await loadPlayersAndStats();
    });

    // Funkcija za učitavanje igrača i statistika
    async function loadPlayersAndStats() {
        // Učitavanje igrača
        const playersSnapshot = await db.collection('players').where('club_id', '==', clubId).get();

        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        updatePlayerList(players); // Ažurira listu igrača
        updatePlayerSelect(players); // Ažurira izbor igrača

        // Učitavanje statistike treninga
        const trainingStatsSnapshot = await db.collection('trainings').where('player_id', 'in', players.map(p => p.id)).get();

        const trainingStatsByPlayer = {};
        trainingStatsSnapshot.forEach(stat => {
            const data = stat.data();
            if (!trainingStatsByPlayer[data.player_id]) {
                trainingStatsByPlayer[data.player_id] = {
                    totalThrows: 0,
                    totalMisses: 0,
                    trainingCount: 0
                };
            }
            trainingStatsByPlayer[data.player_id].totalThrows += data.throws;
            trainingStatsByPlayer[data.player_id].totalMisses += data.misses;
            trainingStatsByPlayer[data.player_id].trainingCount += 1;
        });

        // Učitavanje statistike utakmica
        const matchStatsSnapshot = await db.collection('match_results').where('player_id', 'in', players.map(p => p.id)).get();

        const matchStatsByPlayer = {};
        matchStatsSnapshot.forEach(stat => {
            const data = stat.data();
            if (!matchStatsByPlayer[data.player_id]) {
                matchStatsByPlayer[data.player_id] = {
                    totalScore: 0,
                    matchCount: 0
                };
            }
            matchStatsByPlayer[data.player_id].totalScore += data.score;
            matchStatsByPlayer[data.player_id].matchCount += 1;
        });
        
        // Ažuriranje tabela sa statistikom
        updateTrainingStatsTable(players, trainingStatsByPlayer);
        updateMatchStatsTable(players, matchStatsByPlayer);
    }

    // Funkcija za ažuriranje tabele statistike treninga
    function updateTrainingStatsTable(players, trainingStatsByPlayer) {
        const trainingStatsTableBody = document.querySelector('#training-stats-table tbody');
        trainingStatsTableBody.innerHTML = ''; // Očisti postojeće redove

        players.forEach(player => {
            const stats = trainingStatsByPlayer[player.id] || {
                totalThrows: 0,
                totalMisses: 0,
                trainingCount: 0
            };

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${player.name}</td>
                <td>${stats.trainingCount}</td>
                <td>${stats.trainingCount > 0 ? (stats.totalThrows / stats.trainingCount).toFixed(2) : 0}</td>
                <td>${stats.trainingCount > 0 ? (stats.totalMisses / stats.trainingCount).toFixed(2) : 0}</td>
            `;
            trainingStatsTableBody.appendChild(tr);
        });
    }

    // Funkcija za ažuriranje tabele statistike utakmica
    function updateMatchStatsTable(players, matchStatsByPlayer) {
        const matchStatsTableBody = document.querySelector('#match-stats-table tbody');
        matchStatsTableBody.innerHTML = ''; // Očisti postojeće redove

        players.forEach(player => {
            const stats = matchStatsByPlayer[player.id] || {
                totalScore: 0,
                matchCount: 0
            };

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${player.name}</td>
                <td>${stats.matchCount}</td>
                <td>${stats.matchCount > 0 ? (stats.totalScore / stats.matchCount).toFixed(2) : 0}</td>
            `;
            matchStatsTableBody.appendChild(tr);
        });
    }

    // Ažuriranje liste igrača
    function updatePlayerList(players) {
        const playerList = document.getElementById('players-list');
        playerList.innerHTML = ''; // Očisti trenutnu listu

        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name;

            // Dugme za pregled istorije
            const viewHistoryButton = document.createElement('button');
            viewHistoryButton.textContent = 'Pogledaj istoriju';
            viewHistoryButton.addEventListener('click', () => {
                window.location.href = `history.html?player=${encodeURIComponent(player.id)}`;
            });
            li.appendChild(viewHistoryButton);

            // Ako je korisnik prijavljen kao trener, dodaj dugme za brisanje
            if (user && user.email === 'kkradbrcko9@gmail.com') {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Obriši';
                deleteButton.addEventListener('click', async () => {
                    if (confirm(`Da li ste sigurni da želite da obrišete igrača ${player.name}?`)) {
                        // Brisanje igrača iz Firestore
                        await db.collection('players').doc(player.id).delete()
                            .then(() => {
                                alert('Igrač uspešno obrisan!');
                                loadPlayersAndStats(); // Ponovno učitavanje igrača
                            })
                            .catch((error) => {
                                alert('Greška prilikom brisanja igrača: ' + error.message);
                            });
                    }
                });
                li.appendChild(deleteButton);
            }

            playerList.appendChild(li);
        });
    }

    // Ažuriranje padajućeg menija za unos treninga
    function updatePlayerSelect(players) {
        const playerSelect = document.getElementById('player-select');
        playerSelect.innerHTML = '<option value="">Izaberite igrača</option>';

        players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = player.name;
            playerSelect.appendChild(option);
        });
    }

    // Dodavanje igrača
    const addPlayerForm = document.getElementById('add-player-form');
    addPlayerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const playerName = document.getElementById('player-name').value.trim();

        if (playerName) {
            const { error } = await db.collection('players').add({
                name: playerName,
                club_id: clubId // Povezivanje igrača s klubom
            });

            if (error) {
                alert('Greška prilikom dodavanja igrača: ' + error.message);
            } else {
                alert('Igrač uspešno dodat!');
                addPlayerForm.reset();
                loadPlayersAndStats(); // Ponovo učitajte igrače i statistike
            }
        } else {
            alert('Molimo unesite ime igrača.');
        }
    });

    // Dodavanje treninga
    const addTrainingForm = document.getElementById('add-training-form');
    addTrainingForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const playerId = document.getElementById('player-select').value;
        const throws = parseInt(document.getElementById('training-throws').value);
        const misses = parseInt(document.getElementById('training-misses').value);
        const date = document.getElementById('training-date').value;

        if (playerId && !isNaN(throws) && !isNaN(misses) && date) {
            const { error } = await db.collection('trainings').add({
                player_id: playerId,
                throws: throws,
                misses: misses,
                date: date
            });

            if (error) {
                alert('Greška prilikom dodavanja treninga: ' + error.message);
            } else {
                alert('Trening uspešno dodat!');
                addTrainingForm.reset();
                loadPlayersAndStats(); // Ponovo učitajte igrače i statistike
            }
        } else {
            alert('Molimo popunite sva polja ispravno.');
        }
    });

    // Dodavanje utakmice
    const addMatchForm = document.getElementById('add-match-form');
    const matchPlayersDiv = document.getElementById('match-players');
    const addPlayerToMatchButton = document.getElementById('add-player-to-match');

    let matchPlayerCount = 0;

    addPlayerToMatchButton.addEventListener('click', () => {
        if (matchPlayerCount < 6) {
            addPlayerToMatch();
            matchPlayerCount++;
        } else {
            alert('Možete dodati maksimalno 6 igrača.');
        }
    });

    function addPlayerToMatch() {
        const playerSelectClone = document.createElement('select');
        playerSelectClone.required = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Izaberite igrača';
        playerSelectClone.appendChild(defaultOption);

        // Popunite opcije
        const playerSelectOptions = document.getElementById('player-select').options;
        for (let i = 1; i < playerSelectOptions.length; i++) {
            const optionClone = playerSelectOptions[i].cloneNode(true);
            playerSelectClone.appendChild(optionClone);
        }

        const scoreInput = document.createElement('input');
        scoreInput.type = 'number';
        scoreInput.placeholder = 'Rezultat';
        scoreInput.min = 0;
        scoreInput.required = true;

        const playerDiv = document.createElement('div');
        playerDiv.appendChild(playerSelectClone);
        playerDiv.appendChild(scoreInput);
        matchPlayersDiv.appendChild(playerDiv);
    }

    addMatchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const date = document.getElementById('match-date').value;

        if (!date) {
            alert('Molimo izaberite datum utakmice.');
            return;
        }

        // Kreiranje nove utakmice
        const { id: matchId } = await db.collection('matches').add({
            club_id: clubId,
            date: date
        });

        // Prikupljanje rezultata igrača za utakmicu
        const matchPlayers = matchPlayersDiv.children;
        let matchResults = [];

        for (let i = 0; i < matchPlayers.length; i++) {
            const playerSelect = matchPlayers[i].querySelector('select');
            const scoreInput = matchPlayers[i].querySelector('input');

            const playerId = playerSelect.value;
            const score = parseInt(scoreInput.value);

            if (playerId && !isNaN(score)) {
                matchResults.push({ match_id: matchId, player_id: playerId, score: score });
            } else {
                alert('Molimo popunite sve podatke za igrače.');
                return;
            }
        }

        // Unos rezultata utakmice u Firestore
        const { error: resultsError } = await db.collection('match_results').add(matchResults);

        if (resultsError) {
            alert('Greška prilikom dodavanja rezultata utakmice: ' + resultsError.message);
        } else {
            alert('Utakmica uspešno dodata!');
            addMatchForm.reset();
            matchPlayersDiv.innerHTML = ''; // Očisti selekciju igrača
            matchPlayerCount = 0; // Resetuj brojač igrača
            loadPlayersAndStats(); // Osvježavanje statistike nakon dodavanja utakmice
        }
    });
});
