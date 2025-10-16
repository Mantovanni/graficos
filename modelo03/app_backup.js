// ===== Global Variables =====
let charts = {};
let currentTheme = 'dark';
let currentSort = { column: null, direction: 'asc' };
let selectedMonth = 'Todos'; // Filtro de mês

// ===== Theme Functions =====
const initTheme = () => {
    const savedTheme = localStorage.getItem('financeTheme') || 'dark';
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
        localStorage.setItem('financeTheme', 'dark');
    } else {
        body.classList.add('light-theme');
        currentTheme = 'light';
        updateThemeIcon('light');
        localStorage.setItem('financeTheme', 'light');
    }

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
    createCashFlowChart();
    createMonthlyComparisonChart();
    createProjectionsChart();
    createConvenioDistributionChart();
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
    document.getElementById('loading-overlay')?.classList.add('active');
};

const hideLoading = () => {
    document.getElementById('loading-overlay')?.classList.remove('active');
};

// ===== Data Processing Functions =====
const getAllReceitas = () => {
    const allReceitas = [];
    Object.keys(financialData.receitas).forEach(mes => {
        financialData.receitas[mes].forEach(receita => {
            allReceitas.push({ ...receita, mesOrigem: mes });
        });
    });
    return allReceitas;
};

const calcularTotaisImpostos = () => {
    const allReceitas = getAllReceitas();
    return allReceitas.reduce((sum, r) => sum + r.impostos, 0);
};

// ===== KPI Functions =====
const updateKPIs = () => {
    const revenueJuly = financialData.entradas.julho;
    const revenueAugust = financialData.entradas.agosto;
    const expenseJuly = financialData.saidas.julho;
    const expenseAugust = financialData.saidas.agosto;

    const totalExpenses = expenseJuly + expenseAugust;
    const totalRevenue = revenueJuly + revenueAugust;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = (netProfit / totalRevenue) * 100;

    const profitJuly = revenueJuly - expenseJuly;
    const profitAugust = revenueAugust - expenseAugust;

    const totalTaxes = calcularTotaisImpostos();

    // Log para verificação
    console.log('=== CÁLCULO DE LUCRO (DRE) ===');
    console.log('Julho: Receitas', formatCurrency(revenueJuly), '- Despesas', formatCurrency(expenseJuly), '= Lucro', formatCurrency(profitJuly));
    console.log('Agosto: Receitas', formatCurrency(revenueAugust), '- Despesas', formatCurrency(expenseAugust), '= Lucro', formatCurrency(profitAugust));
    console.log('TOTAL: Receitas', formatCurrency(totalRevenue), '- Despesas', formatCurrency(totalExpenses), '= Lucro', formatCurrency(netProfit));
    console.log('Margem de Lucro:', profitMargin.toFixed(2) + '%');

    document.getElementById('revenue-july').textContent = formatCurrency(revenueJuly);
    document.getElementById('revenue-august').textContent = formatCurrency(revenueAugust);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('net-profit').textContent = formatCurrency(netProfit);
    document.getElementById('profit-margin').textContent = `Margem: ${formatPercent(profitMargin)}`;

    // Quick stats
    document.getElementById('profit-july').textContent = formatCurrency(profitJuly);
    document.getElementById('profit-august').textContent = formatCurrency(profitAugust);
    document.getElementById('avg-margin').textContent = formatPercent(profitMargin);
    document.getElementById('total-taxes').textContent = formatCurrency(totalTaxes);
};

// ===== Chart Functions =====
const createRevenueExpenseChart = () => {
    const ctx = document.getElementById('revenue-expense-chart');
    const colors = getChartColors();

    if (charts.revenueExpense) {
        charts.revenueExpense.destroy();
    }

    const revenueJuly = financialData.entradas.julho;
    const revenueAugust = financialData.entradas.agosto;
    const expenseJuly = financialData.saidas.julho;
    const expenseAugust = financialData.saidas.agosto;
    const profitJuly = revenueJuly - expenseJuly;
    const profitAugust = revenueAugust - expenseAugust;

    charts.revenueExpense = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Julho', 'Agosto'],
            datasets: [
                {
                    label: 'Receitas',
                    data: [revenueJuly, revenueAugust],
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Despesas',
                    data: [expenseJuly, expenseAugust],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Lucro',
                    data: [profitJuly, profitAugust],
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: colors.textColor,
                        padding: 15
                    }
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
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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
};

const createConvenioDistributionChart = () => {
    const ctx = document.getElementById('convenio-distribution-chart');
    const colors = getChartColors();

    if (charts.convenioDistribution) {
        charts.convenioDistribution.destroy();
    }

    const convenioTotals = calcularReceitasPorConvenio();
    const sorted = convenioTotals.sort((a, b) => b.recebidoTotal - a.recebidoTotal);

    const chartColors = [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'
    ];

    const isLight = document.body.classList.contains('light-theme');
    const borderColor = isLight ? '#e2e8f0' : '#1e293b';

    charts.convenioDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sorted.map(c => c.convenio),
            datasets: [{
                data: sorted.map(c => c.recebidoTotal),
                backgroundColor: chartColors,
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
                        color: colors.textColor,
                        padding: 10,
                        font: { size: 11 }
                    }
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
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
};

const createMarginAnalysisChart = () => {
    const ctx = document.getElementById('margin-analysis-chart');
    const colors = getChartColors();

    if (charts.marginAnalysis) {
        charts.marginAnalysis.destroy();
    }

    const revenueJuly = financialData.entradas.julho;
    const revenueAugust = financialData.entradas.agosto;
    const expenseJuly = financialData.saidas.julho;
    const expenseAugust = financialData.saidas.agosto;

    const marginJuly = ((revenueJuly - expenseJuly) / revenueJuly) * 100;
    const marginAugust = ((revenueAugust - expenseAugust) / revenueAugust) * 100;

    charts.marginAnalysis = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Julho', 'Agosto'],
            datasets: [{
                label: 'Margem de Lucro (%)',
                data: [marginJuly, marginAugust],
                backgroundColor: [
                    marginJuly >= 15 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.7)',
                    marginAugust >= 15 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(245, 158, 11, 0.7)'
                ],
                borderColor: [
                    marginJuly >= 15 ? 'rgba(16, 185, 129, 1)' : 'rgba(245, 158, 11, 1)',
                    marginAugust >= 15 ? 'rgba(16, 185, 129, 1)' : 'rgba(245, 158, 11, 1)'
                ],
                borderWidth: 2,
                borderRadius: 6
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
                            return `Margem: ${context.parsed.y.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: colors.gridColor
                    },
                    ticks: {
                        color: colors.textColor,
                        callback: (value) => value + '%'
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
};

const createCashflowChart = () => {
    const ctx = document.getElementById('cashflow-chart');
    const colors = getChartColors();

    if (charts.cashflow) {
        charts.cashflow.destroy();
    }

    const revenueJuly = financialData.entradas.julho;
    const revenueAugust = financialData.entradas.agosto;
    const expenseJuly = financialData.saidas.julho;
    const expenseAugust = financialData.saidas.agosto;

    let saldoAcumulado = 0;
    const saldoJulho = revenueJuly - expenseJuly;
    saldoAcumulado += saldoJulho;
    const saldoAgosto = revenueAugust - expenseAugust;

    charts.cashflow = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Início', 'Julho', 'Agosto'],
            datasets: [{
                label: 'Fluxo de Caixa Acumulado',
                data: [0, saldoAcumulado, saldoAcumulado + saldoAgosto],
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: 'rgba(37, 99, 235, 1)'
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
                            return `Saldo: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
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
};

const createTaxImpactChart = () => {
    const ctx = document.getElementById('tax-impact-chart');
    const colors = getChartColors();

    if (charts.taxImpact) {
        charts.taxImpact.destroy();
    }

    const convenioTotals = calcularReceitasPorConvenio();
    const sorted = convenioTotals.sort((a, b) => b.impostosTotal - a.impostosTotal);

    charts.taxImpact = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(c => c.convenio),
            datasets: [
                {
                    label: 'Valor Bruto',
                    data: sorted.map(c => c.faturamentoTotal),
                    backgroundColor: 'rgba(107, 114, 128, 0.5)',
                    borderColor: 'rgba(107, 114, 128, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Impostos',
                    data: sorted.map(c => c.impostosTotal),
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Valor Líquido',
                    data: sorted.map(c => c.recebidoTotal),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: colors.textColor,
                        padding: 15
                    }
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
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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
                        color: colors.textColor,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
};

const createMonthlyReceiptChart = () => {
    const ctx = document.getElementById('monthly-receipt-chart');
    const colors = getChartColors();

    if (charts.monthlyReceipt) {
        charts.monthlyReceipt.destroy();
    }

    const mesesPagos = calcularReceitasPorMesPago();
    const labels = Object.keys(mesesPagos).filter(m => mesesPagos[m] > 0);
    const values = labels.map(m => mesesPagos[m]);

    charts.monthlyReceipt = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receitas Recebidas',
                data: values,
                backgroundColor: 'rgba(6, 182, 212, 0.7)',
                borderColor: 'rgba(6, 182, 212, 1)',
                borderWidth: 2,
                borderRadius: 6
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
                            return `Recebido: ${formatCurrency(context.parsed.y)}`;
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
};

// ===== Table Functions =====
const renderReceitasTable = (data = null) => {
    const tbody = document.getElementById('receitas-table-body');
    const tableData = data || getAllReceitas();

    tbody.innerHTML = '';

    tableData.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');

        const statusClass = item.status === 'Realizado' ? 'status-realizado' : 'status-pendente';

        row.innerHTML = `
            <td><strong>${item.convenio}</strong></td>
            <td>${item.mesOrigem.charAt(0).toUpperCase() + item.mesOrigem.slice(1)}</td>
            <td class="text-primary">${formatCurrency(item.faturamento)}</td>
            <td class="text-danger">${formatCurrency(item.impostos)}</td>
            <td class="text-success"><strong>${formatCurrency(item.valorRecebido)}</strong></td>
            <td>${item.dataRecebimento}</td>
            <td><span class="status-badge ${statusClass}">${item.status}</span></td>
        `;

        tbody.appendChild(row);
    });
};

const renderConvenioSummaryTable = () => {
    const tbody = document.getElementById('convenio-summary-body');
    const convenioTotals = calcularReceitasPorConvenio();
    const sorted = convenioTotals.sort((a, b) => b.recebidoTotal - a.recebidoTotal);

    tbody.innerHTML = '';

    sorted.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');

        const percentImpostos = item.faturamentoTotal > 0
            ? ((item.impostosTotal / item.faturamentoTotal) * 100).toFixed(2)
            : 0;

        row.innerHTML = `
            <td><strong>${item.convenio}</strong></td>
            <td>${formatCurrency(item.faturamentoTotal)}</td>
            <td class="text-danger">${formatCurrency(item.impostosTotal)}</td>
            <td class="text-success"><strong>${formatCurrency(item.recebidoTotal)}</strong></td>
            <td class="text-warning">${percentImpostos}%</td>
            <td class="text-center">${item.quantidade}</td>
        `;

        tbody.appendChild(row);
    });
};

const renderDRETable = () => {
    const tbody = document.getElementById('dre-table-body');

    const revenueJuly = financialData.entradas.julho;
    const revenueAugust = financialData.entradas.agosto;
    const expenseJuly = financialData.saidas.julho;
    const expenseAugust = financialData.saidas.agosto;
    const profitJuly = revenueJuly - expenseJuly;
    const profitAugust = revenueAugust - expenseAugust;
    const totalRevenue = revenueJuly + revenueAugust;
    const totalExpense = expenseJuly + expenseAugust;
    const totalProfit = profitJuly + profitAugust;

    const variation = ((revenueAugust - revenueJuly) / revenueJuly) * 100;
    const expenseVariation = ((expenseAugust - expenseJuly) / expenseJuly) * 100;
    const profitVariation = profitJuly !== 0 ? ((profitAugust - profitJuly) / profitJuly) * 100 : 0;

    const marginJuly = (profitJuly / revenueJuly) * 100;
    const marginAugust = (profitAugust / revenueAugust) * 100;
    const marginTotal = (totalProfit / totalRevenue) * 100;
    const marginVariation = marginAugust - marginJuly;

    tbody.innerHTML = `
        <tr>
            <td class="font-bold">Receitas (Entradas)</td>
            <td class="text-success">${formatCurrency(revenueJuly)}</td>
            <td class="text-success">${formatCurrency(revenueAugust)}</td>
            <td class="text-success font-bold">${formatCurrency(totalRevenue)}</td>
            <td class="${variation >= 0 ? 'text-success' : 'text-danger'}">${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%</td>
        </tr>
        <tr>
            <td class="font-bold">Despesas (Saídas DRE)</td>
            <td class="text-danger">${formatCurrency(expenseJuly)}</td>
            <td class="text-danger">${formatCurrency(expenseAugust)}</td>
            <td class="text-danger font-bold">${formatCurrency(totalExpense)}</td>
            <td class="${expenseVariation <= 0 ? 'text-success' : 'text-danger'}">${expenseVariation >= 0 ? '+' : ''}${expenseVariation.toFixed(2)}%</td>
        </tr>
        <tr style="background: var(--dark-hover);">
            <td class="font-bold">Lucro Líquido</td>
            <td class="text-primary font-bold">${formatCurrency(profitJuly)}</td>
            <td class="text-primary font-bold">${formatCurrency(profitAugust)}</td>
            <td class="text-primary font-bold">${formatCurrency(totalProfit)}</td>
            <td class="${profitVariation >= 0 ? 'text-success' : 'text-danger'}">${profitVariation >= 0 ? '+' : ''}${profitVariation.toFixed(2)}%</td>
        </tr>
        <tr>
            <td class="font-bold">Margem de Lucro (%)</td>
            <td class="text-info">${marginJuly.toFixed(2)}%</td>
            <td class="text-info">${marginAugust.toFixed(2)}%</td>
            <td class="text-info font-bold">${marginTotal.toFixed(2)}%</td>
            <td class="${marginVariation >= 0 ? 'text-success' : 'text-danger'}">${marginVariation >= 0 ? '+' : ''}${marginVariation.toFixed(2)}pp</td>
        </tr>
    `;
};

// ===== Filter Functions =====
const applyFilters = () => {
    const monthFilter = document.getElementById('month-filter').value;
    const convenioFilter = document.getElementById('convenio-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    let filtered = getAllReceitas();

    if (monthFilter !== 'all') {
        filtered = filtered.filter(r => r.mesOrigem === monthFilter);
    }

    if (convenioFilter !== 'all') {
        filtered = filtered.filter(r => r.convenio === convenioFilter);
    }

    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }

    renderReceitasTable(filtered);
};

const clearFilters = () => {
    document.getElementById('month-filter').value = 'all';
    document.getElementById('convenio-filter').value = 'all';
    document.getElementById('status-filter').value = 'all';
    renderReceitasTable();
};

// ===== Search Function =====
const searchTable = (query) => {
    const allReceitas = getAllReceitas();
    const filtered = allReceitas.filter(r =>
        r.convenio.toLowerCase().includes(query.toLowerCase()) ||
        r.mesOrigem.toLowerCase().includes(query.toLowerCase())
    );
    renderReceitasTable(filtered);
};

// ===== Sort Function =====
const sortTable = (column) => {
    const allReceitas = getAllReceitas();

    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    const sorted = [...allReceitas].sort((a, b) => {
        let valueA, valueB;

        switch (column) {
            case 'convenio':
                valueA = a.convenio;
                valueB = b.convenio;
                break;
            case 'mes':
                valueA = a.mesOrigem;
                valueB = b.mesOrigem;
                break;
            case 'faturamento':
                valueA = a.faturamento;
                valueB = b.faturamento;
                break;
            case 'impostos':
                valueA = a.impostos;
                valueB = b.impostos;
                break;
            case 'liquido':
                valueA = a.valorRecebido;
                valueB = b.valorRecebido;
                break;
            case 'recebimento':
                valueA = a.dataRecebimento;
                valueB = b.dataRecebimento;
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

    renderReceitasTable(sorted);

    // Update sort icons
    document.querySelectorAll('th.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    const th = document.querySelector(`th[data-column="${column}"] i`);
    if (th) {
        th.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
};

// ===== Export to CSV =====
const exportToCSV = () => {
    const allReceitas = getAllReceitas();

    let csv = 'Convênio,Mês Origem,Faturamento,Impostos,Valor Líquido,Data Recebimento,Status\n';

    allReceitas.forEach(item => {
        csv += `"${item.convenio}","${item.mesOrigem}",${item.faturamento},${item.impostos},${item.valorRecebido},"${item.dataRecebimento}","${item.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `receitas_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ===== Populate Filters =====
const populateConvenioFilter = () => {
    const select = document.getElementById('convenio-filter');
    const convenios = new Set();

    getAllReceitas().forEach(r => convenios.add(r.convenio));

    const sorted = Array.from(convenios).sort();

    sorted.forEach(conv => {
        const option = document.createElement('option');
        option.value = conv;
        option.textContent = conv;
        select.appendChild(option);
    });
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
    populateConvenioFilter();

    // Update KPIs
    updateKPIs();

    // Create charts
    setTimeout(() => {
        createRevenueExpenseChart();
        createConvenioDistributionChart();
        createMarginAnalysisChart();
        createCashflowChart();
        createTaxImpactChart();
        createMonthlyReceiptChart();

        // Render tables
        renderReceitasTable();
        renderConvenioSummaryTable();
        renderDRETable();

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
});

// ===== Responsive Charts =====
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart && chart.resize) {
            chart.resize();
        }
    });
});
