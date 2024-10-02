// club.js

// Vaš Supabase URL i Anon Public Key
const supabaseUrl = 'https://piykumcyaqnyxwndozhb.supabase.co'; // Vaš Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWt1bWN5YXFueXh3bmRvemhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2OTk2MTMsImV4cCI6MjA0MzI3NTYxM30.eqh0FPRGtqD3A9DLeJv6yZKXP6pnaygDTaaa2bgz3Xs'; // Ovdje ubacite vaš Anon Public Key

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    // Preuzimanje parametra 'club' iz URL-a
    const urlParams = new URLSearchParams(window.location.search);
    const clubName = urlParams.get('club');

    if (!clubName) {
        alert('Nije izabran klub.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('club-name').textContent = `Statistika za klub: ${clubName}`;

    // Učitavanje kluba iz baze podataka
    const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('name', clubName)
        .single();

    if (clubError || !club) {
        alert('Greška prilikom učitavanja kluba.');
        console.error(clubError);
        return;
    }

    const clubId = club.id;

    // Proveri da li je korisnik prijavljen
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Prikaži administratorske funkcije
        document.getElementById('add-player-section').classList.remove('hidden');
        document.getElementById('add-training-section').classList.remove('hidden');
        document.getElementById('add-match-section').classList.remove('hidden');
        document.getElementById('logoutButton').classList.remove('hidden');

        // Poveži dugme za odjavu
        document.getElementById('logoutButton').addEventListener('click', async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert('Greška prilikom odjave: ' + error.message);
            } else {
                window.location.reload();
            }
        });
    }

    // Učitaj igrače i statistike
    await loadPlayersAndStats();

    // Funkcija za učitavanje igrača i statistika
    async function loadPlayersAndStats() {
        // Učitavanje igrača
        const { data: players, error: playersError } = await supabase
            .from('players')
            .select('*')
            .eq('club_id', clubId);

        if (playersError) {
            console.error('Greška prilikom učitavanja igrača:', playersError);
            return;
        }

        // Ažuriranje liste igrača
        updatePlayerList(players);
        updatePlayerSelect(players);

        // Učitavanje statistike treninga
        const { data: trainingStats, error: trainingStatsError } = await supabase
            .from('trainings')
            .select('player_id, throws, misses')
            .in('player_id', players.map(p => p.id));

        if (trainingStatsError) {
            console.error('Greška prilikom učitavanja statistike treninga:', trainingStatsError);
            return;
        }

        // Učitavanje statistike utakmica
        const { data: matchStats, error: matchStatsError } = await supabase
            .from('match_results')
            .select('player_id, score')
            .in('player_id', players.map(p => p.id));

        if (matchStatsError) {
            console.error('Greška prilikom učitavanja statistike utakmica:', matchStatsError);
            return;
        }

        // Generisanje statistike treninga po igraču
        const trainingStatsByPlayer = {};
        trainingStats.forEach(stat => {
            if (!trainingStatsByPlayer[stat.player_id]) {
                trainingStatsByPlayer[stat.player_id] = {
                    totalThrows: 0,
                    totalMisses: 0,
                    trainingCount: 0,
                };
            }
            trainingStatsByPlayer[stat.player_id].totalThrows += stat.throws;
            trainingStatsByPlayer[stat.player_id].totalMisses += stat.misses;
            trainingStatsByPlayer[stat.player_id].trainingCount += 1;
        });

        // Generisanje statistike utakmica po igraču
        const matchStatsByPlayer = {};
        matchStats.forEach(stat => {
            if (!matchStatsByPlayer[stat.player_id]) {
                matchStatsByPlayer[stat.player_id] = {
                    totalScore: 0,
                    matchCount: 0,
                };
            }
            matchStatsByPlayer[stat.player_id].totalScore += stat.score;
            matchStatsByPlayer[stat.player_id].matchCount += 1;
        });

        // Ažuriranje tabela sa statistikom
        updateTrainingStatsTable(players, trainingStatsByPlayer);
        updateMatchStatsTable(players, matchStatsByPlayer);
    }

    // Funkcija za ažuriranje tabele statistike treninga
    function updateTrainingStatsTable(players, trainingStatsByPlayer) {
        const trainingStatsTableBody = document.querySelector('#training-stats-table tbody');
        trainingStatsTableBody.innerHTML = '';

        players.forEach(player => {
            const stats = trainingStatsByPlayer[player.id];
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${player.name}</td>
                <td>${stats ? stats.trainingCount : 0}</td>
                <td>${stats && stats.trainingCount > 0 ? (stats.totalThrows / stats.trainingCount).toFixed(2) : 0}</td>
                <td>${stats && stats.trainingCount > 0 ? (stats.totalMisses / stats.trainingCount).toFixed(2) : 0}</td>
            `;
            trainingStatsTableBody.appendChild(tr);
        });
    }

    // Funkcija za ažuriranje tabele statistike utakmica
    function updateMatchStatsTable(players, matchStatsByPlayer) {
        const matchStatsTableBody = document.querySelector('#match-stats-table tbody');
        matchStatsTableBody.innerHTML = '';

        players.forEach(player => {
            const stats = matchStatsByPlayer[player.id];
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${player.name}</td>
                <td>${stats ? stats.matchCount : 0}</td>
                <td>${stats && stats.matchCount > 0 ? (stats.totalScore / stats.matchCount).toFixed(2) : 0}</td>
            `;
            matchStatsTableBody.appendChild(tr);
        });
    }

    // Ostatak koda ostaje isti kao prethodno
    // ...

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

            // Ako je korisnik prijavljen, dodaj dugme za brisanje
            if (user) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Obriši';
                deleteButton.addEventListener('click', async () => {
                    if (confirm(`Da li ste sigurni da želite da obrišete igrača ${player.name}?`)) {
                        const { error } = await supabase
                            .from('players')
                            .delete()
                            .eq('id', player.id);

                        if (error) {
                            alert('Greška prilikom brisanja igrača: ' + error.message);
                        } else {
                            alert('Igrač uspešno obrisan!');
                            loadPlayersAndStats();
                        }
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
            const { error } = await supabase
                .from('players')
                .insert([{ name: playerName, club_id: clubId }]);

            if (error) {
                alert('Greška prilikom dodavanja igrača: ' + error.message);
            } else {
                alert('Igrač uspešno dodat!');
                addPlayerForm.reset();
                loadPlayersAndStats();
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
            const { error } = await supabase
                .from('trainings')
                .insert([{ player_id: playerId, throws: throws, misses: misses, date: date }]);

            if (error) {
                alert('Greška prilikom dodavanja treninga: ' + error.message);
            } else {
                alert('Trening uspešno dodat!');
                addTrainingForm.reset();
                loadPlayersAndStats();
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

        // Kreiranje utakmice
        const { data: matchData, error: matchError } = await supabase
            .from('matches')
            .insert([{ club_id: clubId, date: date }])
            .select();

        if (matchError) {
            alert('Greška prilikom dodavanja utakmice: ' + matchError.message);
            return;
        }

        const matchId = matchData[0].id;

        // Prikupljanje rezultata igrača
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

        // Unos rezultata utakmice
        const { error: resultsError } = await supabase
            .from('match_results')
            .insert(matchResults);

        if (resultsError) {
            alert('Greška prilikom dodavanja rezultata utakmice: ' + resultsError.message);
        } else {
            alert('Utakmica uspešno dodata!');
            addMatchForm.reset();
            matchPlayersDiv.innerHTML = '';
            matchPlayerCount = 0;
            loadPlayersAndStats();
        }
    });
});
