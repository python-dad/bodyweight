/**
 * BodyTracker Storage Module
 * Handles all data persistence
 * - In Electron: Uses file system via IPC
 * - In Browser: Falls back to IndexedDB/localStorage
 */

const Storage = (function() {
    // Check if running in Electron
    const isElectron = window.electronAPI && window.electronAPI.isElectron;

    // Browser fallback constants
    const DB_NAME = 'BodyTrackerDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'images';
    const ENTRIES_KEY = 'bodytracker_entries';
    const SETTINGS_KEY = 'bodytracker_settings';

    let db = null;
    let entriesCache = null;
    let settingsCache = null;

    /**
     * Initialize storage
     */
    async function init() {
        if (isElectron) {
            // Load initial data from files
            entriesCache = await window.electronAPI.getEntries();
            settingsCache = await window.electronAPI.getSettings();
            console.log('Storage initialized (Electron mode) - Data path:', await window.electronAPI.getDataPath());
        } else {
            // Initialize IndexedDB for browser fallback
            await initDB();
            console.log('Storage initialized (Browser mode)');
        }
    }

    /**
     * Initialize IndexedDB for image storage (browser fallback)
     */
    async function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Generate UUID
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Get all entries
     */
    function getEntries() {
        if (isElectron) {
            return entriesCache || [];
        }
        const data = localStorage.getItem(ENTRIES_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Save entries
     */
    async function saveEntries(entries) {
        if (isElectron) {
            entriesCache = entries;
            await window.electronAPI.saveEntries(entries);
        } else {
            localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
        }
    }

    /**
     * Calculate body fat percentage using Jackson/Pollock 3-site formula
     */
    function calculateBodyFat(gender, age, skinfolds) {
        if (!gender || !age || !skinfolds) return null;

        let sumOfFolds;
        let bodyDensity;

        if (gender === 'male') {
            if (!skinfolds.chest || !skinfolds.abdomen || !skinfolds.thigh) return null;
            sumOfFolds = parseFloat(skinfolds.chest) + parseFloat(skinfolds.abdomen) + parseFloat(skinfolds.thigh);
            bodyDensity = 1.10938 - (0.0008267 * sumOfFolds) + (0.0000016 * Math.pow(sumOfFolds, 2)) - (0.0002574 * age);
        } else {
            if (!skinfolds.triceps || !skinfolds.suprailiac || !skinfolds.thigh) return null;
            sumOfFolds = parseFloat(skinfolds.triceps) + parseFloat(skinfolds.suprailiac) + parseFloat(skinfolds.thigh);
            bodyDensity = 1.0994921 - (0.0009929 * sumOfFolds) + (0.0000023 * Math.pow(sumOfFolds, 2)) - (0.0001392 * age);
        }

        const bodyFatPercent = ((495 / bodyDensity) - 450);
        return Math.max(3, Math.min(60, Math.round(bodyFatPercent * 10) / 10));
    }

    /**
     * Add a new entry
     */
    async function addEntry(entry) {
        const entries = getEntries();

        let calculatedBodyFat = entry.bodyFat ? parseFloat(entry.bodyFat) : null;
        if (entry.skinfolds && entry.gender && entry.age) {
            const calculated = calculateBodyFat(entry.gender, entry.age, entry.skinfolds);
            if (calculated !== null) {
                calculatedBodyFat = calculated;
            }
        }

        const newEntry = {
            id: generateUUID(),
            date: entry.date,
            weight: parseFloat(entry.weight),
            bodyFat: calculatedBodyFat,
            gender: entry.gender || null,
            age: entry.age ? parseInt(entry.age) : null,
            skinfolds: entry.skinfolds || null,
            notes: entry.notes || '',
            images: [],
            createdAt: new Date().toISOString()
        };

        // Store images
        if (entry.imageFiles && entry.imageFiles.length > 0) {
            const imageIds = [];
            for (const file of entry.imageFiles) {
                const imageId = generateUUID();
                const imageData = await processImage(file);
                await saveImage(imageId, imageData);
                imageIds.push(imageId);
            }
            newEntry.images = imageIds;
        }

        entries.push(newEntry);
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        await saveEntries(entries);
        return newEntry;
    }

    /**
     * Update an existing entry
     */
    async function updateEntry(id, updates) {
        const entries = getEntries();
        const index = entries.findIndex(e => e.id === id);

        if (index === -1) {
            throw new Error('Entry not found');
        }

        let calculatedBodyFat = updates.bodyFat ? parseFloat(updates.bodyFat) : entries[index].bodyFat;
        if (updates.skinfolds && updates.gender && updates.age) {
            const calculated = calculateBodyFat(updates.gender, updates.age, updates.skinfolds);
            if (calculated !== null) {
                calculatedBodyFat = calculated;
            }
        }

        entries[index] = {
            ...entries[index],
            ...updates,
            weight: updates.weight ? parseFloat(updates.weight) : entries[index].weight,
            bodyFat: calculatedBodyFat,
            gender: updates.gender !== undefined ? updates.gender : entries[index].gender,
            age: updates.age !== undefined ? (updates.age ? parseInt(updates.age) : null) : entries[index].age,
            skinfolds: updates.skinfolds !== undefined ? updates.skinfolds : entries[index].skinfolds
        };

        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        await saveEntries(entries);
        return entries[index];
    }

    /**
     * Delete an entry
     */
    async function deleteEntry(id) {
        const entries = getEntries();
        const entry = entries.find(e => e.id === id);

        if (entry && entry.images) {
            for (const imageId of entry.images) {
                await deleteImage(imageId);
            }
        }

        const filtered = entries.filter(e => e.id !== id);
        await saveEntries(filtered);
    }

    /**
     * Get entry by ID
     */
    function getEntryById(id) {
        const entries = getEntries();
        return entries.find(e => e.id === id);
    }

    /**
     * Get entries within date range
     */
    function getEntriesByDateRange(startDate, endDate) {
        const entries = getEntries();
        return entries.filter(entry => {
            const date = new Date(entry.date);
            return date >= startDate && date <= endDate;
        });
    }

    /**
     * Search entries by notes
     */
    function searchEntries(query) {
        const entries = getEntries();
        const lowerQuery = query.toLowerCase();
        return entries.filter(entry =>
            entry.notes && entry.notes.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Process and compress image
     */
    async function processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const maxSize = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const thumbCanvas = document.createElement('canvas');
                    const thumbCtx = thumbCanvas.getContext('2d');
                    const thumbSize = 150;
                    const thumbRatio = Math.min(thumbSize / width, thumbSize / height);
                    thumbCanvas.width = width * thumbRatio;
                    thumbCanvas.height = height * thumbRatio;
                    thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);

                    resolve({
                        full: canvas.toDataURL('image/jpeg', 0.8),
                        thumbnail: thumbCanvas.toDataURL('image/jpeg', 0.6),
                        originalName: file.name
                    });
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Save image
     */
    async function saveImage(id, imageData) {
        if (isElectron) {
            await window.electronAPI.saveImage(id, imageData);
        } else {
            return new Promise((resolve, reject) => {
                if (!db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put({ id, ...imageData });
                request.onsuccess = () => resolve(id);
                request.onerror = () => reject(request.error);
            });
        }
    }

    /**
     * Get image
     */
    async function getImage(id) {
        if (isElectron) {
            return await window.electronAPI.getImage(id);
        } else {
            return new Promise((resolve, reject) => {
                if (!db) {
                    reject(new Error('Database not initialized'));
                    return;
                }
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
    }

    /**
     * Delete image
     */
    async function deleteImage(id) {
        if (isElectron) {
            await window.electronAPI.deleteImage(id);
        } else {
            return new Promise((resolve, reject) => {
                if (!db) {
                    resolve();
                    return;
                }
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }

    /**
     * Get settings
     */
    function getSettings() {
        if (isElectron) {
            return settingsCache || {
                goalWeight: null,
                goalBodyFat: null,
                theme: 'light'
            };
        }
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : {
            goalWeight: null,
            goalBodyFat: null,
            theme: 'light'
        };
    }

    /**
     * Save settings
     */
    async function saveSettings(settings) {
        const current = getSettings();
        const updated = { ...current, ...settings };

        if (isElectron) {
            settingsCache = updated;
            await window.electronAPI.saveSettings(updated);
        } else {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
        }
        return updated;
    }

    /**
     * Export all data as JSON
     */
    async function exportData() {
        if (isElectron) {
            return await window.electronAPI.exportData();
        }

        const entries = getEntries();
        const settings = getSettings();

        const entriesWithImages = await Promise.all(entries.map(async (entry) => {
            if (entry.images && entry.images.length > 0) {
                const images = await Promise.all(entry.images.map(id => getImage(id)));
                return { ...entry, imageData: images };
            }
            return entry;
        }));

        return {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            entries: entriesWithImages,
            settings
        };
    }

    /**
     * Import data from JSON
     */
    async function importData(data) {
        if (!data.entries || !Array.isArray(data.entries)) {
            throw new Error('Invalid data format');
        }

        if (isElectron) {
            await window.electronAPI.importData(data);
            // Refresh cache
            entriesCache = await window.electronAPI.getEntries();
            settingsCache = await window.electronAPI.getSettings();
            return;
        }

        // Browser fallback
        await clearAllData();

        for (const entry of data.entries) {
            const imageIds = [];

            if (entry.imageData && entry.imageData.length > 0) {
                for (const imgData of entry.imageData) {
                    const imageId = generateUUID();
                    await saveImage(imageId, {
                        full: imgData.full,
                        thumbnail: imgData.thumbnail,
                        originalName: imgData.originalName
                    });
                    imageIds.push(imageId);
                }
            }

            const cleanEntry = {
                id: entry.id || generateUUID(),
                date: entry.date,
                weight: entry.weight,
                bodyFat: entry.bodyFat,
                gender: entry.gender || null,
                age: entry.age || null,
                skinfolds: entry.skinfolds || null,
                notes: entry.notes,
                images: imageIds,
                createdAt: entry.createdAt || new Date().toISOString()
            };

            const entries = getEntries();
            entries.push(cleanEntry);
            await saveEntries(entries);
        }

        if (data.settings) {
            await saveSettings(data.settings);
        }
    }

    /**
     * Export data as CSV
     */
    function exportCSV() {
        const entries = getEntries();
        const headers = ['Datum', 'Gewicht (kg)', 'Körperfett (%)', 'Geschlecht', 'Alter', 'Brust (mm)', 'Bauch (mm)', 'Trizeps (mm)', 'Hüfte (mm)', 'Oberschenkel (mm)', 'Notizen'];
        const rows = entries.map(e => {
            const sf = e.skinfolds || {};
            return [
                new Date(e.date).toLocaleString('de-DE'),
                e.weight,
                e.bodyFat || '',
                e.gender === 'male' ? 'Männlich' : (e.gender === 'female' ? 'Weiblich' : ''),
                e.age || '',
                sf.chest || '',
                sf.abdomen || '',
                sf.triceps || '',
                sf.suprailiac || '',
                sf.thigh || '',
                `"${(e.notes || '').replace(/"/g, '""')}"`
            ];
        });

        return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    }

    /**
     * Clear all data
     */
    async function clearAllData() {
        if (isElectron) {
            await window.electronAPI.clearAllData();
            entriesCache = [];
            settingsCache = {};
        } else {
            localStorage.removeItem(ENTRIES_KEY);
            localStorage.removeItem(SETTINGS_KEY);

            if (db) {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.clear();
            }
        }
    }

    /**
     * Get statistics for a given time range
     */
    function getStatistics(range = 'all') {
        const entries = getEntries();

        if (entries.length === 0) {
            return null;
        }

        const now = new Date();
        let startDate;

        switch (range) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                startDate = new Date(0);
        }

        const filteredEntries = entries.filter(e => new Date(e.date) >= startDate);

        if (filteredEntries.length === 0) {
            return null;
        }

        const sortedByDate = [...filteredEntries].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        const latestEntry = sortedByDate[sortedByDate.length - 1];
        const firstEntry = sortedByDate[0];

        const weights = filteredEntries.map(e => e.weight);
        const bodyFats = filteredEntries.filter(e => e.bodyFat).map(e => e.bodyFat);

        return {
            currentWeight: latestEntry.weight,
            currentBodyFat: latestEntry.bodyFat,
            weightChange: latestEntry.weight - firstEntry.weight,
            bodyFatChange: (latestEntry.bodyFat && firstEntry.bodyFat)
                ? latestEntry.bodyFat - firstEntry.bodyFat
                : null,
            minWeight: Math.min(...weights),
            maxWeight: Math.max(...weights),
            avgWeight: weights.reduce((a, b) => a + b, 0) / weights.length,
            minBodyFat: bodyFats.length > 0 ? Math.min(...bodyFats) : null,
            maxBodyFat: bodyFats.length > 0 ? Math.max(...bodyFats) : null,
            avgBodyFat: bodyFats.length > 0
                ? bodyFats.reduce((a, b) => a + b, 0) / bodyFats.length
                : null,
            totalEntries: filteredEntries.length,
            lastEntryDate: latestEntry.date,
            entries: sortedByDate
        };
    }

    // Public API
    return {
        init,
        getEntries,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntryById,
        getEntriesByDateRange,
        searchEntries,
        getImage,
        getSettings,
        saveSettings,
        exportData,
        importData,
        exportCSV,
        clearAllData,
        getStatistics,
        calculateBodyFat
    };
})();
