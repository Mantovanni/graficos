const monthNames = {
    "2025-07": "Julho/2025",
    "2025-08": "Agosto/2025",
    "2025-09": "Setembro/2025",
    "2025-10": "Outubro/2025",
};

const productionData = [
    { date: "2025-07-03", month: "2025-07", procedure: "Colonoscopia", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 13, revenue: 20850, expense: 8200, status: "Recebido", daysToReceive: 12, glosaRate: 0.00 },
    { date: "2025-07-04", month: "2025-07", procedure: "Colonoscopia com Polipectomia", convenio: "Unimed", doctor: "Dra. Helena Prado", sector: "Endoscopia", quantity: 9, revenue: 19900, expense: 9100, status: "Recebido", daysToReceive: 21, glosaRate: 0.02 },
    { date: "2025-07-05", month: "2025-07", procedure: "Colonoscopia SUS", convenio: "SUS", doctor: "Dr. Paulo Nogueira", sector: "Endoscopia", quantity: 12, revenue: 7200, expense: 5300, status: "Recebido", daysToReceive: 34, glosaRate: 0.01 },
    { date: "2025-07-08", month: "2025-07", procedure: "Consulta Gastro", convenio: "Unimed", doctor: "Dra. Laura Azevedo", sector: "Consultas", quantity: 61, revenue: 7015, expense: 2380, status: "Recebido", daysToReceive: 18, glosaRate: 0.04 },
    { date: "2025-07-10", month: "2025-07", procedure: "Endoscopia Digestiva Alta", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 95, revenue: 57990, expense: 21560, status: "Recebido", daysToReceive: 10, glosaRate: 0.01 },
    { date: "2025-07-12", month: "2025-07", procedure: "Endoscopia Digestiva Alta", convenio: "SUS", doctor: "Dra. Fabiana Couto", sector: "Endoscopia", quantity: 72, revenue: 21950, expense: 15800, status: "Recebido", daysToReceive: 33, glosaRate: 0.05 },
    { date: "2025-07-14", month: "2025-07", procedure: "Endoscopia Digestiva Alta", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 23, revenue: 7111.37, expense: 4860, status: "Recebido", daysToReceive: 24, glosaRate: 0.03 },
    { date: "2025-07-16", month: "2025-07", procedure: "Endoscopia com Pólipo", convenio: "SUS", doctor: "Dra. Fabiana Couto", sector: "Endoscopia", quantity: 13, revenue: 8450, expense: 6130, status: "Em análise", daysToReceive: 42, glosaRate: 0.07 },
    { date: "2025-07-19", month: "2025-07", procedure: "Gastroenterologia", convenio: "Amil", doctor: "Dr. Henrique Vidal", sector: "Consultas", quantity: 35, revenue: 17850, expense: 6120, status: "Recebido", daysToReceive: 27, glosaRate: 0.02 },
    { date: "2025-07-22", month: "2025-07", procedure: "Polipectomia de Endoscopia", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 26, revenue: 25794.34, expense: 13400, status: "Recebido", daysToReceive: 29, glosaRate: 0.05 },
    { date: "2025-07-25", month: "2025-07", procedure: "Polipectomia do Cólon", convenio: "Unimed", doctor: "Dra. Helena Prado", sector: "Endoscopia", quantity: 22, revenue: 29597.26, expense: 14110, status: "Recebido", daysToReceive: 32, glosaRate: 0.04 },
    { date: "2025-07-28", month: "2025-07", procedure: "Pólipos EDA", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 5, revenue: 1000, expense: 320, status: "Recebido", daysToReceive: 3, glosaRate: 0.00 },
    { date: "2025-07-30", month: "2025-07", procedure: "Teste Respiratório", convenio: "Particular", doctor: "Dra. Camila Reis", sector: "Diagnóstico", quantity: 14, revenue: 4300, expense: 1180, status: "Recebido", daysToReceive: 5, glosaRate: 0.00 },

    { date: "2025-08-02", month: "2025-08", procedure: "Colonoscopia", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 25, revenue: 39100, expense: 15400, status: "Recebido", daysToReceive: 9, glosaRate: 0.00 },
    { date: "2025-08-04", month: "2025-08", procedure: "Colonoscopia com Polipectomia", convenio: "Unimed", doctor: "Dra. Helena Prado", sector: "Endoscopia", quantity: 15, revenue: 37800, expense: 14600, status: "Recebido", daysToReceive: 18, glosaRate: 0.02 },
    { date: "2025-08-06", month: "2025-08", procedure: "Colonoscopia SUS", convenio: "SUS", doctor: "Dr. Paulo Nogueira", sector: "Endoscopia", quantity: 18, revenue: 10200, expense: 7600, status: "Recebido", daysToReceive: 36, glosaRate: 0.02 },
    { date: "2025-08-07", month: "2025-08", procedure: "Colonoscopia", convenio: "Bradesco", doctor: "Dr. Enzo Matos", sector: "Endoscopia", quantity: 10, revenue: 14850, expense: 5400, status: "Recebido", daysToReceive: 31, glosaRate: 0.03 },
    { date: "2025-08-08", month: "2025-08", procedure: "Consulta Gastro", convenio: "Unimed", doctor: "Dra. Laura Azevedo", sector: "Consultas", quantity: 54, revenue: 6210, expense: 2140, status: "Recebido", daysToReceive: 17, glosaRate: 0.05 },
    { date: "2025-08-10", month: "2025-08", procedure: "Endoscopia Digestiva Alta", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 126, revenue: 76170, expense: 28940, status: "Recebido", daysToReceive: 7, glosaRate: 0.01 },
    { date: "2025-08-14", month: "2025-08", procedure: "Endoscopia Digestiva Alta", convenio: "SUS", doctor: "Dra. Fabiana Couto", sector: "Endoscopia", quantity: 98, revenue: 27850, expense: 18650, status: "Recebido", daysToReceive: 34, glosaRate: 0.05 },
    { date: "2025-08-16", month: "2025-08", procedure: "Endoscopia Digestiva Alta", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 27, revenue: 8348.13, expense: 5930, status: "Recebido", daysToReceive: 27, glosaRate: 0.04 },
    { date: "2025-08-18", month: "2025-08", procedure: "Endoscopia com Pólipo", convenio: "SUS", doctor: "Dra. Fabiana Couto", sector: "Endoscopia", quantity: 28, revenue: 18200, expense: 13460, status: "Pendente", daysToReceive: 41, glosaRate: 0.09 },
    { date: "2025-08-20", month: "2025-08", procedure: "Gastroenterologia", convenio: "Amil", doctor: "Dr. Henrique Vidal", sector: "Consultas", quantity: 29, revenue: 14600, expense: 5630, status: "Recebido", daysToReceive: 20, glosaRate: 0.03 },
    { date: "2025-08-22", month: "2025-08", procedure: "Ligadura de Varizes Esofágicas", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 1, revenue: 1500, expense: 620, status: "Recebido", daysToReceive: 4, glosaRate: 0.00 },
    { date: "2025-08-24", month: "2025-08", procedure: "Polipectomia de Endoscopia", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 42, revenue: 41667.78, expense: 21200, status: "Recebido", daysToReceive: 26, glosaRate: 0.05 },
    { date: "2025-08-26", month: "2025-08", procedure: "Polipectomia do Cólon", convenio: "Unimed", doctor: "Dra. Helena Prado", sector: "Endoscopia", quantity: 24, revenue: 32287.92, expense: 16600, status: "Glosado", daysToReceive: 38, glosaRate: 0.12 },
    { date: "2025-08-28", month: "2025-08", procedure: "Pólipos EDA", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 9, revenue: 1800, expense: 520, status: "Recebido", daysToReceive: 6, glosaRate: 0.00 },
    { date: "2025-08-30", month: "2025-08", procedure: "Teste Respiratório", convenio: "Particular", doctor: "Dra. Camila Reis", sector: "Diagnóstico", quantity: 13, revenue: 4000, expense: 1260, status: "Recebido", daysToReceive: 4, glosaRate: 0.00 },

    { date: "2025-09-03", month: "2025-09", procedure: "Colonoscopia", convenio: "Bradesco", doctor: "Dr. Enzo Matos", sector: "Endoscopia", quantity: 28, revenue: 42900, expense: 16750, status: "Recebido", daysToReceive: 19, glosaRate: 0.02 },
    { date: "2025-09-05", month: "2025-09", procedure: "Colonoscopia", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 22, revenue: 35200, expense: 13340, status: "Recebido", daysToReceive: 8, glosaRate: 0.00 },
    { date: "2025-09-06", month: "2025-09", procedure: "Colonoscopia", convenio: "SulAmérica", doctor: "Dr. Enzo Matos", sector: "Endoscopia", quantity: 17, revenue: 26880, expense: 10120, status: "Em análise", daysToReceive: 33, glosaRate: 0.06 },
    { date: "2025-09-08", month: "2025-09", procedure: "Consulta Gastro", convenio: "Amil", doctor: "Dra. Laura Azevedo", sector: "Consultas", quantity: 67, revenue: 7820, expense: 2650, status: "Recebido", daysToReceive: 16, glosaRate: 0.03 },
    { date: "2025-09-10", month: "2025-09", procedure: "Endoscopia Digestiva Alta", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 134, revenue: 80450, expense: 31840, status: "Recebido", daysToReceive: 6, glosaRate: 0.01 },
    { date: "2025-09-12", month: "2025-09", procedure: "Endoscopia Digestiva Alta", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 29, revenue: 8955.76, expense: 6130, status: "Recebido", daysToReceive: 24, glosaRate: 0.04 },
    { date: "2025-09-14", month: "2025-09", procedure: "Endoscopia Digestiva Alta", convenio: "SUS", doctor: "Dra. Fabiana Couto", sector: "Endoscopia", quantity: 108, revenue: 30320, expense: 20580, status: "Pendente", daysToReceive: 39, glosaRate: 0.08 },
    { date: "2025-09-18", month: "2025-09", procedure: "Polipectomia de Endoscopia", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 48, revenue: 45110.18, expense: 23560, status: "Recebido", daysToReceive: 28, glosaRate: 0.06 },
    { date: "2025-09-20", month: "2025-09", procedure: "Polipectomia do Cólon", convenio: "SulAmérica", doctor: "Dra. Helena Prado", sector: "Endoscopia", quantity: 21, revenue: 33940, expense: 17540, status: "Em análise", daysToReceive: 35, glosaRate: 0.09 },
    { date: "2025-09-24", month: "2025-09", procedure: "Teste Respiratório", convenio: "Particular", doctor: "Dra. Camila Reis", sector: "Diagnóstico", quantity: 19, revenue: 5800, expense: 1810, status: "Recebido", daysToReceive: 4, glosaRate: 0.00 },
    { date: "2025-09-26", month: "2025-09", procedure: "Gastroenterologia", convenio: "Particular", doctor: "Dr. Henrique Vidal", sector: "Consultas", quantity: 33, revenue: 19245, expense: 6340, status: "Recebido", daysToReceive: 9, glosaRate: 0.01 },
    { date: "2025-09-28", month: "2025-09", procedure: "Revisão Bariátrica", convenio: "Porto Seguro", doctor: "Dr. Gustavo Moraes", sector: "Cirurgia", quantity: 6, revenue: 41800, expense: 23800, status: "Recebido", daysToReceive: 27, glosaRate: 0.05 },
    { date: "2025-09-30", month: "2025-09", procedure: "Pólipos EDA", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 12, revenue: 2350, expense: 680, status: "Recebido", daysToReceive: 5, glosaRate: 0.00 },

    { date: "2025-10-03", month: "2025-10", procedure: "Colonoscopia", convenio: "Unimed", doctor: "Dr. Enzo Matos", sector: "Endoscopia", quantity: 26, revenue: 39480, expense: 14900, status: "Recebido", daysToReceive: 17, glosaRate: 0.03 },
    { date: "2025-10-04", month: "2025-10", procedure: "Colonoscopia", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 19, revenue: 30200, expense: 11700, status: "Recebido", daysToReceive: 7, glosaRate: 0.00 },
    { date: "2025-10-05", month: "2025-10", procedure: "Colonoscopia", convenio: "Bradesco", doctor: "Dr. Enzo Matos", sector: "Endoscopia", quantity: 15, revenue: 23450, expense: 9050, status: "Pendente", daysToReceive: 0, glosaRate: 0.00 },
    { date: "2025-10-06", month: "2025-10", procedure: "Endoscopia Digestiva Alta", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 120, revenue: 76200, expense: 30580, status: "Recebido", daysToReceive: 6, glosaRate: 0.01 },
    { date: "2025-10-08", month: "2025-10", procedure: "Endoscopia Digestiva Alta", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 31, revenue: 9560.63, expense: 6680, status: "Em análise", daysToReceive: 0, glosaRate: 0.08 },
    { date: "2025-10-10", month: "2025-10", procedure: "Endoscopia Digestiva Alta", convenio: "SUS", doctor: "Dra. Fabiana Couto", sector: "Endoscopia", quantity: 116, revenue: 32540, expense: 22110, status: "Pendente", daysToReceive: 0, glosaRate: 0.09 },
    { date: "2025-10-12", month: "2025-10", procedure: "Consulta Gastro", convenio: "Unimed", doctor: "Dra. Laura Azevedo", sector: "Consultas", quantity: 63, revenue: 7245, expense: 2530, status: "Recebido", daysToReceive: 14, glosaRate: 0.05 },
    { date: "2025-10-14", month: "2025-10", procedure: "Endoscopia com Pólipo", convenio: "SulAmérica", doctor: "Dra. Fabiana Couto", sector: "Endoscopia", quantity: 31, revenue: 21320, expense: 15480, status: "Em análise", daysToReceive: 0, glosaRate: 0.11 },
    { date: "2025-10-16", month: "2025-10", procedure: "Polipectomia de Endoscopia", convenio: "Unimed", doctor: "Dr. André Ivo", sector: "Endoscopia", quantity: 51, revenue: 48210.44, expense: 24980, status: "Recebido", daysToReceive: 22, glosaRate: 0.07 },
    { date: "2025-10-18", month: "2025-10", procedure: "Polipectomia do Cólon", convenio: "Amil", doctor: "Dra. Helena Prado", sector: "Endoscopia", quantity: 26, revenue: 36310, expense: 18650, status: "Recebido", daysToReceive: 30, glosaRate: 0.05 },
    { date: "2025-10-20", month: "2025-10", procedure: "Revisão Bariátrica", convenio: "Porto Seguro", doctor: "Dr. Gustavo Moraes", sector: "Cirurgia", quantity: 7, revenue: 48650, expense: 26100, status: "Recebido", daysToReceive: 28, glosaRate: 0.04 },
    { date: "2025-10-24", month: "2025-10", procedure: "Gastroenterologia", convenio: "Bradesco", doctor: "Dr. Henrique Vidal", sector: "Consultas", quantity: 38, revenue: 20140, expense: 6720, status: "Recebido", daysToReceive: 19, glosaRate: 0.02 },
    { date: "2025-10-26", month: "2025-10", procedure: "Teste Respiratório", convenio: "Particular", doctor: "Dra. Camila Reis", sector: "Diagnóstico", quantity: 17, revenue: 5200, expense: 1580, status: "Recebido", daysToReceive: 5, glosaRate: 0.00 },
    { date: "2025-10-28", month: "2025-10", procedure: "Pólipos EDA", convenio: "Particular", doctor: "Dr. Arthur Mello", sector: "Endoscopia", quantity: 14, revenue: 2800, expense: 820, status: "Recebido", daysToReceive: 5, glosaRate: 0.00 }
];

const expenseData = [
    { month: "2025-07", category: "Folha de pagamento", description: "Equipe médica e enfermagem", amount: 84200 },
    { month: "2025-07", category: "Custos operacionais", description: "Materiais endoscopia", amount: 18650 },
    { month: "2025-07", category: "Infraestrutura", description: "Aluguel e condomínio", amount: 22100 },
    { month: "2025-07", category: "TI & Sistemas", description: "Licenças e prontuário eletrônico", amount: 5400 },
    { month: "2025-08", category: "Folha de pagamento", description: "Equipe médica e enfermagem", amount: 85680 },
    { month: "2025-08", category: "Custos operacionais", description: "Medicamentos e materiais", amount: 19940 },
    { month: "2025-08", category: "Infraestrutura", description: "Aluguel e condomínio", amount: 22100 },
    { month: "2025-08", category: "Marketing", description: "Captação de pacientes", amount: 8200 },
    { month: "2025-09", category: "Folha de pagamento", description: "Equipe médica e enfermagem", amount: 86120 },
    { month: "2025-09", category: "Custos operacionais", description: "Medicamentos e anestesias", amount: 20580 },
    { month: "2025-09", category: "Infraestrutura", description: "Aluguel e condomínio", amount: 22100 },
    { month: "2025-09", category: "Comissões", description: "Participação médica", amount: 11240 },
    { month: "2025-10", category: "Folha de pagamento", description: "Equipe médica e enfermagem", amount: 87950 },
    { month: "2025-10", category: "Custos operacionais", description: "Suprimentos endoscopia", amount: 21430 },
    { month: "2025-10", category: "Infraestrutura", description: "Aluguel e condomínio", amount: 22350 },
    { month: "2025-10", category: "Auditoria & Glosas", description: "Consultorias externas", amount: 6400 }
];

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

const resetFiltersButton = document.querySelector("#resetFilters");
const themeToggle = document.querySelector("#toggleTheme");
const exportCsvButton = document.querySelector("#exportCsv");

let financialEvolutionChart;
let revenueByConvenioChart;
let procedureMixChart;
let receivableStatusChart;

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

Array.from(document.querySelectorAll("[data-download]"), (button) => {
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
    const startIndex = state.months.indexOf(startPeriodSelect.value);
    const endIndex = state.months.indexOf(endPeriodSelect.value);
    const searchTerm = procedureSearchInput.value.toLowerCase().trim();
    const convenioFilter = convenioFilterSelect.value;
    const statusFilter = statusFilterSelect.value;
    const receivedOnly = receivedOnlyToggle.checked;

    return productionData.filter((item) => {
        const monthIndex = state.months.indexOf(item.month);
        if (monthIndex < startIndex || monthIndex > endIndex) return false;
        if (convenioFilter !== "all" && item.convenio !== convenioFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (receivedOnly && item.status !== "Recebido" && item.status !== "Pago") return false;
        if (searchTerm) {
            const haystack = `${item.procedure} ${item.convenio} ${item.doctor} ${item.sector}`.toLowerCase();
            if (!haystack.includes(searchTerm)) return false;
        }
        return true;
    });
}

function getFilteredExpenses() {
    const startIndex = state.months.indexOf(startPeriodSelect.value);
    const endIndex = state.months.indexOf(endPeriodSelect.value);
    return expenseData.filter((expense) => {
        const monthIndex = state.months.indexOf(expense.month);
        return monthIndex >= startIndex && monthIndex <= endIndex;
    });
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
        if (includeAll && select.id !== "convenioFilter" && select.id !== "statusFilter") {
            option.textContent = value;
        }
        if (select.id === "convenioFilter") option.textContent = value;
        if (select.id === "statusFilter") option.textContent = value;
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
