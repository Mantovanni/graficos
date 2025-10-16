import { expenseData, monthNames, productionData } from "../shared/dataset.js";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numberFormatter = new Intl.NumberFormat("pt-BR");

const startPeriodSelect = document.querySelector("#startPeriod");
const endPeriodSelect = document.querySelector("#endPeriod");
const convenioFilterSelect = document.querySelector("#convenioFilter");
const statusFilterSelect = document.querySelector("#statusFilter");
const procedureSearchInput = document.querySelector("#procedureSearch");
const receivedOnlyToggle = document.querySelector("#receivedOnly");

const grossRevenueEl = document.querySelector("#grossRevenue");
const grossRevenueTrendEl = document.querySelector("#grossRevenueTrend");
const grossRevenueDetailEl = document.querySelector("#grossRevenueDetail");
const totalExpensesEl = document.querySelector("#totalExpenses");
const totalExpensesTrendEl = document.querySelector("#totalExpensesTrend");
const totalExpensesDetailEl = document.querySelector("#totalExpensesDetail");
const netMarginEl = document.querySelector("#netMargin");
const netMarginPercentageEl = document.querySelector("#netMarginPercentage");
const netMarginDetailEl = document.querySelector("#netMarginDetail");
const avgTicketEl = document.querySelector("#avgTicket");
const avgTicketTrendEl = document.querySelector("#ticketTrend");
const avgTicketDetailEl = document.querySelector("#avgTicketDetail");
const proceduresCountEl = document.querySelector("#proceduresCount");
const proceduresGrowthEl = document.querySelector("#proceduresGrowth");
const proceduresDetailEl = document.querySelector("#proceduresDetail");
const avgReceivableEl = document.querySelector("#avgReceivable");
const receivableTrendEl = document.querySelector("#receivableTrend");
const avgReceivableDetailEl = document.querySelector("#avgReceivableDetail");
const tableBody = document.querySelector("#productionTable");
const tableCaption = document.querySelector("#tableCaption");
const expenseTableBody = document.querySelector("#expenseTable");
const kpiTableBody = document.querySelector("#kpiTable");
const comparisonMonthASelect = document.querySelector("#comparisonMonthA");
const comparisonMonthBSelect = document.querySelector("#comparisonMonthB");
const comparisonInfoEl = document.querySelector("#comparisonInfo");
const comparisonTableBody = document.querySelector("#comparisonTable");

const resetFiltersButton = document.querySelector("#resetFilters");
const themeToggle = document.querySelector("#toggleTheme");
const exportCsvButton = document.querySelector("#exportCsv");

let financialEvolutionChart;
let revenueByConvenioChart;
let procedureMixChart;
let receivableStatusChart;
let procedureComparisonChart;

const state = {
    months: getUniqueMonths(),
    convenios: getUniqueConvenios(),
    statuses: getUniqueStatuses(),
};

populateSelect(startPeriodSelect, state.months);
populateSelect(endPeriodSelect, state.months);
populateSelect(convenioFilterSelect, state.convenios, true);
populateSelect(statusFilterSelect, state.statuses, true);

startPeriodSelect.value = state.months[0];
endPeriodSelect.value = state.months[state.months.length - 1];
convenioFilterSelect.value = "all";
statusFilterSelect.value = "all";
receivedOnlyToggle.checked = false;

const filters = [
    startPeriodSelect,
    endPeriodSelect,
    convenioFilterSelect,
    statusFilterSelect,
    procedureSearchInput,
    receivedOnlyToggle,
];

filters.forEach((control) => {
    const eventName = control.tagName === "INPUT" && control.type === "search" ? "input" : "change";
    control.addEventListener(eventName, handleFilterChange);
});

if (comparisonMonthASelect && comparisonMonthBSelect) {
    comparisonMonthASelect.addEventListener("change", renderComparison);
    comparisonMonthBSelect.addEventListener("change", renderComparison);
}

resetFiltersButton.addEventListener("click", () => {
    startPeriodSelect.value = state.months[0];
    endPeriodSelect.value = state.months[state.months.length - 1];
    convenioFilterSelect.value = "all";
    statusFilterSelect.value = "all";
    procedureSearchInput.value = "";
    receivedOnlyToggle.checked = false;
    render();
});

themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark") {
        document.documentElement.removeAttribute("data-theme");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
    }
    const scheme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    document.documentElement.style.colorScheme = scheme;
    renderCharts();
    renderComparison();
});

exportCsvButton.addEventListener("click", () => {
    const filtered = getFilteredProduction();
    const rows = [
        ["Data", "Procedimento", "Convênio", "Médico", "Setor", "Quantidade", "Faturamento", "Despesa", "Resultado", "Status", "Prazo médio"],
        ...filtered.map((item) => [
            item.date,
            item.procedure,
            item.convenio,
            item.doctor,
            item.sector,
            item.quantity,
            currencyFormatter.format(item.revenue),
            currencyFormatter.format(item.expense),
            currencyFormatter.format(item.revenue - item.expense),
            item.status,
            `${item.daysToReceive} dias`,
        ]),
    ];
    const csv = rows.map((cols) => cols.map(escapeCsv).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dashboard-clinica.csv";
    link.click();
    URL.revokeObjectURL(link.href);
});

document.querySelectorAll("[data-download]").forEach((button) => {
    button.addEventListener("click", () => {
        const id = button.getAttribute("data-download");
        const chart = getChartInstance(id);
        if (!chart) return;
        const link = document.createElement("a");
        link.href = chart.toBase64Image();
        link.download = `${id}-${Date.now()}.png`;
        link.click();
    });
});

render();

function render() {
    const production = getFilteredProduction();
    const expenses = getFilteredExpenses();

    updateCards(production, expenses);
    populateProductionTable(production);
    populateExpenseTable(expenses);
    populateKpiTable(production);
    renderCharts(production, expenses);
    updateComparisonOptions(getSelectedMonths());
    renderComparison();
}

function handleFilterChange() {
    const start = startPeriodSelect.value;
    const end = endPeriodSelect.value;
    if (state.months.indexOf(start) > state.months.indexOf(end)) {
        endPeriodSelect.value = start;
    }
    render();
}

function getFilteredProduction() {
    const context = getFilterContext();
    return productionData.filter((item) => {
        const monthIndex = context.months.indexOf(item.month);
        if (monthIndex < context.startIndex || monthIndex > context.endIndex) return false;
        return matchesCommonFilters(item, context);
    });
}

function getFilteredExpenses() {
    const context = getFilterContext();
    return expenseData.filter((expense) => {
        const monthIndex = context.months.indexOf(expense.month);
        return monthIndex >= context.startIndex && monthIndex <= context.endIndex;
    });
}

function getFilterContext() {
    const startIndex = state.months.indexOf(startPeriodSelect.value);
    const endIndex = state.months.indexOf(endPeriodSelect.value);
    return {
        startIndex,
        endIndex,
        months: state.months,
        searchTerm: procedureSearchInput.value.toLowerCase().trim(),
        convenioFilter: convenioFilterSelect.value,
        statusFilter: statusFilterSelect.value,
        receivedOnly: receivedOnlyToggle.checked,
    };
}

function matchesCommonFilters(item, context) {
    if (context.convenioFilter !== "all" && item.convenio !== context.convenioFilter) return false;
    if (context.statusFilter !== "all" && item.status !== context.statusFilter) return false;
    if (context.receivedOnly && item.status !== "Recebido" && item.status !== "Pago") return false;
    if (context.searchTerm) {
        const haystack = `${item.procedure} ${item.convenio} ${item.doctor} ${item.sector}`.toLowerCase();
        if (!haystack.includes(context.searchTerm)) return false;
    }
    return true;
}

function getFilteredProductionForMonth(month) {
    const context = getFilterContext();
    const monthIndex = context.months.indexOf(month);
    if (monthIndex === -1) return [];
    if (monthIndex < context.startIndex || monthIndex > context.endIndex) return [];
    return productionData.filter((item) => item.month === month && matchesCommonFilters(item, context));
}

function updateCards(production, expenses) {
    const totalRevenue = sum(production, "revenue");
    const variableCosts = sum(production, "expense");
    const fixedCosts = sum(expenses, "amount");
    const totalExpenses = variableCosts + fixedCosts;
    const totalQuantity = sum(production, "quantity");
    const netResult = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netResult / totalRevenue) * 100 : 0;
    const avgTicket = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;
    const weightedDays = sum(production, null, (item) => item.daysToReceive * item.revenue);
    const avgDays = totalRevenue > 0 ? weightedDays / totalRevenue : 0;
    const monthsSelected = getSelectedMonths();
    const previousMonths = getPreviousMonths(monthsSelected.length, monthsSelected[0]);

    const previousProduction = filterByMonths(productionData, previousMonths);
    const previousExpenses = expenseData.filter((item) => previousMonths.includes(item.month));

    const prevRevenue = sum(previousProduction, "revenue");
    const prevVariable = sum(previousProduction, "expense");
    const prevFixed = sum(previousExpenses, "amount");
    const prevExpensesTotal = prevVariable + prevFixed;
    const prevQuantity = sum(previousProduction, "quantity");
    const prevAvgTicket = prevQuantity > 0 ? prevRevenue / prevQuantity : 0;
    const prevWeightedDays = sum(previousProduction, null, (item) => item.daysToReceive * item.revenue);
    const prevAvgDays = prevRevenue > 0 ? prevWeightedDays / prevRevenue : 0;

    const revenueDelta = computeDelta(totalRevenue, prevRevenue);
    const expenseDelta = computeDelta(totalExpenses, prevExpensesTotal);
    const ticketDelta = computeDelta(avgTicket, prevAvgTicket);
    const proceduresDelta = computeDelta(totalQuantity, prevQuantity);
    const receivableDelta = prevAvgDays > 0 ? avgDays - prevAvgDays : 0;

    grossRevenueEl.textContent = currencyFormatter.format(totalRevenue);
    totalExpensesEl.textContent = currencyFormatter.format(totalExpenses);
    netMarginEl.textContent = currencyFormatter.format(netResult);
    avgTicketEl.textContent = currencyFormatter.format(avgTicket || 0);
    proceduresCountEl.textContent = numberFormatter.format(totalQuantity);
    avgReceivableEl.textContent = `${avgDays.toFixed(0)} dias`;

    grossRevenueTrendEl.textContent = formatDelta(revenueDelta, "%");
    grossRevenueTrendEl.className = trendClass(revenueDelta);
    totalExpensesTrendEl.textContent = formatDelta(expenseDelta, "%");
    totalExpensesTrendEl.className = trendClass(expenseDelta, false);
    netMarginPercentageEl.textContent = `${margin.toFixed(1)}%`;
    netMarginPercentageEl.className = margin >= 0 ? "trend positive" : "trend negative";
    avgTicketTrendEl.textContent = formatDelta(ticketDelta, "%");
    avgTicketTrendEl.className = trendClass(ticketDelta);
    proceduresGrowthEl.textContent = formatDelta(proceduresDelta, "%");
    proceduresGrowthEl.className = trendClass(proceduresDelta);
    receivableTrendEl.textContent = `${receivableDelta > 0 ? "+" : ""}${receivableDelta.toFixed(0)}d`;
    receivableTrendEl.className = receivableDelta <= 0 ? "trend positive" : "trend negative";

    grossRevenueDetailEl.textContent = previousMonths.length
        ? `Período anterior (${formatRange(previousMonths)}) faturou ${currencyFormatter.format(prevRevenue)}.`
        : "Sem histórico anterior suficiente.";
    totalExpensesDetailEl.textContent = previousMonths.length
        ? `Custos anteriores somaram ${currencyFormatter.format(prevExpensesTotal)}.`
        : "Sem histórico anterior suficiente.";
    netMarginDetailEl.textContent = `Custos variáveis representam ${percentual(variableCosts, totalRevenue)} da receita.`;
    avgTicketDetailEl.textContent = `Baseado em ${numberFormatter.format(totalQuantity)} procedimentos.`;
    proceduresDetailEl.textContent = `Produção diária média de ${(totalQuantity / Math.max(monthsSelected.length * 30, 1)).toFixed(1)} procedimentos.`;
    avgReceivableDetailEl.textContent = previousMonths.length
        ? `Prazo anterior: ${prevAvgDays.toFixed(0)} dias.`
        : "Aguardando mais histórico.";
}

function renderCharts(production = getFilteredProduction(), expenses = getFilteredExpenses()) {
    const monthlySummary = buildMonthlySummary(production, expenses);
    const convenios = aggregateByKey(production, "convenio");
    const procedures = aggregateByKey(production, "procedure");
    const statuses = aggregateByKey(production, "status");

    const ctxFinancial = document.getElementById("financialEvolution");
    const ctxConvenio = document.getElementById("revenueByConvenio");
    const ctxProcedures = document.getElementById("procedureMix");
    const ctxReceivable = document.getElementById("receivableStatus");

    const financialData = {
        labels: monthlySummary.labels,
        datasets: [
            {
                label: "Faturamento",
                data: monthlySummary.revenue,
                borderColor: "#3867ff",
                backgroundColor: "rgba(56, 103, 255, 0.12)",
                tension: 0.4,
                fill: true,
            },
            {
                label: "Despesas",
                data: monthlySummary.expenses,
                borderColor: "#ff5a71",
                backgroundColor: "rgba(255, 90, 113, 0.12)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const convenioData = {
        labels: convenios.labels,
        datasets: [
            {
                label: "Faturamento",
                data: convenios.values,
                borderRadius: 12,
                backgroundColor: generatePalette(convenios.labels.length),
            },
        ],
    };

    const procedureData = {
        labels: procedures.labels,
        datasets: [
            {
                label: "Participação",
                data: procedures.values,
                backgroundColor: generatePalette(procedures.labels.length, 0.65),
            },
        ],
    };

    const statusData = {
        labels: statuses.labels,
        datasets: [
            {
                label: "Receita",
                data: statuses.values,
                backgroundColor: [
                    "rgba(38, 193, 126, 0.45)",
                    "rgba(255, 160, 67, 0.45)",
                    "rgba(255, 90, 113, 0.45)",
                    "rgba(119, 140, 255, 0.45)",
                ],
            },
        ],
    };

    financialEvolutionChart = upsertChart(financialEvolutionChart, ctxFinancial, {
        type: "line",
        data: financialData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: (value) => currencyFormatter.format(value),
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${currencyFormatter.format(ctx.parsed.y)}`,
                    },
                },
                legend: {
                    display: true,
                },
            },
        },
    });

    revenueByConvenioChart = upsertChart(revenueByConvenioChart, ctxConvenio, {
        type: "bar",
        data: convenioData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => currencyFormatter.format(value),
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${currencyFormatter.format(ctx.parsed.y)}`,
                    },
                },
            },
        },
    });

    procedureMixChart = upsertChart(procedureMixChart, ctxProcedures, {
        type: "doughnut",
        data: procedureData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${currencyFormatter.format(ctx.parsed)}`,
                    },
                },
                legend: {
                    position: "bottom",
                },
            },
        },
    });

    receivableStatusChart = upsertChart(receivableStatusChart, ctxReceivable, {
        type: "polarArea",
        data: statusData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    ticks: {
                        callback: (value) => currencyFormatter.format(value),
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${currencyFormatter.format(ctx.parsed.r)}`,
                    },
                },
            },
        },
    });
}

function updateComparisonOptions(months) {
    if (!comparisonMonthASelect || !comparisonMonthBSelect) return;
    if (!months.length) {
        comparisonMonthASelect.innerHTML = "";
        comparisonMonthBSelect.innerHTML = "";
        return;
    }

    const previousA = comparisonMonthASelect.value;
    const previousB = comparisonMonthBSelect.value;
    populateSelect(comparisonMonthASelect, months);
    populateSelect(comparisonMonthBSelect, months);

    const fallbackB = months[months.length - 1];
    const fallbackA = months[Math.max(months.length - 2, 0)];

    comparisonMonthASelect.value = months.includes(previousA) ? previousA : fallbackA;
    comparisonMonthBSelect.value = months.includes(previousB) ? previousB : fallbackB;

    if (comparisonMonthASelect.value === comparisonMonthBSelect.value && months.length > 1) {
        const indexB = months.indexOf(comparisonMonthBSelect.value);
        const indexA = Math.max(indexB - 1, 0);
        comparisonMonthASelect.value = months[indexA];
    }
}

function renderComparison() {
    if (!comparisonMonthASelect || !comparisonMonthBSelect) return;

    const monthA = comparisonMonthASelect.value;
    const monthB = comparisonMonthBSelect.value;
    const labelA = monthNames[monthA] || monthA;
    const labelB = monthNames[monthB] || monthB;

    const monthAData = getFilteredProductionForMonth(monthA);
    const monthBData = getFilteredProductionForMonth(monthB);
    const summaryA = summarizeByProcedure(monthAData);
    const summaryB = summarizeByProcedure(monthBData);
    const procedures = new Set([...summaryA.keys(), ...summaryB.keys()]);

    const rows = Array.from(procedures).map((procedure) => {
        const base = summaryA.get(procedure) || { revenue: 0, quantity: 0 };
        const current = summaryB.get(procedure) || { revenue: 0, quantity: 0 };
        return {
            procedure,
            revenueA: base.revenue,
            revenueB: current.revenue,
            variation: current.revenue - base.revenue,
            percentage: computeDelta(current.revenue, base.revenue),
            qtyDelta: current.quantity - base.quantity,
        };
    }).filter((row) => row.revenueA || row.revenueB);

    const totalA = rows.reduce((acc, row) => acc + row.revenueA, 0);
    const totalB = rows.reduce((acc, row) => acc + row.revenueB, 0);
    const totalDelta = totalB - totalA;
    const totalDeltaPercent = computeDelta(totalB, totalA);

    if (comparisonInfoEl) {
        if (!rows.length) {
            comparisonInfoEl.textContent = "Sem dados para os filtros selecionados.";
        } else if (monthA === monthB) {
            comparisonInfoEl.textContent = `Visualizando o detalhamento de ${labelA}.`;
        } else {
            const direction = totalDelta > 0 ? "acima" : totalDelta < 0 ? "abaixo" : "em linha com";
            const deltaText = formatSignedCurrency(totalDelta);
            const percentText = formatDelta(totalDeltaPercent, "%");
            if (direction === "em linha com") {
                comparisonInfoEl.textContent = `${labelB} está em linha com ${labelA} (${deltaText}, ${percentText}).`;
            } else {
                comparisonInfoEl.textContent = `${labelB} está ${direction} ${labelA} (${deltaText}, ${percentText}).`;
            }
        }
    }

    if (!rows.length) {
        if (comparisonTableBody) {
            comparisonTableBody.innerHTML = '<tr><td colspan="6">Sem dados para os filtros selecionados.</td></tr>';
        }
        const ctx = document.getElementById("procedureComparison");
        if (ctx) {
            procedureComparisonChart = upsertChart(procedureComparisonChart, ctx, {
                type: "bar",
                data: { labels: [], datasets: [] },
                options: comparisonChartOptions(),
            });
        }
        return;
    }

    const sorted = rows.sort((a, b) => Math.abs(b.variation) - Math.abs(a.variation));
    const tableRows = sorted.slice(0, 10).map((row) => {
        const moneyClass = row.variation > 0 ? "delta-positive" : row.variation < 0 ? "delta-negative" : "delta-neutral";
        const qtyClass = row.qtyDelta > 0 ? "delta-positive" : row.qtyDelta < 0 ? "delta-negative" : "delta-neutral";
        return `<tr>
            <td>${row.procedure}</td>
            <td>${currencyFormatter.format(row.revenueA)}</td>
            <td>${currencyFormatter.format(row.revenueB)}</td>
            <td><span class="delta ${moneyClass}">${formatSignedCurrency(row.variation)}</span></td>
            <td><span class="delta ${moneyClass}">${formatDelta(row.percentage, "%")}</span></td>
            <td><span class="delta ${qtyClass}">${formatSignedNumber(row.qtyDelta)}</span></td>
        </tr>`;
    });

    if (comparisonTableBody) {
        comparisonTableBody.innerHTML = tableRows.join("") || '<tr><td colspan="6">Sem dados para os filtros selecionados.</td></tr>';
    }

    const chartRows = sorted.slice(0, 6);
    const ctx = document.getElementById("procedureComparison");
    if (!ctx) return;

    const primaryColor = cssVar("--accent", "#3867ff");
    const secondaryColor = cssVar("--muted", "#6f7893");

    const data = {
        labels: chartRows.map((row) => row.procedure),
        datasets: [
            {
                label: labelA,
                data: chartRows.map((row) => row.revenueA),
                backgroundColor: withOpacity(secondaryColor, 0.28),
                borderColor: secondaryColor,
                borderWidth: 1.5,
                borderRadius: 12,
            },
            {
                label: labelB,
                data: chartRows.map((row) => row.revenueB),
                backgroundColor: withOpacity(primaryColor, 0.35),
                borderColor: primaryColor,
                borderWidth: 1.5,
                borderRadius: 12,
            },
        ],
    };

    procedureComparisonChart = upsertChart(procedureComparisonChart, ctx, {
        type: "bar",
        data,
        options: comparisonChartOptions(),
    });
}

function comparisonChartOptions() {
    return {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    callback: (value) => currencyFormatter.format(value),
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${currencyFormatter.format(ctx.parsed.x)}`,
                },
            },
            legend: {
                display: true,
            },
        },
    };
}

function populateProductionTable(production) {
    tableBody.innerHTML = "";
    if (!production.length) {
        tableBody.innerHTML = '<tr><td colspan="11">Nenhum registro encontrado para os filtros selecionados.</td></tr>';
        tableCaption.textContent = "Mostrando 0 itens";
        return;
    }

    const sorted = [...production].sort((a, b) => new Date(b.date) - new Date(a.date));
    const rows = sorted.map((item) => {
        const statusClass = item.status === "Recebido" || item.status === "Pago" ? "paid" : item.status === "Pendente" ? "warning" : item.status === "Glosado" ? "delayed" : "neutral";
        const statusLabel = `<span class="status-pill ${statusClass}">${item.status}</span>`;
        return `<tr>
            <td>${formatDate(item.date)}</td>
            <td>${item.procedure}</td>
            <td>${item.convenio}</td>
            <td>${item.doctor}</td>
            <td>${item.sector}</td>
            <td>${numberFormatter.format(item.quantity)}</td>
            <td>${currencyFormatter.format(item.revenue)}</td>
            <td>${currencyFormatter.format(item.expense)}</td>
            <td>${currencyFormatter.format(item.revenue - item.expense)}</td>
            <td>${statusLabel}</td>
            <td>${item.daysToReceive}d</td>
        </tr>`;
    });

    tableBody.innerHTML = rows.join("");
    tableCaption.textContent = `Mostrando ${numberFormatter.format(production.length)} itens`;
}

function populateExpenseTable(expenses) {
    expenseTableBody.innerHTML = "";
    if (!expenses.length) {
        expenseTableBody.innerHTML = '<tr><td colspan="4">Sem despesas no período.</td></tr>';
        return;
    }
    const sorted = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 8);
    const rows = sorted.map((item) => `<tr>
        <td>${monthNames[item.month] || item.month}</td>
        <td>${item.category}</td>
        <td>${item.description}</td>
        <td>${currencyFormatter.format(item.amount)}</td>
    </tr>`);
    expenseTableBody.innerHTML = rows.join("");
}

function populateKpiTable(production) {
    kpiTableBody.innerHTML = "";
    if (!production.length) {
        kpiTableBody.innerHTML = '<tr><td colspan="6">Sem dados disponíveis.</td></tr>';
        return;
    }

    const grouped = groupBy(production, "convenio");
    const rows = Object.entries(grouped).map(([convenio, items]) => {
        const faturamento = sum(items, "revenue");
        const procedimentos = sum(items, "quantity");
        const ticket = procedimentos ? faturamento / procedimentos : 0;
        const weightedDays = sum(items, null, (item) => item.daysToReceive * item.revenue);
        const prazo = faturamento ? weightedDays / faturamento : 0;
        const glosa = average(items, "glosaRate") * 100;
        return {
            convenio,
            faturamento,
            procedimentos,
            ticket,
            prazo,
            glosa,
        };
    }).sort((a, b) => b.faturamento - a.faturamento);

    const html = rows.map((item) => `<tr>
        <td>${item.convenio}</td>
        <td>${currencyFormatter.format(item.faturamento)}</td>
        <td>${numberFormatter.format(item.procedimentos)}</td>
        <td>${currencyFormatter.format(item.ticket)}</td>
        <td>${item.prazo.toFixed(0)} dias</td>
        <td>${item.glosa.toFixed(1)}%</td>
    </tr>`);

    kpiTableBody.innerHTML = html.join("");
}

function buildMonthlySummary(production, expenses) {
    const map = new Map();

    production.forEach((item) => {
        const entry = map.get(item.month) || { revenue: 0, variable: 0, fixed: 0 };
        entry.revenue += item.revenue;
        entry.variable += item.expense;
        map.set(item.month, entry);
    });

    expenses.forEach((item) => {
        const entry = map.get(item.month) || { revenue: 0, variable: 0, fixed: 0 };
        entry.fixed += item.amount;
        map.set(item.month, entry);
    });

    const labels = Array.from(map.keys()).sort((a, b) => state.months.indexOf(a) - state.months.indexOf(b));
    const revenue = labels.map((month) => map.get(month).revenue);
    const totalExpenses = labels.map((month) => map.get(month).variable + map.get(month).fixed);

    return {
        labels: labels.map((month) => monthNames[month] || month),
        revenue,
        expenses: totalExpenses,
    };
}

function aggregateByKey(list, key) {
    const map = new Map();
    list.forEach((item) => {
        const value = item[key];
        map.set(value, (map.get(value) || 0) + item.revenue);
    });
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return {
        labels: entries.map((entry) => entry[0]),
        values: entries.map((entry) => entry[1]),
    };
}

function summarizeByProcedure(list) {
    const map = new Map();
    list.forEach((item) => {
        const entry = map.get(item.procedure) || { revenue: 0, quantity: 0 };
        entry.revenue += item.revenue;
        entry.quantity += item.quantity;
        map.set(item.procedure, entry);
    });
    return map;
}

function populateSelect(select, values, includeAll = false) {
    select.innerHTML = "";
    if (includeAll) {
        const option = document.createElement("option");
        option.value = "all";
        option.textContent = "Todos";
        select.appendChild(option);
    }
    values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = monthNames[value] || value;
        select.appendChild(option);
    });
}

function getUniqueMonths() {
    return Array.from(new Set(productionData.map((item) => item.month))).sort();
}

function getUniqueConvenios() {
    return Array.from(new Set(productionData.map((item) => item.convenio))).sort();
}

function getUniqueStatuses() {
    return Array.from(new Set(productionData.map((item) => item.status))).sort();
}

function sum(list, key, extractor) {
    if (!list.length) return 0;
    return list.reduce((acc, item) => acc + (extractor ? extractor(item) : key ? item[key] : 0), 0);
}

function average(list, key) {
    if (!list.length) return 0;
    const total = sum(list, key);
    return total / list.length;
}

function computeDelta(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
}

function formatDelta(delta, suffix) {
    if (!Number.isFinite(delta)) return "0%";
    const formatted = delta.toFixed(1);
    return `${delta > 0 ? "+" : ""}${formatted}${suffix}`;
}

function trendClass(delta, positiveIsGood = true) {
    if (!Number.isFinite(delta) || delta === 0) return "trend neutral";
    const positive = delta > 0;
    if (positive === positiveIsGood) return "trend positive";
    return "trend negative";
}

function percent(value, total) {
    if (!total) return 0;
    return (value / total) * 100;
}

function percentual(value, total) {
    return `${percent(value, total).toFixed(1)}%`;
}

function formatRange(months) {
    if (!months.length) return "N/A";
    if (months.length === 1) return monthNames[months[0]] || months[0];
    const first = monthNames[months[0]] || months[0];
    const last = monthNames[months[months.length - 1]] || months[months.length - 1];
    return `${first} a ${last}`;
}

function getSelectedMonths() {
    const startIndex = state.months.indexOf(startPeriodSelect.value);
    const endIndex = state.months.indexOf(endPeriodSelect.value);
    return state.months.slice(startIndex, endIndex + 1);
}

function getPreviousMonths(length, startMonth) {
    const startIndex = state.months.indexOf(startMonth);
    const previousEnd = startIndex - 1;
    const previousStart = previousEnd - length + 1;
    if (previousStart < 0) return [];
    return state.months.slice(previousStart, previousEnd + 1);
}

function filterByMonths(data, months) {
    if (!months.length) return [];
    return data.filter((item) => months.includes(item.month));
}

function generatePalette(count, opacity = 0.85) {
    const palette = [
        `rgba(56, 103, 255, ${opacity})`,
        `rgba(161, 99, 255, ${opacity})`,
        `rgba(255, 90, 113, ${opacity})`,
        `rgba(38, 193, 126, ${opacity})`,
        `rgba(255, 160, 67, ${opacity})`,
        `rgba(0, 192, 210, ${opacity})`,
        `rgba(147, 158, 255, ${opacity})`,
        `rgba(71, 204, 166, ${opacity})`,
        `rgba(255, 212, 102, ${opacity})`,
    ];
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(palette[i % palette.length]);
    }
    return colors;
}

function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return value ? value.trim() : fallback;
}

function withOpacity(color, opacity) {
    if (!color) return `rgba(56, 103, 255, ${opacity})`;
    if (color.startsWith("rgba") || color.startsWith("rgb")) {
        return color.replace(/rgba?\(([^)]+)\)/, (match, rgbValues) => {
            const parts = rgbValues.split(",").map((part) => part.trim());
            const [r, g, b] = parts;
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        });
    }
    const hex = color.replace("#", "").trim();
    if (hex.length === 6) {
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
}

function formatSignedCurrency(value) {
    if (!Number.isFinite(value) || value === 0) {
        return currencyFormatter.format(0);
    }
    const sign = value > 0 ? "+" : "-";
    return `${sign}${currencyFormatter.format(Math.abs(value))}`;
}

function formatSignedNumber(value) {
    if (!Number.isFinite(value) || value === 0) {
        return "0";
    }
    const sign = value > 0 ? "+" : "-";
    return `${sign}${numberFormatter.format(Math.abs(value))}`;
}

function upsertChart(chartInstance, context, config) {
    if (chartInstance) {
        chartInstance.data = config.data;
        chartInstance.options = config.options;
        chartInstance.update();
        return chartInstance;
    }
    return new Chart(context, config);
}

function getChartInstance(id) {
    switch (id) {
        case "financialEvolution":
            return financialEvolutionChart;
        case "revenueByConvenio":
            return revenueByConvenioChart;
        case "procedureMix":
            return procedureMixChart;
        case "receivableStatus":
            return receivableStatusChart;
        case "procedureComparison":
            return procedureComparisonChart;
        default:
            return null;
    }
}

function formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

function groupBy(list, key) {
    return list.reduce((acc, item) => {
        acc[item[key]] = acc[item[key]] || [];
        acc[item[key]].push(item);
        return acc;
    }, {});
}

function escapeCsv(value) {
    const stringified = String(value ?? "");
    if (stringified.includes(";") || stringified.includes("\"")) {
        return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
}
