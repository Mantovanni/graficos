# Card "A Receber (Pendente)" - Comportamento Atualizado

## 📋 Novo Comportamento

### ✅ **O card agora RESPONDE aos filtros aplicados!**

O card "A Receber (Pendente)" mostra os valores pendentes de pagamento **de acordo com os filtros ativos** (mês, convênio e status).

## 💡 Como Funciona

### 1️⃣ **Sem filtros** (Todos selecionados)
- Mostra **TODOS** os valores com `status: "Pendente"`
- Total geral de valores a receber

### 2️⃣ **Com filtro de MÊS**
- Mostra apenas valores pendentes **daquele mês específico**
- Baseado em `dataPagamento` ou `dataVencimento` (fallback)

### 3️⃣ **Com filtro de CONVÊNIO**
- Mostra apenas valores pendentes **daquele convênio**
- Ex: Filtrar "UNIMED" → mostra apenas pendentes da UNIMED

### 4️⃣ **Com filtro de STATUS**
- Se selecionar "Pendente" → mostra todos pendentes (normal)
- Se selecionar "Realizado" → mostra **R$ 0,00** (realizados não têm valores a receber)
- Se selecionar "Todos" → mostra pendentes (comportamento padrão)

## 💰 Exemplos de Valores

### Dados Atuais (16/10/2025):

| Convênio | Mês | Vencimento | Valor Líquido | Status |
|----------|-----|------------|---------------|---------|
| ITAGIMIRIM | JULHO | 16/10/2025 | R$ 6.100,00 | Pendente |

### Cenários de Filtro:

| Filtro Aplicado | Valor Mostrado | Explicação |
|----------------|----------------|------------|
| **Todos / Todos / Todos** | R$ 6.100,00 | Mostra todos os pendentes |
| **10/2025 / Todos / Todos** | R$ 6.100,00 | Pendente com vencimento em 10/2025 |
| **Todos / ITAGIMIRIM / Todos** | R$ 6.100,00 | Pendente do convênio ITAGIMIRIM |
| **Todos / UNIMED / Todos** | R$ 0,00 | Nenhum pendente da UNIMED |
| **Todos / Todos / Realizado** | R$ 0,00 | Filtra apenas realizados (sem pendentes) |
| **Todos / Todos / Pendente** | R$ 6.100,00 | Filtra apenas pendentes |

## 🔍 Lógica de Cálculo

```javascript
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
```

## ✅ Comportamento Correto

### O card é atualizado quando:
- ✅ Você muda o filtro de **Mês**
- ✅ Você muda o filtro de **Convênio**
- ✅ Você muda o filtro de **Status**
- ✅ Você clica em **"Limpar Filtros"**

### O card mostra:
- ✅ Valores pendentes **filtrados** pelos critérios ativos
- ✅ Sempre usa `valorLiquidoReceber` (já com impostos deduzidos)
- ✅ Considera `dataPagamento` ou `dataVencimento` para filtro de mês

### O card NÃO mostra:
- ❌ Valores com status "Realizado" (já foram pagos)
- ❌ Valores fora do mês selecionado (se filtro de mês ativo)
- ❌ Valores de outros convênios (se filtro de convênio ativo)

## 🎯 Como Testar

1. **Abra o dashboard** → Card deve mostrar R$ 6.100,00
2. **Selecione mês 10/2025** → Card continua R$ 6.100,00
3. **Selecione mês 09/2025** → Card mostra R$ 0,00 (sem pendentes em setembro)
4. **Limpe filtros** → Card volta para R$ 6.100,00
5. **Selecione convênio UNIMED** → Card mostra R$ 0,00 (sem pendentes UNIMED)
6. **Selecione status Realizado** → Card mostra R$ 0,00 (realizados não têm a receber)

---

**Data da Atualização**: 16/10/2025  
**Status**: ✅ Atualizado - Card agora responde a filtros!  
**Mudança**: De comportamento estático para dinâmico com filtros

