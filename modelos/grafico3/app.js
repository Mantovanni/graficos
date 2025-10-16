import { expenseData, monthNames, productionData } from "../shared/dataset.js";

const state = {
    selectedMonth: "all",
    selectedSector: "all",
    selectedStatuses: new Set(),
    doctorQuery: "",
};

const elements = {
    monthFilter: document.getElementById("monthFilter"),
    segmentFilter: document.getElementById("segmentFilter"),
    statusGroup: document.getElementById("statusGroup"),
    doctorSearch: document.getElementById("doctorSearch"),
    cards: {
        revenue: document.getElementById("cardRevenue"),
        revenueDelta: document.getElementById("cardRevenueDelta"),
        revenueDetail: document.getElementById("cardRevenueDetail"),
        expense: document.getElementById("cardExpense"),
        expenseDelta: document.getElementById("cardExpenseDelta"),
        expenseDetail: document.getElementById("cardExpenseDetail"),
        result: document.getElementById("cardResult"),
        resultDelta: document.getElementById("cardResultDelta"),
        resultDetail: document.getElementById("cardResultDetail"),
        denialRate: document.getElementById("cardDenial"),
        denialValue: document.getElementById("cardDenialValue"),
        denialDetail: document.getElementById("cardDenialDetail"),
    },
    cycleLabel: document.getElementById("cycleLabel"),
    progressGrid: document.getElementById("progressGrid"),
    procedureLabel: document.getElementById("procedureLabel"),
    procedureTable: document.getElementById("procedureTable"),
    resetFilters: document.getElementById("resetFilters"),
    toggleContrast: document.getElementById("toggleContrast"),
    exportJson: document.getElementById("exportJson"),
};

const chartInstances = {};

const statusOrder = ["Recebido", "Em análise", "Pendente", "Glosado"];

function initFilters() {
    elements.monthFilter.innerHTML = `<option value="all">Todos os meses</option>` +
        Object.entries(monthNames)
            .map(([value, label]) => `<option value="${value}">${label}</option>`)
            .join("");

    const sectors = Array.from(new Set(productionData.map(item => item.sector))).sort();
    elements.segmentFilter.innerHTML = `<option value="all">Todos os setores</option>` +
        sectors.map(sector => `<option value="${sector}">${sector}</option>`).join("");

    const statuses = Array.from(new Set(productionData.map(item => item.status)))
        .sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));

    statuses.forEach(status => {
        const chip = document.createElement("label");
        chip.className = "status-chip";
        chip.dataset.status = status;
        chip.innerHTML = `<input type="checkbox" checked value="${status}"><span>${status}</span>`;
        elements.statusGroup.appendChild(chip);
        state.selectedStatuses.add(status);
        const checkbox = chip.querySelector("input");
        checkbox.addEventListener("change", () => toggleStatus(status, chip, checkbox.checked));
        chip.addEventListener("click", event => {
            if (event.target.tagName !== "INPUT") {
                event.preventDefault();
                const next = !checkbox.checked;
                checkbox.checked = next;
                toggleStatus(status, chip, next);
            }
        });
        updateChipVisual(chip, checkbox.checked);
    });
}

function toggleStatus(status, chip, checked) {
    if (checked) {
        state.selectedStatuses.add(status);
    } else {
        state.selectedStatuses.delete(status);
    }
    updateChipVisual(chip, checked);
    render();
}

function updateChipVisual(chip, active) {
    chip.classList.toggle("active", active);
}

function initListeners() {
    elements.monthFilter.addEventListener("change", event => {
        state.selectedMonth = event.target.value;
        render();
    });

    elements.segmentFilter.addEventListener("change", event => {
        state.selectedSector = event.target.value;
        render();
    });

    elements.doctorSearch.addEventListener("input", event => {
        state.doctorQuery = event.target.value.trim().toLowerCase();
        render();
    });

    elements.resetFilters.addEventListener("click", () => {
        state.selectedMonth = "all";
        state.selectedSector = "all";
        state.selectedStatuses = new Set();
        elements.statusGroup.querySelectorAll("input").forEach(input => {
            input.checked = true;
            state.selectedStatuses.add(input.value);
            updateChipVisual(input.closest("label"), true);
        });
        elements.monthFilter.value = "all";
        elements.segmentFilter.value = "all";
        elements.doctorSearch.value = "";
        state.doctorQuery = "";
        render();
    });

    elements.toggleContrast.addEventListener("click", () => {
        const root = document.documentElement;
        if (root.getAttribute("data-contrast") === "true") {
            root.removeAttribute("data-contrast");
        } else {
            root.setAttribute("data-contrast", "true");
        }
    });

    elements.exportJson.addEventListener("click", () => {
        const filtered = getFilteredData();
        const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "dashboard-dados.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });

    document.querySelectorAll("button[data-download]").forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.download;
            const instance = getChartInstance(id);
            if (!instance) return;
            const link = document.createElement("a");
            link.href = instance.toBase64Image();
            link.download = `${id}.png`;
            link.click();
        });
    });
}

function getFilteredData() {
    return productionData.filter(item => {
        if (state.selectedMonth !== "all" && item.month !== state.selectedMonth) return false;
        if (state.selectedSector !== "all" && item.sector !== state.selectedSector) return false;
        if (state.selectedStatuses.size && !state.selectedStatuses.has(item.status)) return false;
        if (state.doctorQuery && !item.doctor.toLowerCase().includes(state.doctorQuery)) return false;
        return true;
    });
}

function groupByMonth(records) {
    return records.reduce((acc, item) => {
        acc[item.month] = acc[item.month] || { revenue: 0, expense: 0 };
        acc[item.month].revenue += item.revenue;
        acc[item.month].expense += item.expense;
        return acc;
    }, {});
}

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(value) {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function computeDelta(current, previous) {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}

function renderCards(filtered) {
    const monthGroups = groupByMonth(filtered);
    const sortedMonths = Object.keys(monthGroups).sort();
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    const prevMonth = sortedMonths[sortedMonths.length - 2];

    const totals = filtered.reduce((acc, item) => {
        acc.revenue += item.revenue;
        acc.expense += item.expense;
        acc.glosa += item.revenue * item.glosaRate;
        acc.quantity += item.quantity;
        acc.days += item.daysToReceive;
        acc.count += 1;
        return acc;
    }, { revenue: 0, expense: 0, glosa: 0, quantity: 0, days: 0, count: 0 });

    const expensesMonth = expenseData
        .filter(item => state.selectedMonth === "all" || item.month === state.selectedMonth)
        .reduce((sum, item) => sum + item.amount, 0);
    const currentFixed = lastMonth
        ? expenseData.filter(item => item.month === lastMonth).reduce((sum, item) => sum + item.amount, 0)
        : 0;
    const previousFixed = prevMonth
        ? expenseData.filter(item => item.month === prevMonth).reduce((sum, item) => sum + item.amount, 0)
        : currentFixed;

    const periodLabel = state.selectedMonth === "all"
        ? "acumulado"
        : monthNames[state.selectedMonth] || "período";

    const lastRevenue = lastMonth ? monthGroups[lastMonth].revenue : 0;
    const prevRevenue = prevMonth ? monthGroups[prevMonth].revenue : lastRevenue;
    const lastExpense = lastMonth ? monthGroups[lastMonth].expense : 0;
    const prevExpense = prevMonth ? monthGroups[prevMonth].expense : lastExpense;

    elements.cards.revenue.textContent = formatCurrency(totals.revenue);
    elements.cards.revenueDelta.textContent = formatPercent(computeDelta(lastRevenue, prevRevenue));
    elements.cards.revenueDetail.textContent = `Base ${periodLabel}.`;

    const totalExpense = totals.expense + expensesMonth;
    elements.cards.expense.textContent = formatCurrency(totalExpense);
    elements.cards.expenseDelta.textContent = formatPercent(computeDelta(lastExpense, prevExpense));
    elements.cards.expenseDetail.textContent = `Inclui despesas fixas do ${periodLabel}.`;

    const result = totals.revenue - totalExpense;
    const prevResult = prevMonth ? prevRevenue - (prevExpense + previousFixed) : lastRevenue - (lastExpense + currentFixed);
    elements.cards.result.textContent = formatCurrency(result);
    elements.cards.resultDelta.textContent = formatPercent(computeDelta(result, prevResult));
    elements.cards.resultDetail.textContent = `Margem operacional considerando despesas fixas.`;

    const denialRate = totals.count && totals.revenue > 0 ? (totals.glosa / totals.revenue) * 100 : 0;
    elements.cards.denialRate.textContent = formatPercent(denialRate);
    elements.cards.denialValue.textContent = formatCurrency(totals.glosa);
    elements.cards.denialDetail.textContent = `Valor passível de recuperação no período.`;
}

function renderProgress(filtered) {
    const totals = filtered.reduce((acc, item) => {
        acc.revenue += item.revenue;
        acc.glosa += item.revenue * item.glosaRate;
        acc.days += item.daysToReceive;
        acc.count += 1;
        return acc;
    }, { revenue: 0, glosa: 0, days: 0, count: 0 });

    const goalRevenue = 320000;
    const revenueProgress = Math.min(100, goalRevenue > 0 ? (totals.revenue / goalRevenue) * 100 : 0);
    const glosaTarget = 4; // %
    const glosaRate = totals.count && totals.revenue > 0 ? (totals.glosa / totals.revenue) * 100 : 0;
    const glosaProgress = Math.min(100, Math.max(0, 100 - (glosaTarget > 0 ? (glosaRate / glosaTarget) * 100 : 0)));
    const slaTarget = 25;
    const avgDays = totals.count ? totals.days / totals.count : 0;
    const slaProgress = Math.max(0, Math.min(100, slaTarget > 0 ? Math.max(0, (slaTarget - avgDays) / slaTarget) * 100 : 0));

    elements.progressGrid.innerHTML = "";

    const configs = [
        {
            label: "Receita x Meta",
            value: `${formatCurrency(totals.revenue)} / ${formatCurrency(goalRevenue)}`,
            detail: "Meta de faturamento mensal",
            percent: revenueProgress,
        },
        {
            label: "Glosa recuperável",
            value: `${formatPercent(glosaRate || 0)} média`,
            detail: "Objetivo < 4%",
            percent: glosaProgress,
        },
        {
            label: "Prazo de recebimento",
            value: `${avgDays.toFixed(1)} dias`,
            detail: "SLA 25 dias",
            percent: slaProgress,
        }
    ];

    configs.forEach(config => {
        const item = document.createElement("article");
        item.className = "progress-item";
        item.innerHTML = `
            <header>
                <span>${config.label}</span>
                <strong>${config.value}</strong>
            </header>
            <p>${config.detail}</p>
            <div class="progress-bar"><span style="width:${config.percent}%"></span></div>
        `;
        elements.progressGrid.appendChild(item);
    });

    if (state.selectedMonth === "all") {
        elements.cycleLabel.textContent = "Ciclo consolidado";
    } else {
        elements.cycleLabel.textContent = monthNames[state.selectedMonth];
    }
}

function ensureChart(ctxId, configBuilder) {
    const existing = getChartInstance(ctxId);
    if (existing) {
        existing.destroy();
    }
    const ctx = document.getElementById(ctxId);
    if (!ctx) return null;
    const config = configBuilder();
    const instance = new Chart(ctx, config);
    chartInstances[ctxId] = instance;
    return instance;
}

function getChartInstance(id) {
    return chartInstances[id] || null;
}

function renderCharts(filtered) {
    const byMonth = groupByMonth(filtered);
    const orderedMonths = Object.keys(byMonth).sort();
    const labels = orderedMonths.map(month => monthNames[month]);
    const revenues = orderedMonths.map(month => byMonth[month].revenue);
    const expenses = orderedMonths.map(month => byMonth[month].expense);

    ensureChart("flowChart", () => ({
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Receita",
                    data: revenues,
                    backgroundColor: "rgba(37, 99, 235, 0.65)",
                    borderRadius: 12,
                },
                {
                    label: "Despesa",
                    data: expenses,
                    backgroundColor: "rgba(239, 68, 68, 0.55)",
                    borderRadius: 12,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: value => formatCurrency(value)
                    }
                }
            },
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                    }
                }
            }
        }
    }));

    const bySector = filtered.reduce((acc, item) => {
        acc[item.sector] = (acc[item.sector] || 0) + item.revenue;
        return acc;
    }, {});

    const sectorLabels = Object.keys(bySector);
    const sectorData = Object.values(bySector);
    const totalSector = sectorData.length ? sectorData.reduce((a, b) => a + b, 0) : 0;

    ensureChart("sectorChart", () => ({
        type: "doughnut",
        data: {
            labels: sectorLabels,
            datasets: [
                {
                    data: sectorData,
                    backgroundColor: [
                        "#2563eb",
                        "#f59e0b",
                        "#10b981",
                        "#8b5cf6",
                        "#ec4899"
                    ],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const value = context.parsed;
                            const percent = totalSector > 0 ? (value / totalSector) * 100 : 0;
                            return `${context.label}: ${formatCurrency(value)} (${percent.toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    }));

    const scatterGroups = filtered.reduce((acc, item) => {
        acc[item.convenio] = acc[item.convenio] || [];
        acc[item.convenio].push(item);
        return acc;
    }, {});

    const palette = ["#2563eb", "#22c55e", "#f97316", "#a855f7", "#ef4444", "#0ea5e9", "#facc15"];
    const datasets = Object.entries(scatterGroups).map(([convenio, items], index) => ({
        label: convenio,
        data: items.map(item => ({ x: item.daysToReceive, y: item.glosaRate * 100, r: Math.max(6, item.quantity / 3) })),
        backgroundColor: palette[index % palette.length],
    }));

    ensureChart("scatterChart", () => ({
        type: "bubble",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Prazo de recebimento (dias)" }
                },
                y: {
                    title: { display: true, text: "Glosa (%)" }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: context => {
                            const { raw } = context;
                            return `${context.dataset.label} | Prazo ${raw.x}d | Glosa ${raw.y.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    }));
}

function renderTable(filtered) {
    const sorted = [...filtered].sort((a, b) => (b.revenue - b.expense) - (a.revenue - a.expense)).slice(0, 8);
    if (!sorted.length) {
        elements.procedureTable.innerHTML = `<tr><td colspan="6">Nenhum registro encontrado para os filtros selecionados.</td></tr>`;
    } else {
        elements.procedureTable.innerHTML = sorted.map(item => {
            const margin = item.revenue - item.expense;
            return `
                <tr>
                    <td>${item.procedure}</td>
                    <td>${item.convenio}</td>
                    <td>${item.doctor}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.revenue)}</td>
                    <td>${formatCurrency(margin)}</td>
                </tr>
            `;
        }).join("");
    }

    const descriptors = [];
    if (state.selectedMonth !== "all") descriptors.push(monthNames[state.selectedMonth]);
    if (state.selectedSector !== "all") descriptors.push(state.selectedSector);
    elements.procedureLabel.textContent = descriptors.length ? descriptors.join(" • ") : "Todas as bases";
}

function ensureDefaults() {
    if (!state.selectedStatuses.size) {
        elements.statusGroup.querySelectorAll("input").forEach(input => {
            input.checked = true;
            state.selectedStatuses.add(input.value);
            updateChipVisual(input.closest("label"), true);
        });
    }
}

function render() {
    ensureDefaults();
    const filtered = getFilteredData();
    renderCards(filtered);
    renderProgress(filtered);
    renderCharts(filtered);
    renderTable(filtered);
}

function main() {
    initFilters();
    initListeners();
    render();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}
