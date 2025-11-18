// Dados do Fluxo de Caixa - Entradas e Saídas
const fluxoCaixaData = {
    entradas: [
        { convenio: "PARTICULAR", mes: "JULHO", numeroNota: "", faturamento: 185698.06, impostos: 0, valorLiquidoReceber: 185698.06, valorRecebido: 185698.06, dataPagamento: "31/07/2025", dataVencimento: "31/07/2025", status: "Realizado" },
        { convenio: "PARTICULAR", mes: "AGOSTO", numeroNota: "", faturamento: 191705.33, impostos: 0, valorLiquidoReceber: 191705.33, valorRecebido: 191705.33, dataPagamento: "31/08/2025", dataVencimento: "31/08/2025", status: "Realizado" },
        { convenio: "UNIMED", mes: "JULHO", numeroNota: "", faturamento: 90771.06, impostos: 34538.39, valorLiquidoReceber: 56232.67, valorRecebido: 56232.67, dataPagamento: "30/08/2025", dataVencimento: "30/08/2025", status: "Realizado" },
        { convenio: "BELMONTE", mes: "JULHO", numeroNota: "", faturamento: 750.00, impostos: 206.25, valorLiquidoReceber: 543.75, valorRecebido: 543.75, dataPagamento: "31/07/2025", dataVencimento: "31/07/2025", status: "Realizado" },
        { convenio: "SUS PORTO", mes: "JULHO", numeroNota: "226", faturamento: 41350.00, impostos: 827.00, valorLiquidoReceber: 40523.00, valorRecebido: 40523.00, dataPagamento: "17/09/2025", dataVencimento: "17/09/2025", status: "Realizado" },
        { convenio: "GUARATINGA", mes: "JULHO", numeroNota: "", faturamento: 9600.00, impostos: 2640.00, valorLiquidoReceber: 6960.00, valorRecebido: 6960.00, dataPagamento: "15/08/2025", dataVencimento: "15/08/2025", status: "Realizado" },
        { convenio: "UNIMED", mes: "JUNHO", numeroNota: "", faturamento: 74504.09, impostos: 28348.81, valorLiquidoReceber: 46155.28, valorRecebido: 46155.28, dataPagamento: "30/07/2025", dataVencimento: "30/07/2025", status: "Realizado" },
        { convenio: "SUS PORTO", mes: "MAIO", numeroNota: "170", faturamento: 34800.00, impostos: 696.00, valorLiquidoReceber: 34104.00, valorRecebido: 34104.00, dataPagamento: "08/07/2025", dataVencimento: "08/07/2025", status: "Realizado" },
        { convenio: "SUS PORTO", mes: "JUNHO", numeroNota: "195", faturamento: 31850.00, impostos: 637.00, valorLiquidoReceber: 31213.00, valorRecebido: 31213.00, dataPagamento: "05/08/2025", dataVencimento: "05/08/2025", status: "Realizado" },
        { convenio: "UNIMED", mes: "AGOSTO", numeroNota: "", faturamento: 90464.42, impostos: 34828.8, valorLiquidoReceber: 55635.62, valorRecebido: 55635.62, dataPagamento: "30/09/2025", dataVencimento: "30/09/2025", status: "Realizado" },
        { convenio: "BELMONTE", mes: "AGOSTO", numeroNota: "", faturamento: 2100.00, impostos: 0, valorLiquidoReceber: 2100.00, valorRecebido: 2100.00, dataPagamento: "15/10/2025", dataVencimento: "15/10/2025", status: "Realizado" },
        { convenio: "SUS PORTO", mes: "AGOSTO", numeroNota: "249", faturamento: 37500.00, impostos: 750.00, valorLiquidoReceber: 36750.00, valorRecebido: 36750.00, dataPagamento: "15/10/2025", dataVencimento: "15/10/2025", status: "Realizado" },
        { convenio: "GUARATINGA", mes: "AGOSTO", numeroNota: "", faturamento: 3500.00, impostos: 962.50, valorLiquidoReceber: 2537.50, valorRecebido: 2537.50, dataPagamento: "15/09/2025", dataVencimento: "15/09/2025", status: "Realizado" },
        // Valores a receber (pendentes de pagamento)
        { convenio: "ITAGIMIRIM", mes: "JULHO", numeroNota: "224", faturamento: 6100.00, impostos: 0, valorLiquidoReceber: 6100.00, valorRecebido: 0, dataPagamento: "", dataVencimento: "16/10/2025", status: "Pendente" },

        { convenio: "PARTICULAR", mes: "Setembro", numeroNota: "", faturamento: 212722.29, impostos: 0, valorLiquidoReceber: 212722.29, valorRecebido: 212722.29, dataPagamento: "31/09/2025", dataVencimento: "31/09/2025", status: "Realizado" },
        { convenio: "UNIMED", mes: "Setembro", numeroNota: "", faturamento: 83700.15, impostos: 22360.29, valorLiquidoReceber: 61513.07, valorRecebido: 61513.07, dataPagamento: "30/10/2025", dataVencimento: "30/10/2025", status: "Realizado" },
        { convenio: "BELMONTE", mes: "Setembro", numeroNota: "", faturamento: 3300.00, impostos: 907.50, valorLiquidoReceber: 2392.50, valorRecebido: 0, dataPagamento: "30/10/2025", dataVencimento: "30/10/2025", status: "Realizado" },
        { convenio: "SUS PORTO", mes: "Setembro", numeroNota: "284", faturamento: 34800.00, impostos: 827.00, valorLiquidoReceber: 33973.00, valorRecebido: 40523.00, dataPagamento: "30/11/2025", dataVencimento: "30/11/2025", status: "Realizado" },
        { convenio: "ITAGIMIRIM", mes: "Setembro", numeroNota: "", faturamento: 149000.00, impostos: 0, valorLiquidoReceber: 6100.00, valorRecebido: 0, dataPagamento: "30/11/2025", dataVencimento: "30/11/2025", status: "Realizado" },
        { convenio: "GUARATINGA", mes: "Setembro", numeroNota: "", faturamento: 5500.00, impostos: 1512.50, valorLiquidoReceber: 3987.50, valorRecebido: 0, dataPagamento: "30/10/2025", dataVencimento: "30/10/2025", status: "Realizado" },
 ],
    saidas: [
        { categoria: "Geral", valor: 51632.96, dataPagamento: "31/07/2025" },
        { categoria: "Geral", valor: 41336.52, dataPagamento: "31/08/2025" },
        { categoria: "Geral", valor: 51632.96, dataPagamento: "30/09/2025" },
    ]
};

// Função auxiliar para processar dados por mês
const processarDadosPorMes = () => {
    const meses = {};

    // Processar entradas
    fluxoCaixaData.entradas.forEach(entrada => {
        // Usa dataPagamento se disponível, senão usa dataVencimento
        const dataReferencia = entrada.dataPagamento || entrada.dataVencimento;
        if (!dataReferencia) return; // Ignora se não tiver nenhuma data

        const mesAno = dataReferencia.substring(3); // MM/YYYY

        if (!meses[mesAno]) {
            meses[mesAno] = {
                entradas: 0,
                saidas: 0,
                entradasDetalhes: [],
                saidasDetalhes: []
            };
        }

        // Usa valorRecebido para entradas realizadas, valorLiquidoReceber para pendentes
        const valorParaSomar = entrada.status === "Realizado" ? entrada.valorRecebido : entrada.valorLiquidoReceber;
        meses[mesAno].entradas += valorParaSomar;
        meses[mesAno].entradasDetalhes.push(entrada);
    });

    // Processar saídas
    fluxoCaixaData.saidas.forEach(saida => {
        if (!saida.dataPagamento) return; // Ignora se não tiver data

        const mesAno = saida.dataPagamento.substring(3); // MM/YYYY

        if (!meses[mesAno]) {
            meses[mesAno] = {
                entradas: 0,
                saidas: 0,
                entradasDetalhes: [],
                saidasDetalhes: []
            };
        }

        meses[mesAno].saidas += saida.valor;
        meses[mesAno].saidasDetalhes.push(saida);
    });

    return meses;
};
