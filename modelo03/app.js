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
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (theme === 'light') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
        }
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

// ===== Cash Flow Calculations =====
const calcularResumoFluxo = (mes = 'Todos') => {
    const fluxo = calcularFluxoDeCaixaPorMes();
    
    if (mes === 'Todos') {
        // Somar todos os meses
        let totalEntradas = 0;
        let totalSaidas = 0;
        let totalPendentesEntradas = 0;
        let totalPendentesSaidas = 0;
        
        Object.values(fluxo).forEach(item => {
            totalEntradas += item.entradas;
            totalSaidas += item.saidas;
            totalPendentesEntradas += item.entradasPendentes;
            totalPendentesSaidas += item.saidasPendentes;
        });
        
        return {
            entradas: totalEntradas,
            saidas: totalSaidas,
            saldo: totalEntradas - totalSaidas,
            entradasPendentes: totalPendentesEntradas,
            saidasPendentes: totalPendentesSaidas,
            saldoProjetado: (totalEntradas + totalPendentesEntradas) - (totalSaidas + totalPendentesSaidas)
        };
    } else {
        // Filtrar por mês específico
        const dadosMes = fluxo[mes] || { entradas: 0, saidas: 0, saldo: 0, entradasPendentes: 0, saidasPendentes: 0 };
        return {
            ...dadosMes,
            saldoProjetado: (dadosMes.entradas + dadosMes.entradasPendentes) - (dadosMes.saidas + dadosMes.saidasPendentes)
        };
    }
};

// ===== Update KPIs =====
const updateKPIs = () => {
    const resumo = calcularResumoFluxo(selectedMonth);
    
    // KPI: Receitas Recebidas
    document.getElementById('kpi-receitas').textContent = formatCurrency(resumo.entradas);
    
    // KPI: Despesas Pagas
    document.getElementById('kpi-despesas').textContent = formatCurrency(resumo.saidas);
    
    // KPI: Saldo Realizado
    document.getElementById('kpi-saldo').textContent = formatCurrency(resumo.saldo);
    const saldoCard = document.getElementById('kpi-saldo').closest('.kpi-card');
    if (resumo.saldo >= 0) {
        saldoCard.style.borderColor = '#10b981';
    } else {
        saldoCard.style.borderColor = '#ef4444';
    }
    
    // KPI: Projeção
    document.getElementById('kpi-projecao').textContent = formatCurrency(resumo.saldoProjetado);
    const projecaoCard = document.getElementById('kpi-projecao').closest('.kpi-card');
    if (resumo.saldoProjetado >= 0) {
        projecaoCard.style.borderColor = '#3b82f6';
    } else {
        projecaoCard.style.borderColor = '#f59e0b';
    }
    
    console.log('=== RESUMO FLUXO DE CAIXA ===');
    console.log('Mês Selecionado:', selectedMonth);
    console.log('Entradas Realizadas:', formatCurrency(resumo.entradas));
    console.log('Saídas Realizadas:', formatCurrency(resumo.saidas));
    console.log('Saldo Realizado:', formatCurrency(resumo.saldo));
    console.log('Entradas Pendentes:', formatCurrency(resumo.entradasPendentes));
    console.log('Saídas Pendentes:', formatCurrency(resumo.saidasPendentes));
    console.log('Saldo Projetado:', formatCurrency(resumo.saldoProjetado));
};

// ===== Chart Creation Functions =====

// 1. Gráfico de Fluxo de Caixa (Entradas vs Saídas por Mês)
const createCashFlowChart = () => {
    const ctx = document.getElementById('cashflow-chart');
    if (!ctx) return;

    const fluxo = calcularFluxoDeCaixaPorMes();
    const meses = financialData.meses.filter(mes => fluxo[mes] && (fluxo[mes].entradas > 0 || fluxo[mes].saidas > 0));
    const entradas = meses.map(mes => fluxo[mes].entradas);
    const saidas = meses.map(mes => fluxo[mes].saidas);
    const saldos = meses.map(mes => fluxo[mes].saldo);

    const colors = getChartColors();

    if (charts.cashflow) {
        charts.cashflow.destroy();
    }

    charts.cashflow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradas,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Saídas',
                    data: saidas,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Saldo',
                    data: saldos,
                    type: 'line',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: colors.textColor,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipTitleColor,
                    bodyColor: colors.tooltipBodyColor,
                    borderColor: colors.tooltipBorderColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: colors.gridColor },
                    ticks: {
                        color: colors.textColor,
                        callback: (value) => formatCurrency(value)
                    }
                },
                x: {
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textColor }
                }
            }
        }
    });
};

// 2. Gráfico de Comparação Mensal
const createMonthlyComparisonChart = () => {
    const ctx = document.getElementById('monthly-comparison-chart');
    if (!ctx) return;

    const fluxo = calcularFluxoDeCaixaPorMes();
    const meses = financialData.meses.filter(mes => fluxo[mes] && (fluxo[mes].entradas > 0 || fluxo[mes].saidas > 0));
    const saldos = meses.map(mes => fluxo[mes].saldo);

    const colors = getChartColors();

    if (charts.monthlyComparison) {
        charts.monthlyComparison.destroy();
    }

    charts.monthlyComparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Saldo Mensal',
                data: saldos,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: colors.textColor,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipTitleColor,
                    bodyColor: colors.tooltipBodyColor,
                    borderColor: colors.tooltipBorderColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => 'Saldo: ' + formatCurrency(context.raw)
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: colors.gridColor },
                    ticks: {
                        color: colors.textColor,
                        callback: (value) => formatCurrency(value)
                    }
                },
                x: {
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textColor }
                }
            }
        }
    });
};

// 3. Gráfico de Projeções Futuras
const createProjectionsChart = () => {
    const ctx = document.getElementById('projections-chart');
    if (!ctx) return;

    const fluxo = calcularFluxoDeCaixaPorMes();
    const meses = financialData.meses;
    const realizados = meses.map(mes => fluxo[mes] ? fluxo[mes].saldo : 0);
    const pendentes = meses.map(mes => fluxo[mes] ? fluxo[mes].entradasPendentes - fluxo[mes].saidasPendentes : 0);

    const colors = getChartColors();

    if (charts.projections) {
        charts.projections.destroy();
    }

    charts.projections = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Realizado',
                    data: realizados,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Pendente',
                    data: pendentes,
                    backgroundColor: 'rgba(251, 146, 60, 0.8)',
                    borderColor: 'rgba(251, 146, 60, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: colors.textColor,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipTitleColor,
                    bodyColor: colors.tooltipBodyColor,
                    borderColor: colors.tooltipBorderColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: colors.gridColor },
                    ticks: {
                        color: colors.textColor,
                        callback: (value) => formatCurrency(value)
                    }
                },
                x: {
                    grid: { color: colors.gridColor },
                    ticks: { color: colors.textColor }
                }
            }
        }
    });
};

// 4. Gráfico de Distribuição por Convênio
const createConvenioDistributionChart = () => {
    const ctx = document.getElementById('convenio-distribution-chart');
    if (!ctx) return;

    const convenios = calcularReceitasPorConvenio();
    const labels = convenios.map(c => c.convenio);
    const data = convenios.map(c => c.recebidoTotal);

    const colors = getChartColors();

    if (charts.convenioDistribution) {
        charts.convenioDistribution.destroy();
    }

    charts.convenioDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(234, 179, 8, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(251, 146, 60, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(234, 179, 8, 1)'
                ],
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
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: colors.tooltipBg,
                    titleColor: colors.tooltipTitleColor,
                    bodyColor: colors.tooltipBodyColor,
                    borderColor: colors.tooltipBorderColor,
                    borderWidth: 1,
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = formatCurrency(context.raw);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = ((context.raw / total) * 100).toFixed(1);
                            return label + ': ' + value + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });
};

// ===== Table Rendering =====

// Tabela de Receitas
const renderReceitasTable = (mes = 'Todos') => {
    const tbody = document.getElementById('receitas-table-body');
    if (!tbody) return;

    let receitas = [];
    
    if (mes === 'Todos') {
        receitas = getAllReceitas();
    } else {
        const mesKey = mes.toLowerCase();
        receitas = financialData.receitas[mesKey] || [];
    }

    tbody.innerHTML = '';
    
    receitas.forEach(receita => {
        const row = document.createElement('tr');
        const statusClass = receita.status === 'Realizado' ? 'status-realizado' : 'status-pendente';
        
        row.innerHTML = `
            <td>${receita.convenio}</td>
            <td>${formatCurrency(receita.faturamento)}</td>
            <td>${formatCurrency(receita.impostos)}</td>
            <td>${formatCurrency(receita.valorLiquido)}</td>
            <td>${receita.dataVencimento || '-'}</td>
            <td>${receita.dataRecebimento || '-'}</td>
            <td><span class="status ${statusClass}">${receita.status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
};

// Tabela de Despesas
const renderDespesasTable = () => {
    const tbody = document.getElementById('despesas-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    financialData.despesas.forEach(despesa => {
        const row = document.createElement('tr');
        const statusClass = despesa.status === 'Pago' ? 'status-realizado' : 'status-pendente';
        
        row.innerHTML = `
            <td>${despesa.descricao}</td>
            <td>${despesa.categoria}</td>
            <td>${formatCurrency(despesa.valor)}</td>
            <td>${despesa.dataVencimento}</td>
            <td>${despesa.dataPagamento || '-'}</td>
            <td><span class="status ${statusClass}">${despesa.status}</span></td>
        `;
        
        tbody.appendChild(row);
    });
};

// ===== Filtros =====
const changeMonth = (mes) => {
    selectedMonth = mes;
    
    // Atualizar botões
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Atualizar dados
    updateKPIs();
    renderReceitasTable(mes);
    updateChartsTheme();
};

// ===== Export Functions =====
const exportToCSV = (tableId, filename) => {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        cols.forEach(col => csvRow.push(col.textContent));
        csv.push(csvRow.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};

// ===== Initialization =====
const init = () => {
    console.log('Inicializando Dashboard de Fluxo de Caixa...');
    
    initTheme();
    updateKPIs();
    
    createCashFlowChart();
    createMonthlyComparisonChart();
    createProjectionsChart();
    createConvenioDistributionChart();
    
    renderReceitasTable();
    renderDespesasTable();
    
    console.log('Dashboard carregado com sucesso!');
};

// Executar ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
