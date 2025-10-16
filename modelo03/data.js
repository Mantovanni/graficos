// Dados Financeiros da Clínica - Modelo 03
// Dashboard de Fluxo de Caixa

const financialData = {
    // Receitas detalhadas por convênio (com datas de vencimento/recebimento)
    receitas: {
        julho: [
            { convenio: "PARTICULAR", faturamento: 185698.06, impostos: 0, valorLiquido: 185698.06, dataVencimento: "31/07/2025", dataRecebimento: "31/07/2025", status: "Realizado" },
            { convenio: "UNIMED", faturamento: 90771.06, impostos: 34538.39, valorLiquido: 56232.67, dataVencimento: "30/08/2025", dataRecebimento: "30/08/2025", status: "Realizado" },
            { convenio: "BELMONTE", faturamento: 750.00, impostos: 206.25, valorLiquido: 543.75, dataVencimento: "31/07/2025", dataRecebimento: "31/07/2025", status: "Realizado" },
            { convenio: "SUS PORTO", faturamento: 41350.00, impostos: 827.00, valorLiquido: 40523.00, dataVencimento: "17/09/2025", dataRecebimento: "17/09/2025", status: "Realizado", notaFiscal: 226 },
            { convenio: "ITAGIMIRIM", faturamento: 6100.00, impostos: 0, valorLiquido: 6100.00, dataVencimento: "17/10/2025", dataRecebimento: null, status: "Pendente", notaFiscal: 224 },
            { convenio: "GUARANTIGA", faturamento: 9600.00, impostos: 2640.00, valorLiquido: 6960.00, dataVencimento: "15/08/2025", dataRecebimento: "15/08/2025", status: "Realizado" }
        ],
        agosto: [
            { convenio: "PARTICULAR", faturamento: 191705.33, impostos: 0, valorLiquido: 191705.33, dataVencimento: "31/08/2025", dataRecebimento: "31/08/2025", status: "Realizado" },
            { convenio: "UNIMED", faturamento: 90464.42, impostos: 34828.8, valorLiquido: 55635.62, dataVencimento: "30/09/2025", dataRecebimento: "30/09/2025", status: "Realizado" },
            { convenio: "BELMONTE", faturamento: 2100.00, impostos: 0, valorLiquido: 2100.00, dataVencimento: "31/08/2025", dataRecebimento: "15/10/2025", status: "Realizado" },
            { convenio: "SUS PORTO", faturamento: 37500.00, impostos: 750.00, valorLiquido: 36750.00, dataVencimento: "30/09/2025", dataRecebimento: "15/10/2025", status: "Realizado", notaFiscal: 249 },
            { convenio: "GUARANTIGA", faturamento: 3500.00, impostos: 962.50, valorLiquido: 2537.50, dataVencimento: "15/09/2025", dataRecebimento: "15/09/2025", status: "Realizado" }
        ],
        junho: [
            { convenio: "UNIMED", faturamento: 74504.09, impostos: 28348.81, valorLiquido: 46155.28, dataVencimento: "30/07/2025", dataRecebimento: "30/07/2025", status: "Realizado" },
            { convenio: "SUS PORTO", faturamento: 31850.00, impostos: 637.00, valorLiquido: 31213.00, dataVencimento: "31/07/2025", dataRecebimento: "05/08/2025", status: "Realizado", notaFiscal: 195 }
        ],
        maio: [
            { convenio: "SUS PORTO", faturamento: 34800.00, impostos: 696.00, valorLiquido: 34104.00, dataVencimento: "30/06/2025", dataRecebimento: "08/07/2025", status: "Realizado", notaFiscal: 170 }
        ]
    },

    // Despesas/Saídas por mês
    despesas: [
        { descricao: "Despesas Operacionais Julho", valor: 51632.96, dataVencimento: "31/07/2025", dataPagamento: "31/07/2025", status: "Pago", categoria: "Operacional" },
        { descricao: "Despesas Operacionais Agosto", valor: 41336.52, dataVencimento: "31/08/2025", dataPagamento: "31/08/2025", status: "Pago", categoria: "Operacional" }
    ],

    // Meses disponíveis
    meses: ["Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
};

// ===== FUNÇÕES AUXILIARES =====

// Obter todas as receitas em um array único
const getAllReceitas = () => {
    const allReceitas = [];
    Object.keys(financialData.receitas).forEach(mes => {
        financialData.receitas[mes].forEach(receita => {
            allReceitas.push({ ...receita, mesOrigem: mes });
        });
    });
    return allReceitas;
};

// Calcular fluxo de caixa por mês (baseado em quando o dinheiro entrou/saiu de fato)
const calcularFluxoDeCaixaPorMes = () => {
    const fluxo = {};

    // Inicializar meses
    financialData.meses.forEach(mes => {
        fluxo[mes] = {
            entradas: 0,
            saidas: 0,
            saldo: 0,
            entradasPendentes: 0,
            saidasPendentes: 0
        };
    });

    // Processar receitas realizadas (por data de recebimento)
    getAllReceitas().forEach(receita => {
        if (receita.status === 'Realizado' && receita.dataRecebimento) {
            const mes = getMesFromDate(receita.dataRecebimento);
            if (fluxo[mes]) {
                fluxo[mes].entradas += receita.valorLiquido;
            }
        }

        // Receitas pendentes (por data de vencimento)
        if (receita.status === 'Pendente' && receita.dataVencimento) {
            const mes = getMesFromDate(receita.dataVencimento);
            if (fluxo[mes]) {
                fluxo[mes].entradasPendentes += receita.valorLiquido;
            }
        }
    });

    // Processar despesas pagas (por data de pagamento)
    financialData.despesas.forEach(despesa => {
        if (despesa.status === 'Pago' && despesa.dataPagamento) {
            const mes = getMesFromDate(despesa.dataPagamento);
            if (fluxo[mes]) {
                fluxo[mes].saidas += despesa.valor;
            }
        }

        // Despesas pendentes (por data de vencimento)
        if (despesa.status === 'Pendente' && despesa.dataVencimento) {
            const mes = getMesFromDate(despesa.dataVencimento);
            if (fluxo[mes]) {
                fluxo[mes].saidasPendentes += despesa.valor;
            }
        }
    });

    // Calcular saldos
    Object.keys(fluxo).forEach(mes => {
        fluxo[mes].saldo = fluxo[mes].entradas - fluxo[mes].saidas;
    });

    return fluxo;
};

// Extrair mês de uma data no formato DD/MM/YYYY
const getMesFromDate = (dateStr) => {
    if (!dateStr) return null;
    const [dia, mes, ano] = dateStr.split('/');
    const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return mesesNomes[parseInt(mes) - 1];
};

// Calcular totais por convênio
const calcularReceitasPorConvenio = () => {
    const conveniosTotais = {};

    getAllReceitas().forEach(item => {
        if (!conveniosTotais[item.convenio]) {
            conveniosTotais[item.convenio] = {
                convenio: item.convenio,
                faturamentoTotal: 0,
                impostosTotal: 0,
                recebidoTotal: 0,
                pendenteTotal: 0,
                quantidade: 0
            };
        }
        conveniosTotais[item.convenio].faturamentoTotal += item.faturamento;
        conveniosTotais[item.convenio].impostosTotal += item.impostos;

        if (item.status === 'Realizado') {
            conveniosTotais[item.convenio].recebidoTotal += item.valorLiquido;
        } else {
            conveniosTotais[item.convenio].pendenteTotal += item.valorLiquido;
        }

        conveniosTotais[item.convenio].quantidade += 1;
    });

    return Object.values(conveniosTotais);
};

// Calcular saldo acumulado
const calcularSaldoAcumulado = () => {
    const fluxo = calcularFluxoDeCaixaPorMes();
    let acumulado = 0;
    const resultado = [];

    financialData.meses.forEach(mes => {
        if (fluxo[mes] && (fluxo[mes].entradas > 0 || fluxo[mes].saidas > 0)) {
            acumulado += fluxo[mes].saldo;
            resultado.push({
                mes: mes,
                saldo: fluxo[mes].saldo,
                acumulado: acumulado
            });
        }
    });

    return resultado;
};

// Exportar dados para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        financialData,
        getAllReceitas,
        calcularFluxoDeCaixaPorMes,
        calcularReceitasPorConvenio,
        calcularSaldoAcumulado,
        getMesFromDate
    };
}
