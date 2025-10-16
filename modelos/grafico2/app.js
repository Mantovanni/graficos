import { expenseData, monthNames, productionData } from "../shared/dataset.js";

const monthOrder = Array.from(new Set(productionData.map((item) => item.month))).sort();

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const percentFormatter = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

const periodRangeSelect = document.querySelector("#periodRange");
const convenioSelect = document.querySelector("#convenioSelect");
const includePendingToggle = document.querySelector("#includePending");
const downloadButton = document.querySelector("#downloadReport");
const resetButton = document.querySelector("#resetView");

const periodLabelEl = document.querySelector("#periodLabel");
const bestConvenioEl = document.querySelector("#bestConvenio");
const riskConvenioEl = document.querySelector("#riskConvenio");

const netRevenueEl = document.querySelector("#netRevenue");
const netRevenueDeltaEl = document.querySelector("#netRevenueDelta");
const netRevenueDetailEl = document.querySelector("#netRevenueDetail");
const operMarginEl = document.querySelector("#operMargin");
const operMarginDeltaEl = document.querySelector("#operMarginDelta");
const operMarginDetailEl = document.querySelector("#operMarginDetail");
const receivingAvgEl = document.querySelector("#receivingAvg");
const receivingDeltaEl = document.querySelector("#receivingDelta");
const receivingDetailEl = document.querySelector("#receivingDetail");
const denialIndexEl = document.querySelector("#denialIndex");
const denialDeltaEl = document.querySelector("#denialDelta");
const denialDetailEl = document.querySelector("#denialDetail");

const tableLabelEl = document.querySelector("#tableLabel");
const rankingTableBody = document.querySelector("#rankingTable");

let revenueTrendChart;
let costBreakdownChart;
let convenioRadarChart;

populateConvenioSelect();

periodRangeSelect.addEventListener("change", render);
convenioSelect.addEventListener("change", render);
includePendingToggle.addEventListener("change", render);

resetButton.addEventListener("click", () => {
    periodRangeSelect.value = "3m";
    convenioSelect.value = "all";
    includePendingToggle.checked = true;
    render();
});

downloadButton.addEventListener("click", () => {
    const { filteredProduction } = collectData();
    const grouped = groupBy(filteredProduction, "convenio");
    const rows = [
        ["Convênio", "Receita", "Margem", "Ticket médio", "Prazo médio", "Glosa", "Participação"]
    ];
    Object.entries(grouped).forEach(([convenio, items]) => {
        const revenue = sum(items, "revenue");
        const variable = sum(items, "expense");
        const procedures = sum(items, "quantity");
        const net = revenue - variable;
        const margin = revenue > 0 ? net / revenue : 0;
        const ticket = procedures > 0 ? revenue / procedures : 0;
        const weightedDays = sum(items, null, (item) => item.daysToReceive * item.revenue);
        const avgDays = revenue > 0 ? weightedDays / revenue : 0;
        const denial = average(items, "glosaRate");
        rows.push([
            convenio,
            currencyFormatter.format(revenue),
            percentFormatter.format(margin),
            currencyFormatter.format(ticket),
            `${avgDays.toFixed(0)} dias`,
            percentFormatter.format(denial),
            percentFormatter.format(revenue / Math.max(sum(filteredProduction, "revenue"), 1)),
        ]);
    });
    const csv = rows.map((line) => line.map(escapeCsv).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modelo2-convenios.csv";
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
    const { months, previousMonths, filteredProduction, filteredExpenses } = collectData();

    updateHeader(months);
    updateKPIs(filteredProduction, filteredExpenses, months, previousMonths);
    updateChips(filteredProduction);
    updateTable(filteredProduction);
    renderCharts(filteredProduction, filteredExpenses, months);
}

function collectData() {
    const months = getSelectedMonths();
    const previousMonths = getPreviousMonths(months.length, months[0]);
    const convenio = convenioSelect.value;
    const includePending = includePendingToggle.checked;

    const filteredProduction = productionData.filter((item) => {
        if (!months.includes(item.month)) return false;
        if (convenio !== "all" && item.convenio !== convenio) return false;
        if (!includePending && item.status !== "Recebido" && item.status !== "Pago") return false;
        return true;
    });

    const filteredExpenses = expenseData.filter((item) => months.includes(item.month));

    return { months, previousMonths, filteredProduction, filteredExpenses };
}

function updateHeader(months) {
    if (!months.length) {
        periodLabelEl.textContent = "Sem dados disponíveis para o período";
        return;
    }
    periodLabelEl.textContent = months.length === 1
        ? monthNames[months[0]]
        : `${monthNames[months[0]]} a ${monthNames[months[months.length - 1]]}`;
}

function updateKPIs(production, expenses, months, previousMonths) {
    const revenue = sum(production, "revenue");
    const variable = sum(production, "expense");
    const fixed = sum(expenses, "amount");
    const netRevenue = revenue - variable;
    const result = revenue - (variable + fixed);
    const margin = revenue > 0 ? result / revenue : 0;

    const weightedDays = sum(production, null, (item) => item.daysToReceive * item.revenue);
    const receivingAvg = revenue > 0 ? weightedDays / revenue : 0;

    const denialAvg = average(production, "glosaRate");

    const previousProduction = filterByMonths(productionData, previousMonths);
    const previousExpenses = expenseData.filter((item) => previousMonths.includes(item.month));

    const prevRevenue = sum(previousProduction, "revenue");
    const prevVariable = sum(previousProduction, "expense");
    const prevFixed = sum(previousExpenses, "amount");
    const prevNetRevenue = prevRevenue - prevVariable;
    const prevResult = prevRevenue - (prevVariable + prevFixed);
    const prevMargin = prevRevenue > 0 ? prevResult / prevRevenue : 0;
    const prevWeightedDays = sum(previousProduction, null, (item) => item.daysToReceive * item.revenue);
    const prevReceivingAvg = prevRevenue > 0 ? prevWeightedDays / prevRevenue : 0;
    const prevDenialAvg = average(previousProduction, "glosaRate");

    const netRevenueDelta = computeDelta(netRevenue, prevNetRevenue);
    const marginDiff = (margin - prevMargin) * 100;
    const receivingDelta = prevReceivingAvg ? receivingAvg - prevReceivingAvg : receivingAvg;
    const denialDiff = (denialAvg - prevDenialAvg) * 100;

    netRevenueEl.textContent = currencyFormatter.format(netRevenue);
    netRevenueDeltaEl.textContent = formatPercentChange(netRevenueDelta);
    netRevenueDeltaEl.className = `delta ${netRevenueDelta >= 0 ? "positive" : "negative"}`;
    netRevenueDetailEl.textContent = previousMonths.length
        ? `Período anterior: ${currencyFormatter.format(prevNetRevenue)}`
        : "Sem histórico comparativo";

    operMarginEl.textContent = percentFormatter.format(margin);
    operMarginDeltaEl.textContent = formatSigned(marginDiff, " p.p.");
    operMarginDeltaEl.className = `delta ${marginDiff >= 0 ? "positive" : "negative"}`;
    operMarginDetailEl.textContent = `Resultado líquido de ${currencyFormatter.format(result)}.`;

    receivingAvgEl.textContent = `${receivingAvg.toFixed(0)} dias`;
    receivingDeltaEl.textContent = `${receivingDelta >= 0 ? "+" : ""}${receivingDelta.toFixed(0)}d`;
    receivingDeltaEl.className = `delta ${receivingDelta <= 0 ? "positive" : "negative"}`;
    receivingDetailEl.textContent = previousMonths.length
        ? `Prazo anterior: ${prevReceivingAvg.toFixed(0)} dias.`
        : "Aguardando histórico.";

    denialIndexEl.textContent = percentFormatter.format(denialAvg || 0);
    denialDeltaEl.textContent = formatSigned(denialDiff, " p.p.");
    denialDeltaEl.className = `delta ${denialDiff <= 0 ? "positive" : "negative"}`;
    denialDetailEl.textContent = previousMonths.length
        ? `Glosa anterior: ${percentFormatter.format(prevDenialAvg || 0)}.`
        : "Primeiro período acompanhado.";
}

function updateChips(production) {
    if (!production.length) {
        bestConvenioEl.textContent = "Top convênio • N/A";
        riskConvenioEl.textContent = "Maior glosa • N/A";
        return;
    }
    const grouped = groupBy(production, "convenio");
    const convenios = Object.entries(grouped).map(([name, items]) => {
        return {
            name,
            revenue: sum(items, "revenue"),
            denial: average(items, "glosaRate"),
        };
    });
    const best = convenios.slice().sort((a, b) => b.revenue - a.revenue)[0];
    const risk = convenios.slice().sort((a, b) => b.denial - a.denial)[0];
    bestConvenioEl.textContent = `Top convênio • ${best.name}`;
    riskConvenioEl.textContent = `Maior glosa • ${risk.name}`;
}

function updateTable(production) {
    rankingTableBody.innerHTML = "";
    if (!production.length) {
        rankingTableBody.innerHTML = '<tr><td colspan="7">Sem dados para o filtro atual.</td></tr>';
        tableLabelEl.textContent = "Sem convênios contabilizados.";
        return;
    }

    const grouped = groupBy(production, "convenio");
    const totalRevenue = sum(production, "revenue");

    const rows = Object.entries(grouped).map(([convenio, items]) => {
        const revenue = sum(items, "revenue");
        const variable = sum(items, "expense");
        const procedures = sum(items, "quantity");
        const net = revenue - variable;
        const margin = revenue > 0 ? net / revenue : 0;
        const ticket = procedures > 0 ? revenue / procedures : 0;
        const weightedDays = sum(items, null, (item) => item.daysToReceive * item.revenue);
        const avgDays = revenue > 0 ? weightedDays / revenue : 0;
        const denial = average(items, "glosaRate");

        return {
            convenio,
            revenue,
            margin,
            ticket,
            avgDays,
            denial,
            share: totalRevenue > 0 ? revenue / totalRevenue : 0,
        };
    }).sort((a, b) => b.revenue - a.revenue);

    tableLabelEl.textContent = `${rows.length} convênios listados`;

    const html = rows.map((item) => {
        const prazoClass = item.avgDays <= 20 ? "good" : item.avgDays <= 30 ? "warning" : "danger";
        return `<tr>
            <td>${item.convenio}</td>
            <td>${currencyFormatter.format(item.revenue)}</td>
            <td>${percentFormatter.format(item.margin)}</td>
            <td>${currencyFormatter.format(item.ticket)}</td>
            <td><span class="badge ${prazoClass}">${item.avgDays.toFixed(0)} dias</span></td>
            <td>${percentFormatter.format(item.denial)}</td>
            <td>${percentFormatter.format(item.share)}</td>
        </tr>`;
    }).join("");

    rankingTableBody.innerHTML = html;
}

function renderCharts(production, expenses, months) {
    const monthLabels = months.map((month) => monthNames[month] || month);

    const monthly = months.map((month) => {
        const prodItems = production.filter((item) => item.month === month);
        const expItems = expenses.filter((item) => item.month === month);
        const revenue = sum(prodItems, "revenue");
        const variable = sum(prodItems, "expense");
        const fixed = sum(expItems, "amount");
        return { month, revenue, variable, fixed };
    });

    const revenueData = monthly.map((item) => item.revenue);
    const targetData = revenueData.map((value) => value * 1.08 + 5000);
    const movingAverage = computeMovingAverage(revenueData, 2);

    revenueTrendChart = upsertChart(revenueTrendChart, document.getElementById("revenueTrend"), {
        type: "line",
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: "Receita",
                    data: revenueData,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56, 189, 248, 0.12)",
                    fill: true,
                    tension: 0.35,
                },
                {
                    label: "Meta projetada",
                    data: targetData,
                    borderColor: "#fbbf24",
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false,
                    tension: 0.25,
                },
                {
                    label: "Média móvel",
                    data: movingAverage,
                    borderColor: "#34d399",
                    pointRadius: 0,
                    fill: false,
                    tension: 0.25,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${currencyFormatter.format(ctx.parsed.y)}`,
                    },
                },
            },
            scales: {
                y: {
                    ticks: {
                        callback: (value) => currencyFormatter.format(value),
                    },
                },
            },
        },
    });

    costBreakdownChart = upsertChart(costBreakdownChart, document.getElementById("costBreakdown"), {
        type: "bar",
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: "Custos variáveis",
                    data: monthly.map((item) => item.variable),
                    backgroundColor: "rgba(248, 113, 113, 0.65)",
                    stack: "costs",
                    borderRadius: 10,
                },
                {
                    label: "Custos fixos",
                    data: monthly.map((item) => item.fixed),
                    backgroundColor: "rgba(59, 130, 246, 0.65)",
                    stack: "costs",
                    borderRadius: 10,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${currencyFormatter.format(ctx.parsed.y)}`,
                    },
                },
            },
            scales: {
                y: {
                    stacked: true,
                    ticks: {
                        callback: (value) => currencyFormatter.format(value),
                    },
                },
                x: {
                    stacked: true,
                },
            },
        },
    });

    const radarData = buildConvenioRadarData(production);

    convenioRadarChart = upsertChart(convenioRadarChart, document.getElementById("convenioRadar"), {
        type: "radar",
        data: radarData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 1,
                    ticks: {
                        callback: (value) => `${Math.round(value * 100)}%`,
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${(ctx.parsed.r * 100).toFixed(0)}%`,
                    },
                },
                legend: {
                    position: "bottom",
                },
            },
        },
    });
}

function buildConvenioRadarData(production) {
    const grouped = groupBy(production, "convenio");
    const convenios = Object.entries(grouped).map(([name, items]) => {
        const revenue = sum(items, "revenue");
        const procedures = sum(items, "quantity");
        const ticket = procedures > 0 ? revenue / procedures : 0;
        const weightedDays = sum(items, null, (item) => item.daysToReceive * item.revenue);
        const prazo = revenue > 0 ? weightedDays / revenue : 0;
        const denial = average(items, "glosaRate");
        return {
            name,
            revenue,
            ticket,
            prazo,
            denial,
        };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

    if (!convenios.length) {
        return {
            labels: ["Receita", "Ticket", "Prazo", "Glosa"],
            datasets: [],
        };
    }

    const maxRevenue = Math.max(...convenios.map((item) => item.revenue));
    const maxTicket = Math.max(...convenios.map((item) => item.ticket));
    const maxPrazo = Math.max(...convenios.map((item) => item.prazo));
    const maxDenial = Math.max(...convenios.map((item) => item.denial));

    const labels = ["Receita", "Ticket", "Prazo", "Glosa"];

    const palette = [
        "rgba(56, 189, 248, 0.45)",
        "rgba(59, 130, 246, 0.45)",
        "rgba(34, 197, 94, 0.45)",
        "rgba(251, 191, 36, 0.45)",
    ];

    const datasets = convenios.map((item, index) => {
        const glosaScore = maxDenial > 0 ? (maxDenial - item.denial) / maxDenial : 1;
        return {
            label: item.name,
            data: [
                normalize(item.revenue, maxRevenue),
                normalize(item.ticket, maxTicket),
                maxPrazo > 0 ? 1 - normalize(item.prazo, maxPrazo) : 1,
                glosaScore,
            ],
            backgroundColor: palette[index % palette.length],
            borderColor: palette[index % palette.length].replace("0.45", "0.9"),
            borderWidth: 2,
            pointRadius: 3,
        };
    });

    return { labels, datasets };
}

function getSelectedMonths() {
    const value = periodRangeSelect.value;
    if (value === "all") return monthOrder.slice();
    const count = value === "2m" ? 2 : 3;
    return monthOrder.slice(-count);
}

function getPreviousMonths(length, startMonth) {
    const startIndex = monthOrder.indexOf(startMonth);
    const previousEnd = startIndex - 1;
    const previousStart = previousEnd - length + 1;
    if (previousStart < 0 || previousEnd < 0) return [];
    return monthOrder.slice(previousStart, previousEnd + 1);
}

function populateConvenioSelect() {
    const convenios = Array.from(new Set(productionData.map((item) => item.convenio))).sort();
    convenioSelect.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "Todos";
    convenioSelect.appendChild(allOption);
    convenios.forEach((convenio) => {
        const option = document.createElement("option");
        option.value = convenio;
        option.textContent = convenio;
        convenioSelect.appendChild(option);
    });
    convenioSelect.value = "all";
}

function sum(list, key, extractor) {
    if (!list.length) return 0;
    return list.reduce((acc, item) => acc + (extractor ? extractor(item) : key ? item[key] : 0), 0);
}

function average(list, key) {
    if (!list.length) return 0;
    return sum(list, key) / list.length;
}

function groupBy(list, key) {
    return list.reduce((acc, item) => {
        acc[item[key]] = acc[item[key]] || [];
        acc[item[key]].push(item);
        return acc;
    }, {});
}

function filterByMonths(data, months) {
    if (!months.length) return [];
    return data.filter((item) => months.includes(item.month));
}

function computeDelta(current, previous) {
    if (!previous) return current ? 1 : 0;
    return (current - previous) / Math.abs(previous);
}

function formatPercentChange(ratio) {
    if (!Number.isFinite(ratio)) return "0%";
    return `${ratio >= 0 ? "+" : ""}${(ratio * 100).toFixed(1)}%`;
}

function formatSigned(value, suffix = "") {
    if (!Number.isFinite(value)) return `0${suffix}`;
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}${suffix}`;
}

function computeMovingAverage(data, windowSize) {
    if (!data.length) return [];
    return data.map((_, index) => {
        const start = Math.max(0, index - windowSize + 1);
        const slice = data.slice(start, index + 1);
        const sumValues = slice.reduce((acc, value) => acc + value, 0);
        return sumValues / slice.length;
    });
}

function normalize(value, maxValue) {
    if (!maxValue) return 0;
    return value / maxValue;
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
        case "revenueTrend":
            return revenueTrendChart;
        case "costBreakdown":
            return costBreakdownChart;
        case "convenioRadar":
            return convenioRadarChart;
        default:
            return null;
    }
}

function escapeCsv(value) {
    const stringified = String(value ?? "");
    if (stringified.includes(";") || stringified.includes("\"")) {
        return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
}
