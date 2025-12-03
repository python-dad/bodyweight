/**
 * BodyTracker - Electron Main Process
 * Handles window creation and file system operations
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Data directory in user's app data folder
const userDataPath = app.getPath('userData');
const dataDir = path.join(userDataPath, 'data');
const entriesFile = path.join(dataDir, 'entries.json');
const settingsFile = path.join(dataDir, 'settings.json');
const imagesDir = path.join(dataDir, 'images');

let mainWindow;

/**
 * Create the main application window
 */
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1400,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
}

/**
 * Ensure data directories exist
 */
function ensureDataDirectories() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }
}

/**
 * Read JSON file safely
 */
function readJsonFile(filePath, defaultValue = null) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
    return defaultValue;
}

/**
 * Write JSON file safely
 */
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// App ready
app.whenReady().then(() => {
    ensureDataDirectories();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ============================================
// IPC Handlers for File System Operations
// ============================================

// Get all entries
ipcMain.handle('get-entries', () => {
    return readJsonFile(entriesFile, []);
});

// Save all entries
ipcMain.handle('save-entries', (event, entries) => {
    return writeJsonFile(entriesFile, entries);
});

// Get settings
ipcMain.handle('get-settings', () => {
    return readJsonFile(settingsFile, {});
});

// Save settings
ipcMain.handle('save-settings', (event, settings) => {
    return writeJsonFile(settingsFile, settings);
});

// Save image
ipcMain.handle('save-image', (event, { id, data }) => {
    try {
        const imagePath = path.join(imagesDir, `${id}.json`);
        fs.writeFileSync(imagePath, JSON.stringify(data), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving image:', error);
        return false;
    }
});

// Get image
ipcMain.handle('get-image', (event, id) => {
    try {
        const imagePath = path.join(imagesDir, `${id}.json`);
        if (fs.existsSync(imagePath)) {
            const data = fs.readFileSync(imagePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading image:', error);
    }
    return null;
});

// Delete image
ipcMain.handle('delete-image', (event, id) => {
    try {
        const imagePath = path.join(imagesDir, `${id}.json`);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
});

// Clear all data
ipcMain.handle('clear-all-data', () => {
    try {
        // Delete entries file
        if (fs.existsSync(entriesFile)) {
            fs.unlinkSync(entriesFile);
        }
        // Delete all images
        if (fs.existsSync(imagesDir)) {
            const files = fs.readdirSync(imagesDir);
            files.forEach(file => {
                fs.unlinkSync(path.join(imagesDir, file));
            });
        }
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
});

// Get data path (for debugging/info)
ipcMain.handle('get-data-path', () => {
    return dataDir;
});

// Export data (get full export object)
ipcMain.handle('export-data', () => {
    const entries = readJsonFile(entriesFile, []);
    const settings = readJsonFile(settingsFile, {});

    // Collect all images
    const images = {};
    if (fs.existsSync(imagesDir)) {
        const files = fs.readdirSync(imagesDir);
        files.forEach(file => {
            const id = path.basename(file, '.json');
            const imagePath = path.join(imagesDir, file);
            try {
                const data = fs.readFileSync(imagePath, 'utf8');
                images[id] = JSON.parse(data);
            } catch (e) {
                console.error(`Error reading image ${file}:`, e);
            }
        });
    }

    return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        entries,
        settings,
        images
    };
});

// Import data
ipcMain.handle('import-data', (event, data) => {
    try {
        // Import entries
        if (data.entries) {
            writeJsonFile(entriesFile, data.entries);
        }

        // Import settings
        if (data.settings) {
            writeJsonFile(settingsFile, data.settings);
        }

        // Import images
        if (data.images) {
            Object.entries(data.images).forEach(([id, imageData]) => {
                const imagePath = path.join(imagesDir, `${id}.json`);
                fs.writeFileSync(imagePath, JSON.stringify(imageData), 'utf8');
            });
        }

        return true;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
});
