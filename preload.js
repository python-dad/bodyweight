/**
 * BodyTracker - Preload Script
 * Exposes safe APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Entries
    getEntries: () => ipcRenderer.invoke('get-entries'),
    saveEntries: (entries) => ipcRenderer.invoke('save-entries', entries),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

    // Images
    saveImage: (id, data) => ipcRenderer.invoke('save-image', { id, data }),
    getImage: (id) => ipcRenderer.invoke('get-image', id),
    deleteImage: (id) => ipcRenderer.invoke('delete-image', id),

    // Data management
    clearAllData: () => ipcRenderer.invoke('clear-all-data'),
    getDataPath: () => ipcRenderer.invoke('get-data-path'),
    exportData: () => ipcRenderer.invoke('export-data'),
    importData: (data) => ipcRenderer.invoke('import-data', data),

    // Check if running in Electron
    isElectron: true
});
