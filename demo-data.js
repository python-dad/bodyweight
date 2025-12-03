/**
 * Demo Data Generator for BodyTracker
 * Now includes Jackson/Pollock caliper measurements
 *
 * Run this script in the browser console to populate the app with sample data.
 * To use: Open index.html in browser, open Developer Console (F12), paste and run this code.
 */

(function generateDemoData() {
    // Generate 60 days of sample data
    const entries = [];
    const now = new Date();

    // Starting values
    let weight = 82.5;

    // Caliper starting values (in mm)
    const gender = 'male'; // Demo uses male measurements
    const age = 35;

    // Starting skinfold values
    let chest = 15;
    let abdomen = 25;
    let thigh = 18;

    for (let i = 60; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(7, 30, 0, 0); // Morning measurement

        // Add some realistic variation
        const weightVariation = (Math.random() - 0.5) * 0.8;

        // Skinfold variations (smaller changes)
        const chestVariation = (Math.random() - 0.5) * 1;
        const abdomenVariation = (Math.random() - 0.5) * 1.5;
        const thighVariation = (Math.random() - 0.5) * 1;

        // General downward trend
        weight = Math.max(70, weight - 0.05 + weightVariation);
        chest = Math.max(5, chest - 0.02 + chestVariation);
        abdomen = Math.max(8, abdomen - 0.03 + abdomenVariation);
        thigh = Math.max(5, thigh - 0.02 + thighVariation);

        // Skip some days randomly (not measuring every day)
        if (Math.random() > 0.7) continue;

        // Calculate body fat using Jackson/Pollock formula
        const sumOfFolds = chest + abdomen + thigh;
        const bodyDensity = 1.10938 - (0.0008267 * sumOfFolds) + (0.0000016 * Math.pow(sumOfFolds, 2)) - (0.0002574 * age);
        const bodyFat = Math.max(3, Math.min(60, Math.round(((495 / bodyDensity) - 450) * 10) / 10));

        const entry = {
            id: crypto.randomUUID ? crypto.randomUUID() : 'demo-' + Date.now() + '-' + i,
            date: date.toISOString(),
            weight: Math.round(weight * 10) / 10,
            bodyFat: bodyFat,
            gender: gender,
            age: age,
            skinfolds: {
                chest: Math.round(chest * 10) / 10,
                abdomen: Math.round(abdomen * 10) / 10,
                thigh: Math.round(thigh * 10) / 10
            },
            notes: getRandomNote(),
            images: [],
            createdAt: date.toISOString()
        };

        entries.push(entry);
    }

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Save to localStorage
    localStorage.setItem('bodytracker_entries', JSON.stringify(entries));

    // Set some goals and default preferences
    localStorage.setItem('bodytracker_settings', JSON.stringify({
        goalWeight: 75.0,
        goalBodyFat: 15.0,
        theme: 'light',
        defaultGender: 'male',
        defaultAge: 35
    }));

    console.log(`Demo data generated: ${entries.length} entries with Jackson/Pollock caliper data`);
    console.log('Reload the page to see the data.');

    // Helper function for random notes
    function getRandomNote() {
        const notes = [
            '',
            '',
            '',
            'Nuchtern gemessen',
            'Nach dem Training',
            'Viel Wasser getrunken',
            'Wenig Schlaf',
            'Cheat Day gestern',
            'Gutes Gefuhl heute',
            'Leicht mude',
            'Nach dem Fruhstuck',
            'Vor dem Gym',
            '3x gemessen, Durchschnitt',
            'Messung vor dem Cardio'
        ];
        return notes[Math.floor(Math.random() * notes.length)];
    }

    return entries.length;
})();
