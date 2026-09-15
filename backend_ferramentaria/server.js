const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ==========================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Variável de ambiente configurada no Render
    ssl: { rejectUnauthorized: false }
});

// ==========================================
// 1. ROTAS DE AUTENTICAÇÃO
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { senha } = req.body;
    // Senha padrão do sistema (pode ser alterada via .env futuramente)
    const senhaCorreta = process.env.SENHA_SISTEMA || 'senai123'; 
    if (senha === senhaCorreta) {
        res.json({ message: 'Autenticado com sucesso' });
    } else {
        res.status(401).json({ error: 'Senha incorreta' });
    }
});

// ==========================================
// 2. ROTAS DE ALUNOS (OPERADORES)
// ==========================================
app.get('/api/operadores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM operadores ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/operadores', async (req, res) => {
    try {
        const { id, nome } = req.body;
        await pool.query('INSERT INTO operadores (id, nome) VALUES ($1, $2)', [id, nome]);
        res.status(201).json({ message: "Aluno cadastrado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/operadores/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM operadores WHERE id = $1', [req.params.id]);
        res.json({ message: "Aluno excluído com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: "Este crachá já possui apontamentos registrados." });
    }
});

// ==========================================
// 3. ROTAS DE PROJETOS E ESTAMPOS
// ==========================================
app.get('/api/projetos', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id AS projeto_id,
                p.nome AS projeto, 
                p.status,
                TO_CHAR(p.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                TO_CHAR(p.data_fim, 'DD/MM/YYYY') AS data_fim,
                TO_CHAR(p.data_conclusao, 'DD/MM/YYYY') AS data_conclusao,
                e.nome AS estampo, 
                e.id AS estampo_id,
                e.tipo AS tipo
            FROM projetos p
            LEFT JOIN estampos e ON p.id = e.projeto_id
            ORDER BY p.id DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projetos', async (req, res) => {
    try {
        const { nome, tipo, data_inicio, data_fim } = req.body;
        
        // Insere o projeto e captura o ID gerado
        const resultProj = await pool.query(
            `INSERT INTO projetos (nome, data_inicio, data_fim, status) 
             VALUES ($1, $2, $3, 'Em Planejamento') RETURNING id`,
            [nome, data_inicio || null, data_fim || null]
        );
        const novoProjetoId = resultProj.rows[0].id;

        // Insere automaticamente o Estampo atrelado ao projeto (Evita Erro 500 nas peças!)
        await pool.query(
            `INSERT INTO estampos (projeto_id, nome, tipo) VALUES ($1, $2, $3)`,
            [novoProjetoId, nome, tipo || 'Outro']
        );

        res.status(201).json({ message: "Projeto criado com sucesso!" });
    } catch (err) {
        console.error("Erro ao criar projeto:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projetos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo, data_inicio, data_fim } = req.body;

        await pool.query(
            `UPDATE projetos SET nome = $1, data_inicio = NULLIF($2, ''), data_fim = NULLIF($3, '') WHERE id = $4`,
            [nome, data_inicio, data_fim, id]
        );

        await pool.query(
            `UPDATE estampos SET nome = $1, tipo = $2 WHERE projeto_id = $3`,
            [nome, tipo, id]
        );

        res.json({ message: "Projeto atualizado!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/projetos/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, data_conclusao } = req.body;
        await pool.query(
            `UPDATE projetos SET status = $1, data_conclusao = $2 WHERE id = $3`,
            [status, data_conclusao ? new Date() : null, id]
        );
        res.json({ message: "Status alterado!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/projetos/:id', async (req, res) => {
    try {
        // Como o BD é relacional, ao apagar o projeto com CASCADE, ele apaga estampos, peças e processos juntos
        await pool.query('DELETE FROM projetos WHERE id = $1', [req.params.id]);
        res.json({ message: "Projeto excluído!" });
    } catch (err) {
        res.status(500).json({ error: "Este projeto possui apontamentos registrados." });
    }
});

// ==========================================
// 4. ROTAS DE ENGENHARIA (PEÇAS E PROCESSOS)
// ==========================================
app.get('/api/projetos/:id/engenharia', async (req, res) => {
    try {
        const { id } = req.params;
        // Agrupa os processos dentro das peças em formato JSON para o Front-end ler fácil
        const query = `
            SELECT p.*,
                   COALESCE(
                     json_agg(pr.* ORDER BY pr.ordem_execucao) FILTER (WHERE pr.id IS NOT NULL), '[]'
                   ) AS processos
            FROM pecas p
            LEFT JOIN processos pr ON p.id = pr.peca_id
            WHERE p.estampo_id = $1 OR p.projeto_id = $1
            GROUP BY p.id
            ORDER BY p.pos ASC;
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pecas', async (req, res) => {
    try {
        const { estampo_id, projeto_id, pos, nome } = req.body;
        // Blindagem: aceita tanto projeto_id quanto estampo_id
        const idVinculo = estampo_id || projeto_id;

        const result = await pool.query(
            // Se o BD der erro aqui de "column does not exist", altere 'estampo_id' para 'projeto_id' na linha abaixo
            `INSERT INTO pecas (estampo_id, pos, nome) VALUES ($1, $2, $3) RETURNING *`,
            [idVinculo, pos, nome]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("ERRO AO CRIAR PEÇA:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/pecas/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM pecas WHERE id = $1', [req.params.id]);
        res.json({ message: "Peça excluída!" });
    } catch (err) {
        res.status(500).json({ error: "Esta peça já possui apontamentos." });
    }
});

app.post('/api/processos', async (req, res) => {
    try {
        const { peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida } = req.body;
        await pool.query(
            `INSERT INTO processos (peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida) 
             VALUES ($1, $2, $3, $4, $5)`,
            [peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida]
        );
        res.status(201).json({ message: "Processo criado!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/processos/:id', async (req, res) => {
    try {
        const { ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida } = req.body;
        await pool.query(
            `UPDATE processos SET ordem_execucao = $1, nome_operacao = $2, tempo_planejado_min = $3, maquina_sugerida = $4 WHERE id = $5`,
            [ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida, req.params.id]
        );
        res.json({ message: "Processo atualizado!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/processos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM processos WHERE id = $1', [req.params.id]);
        res.json({ message: "Processo excluído!" });
    } catch (err) {
        res.status(500).json({ error: "Este processo já possui apontamentos de alunos." });
    }
});

// ==========================================
// 5. ROTAS DE APONTAMENTO (CHÃO DE FÁBRICA / 5S)
// ==========================================
app.post('/api/apontamentos/iniciar', async (req, res) => {
    try {
        const { processo_id, operador_id } = req.body;
        
        // Verifica se o aluno já tem uma máquina rodando
        const emAberto = await pool.query(
            'SELECT id FROM apontamentos WHERE operador_id = $1 AND data_hora_fim IS NULL',
            [operador_id]
        );
        if (emAberto.rows.length > 0) {
            return res.status(400).json({ error: 'Você já possui uma operação em andamento.' });
        }

        await pool.query(
            'INSERT INTO apontamentos (processo_id, operador_id, data_hora_inicio) VALUES ($1, $2, CURRENT_TIMESTAMP)',
            [processo_id, operador_id]
        );
        res.status(201).json({ message: 'Apontamento iniciado!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/apontamentos/finalizar', async (req, res) => {
    try {
        const { processo_id, operador_id, ocorrencia } = req.body;
        await pool.query(
            `UPDATE apontamentos 
             SET data_hora_fim = CURRENT_TIMESTAMP, ocorrencia = $1 
             WHERE processo_id = $2 AND operador_id = $3 AND data_hora_fim IS NULL`,
            [ocorrencia || null, processo_id, operador_id]
        );
        res.json({ message: 'Apontamento finalizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 6. ROTAS DE RELATÓRIOS E DASHBOARD
// ==========================================
app.get('/api/relatorios/ao-vivo', async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id AS operador_id,
                o.nome AS operador_nome,
                pr.nome_operacao,
                pr.maquina_sugerida,
                pe.nome AS nome_peca,
                a.data_hora_inicio,
                (SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(data_hora_fim))) / 60 
                 FROM apontamentos 
                 WHERE operador_id = o.id AND data_hora_fim IS NOT NULL) AS ocioso_minutos
            FROM operadores o
            LEFT JOIN apontamentos a ON o.id = a.operador_id AND a.data_hora_fim IS NULL
            LEFT JOIN processos pr ON a.processo_id = pr.id
            LEFT JOIN pecas pe ON pr.peca_id = pe.id
            ORDER BY o.nome ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/relatorios/processos', async (req, res) => {
    try {
        const query = `
            SELECT 
                proj.nome AS projeto,
                pe.nome AS peca,
                pr.nome_operacao AS processo,
                pr.maquina_sugerida AS maquina,
                pr.tempo_planejado_min AS planejado,
                COALESCE(SUM(EXTRACT(EPOCH FROM (a.data_hora_fim - a.data_hora_inicio))/60), 0) AS realizado
            FROM processos pr
            JOIN pecas pe ON pr.peca_id = pe.id
            JOIN estampos e ON pe.estampo_id = e.id
            JOIN projetos proj ON e.projeto_id = proj.id
            LEFT JOIN apontamentos a ON pr.id = a.processo_id
            GROUP BY proj.nome, pe.nome, pr.nome_operacao, pr.maquina_sugerida, pr.tempo_planejado_min;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/ocorrencias', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id,
                a.ocorrencia,
                TO_CHAR(a.data_hora_fim, 'DD/MM/YYYY HH24:MI') as data_registro,
                pr.nome_operacao as operacao,
                pe.nome as peca,
                proj.nome as projeto,
                o.nome as operador
            FROM apontamentos a
            JOIN processos pr ON a.processo_id = pr.id
            JOIN pecas pe ON pr.peca_id = pe.id
            JOIN estampos e ON pe.estampo_id = e.id
            JOIN projetos proj ON e.projeto_id = proj.id
            JOIN operadores o ON a.operador_id = o.id
            WHERE a.ocorrencia IS NOT NULL AND a.ocorrencia != ''
            ORDER BY a.data_hora_fim DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    //console.log(`Servidor MES rodando na porta ${PORT}`);
});

// ==========================================
// ROTA DE EMERGÊNCIA: ATUALIZAR BANCO DE DADOS
// ==========================================
app.get('/api/atualizar-banco', async (req, res) => {
    try {
        await pool.query('ALTER TABLE estampos ADD COLUMN IF NOT EXISTS tipo VARCHAR(100);');
        await pool.query('ALTER TABLE projetos ADD COLUMN IF NOT EXISTS data_conclusao DATE;');
        await pool.query('ALTER TABLE apontamentos ADD COLUMN IF NOT EXISTS ocorrencia TEXT;');
        res.send("<h1>Sucesso!</h1><p>As colunas 'tipo', 'data_conclusao' e 'ocorrencia' foram verificadas/criadas no banco de dados.</p><p>Pode voltar para o seu sistema que ele já vai carregar!</p>");
    } catch (err) {
        res.status(500).send("Erro ao atualizar banco: " + err.message);
    }
});