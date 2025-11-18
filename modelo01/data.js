// Dados financeiros da clínica - Todos os meses
const clinicData = {
    janeiro: [],
    fevereiro: [],
    marco: [],
    abril: [],
    maio: [],
    junho: [],
    julho: [
        { procedimento: "COLONOSCOPIA", quantidade: 13, total: 20850.00 },
        { procedimento: "COLONOSCOPIA COM POLIPECTOMIA", quantidade: 9, total: 19900.00 },
        { procedimento: "COLONOSCOPIA SUS", quantidade: 12, total: 7200.00 },
        { procedimento: "COLONOSCOPIA UNIMED", quantidade: 12, total: 5797.20 },
        { procedimento: "CONSULTA GASTRO UNIMED", quantidade: 61, total: 7015.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA", quantidade: 95, total: 57990.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA SUS", quantidade: 72, total: 21950.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA UNIMED", quantidade: 23, total: 7111.37 },
        { procedimento: "ENDOSCOPIA COM POLIPOS SUS", quantidade: 13, total: 8450.00 },
        { procedimento: "GASTROENTEROLOGIA", quantidade: 35, total: 17850.00 },
        { procedimento: "LIGADURA DE VARIZES ESOFÁGICA", quantidade: 0, total: 0.00 },
        { procedimento: "POLIPECTOMIA DE ENDOSCOPIA UNIMED", quantidade: 26, total: 25794.34 },
        { procedimento: "POLIPECTOMIA DO COLON UNIMED", quantidade: 22, total: 29597.26 },
        { procedimento: "POLIPOS EDA PARTICULAR", quantidade: 5, total: 1000.00 },
        { procedimento: "TESTE RESPIRATÓRIO", quantidade: 14, total: 4300.00 }
    ],
    agosto: [
        { procedimento: "COLONOSCOPIA", quantidade: 25, total: 39100.00 },
        { procedimento: "COLONOSCOPIA COM POLIPECTOMIA", quantidade: 15, total: 37800.00 },
        { procedimento: "COLONOSCOPIA SUS", quantidade: 18, total: 10200.00 },
        { procedimento: "COLONOSCOPIA UNIMED", quantidade: 10, total: 4831.00 },
        { procedimento: "CONSULTA GASTRO UNIMED", quantidade: 54, total: 6210.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA", quantidade: 126, total: 76170.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA SUS", quantidade: 98, total: 27850.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA UNIMED", quantidade: 27, total: 8348.13 },
        { procedimento: "ENDOSCOPIA COM POLIPOS SUS", quantidade: 28, total: 18200.00 },
        { procedimento: "GASTROENTEROLOGIA", quantidade: 29, total: 14600.00 },
        { procedimento: "LIGADURA DE VARIZES ESOFÁGICA", quantidade: 1, total: 1500.00 },
        { procedimento: "POLIPECTOMIA DE ENDOSCOPIA UNIMED", quantidade: 42, total: 41667.78 },
        { procedimento: "POLIPECTOMIA DO COLON UNIMED", quantidade: 24, total: 32287.92 },
        { procedimento: "POLIPOS EDA PARTICULAR", quantidade: 9, total: 1800.00 },
        { procedimento: "TESTE RESPIRATÓRIO", quantidade: 13, total: 4000.00 }
    ],
    setembro: [
        { procedimento: "COLONOSCOPIA COM RETIRADA DE PÓLIPOS", quantidade: 30, total: 66100.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA", quantidade: 98, total: 59580.00 },
        { procedimento: "COLONOSCOPIA", quantidade: 33, total: 50100.00 },
        { procedimento: "POLIPECTOMIA DO COLON UNIMED", quantidade: 25, total: 33633.25 },
        { procedimento: "GASTROENTEROLOGIA", quantidade: 50, total: 25250.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA SUS", quantidade: 82, total: 23600.00 },
        { procedimento: "POLIPECTOMIA DE ENDOSCOPIA UNIMED", quantidade: 21, total: 20833.89 },
        { procedimento: "ENDOSCOPIA COM POLIPOS SUS", quantidade: 32, total: 20800.00 },
        { procedimento: "COLONOSCOPIA SUS", quantidade: 18, total: 10700.00 },
        { procedimento: "ENDOSCOPIA DIGESTIVA ALTA UNIMED", quantidade: 26, total: 8038.94 },
        { procedimento: "CONSULTA GASTRO UNIMED", quantidade: 50, total: 5750.00 },
        { procedimento: "TESTE RESPIRATÓRIO", quantidade: 15, total: 4600.00 },
        { procedimento: "COLONOSCOPIA UNIMED", quantidade: 9, total: 4347.90 },
        { procedimento: "RETOSSIGMOIDOSCOPIA", quantidade: 6, total: 2550.00 },
        { procedimento: "POLIPOS EDA PARTICULAR", quantidade: 7, total: 1700.00 },
        { procedimento: "LIGADURA DE VARIZES ESOFÁGICA", quantidade: 1, total: 1400.00 },
        { procedimento: "PHMETRIA / MANOMETRIA UNIMED", quantidade: 2, total: 1308.56 }
    ],
    outubro: [],
    novembro: [],
    dezembro: []
};

// Dados de despesas por mês
const despesasData = {
    janeiro: { categoria: "Geral", valor: 0, mes: "Janeiro" },
    fevereiro: { categoria: "Geral", valor: 0, mes: "Fevereiro" },
    marco: { categoria: "Geral", valor: 0, mes: "Março" },
    abril: { categoria: "Geral", valor: 0, mes: "Abril" },
    maio: { categoria: "Geral", valor: 0, mes: "Maio" },
    junho: { categoria: "Geral", valor: 0, mes: "Junho" },
    julho: { categoria: "Geral", valor: 51632.96, mes: "Julho" },
    agosto: { categoria: "Geral", valor: 41336.52, mes: "Agosto" },
    setembro: { categoria: "Geral", valor: 0, mes: "Setembro" },
    outubro: { categoria: "Geral", valor: 0, mes: "Outubro" },
    novembro: { categoria: "Geral", valor: 0, mes: "Novembro" },
    dezembro: { categoria: "Geral", valor: 0, mes: "Dezembro" }
};

// Exportar dados para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = clinicData;
}
