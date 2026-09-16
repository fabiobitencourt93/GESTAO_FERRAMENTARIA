# ⚙️ Sistema de Gestão de Ferramentaria e Usinagem (MES/ERP)

<div align="center">
  <p><b>Plataforma web completa desenvolvida para o controle de chão de fábrica, apontamentos de produção, almoxarifado (Kardex) e gestão acadêmica de turmas em ambientes de usinagem e ferramentaria.</b></p>
</div>

---

## 🚀 Sobre o Projeto
Desenvolvido para otimizar o fluxo de trabalho em ambientes educacionais e industriais (como laboratórios do SENAI), este software integra conceitos de **MES (Manufacturing Execution System)** e **ERP**. O sistema permite que múltiplos alunos realizem apontamentos de processos em tempo real, gerenciem estoques de matéria-prima e componentes, e acompanhem o andamento de projetos de estampos e moldes de forma centralizada.

---

## ✨ Principais Funcionalidades

### 🏭 1. Chão de Fábrica & Apontamentos (Painel do Aluno)
* **Cronômetro Industrial:** Sistema de *Play/Stop* integrado para o apontamento de horas reais de execução em máquinas CNC e convencionais.
* **Identificação por Crachá:** Registro de operador via ID numérico vinculado a cada apontamento.
* **Relatos de Ocorrências:** Canal rápido para os alunos reportarem quebras de ferramentas, paradas de máquina ou desvios de processo.

### 📦 2. Gestão de Estoque e Almoxarifado (Kardex)
* **Cadastro de Materiais:** Organização por categorias (*Matéria-Prima, Componentes e Consumíveis*) com controle de dimensões/especificações.
* **Entradas e Saídas Vinculadas:** Movimentação de estoque com opção de baixa direta atrelada ao crachá do aluno e ao projeto de destino.
* **Alertas Visuais:** Mudança automática de status e cores nos cards de materiais que atingem ou ficam abaixo do estoque mínimo ideal.
* **Relatório de Movimentações:** Extração completa de dados (Kardex) exportável para planilha em formato CSV/Excel.

### 🛠️ 3. Engenharia e Roteiros
* **Estruturação de Processos:** Cadastro de peças, definição de sequências operacionais, máquinas alocadas e tempos-alvo (planejados).
* **Gestão de Projetos e Estampos:** Acompanhamento do ciclo de vida de ferramentas (Corte, Dobra, Repuxo, Progressivo, Moldes de Injeção) com suporte a **upload de imagens de referência/CAD**.

### 📊 4. Relatórios e Indicadores de Desempenho
* **Análise de Desempenho:** Comparativo gráfico entre o tempo Planejado vs. Realizado por peça e por processo.
* **Gestão de Atrasos:** Identificação imediata de gargalos e desvios de tempo nas operações fabris.
* **Exportação de Dados:** Exportação de relatórios gerenciais e de ocorrências com codificação UTF-8 otimizada para Excel.

### 📚 5. Gestão Acadêmica (Múltiplas Turmas / Semestres)
* **Isolamento de Dados:** Criação de novos semestres letivos que mantêm o histórico seguro enquanto limpam o painel para novas turmas.
* **Painel Administrativo Protegido:** Área restrita por senha para controle de alunos, turmas, projetos e ajustes globais.

---

## 🛠️ Tecnologias Utilizadas

### Front-end:
* **React.js** (com *React Router* para navegação)
* **Lucide React** (para iconografia industrial moderna)
* **Axios** (para comunicação HTTP com a API)

### Back-end & Banco de Dados:
* **Node.js & Express** (Arquitetura RESTful com Pool de conexões assíncronas)
* **PostgreSQL / Supabase** (Banco de dados relacional com transações seguras e suporte a payloads otimizados para imagens em Base64)
* **Deploy:** Vercel (Front-end) & Render (Back-end)

---

## 🗄️ Estrutura do Banco de Dados (Resumo)

O sistema opera com tabelas relacionais altamente otimizadas:
* `turmas` (Gerenciamento de semestres letivos)
* `operadores` (Alunos e controle de crachás/XP)
* `projetos` & `estampos` (Ferramental em fabricação com suporte a imagens)
* `pecas` & `processos` (Roteiros de usinagem e tempos planejados)
* `apontamentos` (Cronômetros e histórico de produção)
* `estoque_itens` & `estoque_movimentacoes` (Kardex e controle de almoxarifado)

---

## 📱 Acesso ao Sistema
Você pode conferir a aplicação em funcionamento através do link de produção:
🔗 **[Gestão Ferramentaria SENAI](https://gestao-ferramentaria-senai.vercel.app/)**

---

<div align="center">
  <p>Desenvolvido com foco em Indústria 4.0 e Educação Tecnológica.</p>
</div>