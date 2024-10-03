// history.js
const supabaseUrl = 'https://piykumcyaqnyxwndozhb.supabase.co'; // Vaš Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeWt1bWN5YXFueXh3bmRvemhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2OTk2MTMsImV4cCI6MjA0MzI3NTYxM30.eqh0FPRGtqD3A9DLeJv6yZKXP6pnaygDTaaa2bgz3Xs'; // Ovdje ubacite vaš Anon Public Key

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const playerId = urlParams.get('player');

    if (!playerId) {
        alert('Nije izabran igrač.');
        window.history.back();
        return;
    }

    const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

    if (playerError || !player) {
        alert('Greška prilikom učitavanja igrača.');
        console.error(playerError);
        return;
    }

    document.getElementById('player-name').textContent = `Istorija igrača: ${player.name}`;

    const { data: trainings, error: trainingsError } = await supabase
        .from('trainings')
        .select('*')
        .eq('player_id', playerId)
        .order('date', { ascending: true });

    if (trainingsError) {
        alert('Greška prilikom učitavanja treninga.');
        console.error(trainingsError);
        return;
    }

    const dates = trainings.map(t => t.date);
    const throws = trainings.map(t => t.throws);
    const misses = trainings.map(t => t.misses);

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
