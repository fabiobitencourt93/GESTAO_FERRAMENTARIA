const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configuração de Middlewares
app.use(cors()); // Se for colocar em produção, restrinja para a URL da Vercel
app.use(express.json());

// Configuração do Banco de Dados (Use o Session Pooler IPv4)
const pool = new Pool({
    // Lembre-se da Dívida Técnica: cadastre a variável DATABASE_URL no Render
    // para não deixar sua senha exposta aqui!
    connectionString: process.env.DATABASE_URL || 'SUA_STRING_DO_SESSION_POOLER_AQUI',
    ssl: { rejectUnauthorized: false }
});

// ==========================================
// ROTA 1: Lista Geral de Projetos e Estampos
// ==========================================
app.get('/api/projetos', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.nome AS projeto, 
                e.nome AS estampo, 
                e.id AS estampo_id
            FROM projetos p
            JOIN estampos e ON p.id = e.projeto_id
            ORDER BY p.id;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na Rota 1:", err.message);
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 2: Lista as Peças de um Estampo Específico
// ==========================================
app.get('/api/estampos/:id/pecas', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM pecas WHERE estampo_id = $1 ORDER BY pos ASC',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na Rota 2:", err.message);
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 3: Roteiro de Fabricação (Processos da Peça com JOIN)
// ==========================================
app.get('/api/pecas/:id/processos', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                pr.*, 
                pe.pos AS posicao_peca, 
                pe.nome AS nome_peca
            FROM processos pr
            JOIN pecas pe ON pr.peca_id = pe.id
            WHERE pr.peca_id = $1 
            ORDER BY pr.ordem_execucao ASC
        `;
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na Rota 3:", err.message);
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 4: Iniciar Apontamento (Play)
// ==========================================
app.post('/api/apontamentos/iniciar', async (req, res) => {
    try {
        const { processo_id, operador_id } = req.body;
        const query = `
            INSERT INTO apontamentos (processo_id, operador_id, data_hora_inicio)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        const result = await pool.query(query, [processo_id, operador_id]);
        res.json({ message: 'Operação iniciada', apontamento: result.rows[0] });
    } catch (err) {
        console.error("Erro na Rota 4:", err.message);
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 5: Finalizar Apontamento (Stop - Amarrado ao ID do Aluno)
// ==========================================
app.put('/api/apontamentos/finalizar', async (req, res) => {
    try {
        const { processo_id, operador_id } = req.body;
        const result = await pool.query(`
            UPDATE apontamentos 
            SET data_hora_fim = CURRENT_TIMESTAMP 
            WHERE processo_id = $1 
              AND operador_id = $2 
              AND data_hora_fim IS NULL 
            RETURNING *
        `, [processo_id, operador_id]);

        if (result.rowCount === 0) {
            return res.status(403).json({ error: 'Operação não encontrada, já finalizada ou ID do aluno incorreto.' });
        }

        res.json({ message: 'Operação finalizada com sucesso!', apontamento: result.rows[0] });
    } catch (err) {
        console.error("Erro na Rota 5:", err.message);
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 6: Relatório de Desempenho (Dashboards/Visitantes)
// ==========================================
app.get('/api/relatorios/desempenho', async (req, res) => {
    try {
        const query = `
            WITH tempo_real AS (
                SELECT 
                    processo_id,
                    SUM(EXTRACT(EPOCH FROM (data_hora_fim - data_hora_inicio)) / 60.0) AS total_realizado_min
                FROM apontamentos
                WHERE data_hora_fim IS NOT NULL
                GROUP BY processo_id
            )
            SELECT 
                p.nome AS projeto,
                SUM(pr.tempo_planejado_min) AS total_planejado,
                SUM(COALESCE(tr.total_realizado_min, 0)) AS total_realizado
            FROM processos pr
            JOIN pecas pe ON pr.peca_id = pe.id
            JOIN estampos e ON pe.estampo_id = e.id
            JOIN projetos p ON e.projeto_id = p.id
            LEFT JOIN tempo_real tr ON pr.id = tr.processo_id
            GROUP BY p.nome
            ORDER BY p.nome;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na Rota 6:", err.message);
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// Inicialização do Servidor
// ==========================================
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});