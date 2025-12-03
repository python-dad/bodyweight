/**
 * BodyTracker Main Application
 * Handles UI interactions, navigation, and application logic
 */

const App = (function() {
    // DOM Elements
    let elements = {};
    let currentRange = 'month';
    let currentPage = 1;
    const entriesPerPage = 10;
    let selectedImages = [];
    let currentImageIndex = 0;
    let modalImages = [];

    /**
     * Initialize the application
     */
    async function init() {
        await Storage.init();
        cacheElements();
        bindEvents();
        initTheme();
        setDefaultDate();
        updateDashboard();
        showView('dashboard');
    }

    /**
     * Cache DOM elements for better performance
     */
    function cacheElements() {
        elements = {
            // Navigation
            navButtons: document.querySelectorAll('.nav-btn'),
            views: document.querySelectorAll('.view'),
            themeToggle: document.getElementById('themeToggle'),

            // Dashboard
            currentWeight: document.getElementById('currentWeight'),
            currentBodyFat: document.getElementById('currentBodyFat'),
            weightChange: document.getElementById('weightChange'),
            bodyFatChange: document.getElementById('bodyFatChange'),
            totalWeightChange: document.getElementById('totalWeightChange'),
            periodLabel: document.getElementById('periodLabel'),
            totalEntries: document.getElementById('totalEntries'),
            lastEntryDate: document.getElementById('lastEntryDate'),
            recentEntriesList: document.getElementById('recentEntriesList'),
            filterButtons: document.querySelectorAll('.filter-btn'),

            // Entry Form
            entryForm: document.getElementById('entryForm'),
            measureDate: document.getElementById('measureDate'),
            weight: document.getElementById('weight'),
            bodyFat: document.getElementById('bodyFat'),
            notes: document.getElementById('notes'),
            imageInput: document.getElementById('imageInput'),
            imageUploadArea: document.getElementById('imageUploadArea'),
            imagePreview: document.getElementById('imagePreview'),
            clearForm: document.getElementById('clearForm'),

            // Caliper Entry Fields
            useCaliperToggle: document.getElementById('useCaliperToggle'),
            caliperFields: document.getElementById('caliperFields'),
            manualBodyFat: document.getElementById('manualBodyFat'),
            gender: document.getElementById('gender'),
            age: document.getElementById('age'),
            maleFields: document.getElementById('maleFields'),
            femaleFields: document.getElementById('femaleFields'),
            skinfoldChest: document.getElementById('skinfoldChest'),
            skinfoldAbdomen: document.getElementById('skinfoldAbdomen'),
            skinfoldThighMale: document.getElementById('skinfoldThighMale'),
            skinfoldTriceps: document.getElementById('skinfoldTriceps'),
            skinfoldSuprailiac: document.getElementById('skinfoldSuprailiac'),
            skinfoldThighFemale: document.getElementById('skinfoldThighFemale'),
            calculatedBodyFat: document.getElementById('calculatedBodyFat'),
            calculatedValue: document.getElementById('calculatedValue'),
            measurementIllustration: document.getElementById('measurementIllustration'),

            // History
            historyTableBody: document.getElementById('historyTableBody'),
            searchInput: document.getElementById('searchInput'),
            filterDateFrom: document.getElementById('filterDateFrom'),
            filterDateTo: document.getElementById('filterDateTo'),
            applyFilter: document.getElementById('applyFilter'),
            clearFilter: document.getElementById('clearFilter'),
            pagination: document.getElementById('pagination'),

            // Settings
            goalWeight: document.getElementById('goalWeight'),
            goalBodyFat: document.getElementById('goalBodyFat'),
            saveGoals: document.getElementById('saveGoals'),
            exportJSON: document.getElementById('exportJSON'),
            exportCSV: document.getElementById('exportCSV'),
            exportPDF: document.getElementById('exportPDF'),
            importFile: document.getElementById('importFile'),
            deleteAllData: document.getElementById('deleteAllData'),

            // Modals
            caliperModal: document.getElementById('caliperModal'),
            caliperHelp: document.getElementById('caliperHelp'),
            closeCaliperModal: document.getElementById('closeCaliperModal'),
            imageModal: document.getElementById('imageModal'),
            closeImageModal: document.getElementById('closeImageModal'),
            modalImage: document.getElementById('modalImage'),
            prevImage: document.getElementById('prevImage'),
            nextImage: document.getElementById('nextImage'),
            imageCounter: document.getElementById('imageCounter'),
            editModal: document.getElementById('editModal'),
            closeEditModal: document.getElementById('closeEditModal'),
            editForm: document.getElementById('editForm'),
            cancelEdit: document.getElementById('cancelEdit'),
            confirmModal: document.getElementById('confirmModal'),
            confirmCancel: document.getElementById('confirmCancel'),
            confirmOk: document.getElementById('confirmOk'),
            confirmTitle: document.getElementById('confirmTitle'),
            confirmMessage: document.getElementById('confirmMessage'),

            // Edit Modal Caliper Fields
            editUseCaliperToggle: document.getElementById('editUseCaliperToggle'),
            editCaliperFields: document.getElementById('editCaliperFields'),
            editManualBodyFat: document.getElementById('editManualBodyFat'),
            editGender: document.getElementById('editGender'),
            editAge: document.getElementById('editAge'),
            editMaleFields: document.getElementById('editMaleFields'),
            editFemaleFields: document.getElementById('editFemaleFields'),
            editSkinfoldChest: document.getElementById('editSkinfoldChest'),
            editSkinfoldAbdomen: document.getElementById('editSkinfoldAbdomen'),
            editSkinfoldThighMale: document.getElementById('editSkinfoldThighMale'),
            editSkinfoldTriceps: document.getElementById('editSkinfoldTriceps'),
            editSkinfoldSuprailiac: document.getElementById('editSkinfoldSuprailiac'),
            editSkinfoldThighFemale: document.getElementById('editSkinfoldThighFemale'),
            editCalculatedBodyFat: document.getElementById('editCalculatedBodyFat'),
            editCalculatedValue: document.getElementById('editCalculatedValue'),

            // Toast
            toastContainer: document.getElementById('toastContainer')
        };
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Navigation
        elements.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                showView(view);
            });
        });

        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);

        // Time range filter
        elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentRange = btn.dataset.range;
                updateDashboard();
            });
        });

        // Entry form
        elements.entryForm.addEventListener('submit', handleEntrySubmit);
        elements.clearForm.addEventListener('click', resetEntryForm);

        // Image upload
        elements.imageUploadArea.addEventListener('click', () => elements.imageInput.click());
        elements.imageInput.addEventListener('change', handleImageSelect);
        elements.imageUploadArea.addEventListener('dragover', handleDragOver);
        elements.imageUploadArea.addEventListener('dragleave', handleDragLeave);
        elements.imageUploadArea.addEventListener('drop', handleDrop);

        // History search and filter
        elements.searchInput.addEventListener('input', debounce(loadHistory, 300));
        elements.applyFilter.addEventListener('click', loadHistory);
        elements.clearFilter.addEventListener('click', () => {
            elements.filterDateFrom.value = '';
            elements.filterDateTo.value = '';
            elements.searchInput.value = '';
            loadHistory();
        });

        // Settings
        elements.saveGoals.addEventListener('click', saveGoals);
        elements.exportJSON.addEventListener('click', exportJSON);
        elements.exportCSV.addEventListener('click', exportCSV);
        elements.exportPDF.addEventListener('click', exportPDF);
        elements.importFile.addEventListener('change', importData);
        elements.deleteAllData.addEventListener('click', confirmDeleteAll);

        // Modals
        elements.caliperHelp.addEventListener('click', () => openModal('caliperModal'));
        elements.closeCaliperModal.addEventListener('click', () => closeModal('caliperModal'));
        elements.closeImageModal.addEventListener('click', () => closeModal('imageModal'));
        elements.closeEditModal.addEventListener('click', () => closeModal('editModal'));
        elements.cancelEdit.addEventListener('click', () => closeModal('editModal'));
        elements.confirmCancel.addEventListener('click', () => closeModal('confirmModal'));
        elements.prevImage.addEventListener('click', showPrevImage);
        elements.nextImage.addEventListener('click', showNextImage);
        elements.editForm.addEventListener('submit', handleEditSubmit);

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);

        // Caliper toggle and fields
        elements.useCaliperToggle.addEventListener('change', toggleCaliperFields);
        elements.gender.addEventListener('change', updateGenderFields);
        elements.age.addEventListener('input', calculateAndDisplayBodyFat);
        elements.skinfoldChest.addEventListener('input', calculateAndDisplayBodyFat);
        elements.skinfoldAbdomen.addEventListener('input', calculateAndDisplayBodyFat);
        elements.skinfoldThighMale.addEventListener('input', calculateAndDisplayBodyFat);
        elements.skinfoldTriceps.addEventListener('input', calculateAndDisplayBodyFat);
        elements.skinfoldSuprailiac.addEventListener('input', calculateAndDisplayBodyFat);
        elements.skinfoldThighFemale.addEventListener('input', calculateAndDisplayBodyFat);

        // Edit Modal Caliper Events
        elements.editUseCaliperToggle.addEventListener('change', toggleEditCaliperFields);
        elements.editGender.addEventListener('change', updateEditGenderFields);
        elements.editAge.addEventListener('input', calculateAndDisplayEditBodyFat);
        elements.editSkinfoldChest.addEventListener('input', calculateAndDisplayEditBodyFat);
        elements.editSkinfoldAbdomen.addEventListener('input', calculateAndDisplayEditBodyFat);
        elements.editSkinfoldThighMale.addEventListener('input', calculateAndDisplayEditBodyFat);
        elements.editSkinfoldTriceps.addEventListener('input', calculateAndDisplayEditBodyFat);
        elements.editSkinfoldSuprailiac.addEventListener('input', calculateAndDisplayEditBodyFat);
        elements.editSkinfoldThighFemale.addEventListener('input', calculateAndDisplayEditBodyFat);

        // Load saved user preferences
        loadUserPreferences();
    }

    /**
     * Toggle caliper fields visibility
     */
    function toggleCaliperFields() {
        const useCaliper = elements.useCaliperToggle.checked;
        elements.caliperFields.style.display = useCaliper ? 'block' : 'none';
        elements.manualBodyFat.style.display = useCaliper ? 'none' : 'block';

        if (useCaliper) {
            updateGenderFields();
        }
    }

    /**
     * Update gender-specific fields
     */
    function updateGenderFields() {
        const gender = elements.gender.value;
        elements.maleFields.style.display = gender === 'male' ? 'block' : 'none';
        elements.femaleFields.style.display = gender === 'female' ? 'block' : 'none';

        // Show illustration when gender is selected
        elements.measurementIllustration.style.display = gender ? 'block' : 'none';

        calculateAndDisplayBodyFat();
    }

    /**
     * Calculate and display body fat in entry form
     */
    function calculateAndDisplayBodyFat() {
        const gender = elements.gender.value;
        const age = elements.age.value;

        if (!gender || !age) {
            elements.calculatedBodyFat.style.display = 'none';
            return;
        }

        let skinfolds = {};
        if (gender === 'male') {
            skinfolds = {
                chest: elements.skinfoldChest.value,
                abdomen: elements.skinfoldAbdomen.value,
                thigh: elements.skinfoldThighMale.value
            };
        } else {
            skinfolds = {
                triceps: elements.skinfoldTriceps.value,
                suprailiac: elements.skinfoldSuprailiac.value,
                thigh: elements.skinfoldThighFemale.value
            };
        }

        const bodyFat = Storage.calculateBodyFat(gender, parseInt(age), skinfolds);

        if (bodyFat !== null) {
            elements.calculatedBodyFat.style.display = 'block';
            elements.calculatedValue.textContent = `${bodyFat.toFixed(1)} %`;
        } else {
            elements.calculatedBodyFat.style.display = 'none';
        }
    }

    /**
     * Toggle edit caliper fields visibility
     */
    function toggleEditCaliperFields() {
        const useCaliper = elements.editUseCaliperToggle.checked;
        elements.editCaliperFields.style.display = useCaliper ? 'block' : 'none';
        elements.editManualBodyFat.style.display = useCaliper ? 'none' : 'block';

        if (useCaliper) {
            updateEditGenderFields();
        }
    }

    /**
     * Update edit modal gender-specific fields
     */
    function updateEditGenderFields() {
        const gender = elements.editGender.value;
        elements.editMaleFields.style.display = gender === 'male' ? 'block' : 'none';
        elements.editFemaleFields.style.display = gender === 'female' ? 'block' : 'none';
        calculateAndDisplayEditBodyFat();
    }

    /**
     * Calculate and display body fat in edit modal
     */
    function calculateAndDisplayEditBodyFat() {
        const gender = elements.editGender.value;
        const age = elements.editAge.value;

        if (!gender || !age) {
            elements.editCalculatedBodyFat.style.display = 'none';
            return;
        }

        let skinfolds = {};
        if (gender === 'male') {
            skinfolds = {
                chest: elements.editSkinfoldChest.value,
                abdomen: elements.editSkinfoldAbdomen.value,
                thigh: elements.editSkinfoldThighMale.value
            };
        } else {
            skinfolds = {
                triceps: elements.editSkinfoldTriceps.value,
                suprailiac: elements.editSkinfoldSuprailiac.value,
                thigh: elements.editSkinfoldThighFemale.value
            };
        }

        const bodyFat = Storage.calculateBodyFat(gender, parseInt(age), skinfolds);

        if (bodyFat !== null) {
            elements.editCalculatedBodyFat.style.display = 'block';
            elements.editCalculatedValue.textContent = `${bodyFat.toFixed(1)} %`;
        } else {
            elements.editCalculatedBodyFat.style.display = 'none';
        }
    }

    /**
     * Load user preferences (gender, age) from settings
     */
    function loadUserPreferences() {
        const settings = Storage.getSettings();
        if (settings.defaultGender) {
            elements.gender.value = settings.defaultGender;
        }
        if (settings.defaultAge) {
            elements.age.value = settings.defaultAge;
        }
    }

    /**
     * Initialize theme from settings
     */
    function initTheme() {
        const settings = Storage.getSettings();
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
            elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // Load saved goals
        if (settings.goalWeight) {
            elements.goalWeight.value = settings.goalWeight;
        }
        if (settings.goalBodyFat) {
            elements.goalBodyFat.value = settings.goalBodyFat;
        }
    }

    /**
     * Toggle theme
     */
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        elements.themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        Storage.saveSettings({ theme: isDark ? 'dark' : 'light' });
        Charts.updateTheme();
    }

    /**
     * Show view
     */
    function showView(viewId) {
        elements.views.forEach(v => v.classList.remove('active'));
        elements.navButtons.forEach(b => b.classList.remove('active'));

        document.getElementById(viewId).classList.add('active');
        document.querySelector(`[data-view="${viewId}"]`).classList.add('active');

        if (viewId === 'history') {
            loadHistory();
        } else if (viewId === 'dashboard') {
            updateDashboard();
        }
    }

    /**
     * Set default date to now
     */
    function setDefaultDate() {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60 * 1000);
        elements.measureDate.value = local.toISOString().slice(0, 16);
    }

    /**
     * Update dashboard with current statistics
     */
    function updateDashboard() {
        const stats = Storage.getStatistics(currentRange);

        if (!stats) {
            elements.currentWeight.textContent = '-- kg';
            elements.currentBodyFat.textContent = '-- %';
            elements.weightChange.textContent = '--';
            elements.bodyFatChange.textContent = '--';
            elements.totalWeightChange.textContent = '-- kg';
            elements.totalEntries.textContent = '0';
            elements.lastEntryDate.textContent = '--';
            elements.recentEntriesList.innerHTML = '<p class="empty-state">Noch keine Messungen vorhanden</p>';
            Charts.updateCharts([]);
            return;
        }

        // Update stat cards
        elements.currentWeight.textContent = `${stats.currentWeight.toFixed(1)} kg`;
        elements.currentBodyFat.textContent = stats.currentBodyFat
            ? `${stats.currentBodyFat.toFixed(1)} %`
            : '-- %';

        // Weight change indicator
        const weightChangeValue = stats.weightChange;
        elements.weightChange.textContent = formatChange(weightChangeValue, 'kg');
        elements.weightChange.className = `stat-change ${getChangeClass(weightChangeValue)}`;

        // Body fat change indicator
        if (stats.bodyFatChange !== null) {
            elements.bodyFatChange.textContent = formatChange(stats.bodyFatChange, '%');
            elements.bodyFatChange.className = `stat-change ${getChangeClass(stats.bodyFatChange)}`;
        } else {
            elements.bodyFatChange.textContent = '--';
        }

        // Total weight change
        elements.totalWeightChange.textContent = formatChange(weightChangeValue, 'kg');
        elements.periodLabel.textContent = getRangeLabel(currentRange);

        // Entries count and last date
        elements.totalEntries.textContent = stats.totalEntries;
        elements.lastEntryDate.textContent = `Letzte: ${formatDate(stats.lastEntryDate)}`;

        // Recent entries
        renderRecentEntries(stats.entries.slice(-5).reverse());

        // Update charts
        Charts.updateCharts(stats.entries);
    }

    /**
     * Format change value with sign
     */
    function formatChange(value, unit) {
        if (value === null || value === undefined) return '--';
        const sign = value > 0 ? '+' : '';
        return `${sign}${value.toFixed(1)} ${unit}`;
    }

    /**
     * Get CSS class for change indicator
     */
    function getChangeClass(value) {
        if (value < 0) return 'negative';
        if (value > 0) return 'positive';
        return 'neutral';
    }

    /**
     * Get label for time range
     */
    function getRangeLabel(range) {
        const labels = {
            week: 'letzte Woche',
            month: 'letzter Monat',
            year: 'letztes Jahr',
            all: 'gesamt'
        };
        return labels[range] || range;
    }

    /**
     * Render recent entries list
     */
    function renderRecentEntries(entries) {
        if (!entries || entries.length === 0) {
            elements.recentEntriesList.innerHTML = '<p class="empty-state">Noch keine Messungen vorhanden</p>';
            return;
        }

        elements.recentEntriesList.innerHTML = entries.map(entry => `
            <div class="entry-item">
                <div class="entry-date">${formatDate(entry.date)}</div>
                <div class="entry-values">
                    <span class="entry-weight">${entry.weight.toFixed(1)} kg</span>
                    ${entry.bodyFat ? `<span class="entry-bodyfat">${entry.bodyFat.toFixed(1)} %</span>` : ''}
                </div>
                ${entry.notes ? `<div class="entry-notes">${escapeHtml(entry.notes)}</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Handle entry form submission
     */
    async function handleEntrySubmit(e) {
        e.preventDefault();

        const useCaliper = elements.useCaliperToggle.checked;
        const gender = elements.gender.value;
        const age = elements.age.value;

        let entry = {
            date: elements.measureDate.value,
            weight: elements.weight.value,
            notes: elements.notes.value,
            imageFiles: selectedImages
        };

        if (useCaliper && gender && age) {
            // Caliper measurement
            entry.gender = gender;
            entry.age = age;

            if (gender === 'male') {
                entry.skinfolds = {
                    chest: elements.skinfoldChest.value || null,
                    abdomen: elements.skinfoldAbdomen.value || null,
                    thigh: elements.skinfoldThighMale.value || null
                };
            } else {
                entry.skinfolds = {
                    triceps: elements.skinfoldTriceps.value || null,
                    suprailiac: elements.skinfoldSuprailiac.value || null,
                    thigh: elements.skinfoldThighFemale.value || null
                };
            }

            // Save gender and age as default for next time
            Storage.saveSettings({ defaultGender: gender, defaultAge: age });
        } else {
            // Manual body fat entry
            entry.bodyFat = elements.bodyFat.value || null;
        }

        // Validate
        if (!validateEntry(entry, useCaliper)) {
            return;
        }

        try {
            await Storage.addEntry(entry);
            showToast('Messung erfolgreich gespeichert', 'success');
            resetEntryForm();
            updateDashboard();
        } catch (error) {
            showToast('Fehler beim Speichern: ' + error.message, 'error');
        }
    }

    /**
     * Validate entry data
     */
    function validateEntry(entry, useCaliper = false) {
        const weight = parseFloat(entry.weight);
        if (isNaN(weight) || weight < 20 || weight > 300) {
            showToast('Gewicht muss zwischen 20 und 300 kg liegen', 'error');
            return false;
        }

        if (!entry.date) {
            showToast('Bitte geben Sie ein Datum an', 'error');
            return false;
        }

        if (useCaliper) {
            if (!entry.gender) {
                showToast('Bitte wählen Sie ein Geschlecht aus', 'error');
                return false;
            }

            const age = parseInt(entry.age);
            if (isNaN(age) || age < 10 || age > 100) {
                showToast('Bitte geben Sie ein gültiges Alter an (10-100)', 'error');
                return false;
            }

            // Validate skinfold measurements
            if (entry.gender === 'male') {
                const hasAllMeasurements = entry.skinfolds.chest && entry.skinfolds.abdomen && entry.skinfolds.thigh;
                if (!hasAllMeasurements) {
                    showToast('Bitte geben Sie alle drei Hautfaltenmessungen ein', 'error');
                    return false;
                }
            } else {
                const hasAllMeasurements = entry.skinfolds.triceps && entry.skinfolds.suprailiac && entry.skinfolds.thigh;
                if (!hasAllMeasurements) {
                    showToast('Bitte geben Sie alle drei Hautfaltenmessungen ein', 'error');
                    return false;
                }
            }
        } else if (entry.bodyFat) {
            const bf = parseFloat(entry.bodyFat);
            if (isNaN(bf) || bf < 3 || bf > 60) {
                showToast('Körperfett muss zwischen 3 und 60 % liegen', 'error');
                return false;
            }
        }

        return true;
    }

    /**
     * Reset entry form
     */
    function resetEntryForm() {
        elements.entryForm.reset();
        setDefaultDate();
        selectedImages = [];
        elements.imagePreview.innerHTML = '';

        // Reset caliper fields but keep user preferences
        elements.useCaliperToggle.checked = false;
        elements.caliperFields.style.display = 'none';
        elements.manualBodyFat.style.display = 'block';
        elements.maleFields.style.display = 'none';
        elements.femaleFields.style.display = 'none';
        elements.calculatedBodyFat.style.display = 'none';
        elements.measurementIllustration.style.display = 'none';

        // Reload user preferences
        loadUserPreferences();
    }

    /**
     * Handle image selection
     */
    function handleImageSelect(e) {
        const files = Array.from(e.target.files);
        addImages(files);
    }

    /**
     * Handle drag over
     */
    function handleDragOver(e) {
        e.preventDefault();
        elements.imageUploadArea.classList.add('drag-over');
    }

    /**
     * Handle drag leave
     */
    function handleDragLeave(e) {
        e.preventDefault();
        elements.imageUploadArea.classList.remove('drag-over');
    }

    /**
     * Handle drop
     */
    function handleDrop(e) {
        e.preventDefault();
        elements.imageUploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        addImages(files);
    }

    /**
     * Add images to preview
     */
    function addImages(files) {
        if (selectedImages.length + files.length > 5) {
            showToast('Maximal 5 Bilder erlaubt', 'warning');
            return;
        }

        files.forEach(file => {
            if (selectedImages.length >= 5) return;
            selectedImages.push(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'image-preview-item';
                wrapper.innerHTML = `
                    <img src="${e.target.result}" alt="Vorschau">
                    <button type="button" class="remove-image" data-index="${selectedImages.length - 1}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                wrapper.querySelector('.remove-image').addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const index = parseInt(ev.currentTarget.dataset.index);
                    removeImage(index);
                });
                elements.imagePreview.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Remove image from selection
     */
    function removeImage(index) {
        selectedImages.splice(index, 1);
        elements.imagePreview.innerHTML = '';
        selectedImages.forEach((file, i) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'image-preview-item';
                wrapper.innerHTML = `
                    <img src="${e.target.result}" alt="Vorschau">
                    <button type="button" class="remove-image" data-index="${i}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                wrapper.querySelector('.remove-image').addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    removeImage(parseInt(ev.currentTarget.dataset.index));
                });
                elements.imagePreview.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Load history entries
     */
    function loadHistory() {
        let entries = Storage.getEntries();
        const search = elements.searchInput.value.toLowerCase();
        const dateFrom = elements.filterDateFrom.value;
        const dateTo = elements.filterDateTo.value;

        // Apply filters
        if (search) {
            entries = entries.filter(e =>
                (e.notes && e.notes.toLowerCase().includes(search))
            );
        }

        if (dateFrom) {
            entries = entries.filter(e => new Date(e.date) >= new Date(dateFrom));
        }

        if (dateTo) {
            const endDate = new Date(dateTo);
            endDate.setHours(23, 59, 59);
            entries = entries.filter(e => new Date(e.date) <= endDate);
        }

        // Pagination
        const totalPages = Math.ceil(entries.length / entriesPerPage);
        currentPage = Math.min(currentPage, totalPages || 1);
        const start = (currentPage - 1) * entriesPerPage;
        const paginatedEntries = entries.slice(start, start + entriesPerPage);

        renderHistoryTable(paginatedEntries);
        renderPagination(totalPages);
    }

    /**
     * Render history table
     */
    function renderHistoryTable(entries) {
        if (!entries || entries.length === 0) {
            elements.historyTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">Keine Einträge gefunden</td>
                </tr>
            `;
            return;
        }

        elements.historyTableBody.innerHTML = entries.map(entry => `
            <tr data-id="${entry.id}">
                <td>${formatDateTime(entry.date)}</td>
                <td>${entry.weight.toFixed(1)} kg</td>
                <td>${entry.bodyFat ? entry.bodyFat.toFixed(1) + ' %' : '-'}</td>
                <td class="notes-cell">${entry.notes ? escapeHtml(truncate(entry.notes, 50)) : '-'}</td>
                <td>
                    ${entry.images && entry.images.length > 0
                        ? `<button class="btn-icon view-images" data-id="${entry.id}" title="${entry.images.length} Bild(er)">
                            <i class="fas fa-images"></i> ${entry.images.length}
                           </button>`
                        : '-'}
                </td>
                <td class="actions-cell">
                    <button class="btn-icon edit-entry" data-id="${entry.id}" title="Bearbeiten">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-entry" data-id="${entry.id}" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Bind row action buttons
        elements.historyTableBody.querySelectorAll('.edit-entry').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });

        elements.historyTableBody.querySelectorAll('.delete-entry').forEach(btn => {
            btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
        });

        elements.historyTableBody.querySelectorAll('.view-images').forEach(btn => {
            btn.addEventListener('click', () => openImageViewer(btn.dataset.id));
        });
    }

    /**
     * Render pagination
     */
    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            elements.pagination.innerHTML = '';
            return;
        }

        let html = '';

        if (currentPage > 1) {
            html += `<button class="page-btn" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
        }

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += '<span class="page-ellipsis">...</span>';
            }
        }

        if (currentPage < totalPages) {
            html += `<button class="page-btn" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        }

        elements.pagination.innerHTML = html;

        elements.pagination.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.dataset.page);
                loadHistory();
            });
        });
    }

    /**
     * Open edit modal
     */
    function openEditModal(id) {
        const entry = Storage.getEntryById(id);
        if (!entry) return;

        document.getElementById('editId').value = entry.id;
        document.getElementById('editDate').value = entry.date.slice(0, 16);
        document.getElementById('editWeight').value = entry.weight;
        document.getElementById('editNotes').value = entry.notes || '';

        // Check if entry has caliper data
        const hasCaliper = entry.skinfolds && entry.gender && entry.age;

        if (hasCaliper) {
            elements.editUseCaliperToggle.checked = true;
            elements.editCaliperFields.style.display = 'block';
            elements.editManualBodyFat.style.display = 'none';

            elements.editGender.value = entry.gender;
            elements.editAge.value = entry.age;

            if (entry.gender === 'male') {
                elements.editMaleFields.style.display = 'block';
                elements.editFemaleFields.style.display = 'none';
                elements.editSkinfoldChest.value = entry.skinfolds.chest || '';
                elements.editSkinfoldAbdomen.value = entry.skinfolds.abdomen || '';
                elements.editSkinfoldThighMale.value = entry.skinfolds.thigh || '';
            } else {
                elements.editMaleFields.style.display = 'none';
                elements.editFemaleFields.style.display = 'block';
                elements.editSkinfoldTriceps.value = entry.skinfolds.triceps || '';
                elements.editSkinfoldSuprailiac.value = entry.skinfolds.suprailiac || '';
                elements.editSkinfoldThighFemale.value = entry.skinfolds.thigh || '';
            }

            calculateAndDisplayEditBodyFat();
        } else {
            elements.editUseCaliperToggle.checked = false;
            elements.editCaliperFields.style.display = 'none';
            elements.editManualBodyFat.style.display = 'block';
            document.getElementById('editBodyFat').value = entry.bodyFat || '';

            // Reset caliper fields
            elements.editGender.value = '';
            elements.editAge.value = '';
            elements.editMaleFields.style.display = 'none';
            elements.editFemaleFields.style.display = 'none';
            elements.editCalculatedBodyFat.style.display = 'none';
        }

        openModal('editModal');
    }

    /**
     * Handle edit form submission
     */
    async function handleEditSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('editId').value;
        const useCaliper = elements.editUseCaliperToggle.checked;
        const gender = elements.editGender.value;
        const age = elements.editAge.value;

        let updates = {
            date: document.getElementById('editDate').value,
            weight: document.getElementById('editWeight').value,
            notes: document.getElementById('editNotes').value
        };

        if (useCaliper && gender && age) {
            updates.gender = gender;
            updates.age = age;

            if (gender === 'male') {
                updates.skinfolds = {
                    chest: elements.editSkinfoldChest.value || null,
                    abdomen: elements.editSkinfoldAbdomen.value || null,
                    thigh: elements.editSkinfoldThighMale.value || null
                };
            } else {
                updates.skinfolds = {
                    triceps: elements.editSkinfoldTriceps.value || null,
                    suprailiac: elements.editSkinfoldSuprailiac.value || null,
                    thigh: elements.editSkinfoldThighFemale.value || null
                };
            }
        } else {
            updates.bodyFat = document.getElementById('editBodyFat').value || null;
            updates.gender = null;
            updates.age = null;
            updates.skinfolds = null;
        }

        try {
            await Storage.updateEntry(id, updates);
            showToast('Messung aktualisiert', 'success');
            closeModal('editModal');
            loadHistory();
            updateDashboard();
        } catch (error) {
            showToast('Fehler beim Aktualisieren: ' + error.message, 'error');
        }
    }

    /**
     * Confirm delete entry
     */
    function confirmDelete(id) {
        elements.confirmTitle.textContent = 'Eintrag löschen';
        elements.confirmMessage.textContent = 'Möchten Sie diesen Eintrag wirklich löschen?';
        elements.confirmOk.onclick = async () => {
            try {
                await Storage.deleteEntry(id);
                showToast('Eintrag gelöscht', 'success');
                closeModal('confirmModal');
                loadHistory();
                updateDashboard();
            } catch (error) {
                showToast('Fehler beim Löschen: ' + error.message, 'error');
            }
        };
        openModal('confirmModal');
    }

    /**
     * Confirm delete all data
     */
    function confirmDeleteAll() {
        elements.confirmTitle.textContent = 'Alle Daten löschen';
        elements.confirmMessage.textContent = 'Möchten Sie wirklich ALLE Daten unwiderruflich löschen?';
        elements.confirmOk.onclick = async () => {
            try {
                await Storage.clearAllData();
                showToast('Alle Daten wurden gelöscht', 'success');
                closeModal('confirmModal');
                updateDashboard();
                loadHistory();
            } catch (error) {
                showToast('Fehler beim Löschen: ' + error.message, 'error');
            }
        };
        openModal('confirmModal');
    }

    /**
     * Open image viewer
     */
    async function openImageViewer(entryId) {
        const entry = Storage.getEntryById(entryId);
        if (!entry || !entry.images || entry.images.length === 0) return;

        modalImages = [];
        currentImageIndex = 0;

        for (const imageId of entry.images) {
            try {
                const imageData = await Storage.getImage(imageId);
                if (imageData) {
                    modalImages.push(imageData.full);
                }
            } catch (e) {
                console.error('Error loading image:', e);
            }
        }

        if (modalImages.length > 0) {
            updateImageViewer();
            openModal('imageModal');
        }
    }

    /**
     * Update image viewer display
     */
    function updateImageViewer() {
        elements.modalImage.src = modalImages[currentImageIndex];
        elements.imageCounter.textContent = `${currentImageIndex + 1} / ${modalImages.length}`;
        elements.prevImage.style.display = modalImages.length > 1 ? 'flex' : 'none';
        elements.nextImage.style.display = modalImages.length > 1 ? 'flex' : 'none';
    }

    /**
     * Show previous image
     */
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + modalImages.length) % modalImages.length;
        updateImageViewer();
    }

    /**
     * Show next image
     */
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % modalImages.length;
        updateImageViewer();
    }

    /**
     * Save goals
     */
    function saveGoals() {
        const goalWeight = elements.goalWeight.value ? parseFloat(elements.goalWeight.value) : null;
        const goalBodyFat = elements.goalBodyFat.value ? parseFloat(elements.goalBodyFat.value) : null;

        Storage.saveSettings({ goalWeight, goalBodyFat });
        showToast('Ziele gespeichert', 'success');
    }

    /**
     * Export data as JSON
     */
    async function exportJSON() {
        try {
            const data = await Storage.exportData();
            downloadFile(
                JSON.stringify(data, null, 2),
                `bodytracker-export-${formatDateForFile(new Date())}.json`,
                'application/json'
            );
            showToast('JSON-Export erfolgreich', 'success');
        } catch (error) {
            showToast('Export-Fehler: ' + error.message, 'error');
        }
    }

    /**
     * Export data as CSV
     */
    function exportCSV() {
        try {
            const csv = Storage.exportCSV();
            downloadFile(
                '\ufeff' + csv,
                `bodytracker-export-${formatDateForFile(new Date())}.csv`,
                'text/csv;charset=utf-8'
            );
            showToast('CSV-Export erfolgreich', 'success');
        } catch (error) {
            showToast('Export-Fehler: ' + error.message, 'error');
        }
    }

    /**
     * Export data as PDF
     */
    function exportPDF() {
        const entries = Storage.getEntries();
        if (entries.length === 0) {
            showToast('Keine Daten zum Exportieren', 'warning');
            return;
        }

        // Create printable HTML
        const printWindow = window.open('', '_blank');
        const stats = Storage.getStatistics('all');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>BodyTracker Export</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #1f2937; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
                    th { background: #f3f4f6; }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
                    .stat { background: #f9fafb; padding: 15px; border-radius: 8px; }
                    .stat-label { font-size: 12px; color: #6b7280; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <h1>BodyTracker - Messverlauf</h1>
                <p>Exportiert am: ${new Date().toLocaleDateString('de-DE')}</p>

                ${stats ? `
                <div class="stats">
                    <div class="stat">
                        <div class="stat-label">Aktuelles Gewicht</div>
                        <div class="stat-value">${stats.currentWeight.toFixed(1)} kg</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Körperfett</div>
                        <div class="stat-value">${stats.currentBodyFat ? stats.currentBodyFat.toFixed(1) + ' %' : '-'}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Gesamtveränderung</div>
                        <div class="stat-value">${formatChange(stats.weightChange, 'kg')}</div>
                    </div>
                </div>
                ` : ''}

                <table>
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Gewicht</th>
                            <th>Körperfett</th>
                            <th>Notizen</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map(e => `
                            <tr>
                                <td>${formatDateTime(e.date)}</td>
                                <td>${e.weight.toFixed(1)} kg</td>
                                <td>${e.bodyFat ? e.bodyFat.toFixed(1) + ' %' : '-'}</td>
                                <td>${e.notes || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
        showToast('PDF-Export geöffnet', 'success');
    }

    /**
     * Import data from file
     */
    async function importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            await Storage.importData(data);
            showToast(`${data.entries.length} Einträge importiert`, 'success');
            updateDashboard();
            loadHistory();
        } catch (error) {
            showToast('Import-Fehler: ' + error.message, 'error');
        }

        e.target.value = '';
    }

    /**
     * Open modal
     */
    function openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    function closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${escapeHtml(message)}</span>
        `;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Handle keyboard events
     */
    function handleKeyboard(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }

        if (document.getElementById('imageModal').classList.contains('active')) {
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        }
    }

    // Utility functions
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDateForFile(date) {
        return date.toISOString().slice(0, 10);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncate(str, len) {
        return str.length > len ? str.substring(0, len) + '...' : str;
    }

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize app when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        showToast,
        updateDashboard
    };
})();
