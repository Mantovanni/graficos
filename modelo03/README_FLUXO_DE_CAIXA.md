# Dashboard de Fluxo de Caixa - Clínica Médica

## 📊 Visão Geral

Dashboard completo para análise de fluxo de caixa da clínica médica, com foco em:
- **Entradas e Saídas Realizadas** (valores efetivamente recebidos/pagos)
- **Receitas e Despesas Pendentes** (valores a receber/pagar)
- **Projeções Futuras** (realizado + pendente)
- **Filtros por Mês** para análise temporal

## 🎯 Funcionalidades Principais

### 1. KPIs (Indicadores-Chave)
- **Entradas Realizadas**: Total efetivamente recebido no período
- **Saídas Realizadas**: Total efetivamente pago no período
- **Saldo Realizado**: Diferença entre entradas e saídas realizadas
- **Saldo Projetado**: Incluindo valores pendentes

### 2. Gráficos Interativos
- **Fluxo de Caixa Mensal**: Visualização de entradas vs saídas vs saldo
- **Evolução do Saldo**: Linha do tempo do saldo mensal
- **Realizado vs Pendente**: Comparação de valores realizados e pendentes
- **Distribuição por Convênio**: Pizza mostrando receitas por convênio

### 3. Tabelas Detalhadas
- **Receitas**: Todas as entradas com status, datas de vencimento e recebimento
- **Despesas**: Todas as saídas com status, categorias e datas

### 4. Filtros
- **Por Mês**: Todos, Maio, Junho, Julho, Agosto, Setembro, Outubro
- Atualização dinâmica de todos os componentes ao filtrar

### 5. Temas
- **Tema Escuro** (padrão)
- **Tema Claro**
- Persistência da preferência via localStorage

## 📁 Estrutura de Dados

### Receitas (data.js)
```javascript
{
    convenio: "PARTICULAR",
    faturamento: 185698.06,
    impostos: 0,
    valorLiquido: 185698.06,
    dataVencimento: "31/07/2025",  // Quando deveria ser recebido
    dataRecebimento: "31/07/2025", // Quando foi recebido (null se pendente)
    status: "Realizado" // ou "Pendente"
}
```

### Despesas
```javascript
{
    descricao: "Despesas Operacionais Julho",
    valor: 51632.96,
    dataVencimento: "31/07/2025",  // Quando deveria ser pago
    dataPagamento: "31/07/2025",   // Quando foi pago (null se pendente)
    status: "Pago", // ou "Pendente"
    categoria: "Operacional"
}
```

## 🔍 Lógica de Cálculo

### Fluxo de Caixa por Mês

**Para Receitas Realizadas:**
- Usa a `dataRecebimento` para determinar em qual mês a entrada ocorreu
- Exemplo: Faturamento de Julho recebido em Agosto conta como entrada de Agosto

**Para Receitas Pendentes:**
- Usa a `dataVencimento` para projeções futuras
- Exemplo: Faturamento de Julho com vencimento em Setembro conta como pendente de Setembro

**Para Despesas:**
- Mesma lógica: `dataPagamento` para realizadas, `dataVencimento` para pendentes

### Fórmulas

```
Entradas do Mês = Soma(valorLiquido) onde dataRecebimento = mês
Saídas do Mês = Soma(valor) onde dataPagamento = mês
Saldo Realizado = Entradas - Saídas

Pendentes Entradas = Soma(valorLiquido) onde status = "Pendente"
Pendentes Saídas = Soma(valor) onde status = "Pendente"
Saldo Projetado = Saldo Realizado + Pendentes Entradas - Pendentes Saídas
```

## 🎨 Recursos Visuais

- **Cores Intuitivas**:
  - 🟢 Verde: Entradas/Positivo
  - 🔴 Vermelho: Saídas/Negativo
  - 🔵 Azul: Saldo/Neutro
  - 🟣 Roxo: Projeções

- **Badges de Status**:
  - `Realizado`: Verde
  - `Pendente`: Laranja

- **Animações Suaves**: Transições em hover e mudanças de tema

## 📤 Exportação

- Exportar tabelas para CSV
- Botões de exportação nas tabelas e na barra lateral

## 🚀 Como Usar

1. **Abrir**: Navegue até `index.html` no navegador
2. **Filtrar**: Clique nos botões de mês na barra lateral
3. **Visualizar**: Observe as atualizações nos KPIs, gráficos e tabelas
4. **Trocar Tema**: Clique no botão sol/lua no canto superior direito
5. **Exportar**: Use os botões "Exportar" para baixar os dados em CSV

## 📊 Dados de Exemplo

### Valores Corrigidos (Outubro 2025)

**Saídas (Despesas Operacionais):**
- Julho: R$ 51.632,96
- Agosto: R$ 41.336,52

**Entradas por Mês de Recebimento:**
- Maio: R$ 0,00
- Junho: R$ 0,00
- Julho: R$ 266.501,09 (particulares + convênios recebidos em julho)
- Agosto: R$ 286.111,00
- Setembro: R$ 104.310,12
- Outubro: R$ 74.600,00

**Receita Pendente:**
- ITAGIMIRIM: R$ 6.100,00 (vencimento: 17/09/2025)

## 🔧 Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com variáveis CSS e temas
- **JavaScript (Vanilla)**: Lógica e interatividade
- **Chart.js 4.4.0**: Gráficos interativos
- **Font Awesome 6.4.0**: Ícones

## 📝 Notas Importantes

- **Diferença do DRE**: Este é um fluxo de caixa, não um DRE
  - DRE: Competência (quando ocorreu o fato gerador)
  - Fluxo de Caixa: Regime de caixa (quando o dinheiro entrou/saiu)

- **Datas de Vencimento**: Usadas para pendentes e projeções
- **Datas de Recebimento/Pagamento**: Usadas para valores realizados

## 🐛 Debugging

O console do navegador exibe logs detalhados:
- Valores de entradas, saídas e saldos
- Cálculos de fluxo de caixa por mês
- Status de carregamento

Abra o console (F12) para ver os detalhes.

## 📞 Suporte

Para dúvidas ou modificações, consulte os comentários nos arquivos:
- `data.js`: Funções de cálculo
- `app.js`: Lógica do dashboard
- `styles.css`: Estilos e temas

---

**Última Atualização**: Outubro 2025
**Versão**: 2.0 (Fluxo de Caixa)
