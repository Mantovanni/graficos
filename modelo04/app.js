// ===== Global Variables =====
let charts = {};
let currentTheme = 'dark';
let currentSort = { column: null, direction: 'asc' };
let selectedMonth = 'all';
let selectedConvenio = 'all';
let selectedStatus = 'all';

// ===== Theme Functions =====
const initTheme = () => {
    const savedTheme = localStorage.getItem('fluxoCaixaTheme') || 'dark';
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
        localStorage.setItem('fluxoCaixaTheme', 'dark');
    } else {
        body.classList.add('light-theme');
        currentTheme = 'light';
        updateThemeIcon('light');
        localStorage.setItem('fluxoCaixaTheme', 'light');
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
    createFluxoMensalChart();
    createEntradasConvenioChart();
    createEvolucaoSaldoChart();
    createImpostosChart();
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

const parseDateBR = (dateStr) => {
    if (!dateStr) return null;
    const [dia, mes, ano] = dateStr.split('/');
    return new Date(ano, mes - 1, dia);
};

const getMesAno = (dateStr) => {
    if (!dateStr) return null; // Retorna null se não houver data
    return dateStr.substring(3); // Retorna MM/YYYY
};

const getMesNome = (mesAno) => {
    const [mes, ano] = mesAno.split('/');
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[parseInt(mes) - 1]}/${ano}`;
};

// ===== Data Processing Functions =====
const getMesesDisponiveis = () => {
    const meses = new Set();

    fluxoCaixaData.entradas.forEach(entrada => {
        // Usa dataPagamento se disponível, senão usa dataVencimento
        const dataReferencia = entrada.dataPagamento || entrada.dataVencimento;
        const mesAno = getMesAno(dataReferencia);
        if (mesAno) {
            meses.add(mesAno);
        }
    });

    fluxoCaixaData.saidas.forEach(saida => {
        const mesAno = getMesAno(saida.dataPagamento);
        if (mesAno) {
            meses.add(mesAno);
        }
    });

    return Array.from(meses).sort();
};

const getConveniosDisponiveis = () => {
    const convenios = new Set();

    fluxoCaixaData.entradas.forEach(entrada => {
        convenios.add(entrada.convenio);
    });

    return Array.from(convenios).sort();
};

const calcularTotaisPorMes = (mesAno = null, convenio = null, status = null) => {
    let entradas = fluxoCaixaData.entradas;
    let saidas = fluxoCaixaData.saidas;

    // Aplica filtro de mês
    if (mesAno && mesAno !== 'all') {
        entradas = entradas.filter(e => {
            const dataReferencia = e.dataPagamento || e.dataVencimento;
            return getMesAno(dataReferencia) === mesAno;
        });
        saidas = saidas.filter(s => getMesAno(s.dataPagamento) === mesAno);
    }

    // Aplica filtro de convênio
    if (convenio && convenio !== 'all') {
        entradas = entradas.filter(e => e.convenio === convenio);
    }

    // Aplica filtro de status
    if (status && status !== 'all') {
        entradas = entradas.filter(e => e.status === status);
    }

    // Usa valorRecebido para entradas realizadas, valorLiquidoReceber para pendentes
    const totalEntradas = entradas.reduce((sum, e) => {
        const valor = e.status === "Realizado" ? e.valorRecebido : e.valorLiquidoReceber;
        return sum + valor;
    }, 0);
    const totalSaidas = saidas.reduce((sum, s) => sum + s.valor, 0);
    const saldo = totalEntradas - totalSaidas;

    return {
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo: saldo,
        countEntradas: entradas.length,
        countSaidas: saidas.length
    };
};

const calcularValoresFuturos = (mesAno = null, convenio = null, status = null) => {
    let aReceber = 0;
    let aPagar = 0;

    // Filtra as entradas conforme os filtros ativos
    let entradasFiltradas = fluxoCaixaData.entradas;

    // Aplica filtro de mês
    if (mesAno && mesAno !== 'all') {
        entradasFiltradas = entradasFiltradas.filter(e => {
            const dataReferencia = e.dataPagamento || e.dataVencimento;
            return getMesAno(dataReferencia) === mesAno;
        });
    }

    // Aplica filtro de convênio
    if (convenio && convenio !== 'all') {
        entradasFiltradas = entradasFiltradas.filter(e => e.convenio === convenio);
    }

    // Aplica filtro de status
    if (status && status !== 'all') {
        entradasFiltradas = entradasFiltradas.filter(e => e.status === status);
    }

    // Soma APENAS os valores com status Pendente (após aplicar filtros)
    entradasFiltradas.forEach(entrada => {
        if (entrada.status === "Pendente") {
            aReceber += entrada.valorLiquidoReceber;
        }
    });

    return { aReceber, aPagar };
};

const getDadosResumoMensal = () => {
    const meses = getMesesDisponiveis();
    const dadosMensais = processarDadosPorMes();

    return meses.map(mesAno => {
        const dados = dadosMensais[mesAno] || { entradas: 0, saidas: 0 };
        const saldo = dados.entradas - dados.saidas;
        const margem = dados.entradas > 0 ? ((saldo / dados.entradas) * 100) : 0;

        return {
            mesAno,
            entradas: dados.entradas,
            saidas: dados.saidas,
            saldo,
            margem
        };
    });
};

// ===== KPI Functions =====
const updateKPIs = () => {
    // Usa os filtros ativos para todos os cards
    const totais = calcularTotaisPorMes(selectedMonth, selectedConvenio, selectedStatus);
    const valoresFuturos = calcularValoresFuturos(selectedMonth, selectedConvenio, selectedStatus);

    // Atualiza os títulos dos cards conforme o filtro
    const sufixo = selectedMonth === 'all' ? 'Total' : 'do Mês';
    document.getElementById('entradas-titulo').textContent = `Entradas ${sufixo}`;
    document.getElementById('saidas-titulo').textContent = `Saídas ${sufixo}`;
    document.getElementById('saldo-titulo').textContent = `Saldo ${sufixo}`;

    // Entradas do mês (ou total se filtro = "Todos")
    document.getElementById('entradas-mes').textContent = formatCurrency(totais.entradas);
    document.getElementById('entradas-mes-count').textContent = `${totais.countEntradas} lançamentos`;

    // Saídas do mês (ou total se filtro = "Todos")
    document.getElementById('saidas-mes').textContent = formatCurrency(totais.saidas);
    document.getElementById('saidas-mes-count').textContent = `${totais.countSaidas} lançamentos`;

    // Saldo do mês (ou total se filtro = "Todos")
    document.getElementById('saldo-mes').textContent = formatCurrency(totais.saldo);

    const saldoTrend = document.getElementById('saldo-trend');
    if (totais.saldo > 0) {
        saldoTrend.innerHTML = `<i class="fas fa-arrow-up"></i> Positivo`;
        saldoTrend.className = 'kpi-trend trend-up';
    } else if (totais.saldo < 0) {
        saldoTrend.innerHTML = `<i class="fas fa-arrow-down"></i> Negativo`;
        saldoTrend.className = 'kpi-trend trend-down';
    } else {
        saldoTrend.innerHTML = `<i class="fas fa-minus"></i> Neutro`;
        saldoTrend.className = 'kpi-trend';
    }

    // A Receber
    document.getElementById('a-receber').textContent = formatCurrency(valoresFuturos.aReceber);

    // Resumo Geral - AGORA TAMBÉM RESPONDE AOS FILTROS
    const totaisGerais = calcularTotaisPorMes(selectedMonth, selectedConvenio, selectedStatus);
    document.getElementById('total-entradas').textContent = formatCurrency(totaisGerais.entradas);
    document.getElementById('total-saidas').textContent = formatCurrency(totaisGerais.saidas);

    const saldoGeral = document.getElementById('saldo-geral');
    saldoGeral.textContent = formatCurrency(totaisGerais.saldo);
    saldoGeral.className = 'stat-value ' + (totaisGerais.saldo >= 0 ? 'text-success' : 'text-danger');
};

// ===== Chart Functions =====
const createFluxoMensalChart = () => {
    const ctx = document.getElementById('fluxo-mensal-chart');
    const colors = getChartColors();

    if (charts.fluxoMensal) {
        charts.fluxoMensal.destroy();
    }

    const dadosMensais = processarDadosPorMes();
    const meses = Object.keys(dadosMensais).sort();

    const entradas = meses.map(mes => dadosMensais[mes].entradas);
    const saidas = meses.map(mes => dadosMensais[mes].saidas);
    const labels = meses.map(mes => getMesNome(mes));

    charts.fluxoMensal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradas,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Saídas',
                    data: saidas,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
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

const createEntradasConvenioChart = () => {
    const ctx = document.getElementById('entradas-convenio-chart');
    const chartColors = getChartColors();

    if (charts.entradasConvenio) {
        charts.entradasConvenio.destroy();
    }

    const convenios = {};

    fluxoCaixaData.entradas.forEach(entrada => {
        if (!convenios[entrada.convenio]) {
            convenios[entrada.convenio] = 0;
        }
        convenios[entrada.convenio] += entrada.valorRecebido;
    });

    const labels = Object.keys(convenios);
    const data = Object.values(convenios);

    const colors = [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
    ];

    const isLight = document.body.classList.contains('light-theme');
    const borderColor = isLight ? '#e2e8f0' : '#1e293b';

    charts.entradasConvenio = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: borderColor,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: chartColors.textColor,
                        padding: 10,
                        font: {
                            size: 11
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

const createEvolucaoSaldoChart = () => {
    const ctx = document.getElementById('evolucao-saldo-chart');
    const colors = getChartColors();

    if (charts.evolucaoSaldo) {
        charts.evolucaoSaldo.destroy();
    }

    const dadosMensais = processarDadosPorMes();
    const meses = Object.keys(dadosMensais).sort();

    let saldoAcumulado = 0;
    const saldos = meses.map(mes => {
        const dados = dadosMensais[mes];
        saldoAcumulado += (dados.entradas - dados.saidas);
        return saldoAcumulado;
    });

    const labels = meses.map(mes => getMesNome(mes));

    charts.evolucaoSaldo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Saldo Acumulado',
                data: saldos,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
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

const createImpostosChart = () => {
    const ctx = document.getElementById('impostos-chart');
    const colors = getChartColors();

    if (charts.impostos) {
        charts.impostos.destroy();
    }

    const meses = getMesesDisponiveis().sort();

    const impostos = [];
    const valorLiquido = [];

    meses.forEach(mesAno => {
        const entradasMes = fluxoCaixaData.entradas.filter(e => {
            const dataReferencia = e.dataPagamento || e.dataVencimento;
            return getMesAno(dataReferencia) === mesAno;
        });

        const totalImpostos = entradasMes.reduce((sum, e) => sum + e.impostos, 0);
        const totalLiquido = entradasMes.reduce((sum, e) => sum + e.valorLiquidoReceber, 0);

        impostos.push(totalImpostos);
        valorLiquido.push(totalLiquido);
    });

    const labels = meses.map(mes => getMesNome(mes));

    charts.impostos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Valor Líquido',
                    data: valorLiquido,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Impostos',
                    data: impostos,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
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
                    stacked: true,
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
                    stacked: true,
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
const renderEntradasTable = (data = null) => {
    const tbody = document.getElementById('entradas-table-body');
    const tableData = data || fluxoCaixaData.entradas;

    tbody.innerHTML = '';

    tableData.forEach(entrada => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');

        const statusClass = entrada.status === 'Realizado' ? 'status-realizado' : 'status-pendente';
        const dataPagamentoDisplay = entrada.dataPagamento || entrada.dataVencimento;

        row.innerHTML = `
            <td><strong>${entrada.convenio}</strong></td>
            <td>${entrada.mes}</td>
            <td class="text-primary">${formatCurrency(entrada.faturamento)}</td>
            <td class="text-warning">${formatCurrency(entrada.impostos)}</td>
            <td class="text-success"><strong>${formatCurrency(entrada.valorLiquidoReceber)}</strong></td>
            <td>${dataPagamentoDisplay}</td>
            <td><span class="status-badge ${statusClass}">${entrada.status}</span></td>
        `;

        tbody.appendChild(row);
    });
};

const renderSaidasTable = (data = null) => {
    const tbody = document.getElementById('saidas-table-body');
    const tableData = data || fluxoCaixaData.saidas;

    tbody.innerHTML = '';

    tableData.forEach(saida => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');

        row.innerHTML = `
            <td><strong>${saida.categoria}</strong></td>
            <td class="text-danger"><strong>${formatCurrency(saida.valor)}</strong></td>
            <td>${saida.dataPagamento}</td>
        `;

        tbody.appendChild(row);
    });
};

const renderResumoMensalTable = () => {
    const tbody = document.getElementById('resumo-mensal-body');
    const dados = getDadosResumoMensal();

    tbody.innerHTML = '';

    dados.forEach(item => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');

        const saldoClass = item.saldo >= 0 ? 'text-success' : 'text-danger';
        const margemClass = item.margem >= 0 ? 'text-success' : 'text-danger';

        row.innerHTML = `
            <td><strong>${getMesNome(item.mesAno)}</strong></td>
            <td class="text-success">${formatCurrency(item.entradas)}</td>
            <td class="text-danger">${formatCurrency(item.saidas)}</td>
            <td class="${saldoClass}"><strong>${formatCurrency(item.saldo)}</strong></td>
            <td class="${margemClass}"><strong>${item.margem.toFixed(1)}%</strong></td>
        `;

        tbody.appendChild(row);
    });
};

// ===== Filter Functions =====
const populateFilters = () => {
    // Populate month filter
    const monthFilter = document.getElementById('month-filter');
    const meses = getMesesDisponiveis();

    meses.forEach(mesAno => {
        const option = document.createElement('option');
        option.value = mesAno;
        option.textContent = getMesNome(mesAno);
        monthFilter.appendChild(option);
    });

    // Populate convenio filter
    const convenioFilter = document.getElementById('convenio-filter');
    const convenios = getConveniosDisponiveis();

    convenios.forEach(convenio => {
        const option = document.createElement('option');
        option.value = convenio;
        option.textContent = convenio;
        convenioFilter.appendChild(option);
    });
};

const applyFilters = () => {
    const monthFilter = document.getElementById('month-filter').value;
    const convenioFilter = document.getElementById('convenio-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    selectedMonth = monthFilter;
    selectedConvenio = convenioFilter;
    selectedStatus = statusFilter;

    let filteredEntradas = fluxoCaixaData.entradas;
    let filteredSaidas = fluxoCaixaData.saidas;

    // Apply filters
    if (monthFilter !== 'all') {
        filteredEntradas = filteredEntradas.filter(e => {
            const dataReferencia = e.dataPagamento || e.dataVencimento;
            return getMesAno(dataReferencia) === monthFilter;
        });
        filteredSaidas = filteredSaidas.filter(s => getMesAno(s.dataPagamento) === monthFilter);
    }

    if (convenioFilter !== 'all') {
        filteredEntradas = filteredEntradas.filter(e => e.convenio === convenioFilter);
    }

    if (statusFilter !== 'all') {
        filteredEntradas = filteredEntradas.filter(e => e.status === statusFilter);
    }

    // Update tables
    renderEntradasTable(filteredEntradas);
    renderSaidasTable(filteredSaidas);

    // Update KPIs
    updateKPIs();

    // Recarregar gráficos com animação
    showLoading();
    setTimeout(() => {
        createFluxoMensalChart();
        createEntradasConvenioChart();
        createEvolucaoSaldoChart();
        createImpostosChart();
        hideLoading();
    }, 300);
};

const clearFilters = () => {
    document.getElementById('month-filter').value = 'all';
    document.getElementById('convenio-filter').value = 'all';
    document.getElementById('status-filter').value = 'all';

    selectedMonth = 'all';
    selectedConvenio = 'all';
    selectedStatus = 'all';

    renderEntradasTable();
    renderSaidasTable();
    updateKPIs();
};

// ===== Search Functions =====
const searchEntradas = (query) => {
    const filtered = fluxoCaixaData.entradas.filter(entrada =>
        entrada.convenio.toLowerCase().includes(query.toLowerCase()) ||
        entrada.mes.toLowerCase().includes(query.toLowerCase())
    );
    renderEntradasTable(filtered);
};

const searchSaidas = (query) => {
    const filtered = fluxoCaixaData.saidas.filter(saida =>
        saida.categoria.toLowerCase().includes(query.toLowerCase())
    );
    renderSaidasTable(filtered);
};

// ===== Export Functions =====
const exportEntradasToCSV = () => {
    let csv = 'Convênio,Mês,Faturamento,Impostos,Valor Líquido,Data Pagamento,Status\n';

    fluxoCaixaData.entradas.forEach(entrada => {
        csv += `"${entrada.convenio}","${entrada.mes}",${entrada.faturamento},${entrada.impostos},${entrada.valorLiquidoReceber},"${entrada.dataPagamento}","${entrada.status}"\n`;
    });

    downloadCSV(csv, 'entradas_fluxo_caixa.csv');
};

const exportSaidasToCSV = () => {
    let csv = 'Categoria,Valor,Data Pagamento\n';

    fluxoCaixaData.saidas.forEach(saida => {
        csv += `"${saida.categoria}",${saida.valor},"${saida.dataPagamento}"\n`;
    });

    downloadCSV(csv, 'saidas_fluxo_caixa.csv');
};

const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// ===== Sort Functions =====
const sortTable = (tableName, column) => {
    const data = tableName === 'entradas' ? [...fluxoCaixaData.entradas] : [...fluxoCaixaData.saidas];

    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    const sorted = data.sort((a, b) => {
        let valueA, valueB;

        switch (column) {
            case 'convenio':
                valueA = a.convenio;
                valueB = b.convenio;
                break;
            case 'mes':
                valueA = a.mes;
                valueB = b.mes;
                break;
            case 'faturamento':
                valueA = a.faturamento;
                valueB = b.faturamento;
                break;
            case 'impostos':
                valueA = a.impostos;
                valueB = b.impostos;
                break;
            case 'valor-liquido':
                valueA = a.valorLiquidoReceber;
                valueB = b.valorLiquidoReceber;
                break;
            case 'data-pagamento':
                valueA = parseDateBR(a.dataPagamento || a.dataVencimento);
                valueB = parseDateBR(b.dataPagamento || b.dataVencimento);
                break;
            case 'status':
                valueA = a.status;
                valueB = b.status;
                break;
            case 'categoria':
                valueA = a.categoria;
                valueB = b.categoria;
                break;
            case 'valor':
                valueA = a.valor;
                valueB = b.valor;
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

    if (tableName === 'entradas') {
        renderEntradasTable(sorted);
    } else {
        renderSaidasTable(sorted);
    }
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
    populateFilters();

    // Update KPIs
    updateKPIs();

    // Create charts
    setTimeout(() => {
        createFluxoMensalChart();
        createEntradasConvenioChart();
        createEvolucaoSaldoChart();
        createImpostosChart();

        // Render tables
        renderEntradasTable();
        renderSaidasTable();
        renderResumoMensalTable();

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
    document.getElementById('search-entradas').addEventListener('input', (e) => {
        searchEntradas(e.target.value);
    });

    document.getElementById('search-saidas').addEventListener('input', (e) => {
        searchSaidas(e.target.value);
    });

    // Export CSV
    document.getElementById('export-entradas-csv').addEventListener('click', exportEntradasToCSV);
    document.getElementById('export-saidas-csv').addEventListener('click', exportSaidasToCSV);

    // Sort tables - Entradas
    document.querySelectorAll('#entradas-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-column');
            sortTable('entradas', column);
        });
    });

    // Sort tables - Saidas
    document.querySelectorAll('#saidas-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.getAttribute('data-column');
            sortTable('saidas', column);
        });
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
