// ===== Global Variables =====
let charts = {};
let filteredData = null;
let currentSort = { column: null, direction: 'asc' };
let currentTheme = 'dark';

// ===== Theme Functions =====
const initTheme = () => {
    // Check for saved theme preference or default to 'dark'
    const savedTheme = localStorage.getItem('clinicTheme') || 'dark';
    currentTheme = savedTheme;

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        updateThemeIcon('light');
    } else {
        updateThemeIcon('dark');
    }
};

const toggleTheme = () => {
    const body = document.body;
    const isLight = body.classList.contains('light-theme');

    if (isLight) {
        body.classList.remove('light-theme');
        currentTheme = 'dark';
        updateThemeIcon('dark');
        localStorage.setItem('clinicTheme', 'dark');
    } else {
        body.classList.add('light-theme');
        currentTheme = 'light';
        updateThemeIcon('light');
        localStorage.setItem('clinicTheme', 'light');
    }

    // Update charts with new theme
    updateChartsTheme();
};

const updateThemeIcon = (theme) => {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    if (theme === 'light') {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
};

const getChartColors = () => {
    const isLight = document.body.classList.contains('light-theme');

    return {
        gridColor: isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.5)',
        textColor: isLight ? '#64748b' : '#cbd5e1',
        tooltipBg: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
        tooltipTitleColor: isLight ? '#0f172a' : '#f1f5f9',
        tooltipBodyColor: isLight ? '#64748b' : '#cbd5e1',
        tooltipBorderColor: isLight ? '#e2e8f0' : '#334155'
    };
};

const updateChartsTheme = () => {
    // Recreate all charts with new theme colors
    createRevenueComparisonChart();
    createTopProceduresChart('julho', 'top-procedures-july-chart');
    createTopProceduresChart('agosto', 'top-procedures-august-chart');
    createProceduresEvolutionChart();
};

// ===== Utility Functions =====
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value);
};

const formatPercent = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
};

const showLoading = () => {
    document.getElementById('loading-overlay').classList.add('active');
};

const hideLoading = () => {
    document.getElementById('loading-overlay').classList.remove('active');
};

// ===== Data Processing Functions =====
const calculateTotals = (data) => {
    return data.reduce((sum, item) => sum + item.total, 0);
};

const calculateTotalQuantity = (data) => {
    return data.reduce((sum, item) => sum + item.quantidade, 0);
};

const mergeDataByProcedure = () => {
    const merged = {};

    // Process julho data
    clinicData.julho.forEach(item => {
        merged[item.procedimento] = {
            procedimento: item.procedimento,
            qtyJulho: item.quantidade,
            totalJulho: item.total,
            qtyAgosto: 0,
            totalAgosto: 0
        };
    });

    // Process agosto data
    clinicData.agosto.forEach(item => {
        if (merged[item.procedimento]) {
            merged[item.procedimento].qtyAgosto = item.quantidade;
            merged[item.procedimento].totalAgosto = item.total;
        } else {
            merged[item.procedimento] = {
                procedimento: item.procedimento,
                qtyJulho: 0,
                totalJulho: 0,
                qtyAgosto: item.quantidade,
                totalAgosto: item.total
            };
        }
    });

    // Calculate variations
    Object.values(merged).forEach(item => {
        item.totalGeral = item.totalJulho + item.totalAgosto;
        item.qtyVariation = item.qtyAgosto - item.qtyJulho;
        item.totalVariation = item.totalAgosto - item.totalJulho;
        item.percentVariation = item.totalJulho > 0
            ? ((item.totalAgosto - item.totalJulho) / item.totalJulho) * 100
            : (item.totalAgosto > 0 ? 100 : 0);
    });

    return Object.values(merged);
};

// ===== KPI Functions =====
const updateKPIs = () => {
    const totalJulho = calculateTotals(clinicData.julho);
    const totalAgosto = calculateTotals(clinicData.agosto);
    const variation = totalAgosto - totalJulho;
    const percentVariation = (variation / totalJulho) * 100;
    const totalProc = calculateTotalQuantity(clinicData.julho) + calculateTotalQuantity(clinicData.agosto);

    document.getElementById('revenue-july').textContent = formatCurrency(totalJulho);
    document.getElementById('revenue-august').textContent = formatCurrency(totalAgosto);
    document.getElementById('variation-percent').textContent = formatPercent(percentVariation);
    document.getElementById('variation-value').textContent = formatCurrency(Math.abs(variation));
    document.getElementById('total-proc-count').textContent = formatNumber(totalProc);

    // Update trends
    const trendJuly = document.getElementById('trend-july');
    const trendAugust = document.getElementById('trend-august');

    if (variation > 0) {
        trendAugust.innerHTML = `<i class="fas fa-arrow-up"></i> +${formatPercent(percentVariation)}`;
        trendAugust.className = 'kpi-trend trend-up';
    } else if (variation < 0) {
        trendAugust.innerHTML = `<i class="fas fa-arrow-down"></i> ${formatPercent(percentVariation)}`;
        trendAugust.className = 'kpi-trend trend-down';
    } else {
        trendAugust.innerHTML = `<i class="fas fa-minus"></i> 0%`;
        trendAugust.className = 'kpi-trend';
    }
};

// ===== Chart Functions =====
const createRevenueComparisonChart = () => {
    const ctx = document.getElementById('revenue-comparison-chart');
    const colors = getChartColors();

    if (charts.revenueComparison) {
        charts.revenueComparison.destroy();
    }

    const totalJulho = calculateTotals(clinicData.julho);
    const totalAgosto = calculateTotals(clinicData.agosto);

    charts.revenueComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Julho', 'Agosto'],
            datasets: [{
                label: 'Receita Total',
                data: [totalJulho, totalAgosto],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    'rgba(37, 99, 235, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    padding: 12,
                    titleColor: colors.tooltipTitleColor,
                    bodyColor: colors.tooltipBodyColor,
                    borderColor: colors.tooltipBorderColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            return `Receita: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor,
                        callback: (value) => formatCurrency(value)
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: colors.textColor
                    }
                }
            }
        }
    });
}; const createTopProceduresChart = (month, canvasId) => {
    const ctx = document.getElementById(canvasId);
    const chartKey = canvasId;
    const chartColors = getChartColors();

    if (charts[chartKey]) {
        charts[chartKey].destroy();
    }

    const data = month === 'julho' ? clinicData.julho : clinicData.agosto;
    const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 10);

    const colors = [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
    ];

    const isLight = document.body.classList.contains('light-theme');
    const borderColor = isLight ? '#e2e8f0' : '#1e293b';

    charts[chartKey] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sorted.map(item => item.procedimento),
            datasets: [{
                data: sorted.map(item => item.total),
                backgroundColor: colors,
                borderColor: borderColor,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: chartColors.textColor,
                        padding: 10,
                        font: {
                            size: 11
                        },
                        generateLabels: (chart) => {
                            const data = chart.data;
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                return {
                                    text: `${label.substring(0, 25)}... - ${formatCurrency(value)}`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    padding: 12,
                    titleColor: chartColors.tooltipTitleColor,
                    bodyColor: chartColors.tooltipBodyColor,
                    borderColor: chartColors.tooltipBorderColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            const label = context.label;
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
};

const createProceduresEvolutionChart = () => {
    const ctx = document.getElementById('procedures-evolution-chart');
    const chartColors = getChartColors();

    if (charts.proceduresEvolution) {
        charts.proceduresEvolution.destroy();
    }

    const merged = mergeDataByProcedure();
    const top10 = merged.sort((a, b) => b.totalGeral - a.totalGeral).slice(0, 10);

    const datasets = [
        {
            label: 'Julho',
            data: top10.map(item => item.qtyJulho),
            backgroundColor: 'rgba(37, 99, 235, 0.7)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 2,
            borderRadius: 6
        },
        {
            label: 'Agosto',
            data: top10.map(item => item.qtyAgosto),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            borderRadius: 6
        }
    ];

    charts.proceduresEvolution = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top10.map(item => {
                const label = item.procedimento;
                return label.length > 20 ? label.substring(0, 20) + '...' : label;
            }),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: chartColors.textColor,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    padding: 12,
                    titleColor: chartColors.tooltipTitleColor,
                    bodyColor: chartColors.tooltipBodyColor,
                    borderColor: chartColors.tooltipBorderColor,
                    borderWidth: 1,
                    callbacks: {
                        title: (context) => {
                            const index = context[0].dataIndex;
                            return top10[index].procedimento;
                        },
                        afterBody: (context) => {
                            const index = context[0].dataIndex;
                            const item = top10[index];
                            return [
                                '',
                                `Receita Julho: ${formatCurrency(item.totalJulho)}`,
                                `Receita Agosto: ${formatCurrency(item.totalAgosto)}`,
                                `Variação: ${item.percentVariation >= 0 ? '+' : ''}${item.percentVariation.toFixed(1)}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: chartColors.gridColor
                    },
                    ticks: {
                        color: chartColors.textColor
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: chartColors.textColor,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
};

// ===== Table Functions =====
const renderProceduresTable = (data = null) => {
    const tbody = document.getElementById('procedures-table-body');
    const tableData = data || mergeDataByProcedure();

    tbody.innerHTML = '';

    tableData.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');

        const variationClass = item.totalVariation > 0 ? 'trend-positive' :
            item.totalVariation < 0 ? 'trend-negative' : 'trend-neutral';
        const variationIcon = item.totalVariation > 0 ? 'fa-arrow-up' :
            item.totalVariation < 0 ? 'fa-arrow-down' : 'fa-minus';

        row.innerHTML = `
            <td><strong>${item.procedimento}</strong></td>
            <td class="text-center">${formatNumber(item.qtyJulho)}</td>
            <td class="text-primary">${formatCurrency(item.totalJulho)}</td>
            <td class="text-center">${formatNumber(item.qtyAgosto)}</td>
            <td class="text-secondary">${formatCurrency(item.totalAgosto)}</td>
            <td>
                <span class="trend-badge ${variationClass}">
                    <i class="fas ${variationIcon}"></i>
                    ${formatPercent(item.percentVariation)}
                </span>
            </td>
            <td><strong>${formatCurrency(item.totalGeral)}</strong></td>
        `;

        tbody.appendChild(row);
    });
};

const renderComparisonTable = (data = null) => {
    const tbody = document.getElementById('comparison-table-body');
    const tableData = data || mergeDataByProcedure();

    tbody.innerHTML = '';

    tableData.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');

        let statusClass = 'status-stable';
        let statusText = 'ESTÁVEL';

        if (item.percentVariation > 5) {
            statusClass = 'status-growth';
            statusText = 'CRESCIMENTO';
        } else if (item.percentVariation < -5) {
            statusClass = 'status-decline';
            statusText = 'QUEDA';
        }

        const qtyVariationClass = item.qtyVariation > 0 ? 'text-success' :
            item.qtyVariation < 0 ? 'text-danger' : '';
        const totalVariationClass = item.totalVariation > 0 ? 'text-success' :
            item.totalVariation < 0 ? 'text-danger' : '';

        row.innerHTML = `
            <td><strong>${item.procedimento}</strong></td>
            <td class="${qtyVariationClass}">
                ${item.qtyVariation > 0 ? '+' : ''}${formatNumber(item.qtyVariation)}
            </td>
            <td class="${totalVariationClass}">
                ${item.totalVariation > 0 ? '+' : ''}${formatCurrency(item.totalVariation)}
            </td>
            <td class="${totalVariationClass}">
                <strong>${item.percentVariation > 0 ? '+' : ''}${item.percentVariation.toFixed(1)}%</strong>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
        `;

        tbody.appendChild(row);
    });
};

// ===== Filter Functions =====
const applyFilters = () => {
    const monthFilter = document.getElementById('month-filter').value;
    const procedureFilter = document.getElementById('procedure-filter').value;
    const minValue = parseFloat(document.getElementById('min-value').value) || 0;
    const maxValue = parseFloat(document.getElementById('max-value').value) || Infinity;

    let merged = mergeDataByProcedure();

    // Apply procedure filter
    if (procedureFilter !== 'all') {
        merged = merged.filter(item => item.procedimento === procedureFilter);
    }

    // Apply value filters
    merged = merged.filter(item => {
        const total = item.totalGeral;
        return total >= minValue && total <= maxValue;
    });

    // Update tables
    renderProceduresTable(merged);
    renderComparisonTable(merged);

    // Update quick stats
    updateQuickStats(merged);
};

const clearFilters = () => {
    document.getElementById('month-filter').value = 'all';
    document.getElementById('procedure-filter').value = 'all';
    document.getElementById('min-value').value = '';
    document.getElementById('max-value').value = '';

    renderProceduresTable();
    renderComparisonTable();
    updateQuickStats();
};

// ===== Search Function =====
const searchTable = (query) => {
    const merged = mergeDataByProcedure();
    const filtered = merged.filter(item =>
        item.procedimento.toLowerCase().includes(query.toLowerCase())
    );

    renderProceduresTable(filtered);
};

// ===== Sort Function =====
const sortTable = (column) => {
    const merged = mergeDataByProcedure();

    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    const sorted = [...merged].sort((a, b) => {
        let valueA, valueB;

        switch (column) {
            case 'procedimento':
                valueA = a.procedimento;
                valueB = b.procedimento;
                break;
            case 'qty-julho':
                valueA = a.qtyJulho;
                valueB = b.qtyJulho;
                break;
            case 'total-julho':
                valueA = a.totalJulho;
                valueB = b.totalJulho;
                break;
            case 'qty-agosto':
                valueA = a.qtyAgosto;
                valueB = b.qtyAgosto;
                break;
            case 'total-agosto':
                valueA = a.totalAgosto;
                valueB = b.totalAgosto;
                break;
            case 'variacao':
                valueA = a.percentVariation;
                valueB = b.percentVariation;
                break;
            case 'total-geral':
                valueA = a.totalGeral;
                valueB = b.totalGeral;
                break;
            default:
                return 0;
        }

        if (typeof valueA === 'string') {
            return currentSort.direction === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        } else {
            return currentSort.direction === 'asc'
                ? valueA - valueB
                : valueB - valueA;
        }
    });

    renderProceduresTable(sorted);

    // Update sort icons
    document.querySelectorAll('th.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    const th = document.querySelector(`th[data-column="${column}"] i`);
    if (th) {
        th.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
};

// ===== Quick Stats =====
const updateQuickStats = (data = null) => {
    const tableData = data || mergeDataByProcedure();

    const totalProcedures = tableData.reduce((sum, item) =>
        sum + item.qtyJulho + item.qtyAgosto, 0
    );

    const totalRevenue = tableData.reduce((sum, item) =>
        sum + item.totalGeral, 0
    );

    const avgTicket = totalRevenue / totalProcedures;

    document.getElementById('total-procedures').textContent = formatNumber(totalProcedures);
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('avg-ticket').textContent = formatCurrency(avgTicket);
};

// ===== Export to CSV =====
const exportToCSV = () => {
    const merged = mergeDataByProcedure();

    let csv = 'Procedimento,Qtd Julho,Total Julho,Qtd Agosto,Total Agosto,Variação %,Total Geral\n';

    merged.forEach(item => {
        csv += `"${item.procedimento}",${item.qtyJulho},${item.totalJulho},${item.qtyAgosto},${item.totalAgosto},${item.percentVariation.toFixed(2)},${item.totalGeral}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_clinica_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ===== Populate Procedure Filter =====
const populateProcedureFilter = () => {
    const select = document.getElementById('procedure-filter');
    const procedures = new Set();

    clinicData.julho.forEach(item => procedures.add(item.procedimento));
    clinicData.agosto.forEach(item => procedures.add(item.procedimento));

    const sorted = Array.from(procedures).sort();

    sorted.forEach(proc => {
        const option = document.createElement('option');
        option.value = proc;
        option.textContent = proc;
        select.appendChild(option);
    });
};

// ===== Sort Comparison Table =====
const sortComparisonTable = (sortType) => {
    const merged = mergeDataByProcedure();
    let sorted;

    switch (sortType) {
        case 'variation-desc':
            sorted = [...merged].sort((a, b) => b.percentVariation - a.percentVariation);
            break;
        case 'variation-asc':
            sorted = [...merged].sort((a, b) => a.percentVariation - b.percentVariation);
            break;
        case 'total-desc':
            sorted = [...merged].sort((a, b) => b.totalGeral - a.totalGeral);
            break;
        default:
            sorted = merged;
    }

    renderComparisonTable(sorted);
};

// ===== Initialize Dashboard =====
const initDashboard = () => {
    showLoading();

    // Initialize theme
    initTheme();

    // Set current date
    const dateElement = document.getElementById('current-date');
    dateElement.textContent = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Populate filters
    populateProcedureFilter();

    // Update KPIs
    updateKPIs();

    // Update quick stats
    updateQuickStats();

    // Create charts
    setTimeout(() => {
        createRevenueComparisonChart();
        createTopProceduresChart('julho', 'top-procedures-july-chart');
        createTopProceduresChart('agosto', 'top-procedures-august-chart');
        createProceduresEvolutionChart();

        // Render tables
        renderProceduresTable();
        renderComparisonTable();

        hideLoading();
    }, 500);
};

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();

    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Filter buttons
    document.getElementById('apply-filter').addEventListener('click', applyFilters);
    document.getElementById('clear-filter').addEventListener('click', clearFilters);

    // Search
    document.getElementById('search-table').addEventListener('input', (e) => {
        searchTable(e.target.value);
    });

    // Sort table
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-column');
            sortTable(column);
        });
    });

    // Export CSV
    document.getElementById('export-csv').addEventListener('click', exportToCSV);

    // Sort comparison table
    document.getElementById('sort-comparison').addEventListener('change', (e) => {
        sortComparisonTable(e.target.value);
    });
});

// ===== Responsive Charts =====
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart && chart.resize) {
            chart.resize();
        }
    });
});
