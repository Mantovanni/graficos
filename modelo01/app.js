// ===== Global Variables =====
let charts = {};
let filteredData = null;
let currentSort = { column: null, direction: 'asc' };
let currentTheme = 'dark';
let selectedMonth1 = 'outubro';
let selectedMonth2 = 'novembro';

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
    createTopProceduresChart(selectedMonth1, 'top-procedures-july-chart');
    createTopProceduresChart(selectedMonth2, 'top-procedures-august-chart');
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

const capitalizeMonth = (month) => {
    const months = {
        'janeiro': 'Janeiro',
        'fevereiro': 'Fevereiro',
        'marco': 'Março',
        'abril': 'Abril',
        'maio': 'Maio',
        'junho': 'Junho',
        'julho': 'Julho',
        'agosto': 'Agosto',
        'setembro': 'Setembro',
        'outubro': 'Outubro',
        'novembro': 'Novembro',
        'dezembro': 'Dezembro'
    };
    return months[month] || month.charAt(0).toUpperCase() + month.slice(1);
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
    const month1Data = clinicData[selectedMonth1];
    const month2Data = clinicData[selectedMonth2];

    // Process month1 data
    month1Data.forEach(item => {
        merged[item.procedimento] = {
            procedimento: item.procedimento,
            qtyMonth1: item.quantidade,
            totalMonth1: item.total,
            qtyMonth2: 0,
            totalMonth2: 0
        };
    });

    // Process month2 data
    month2Data.forEach(item => {
        if (merged[item.procedimento]) {
            merged[item.procedimento].qtyMonth2 = item.quantidade;
            merged[item.procedimento].totalMonth2 = item.total;
        } else {
            merged[item.procedimento] = {
                procedimento: item.procedimento,
                qtyMonth1: 0,
                totalMonth1: 0,
                qtyMonth2: item.quantidade,
                totalMonth2: item.total
            };
        }
    });

    // Calculate variations
    Object.values(merged).forEach(item => {
        item.totalGeral = item.totalMonth1 + item.totalMonth2;
        item.qtyVariation = item.qtyMonth2 - item.qtyMonth1;
        item.totalVariation = item.totalMonth2 - item.totalMonth1;
        item.percentVariation = item.totalMonth1 > 0
            ? ((item.totalMonth2 - item.totalMonth1) / item.totalMonth1) * 100
            : (item.totalMonth2 > 0 ? 100 : 0);
    });

    return Object.values(merged);
};

// ===== KPI Functions =====
const updateKPIs = () => {
    const totalMonth1 = calculateTotals(clinicData[selectedMonth1]);
    const totalMonth2 = calculateTotals(clinicData[selectedMonth2]);
    const despesaMonth1 = despesasData[selectedMonth1].valor;
    const despesaMonth2 = despesasData[selectedMonth2].valor;
    const dreMonth1 = totalMonth1 - despesaMonth1;
    const dreMonth2 = totalMonth2 - despesaMonth2;

    // Calcular variações
    const variationRevenue = totalMonth2 - totalMonth1;
    const percentVariationRevenue = totalMonth1 > 0 ? (variationRevenue / totalMonth1) * 100 : 0;

    const variationExpense = despesaMonth2 - despesaMonth1;
    const percentVariationExpense = despesaMonth1 > 0 ? (variationExpense / despesaMonth1) * 100 : 0;

    const variationDRE = dreMonth2 - dreMonth1;
    const percentVariationDRE = dreMonth1 !== 0 ? (variationDRE / Math.abs(dreMonth1)) * 100 : 0;

    const totalProc = calculateTotalQuantity(clinicData[selectedMonth1]) + calculateTotalQuantity(clinicData[selectedMonth2]);

    // Atualizar labels
    document.getElementById('month1-label').textContent = `Faturamento ${capitalizeMonth(selectedMonth1)}`;
    document.getElementById('month2-label').textContent = `Faturamento ${capitalizeMonth(selectedMonth2)}`;
    document.getElementById('expense-month1-label').textContent = `Despesas ${capitalizeMonth(selectedMonth1)}`;
    document.getElementById('expense-month2-label').textContent = `Despesas ${capitalizeMonth(selectedMonth2)}`;
    document.getElementById('dre-month1-label').textContent = `DRE ${capitalizeMonth(selectedMonth1)}`;
    document.getElementById('dre-month2-label').textContent = `DRE ${capitalizeMonth(selectedMonth2)}`;

    // Atualizar valores
    document.getElementById('revenue-month1').textContent = formatCurrency(totalMonth1);
    document.getElementById('revenue-month2').textContent = formatCurrency(totalMonth2);
    document.getElementById('expense-month1').textContent = formatCurrency(despesaMonth1);
    document.getElementById('expense-month2').textContent = formatCurrency(despesaMonth2);
    document.getElementById('dre-month1').textContent = formatCurrency(dreMonth1);
    document.getElementById('dre-month2').textContent = formatCurrency(dreMonth2);

    // Definir cores do DRE baseado em lucro/prejuízo
    const dreMonth1Element = document.getElementById('dre-month1');
    const dreMonth2Element = document.getElementById('dre-month2');

    dreMonth1Element.style.color = dreMonth1 >= 0 ? 'var(--secondary-color)' : 'var(--danger-color)';
    dreMonth2Element.style.color = dreMonth2 >= 0 ? 'var(--secondary-color)' : 'var(--danger-color)';

    // Update trend for Month1 Revenue (comparando com Month2)
    const trendMonth1 = document.getElementById('trend-month1');
    if (variationRevenue > 0) {
        trendMonth1.innerHTML = `<i class="fas fa-arrow-down"></i> -${formatPercent(Math.abs(percentVariationRevenue))} vs ${capitalizeMonth(selectedMonth2)}`;
        trendMonth1.className = 'kpi-trend trend-down';
    } else if (variationRevenue < 0) {
        trendMonth1.innerHTML = `<i class="fas fa-arrow-up"></i> +${formatPercent(Math.abs(percentVariationRevenue))} vs ${capitalizeMonth(selectedMonth2)}`;
        trendMonth1.className = 'kpi-trend trend-up';
    } else {
        trendMonth1.innerHTML = `<i class="fas fa-minus"></i> 0% vs ${capitalizeMonth(selectedMonth2)}`;
        trendMonth1.className = 'kpi-trend';
    }

    // Update trend for Month2 Revenue
    const trendMonth2 = document.getElementById('trend-month2');
    if (variationRevenue > 0) {
        trendMonth2.innerHTML = `<i class="fas fa-arrow-up"></i> +${formatPercent(percentVariationRevenue)} vs ${capitalizeMonth(selectedMonth1)}`;
        trendMonth2.className = 'kpi-trend trend-up';
    } else if (variationRevenue < 0) {
        trendMonth2.innerHTML = `<i class="fas fa-arrow-down"></i> ${formatPercent(percentVariationRevenue)} vs ${capitalizeMonth(selectedMonth1)}`;
        trendMonth2.className = 'kpi-trend trend-down';
    } else {
        trendMonth2.innerHTML = `<i class="fas fa-minus"></i> 0% vs ${capitalizeMonth(selectedMonth1)}`;
        trendMonth2.className = 'kpi-trend';
    }

    // Update trend for Expense Month1
    const trendExpenseMonth1 = document.getElementById('trend-expense-month1');
    if (variationExpense > 0) {
        trendExpenseMonth1.innerHTML = `<i class="fas fa-arrow-down"></i> -${formatPercent(Math.abs(percentVariationExpense))} vs ${capitalizeMonth(selectedMonth2)}`;
        trendExpenseMonth1.className = 'kpi-trend trend-up'; // Menor despesa é bom
    } else if (variationExpense < 0) {
        trendExpenseMonth1.innerHTML = `<i class="fas fa-arrow-up"></i> +${formatPercent(Math.abs(percentVariationExpense))} vs ${capitalizeMonth(selectedMonth2)}`;
        trendExpenseMonth1.className = 'kpi-trend trend-down'; // Maior despesa é ruim
    } else {
        trendExpenseMonth1.innerHTML = `<i class="fas fa-minus"></i> 0% vs ${capitalizeMonth(selectedMonth2)}`;
        trendExpenseMonth1.className = 'kpi-trend';
    }

    // Update trend for Expense Month2
    const trendExpenseMonth2 = document.getElementById('trend-expense-month2');
    if (variationExpense > 0) {
        trendExpenseMonth2.innerHTML = `<i class="fas fa-arrow-up"></i> +${formatPercent(percentVariationExpense)} vs ${capitalizeMonth(selectedMonth1)}`;
        trendExpenseMonth2.className = 'kpi-trend trend-down'; // Maior despesa é ruim
    } else if (variationExpense < 0) {
        trendExpenseMonth2.innerHTML = `<i class="fas fa-arrow-down"></i> ${formatPercent(percentVariationExpense)} vs ${capitalizeMonth(selectedMonth1)}`;
        trendExpenseMonth2.className = 'kpi-trend trend-up'; // Menor despesa é bom
    } else {
        trendExpenseMonth2.innerHTML = `<i class="fas fa-minus"></i> 0% vs ${capitalizeMonth(selectedMonth1)}`;
        trendExpenseMonth2.className = 'kpi-trend';
    }

    // Update trend for DRE Month1
    const trendDREMonth1 = document.getElementById('trend-dre-month1');
    if (variationDRE > 0) {
        trendDREMonth1.innerHTML = `<i class="fas fa-arrow-down"></i> -${formatPercent(Math.abs(percentVariationDRE))} vs ${capitalizeMonth(selectedMonth2)}`;
        trendDREMonth1.className = 'kpi-trend trend-down';
    } else if (variationDRE < 0) {
        trendDREMonth1.innerHTML = `<i class="fas fa-arrow-up"></i> +${formatPercent(Math.abs(percentVariationDRE))} vs ${capitalizeMonth(selectedMonth2)}`;
        trendDREMonth1.className = 'kpi-trend trend-up';
    } else {
        trendDREMonth1.innerHTML = `<i class="fas fa-minus"></i> 0% vs ${capitalizeMonth(selectedMonth2)}`;
        trendDREMonth1.className = 'kpi-trend';
    }

    // Update trend for DRE Month2
    const trendDREMonth2 = document.getElementById('trend-dre-month2');
    if (variationDRE > 0) {
        trendDREMonth2.innerHTML = `<i class="fas fa-arrow-up"></i> +${formatPercent(percentVariationDRE)} vs ${capitalizeMonth(selectedMonth1)}`;
        trendDREMonth2.className = 'kpi-trend trend-up';
    } else if (variationDRE < 0) {
        trendDREMonth2.innerHTML = `<i class="fas fa-arrow-down"></i> ${formatPercent(percentVariationDRE)} vs ${capitalizeMonth(selectedMonth1)}`;
        trendDREMonth2.className = 'kpi-trend trend-down';
    } else {
        trendDREMonth2.innerHTML = `<i class="fas fa-minus"></i> 0% vs ${capitalizeMonth(selectedMonth1)}`;
        trendDREMonth2.className = 'kpi-trend';
    }
};

// ===== Chart Functions =====
const createRevenueComparisonChart = () => {
    const ctx = document.getElementById('revenue-comparison-chart');
    const colors = getChartColors();

    if (charts.revenueComparison) {
        charts.revenueComparison.destroy();
    }

    const totalMonth1 = calculateTotals(clinicData[selectedMonth1]);
    const totalMonth2 = calculateTotals(clinicData[selectedMonth2]);

    charts.revenueComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [capitalizeMonth(selectedMonth1), capitalizeMonth(selectedMonth2)],
            datasets: [{
                label: 'Receita Total',
                data: [totalMonth1, totalMonth2],
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

    const data = clinicData[month];
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
            label: capitalizeMonth(selectedMonth1),
            data: top10.map(item => item.qtyMonth1),
            backgroundColor: 'rgba(37, 99, 235, 0.7)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 2,
            borderRadius: 6
        },
        {
            label: capitalizeMonth(selectedMonth2),
            data: top10.map(item => item.qtyMonth2),
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
                                `Receita ${capitalizeMonth(selectedMonth1)}: ${formatCurrency(item.totalMonth1)}`,
                                `Receita ${capitalizeMonth(selectedMonth2)}: ${formatCurrency(item.totalMonth2)}`,
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
            <td class="text-center">${formatNumber(item.qtyMonth1)}</td>
            <td class="text-primary">${formatCurrency(item.totalMonth1)}</td>
            <td class="text-center">${formatNumber(item.qtyMonth2)}</td>
            <td class="text-secondary">${formatCurrency(item.totalMonth2)}</td>
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
            case 'qty-month1':
                valueA = a.qtyMonth1;
                valueB = b.qtyMonth1;
                break;
            case 'total-month1':
                valueA = a.totalMonth1;
                valueB = b.totalMonth1;
                break;
            case 'qty-month2':
                valueA = a.qtyMonth2;
                valueB = b.qtyMonth2;
                break;
            case 'total-month2':
                valueA = a.totalMonth2;
                valueB = b.totalMonth2;
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
        sum + item.qtyMonth1 + item.qtyMonth2, 0
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

    let csv = `Procedimento,Qtd ${capitalizeMonth(selectedMonth1)},Total ${capitalizeMonth(selectedMonth1)},Qtd ${capitalizeMonth(selectedMonth2)},Total ${capitalizeMonth(selectedMonth2)},Variação %,Total Geral\n`;

    merged.forEach(item => {
        csv += `"${item.procedimento}",${item.qtyMonth1},${item.totalMonth1},${item.qtyMonth2},${item.totalMonth2},${item.percentVariation.toFixed(2)},${item.totalGeral}\n`;
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

// ===== Update Dynamic Labels =====
const updateDynamicLabels = () => {
    // Atualizar títulos dos gráficos
    document.getElementById('top-procedures-month1-title').textContent = `Top 10 Procedimentos - ${capitalizeMonth(selectedMonth1)}`;
    document.getElementById('top-procedures-month2-title').textContent = `Top 10 Procedimentos - ${capitalizeMonth(selectedMonth2)}`;

    // Atualizar headers da tabela
    document.getElementById('qty-month1-header').textContent = `Qtd. ${capitalizeMonth(selectedMonth1)}`;
    document.getElementById('total-month1-header').textContent = `Total ${capitalizeMonth(selectedMonth1)}`;
    document.getElementById('qty-month2-header').textContent = `Qtd. ${capitalizeMonth(selectedMonth2)}`;
    document.getElementById('total-month2-header').textContent = `Total ${capitalizeMonth(selectedMonth2)}`;
};

// ===== Update Dashboard on Month Change =====
const updateDashboard = () => {
    showLoading();

    updateDynamicLabels();
    updateKPIs();
    updateQuickStats();

    setTimeout(() => {
        createRevenueComparisonChart();
        createTopProceduresChart(selectedMonth1, 'top-procedures-july-chart');
        createTopProceduresChart(selectedMonth2, 'top-procedures-august-chart');
        createProceduresEvolutionChart();

        renderProceduresTable();
        renderComparisonTable();

        hideLoading();
    }, 300);
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

    // Update dynamic labels
    updateDynamicLabels();

    // Update KPIs
    updateKPIs();

    // Update quick stats
    updateQuickStats();

    // Create charts
    setTimeout(() => {
        createRevenueComparisonChart();
        createTopProceduresChart(selectedMonth1, 'top-procedures-july-chart');
        createTopProceduresChart(selectedMonth2, 'top-procedures-august-chart');
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

    // Month selectors
    document.getElementById('month1-filter').addEventListener('change', (e) => {
        selectedMonth1 = e.target.value;
        updateDashboard();
    });

    document.getElementById('month2-filter').addEventListener('change', (e) => {
        selectedMonth2 = e.target.value;
        updateDashboard();
    });

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

    // Dashboard Navigation
    initDashboardNavigation();
});

// ===== Dashboard Navigation =====
const initDashboardNavigation = () => {
    const switchButtons = document.querySelectorAll('.switch-btn');

    switchButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const dashboard = btn.getAttribute('data-dashboard');
            navigateToDashboard(dashboard);
        });
    });
};

const navigateToDashboard = (dashboard) => {
    const currentPath = window.location.pathname;
    let newPath = '';

    if (dashboard === 'financeiro') {
        // Navegar para modelo01
        newPath = currentPath.replace('/modelo04/', '/modelo01/');
    } else if (dashboard === 'fluxo-caixa') {
        // Navegar para modelo04
        newPath = currentPath.replace('/modelo01/', '/modelo04/');
    }

    if (newPath && newPath !== currentPath) {
        window.location.href = newPath;
    }
};

// ===== Responsive Charts =====
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart && chart.resize) {
            chart.resize();
        }
    });
});
