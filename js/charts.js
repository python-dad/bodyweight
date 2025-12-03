/**
 * BodyTracker Charts Module
 * Handles all chart visualizations using Chart.js
 */

const Charts = (function() {
    let weightChart = null;
    let bodyFatChart = null;
    let combinedChart = null;

    const chartColors = {
        weight: {
            primary: 'rgb(59, 130, 246)',
            gradient: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.05)']
        },
        bodyFat: {
            primary: 'rgb(239, 68, 68)',
            gradient: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.05)']
        }
    };

    /**
     * Get computed CSS variables for theming
     */
    function getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        return {
            text: style.getPropertyValue('--text-primary').trim() || '#1f2937',
            grid: style.getPropertyValue('--border-color').trim() || '#e5e7eb',
            background: style.getPropertyValue('--bg-primary').trim() || '#ffffff'
        };
    }

    /**
     * Create gradient for chart
     */
    function createGradient(ctx, colors) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
    }

    /**
     * Common chart options
     */
    function getCommonOptions(yAxisLabel) {
        const themeColors = getThemeColors();

        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            const date = new Date(context[0].parsed.x);
                            return date.toLocaleDateString('de-DE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'dd.MM',
                            week: 'dd.MM',
                            month: 'MMM yyyy'
                        },
                        tooltipFormat: 'dd.MM.yyyy HH:mm'
                    },
                    grid: {
                        color: themeColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: themeColors.text,
                        maxRotation: 0
                    }
                },
                y: {
                    grid: {
                        color: themeColors.grid,
                        drawBorder: false
                    },
                    ticks: {
                        color: themeColors.text
                    },
                    title: {
                        display: true,
                        text: yAxisLabel,
                        color: themeColors.text
                    }
                }
            }
        };
    }

    /**
     * Initialize weight chart
     */
    function initWeightChart(entries) {
        const ctx = document.getElementById('weightChart');
        if (!ctx) return;

        if (weightChart) {
            weightChart.destroy();
        }

        const data = entries.map(e => ({
            x: new Date(e.date),
            y: e.weight
        }));

        const gradient = createGradient(ctx.getContext('2d'), chartColors.weight.gradient);

        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Gewicht (kg)',
                    data: data,
                    borderColor: chartColors.weight.primary,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: chartColors.weight.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...getCommonOptions('Gewicht (kg)'),
                plugins: {
                    ...getCommonOptions('Gewicht (kg)').plugins,
                    tooltip: {
                        ...getCommonOptions('Gewicht (kg)').plugins.tooltip,
                        callbacks: {
                            ...getCommonOptions('Gewicht (kg)').plugins.tooltip.callbacks,
                            label: function(context) {
                                return `Gewicht: ${context.parsed.y.toFixed(1)} kg`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize body fat chart
     */
    function initBodyFatChart(entries) {
        const ctx = document.getElementById('bodyFatChart');
        if (!ctx) return;

        if (bodyFatChart) {
            bodyFatChart.destroy();
        }

        const data = entries
            .filter(e => e.bodyFat !== null)
            .map(e => ({
                x: new Date(e.date),
                y: e.bodyFat
            }));

        const gradient = createGradient(ctx.getContext('2d'), chartColors.bodyFat.gradient);

        bodyFatChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Körperfett (%)',
                    data: data,
                    borderColor: chartColors.bodyFat.primary,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: chartColors.bodyFat.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                ...getCommonOptions('Körperfett (%)'),
                plugins: {
                    ...getCommonOptions('Körperfett (%)').plugins,
                    tooltip: {
                        ...getCommonOptions('Körperfett (%)').plugins.tooltip,
                        callbacks: {
                            ...getCommonOptions('Körperfett (%)').plugins.tooltip.callbacks,
                            label: function(context) {
                                return `Körperfett: ${context.parsed.y.toFixed(1)} %`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize combined chart
     */
    function initCombinedChart(entries) {
        const ctx = document.getElementById('combinedChart');
        if (!ctx) return;

        if (combinedChart) {
            combinedChart.destroy();
        }

        const weightData = entries.map(e => ({
            x: new Date(e.date),
            y: e.weight
        }));

        const bodyFatData = entries
            .filter(e => e.bodyFat !== null)
            .map(e => ({
                x: new Date(e.date),
                y: e.bodyFat
            }));

        const themeColors = getThemeColors();

        combinedChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Gewicht (kg)',
                        data: weightData,
                        borderColor: chartColors.weight.primary,
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: chartColors.weight.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Körperfett (%)',
                        data: bodyFatData,
                        borderColor: chartColors.bodyFat.primary,
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: chartColors.bodyFat.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: themeColors.text,
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'dd.MM',
                                week: 'dd.MM',
                                month: 'MMM yyyy'
                            }
                        },
                        grid: {
                            color: themeColors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: themeColors.text,
                            maxRotation: 0
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: themeColors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: chartColors.weight.primary
                        },
                        title: {
                            display: true,
                            text: 'Gewicht (kg)',
                            color: chartColors.weight.primary
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: chartColors.bodyFat.primary
                        },
                        title: {
                            display: true,
                            text: 'Körperfett (%)',
                            color: chartColors.bodyFat.primary
                        }
                    }
                }
            }
        });
    }

    /**
     * Update all charts with new data
     */
    function updateCharts(entries) {
        if (!entries || entries.length === 0) {
            // Show empty state
            return;
        }

        initWeightChart(entries);
        initBodyFatChart(entries);
        initCombinedChart(entries);
    }

    /**
     * Update chart theme
     */
    function updateTheme() {
        const entries = Storage.getStatistics()?.entries || [];
        updateCharts(entries);
    }

    /**
     * Destroy all charts
     */
    function destroy() {
        if (weightChart) {
            weightChart.destroy();
            weightChart = null;
        }
        if (bodyFatChart) {
            bodyFatChart.destroy();
            bodyFatChart = null;
        }
        if (combinedChart) {
            combinedChart.destroy();
            combinedChart = null;
        }
    }

    // Public API
    return {
        updateCharts,
        updateTheme,
        destroy
    };
})();
