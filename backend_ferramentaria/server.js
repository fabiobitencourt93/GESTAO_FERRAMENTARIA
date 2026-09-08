const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração de conexão segura com o Supabase via Variáveis de Ambiente
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    family: 4 // Força o uso de IPv4, evitando o erro de rede ENETUNREACH no Render
});

// ==========================================
// ROTA 1: Lista os Projetos (Para a Tela 1)
// ==========================================
app.get('/api/projetos', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id as projeto_id, p.nome as projeto, 
                e.id as estampo_id, e.nome as estampo, 
                e.tipo, TO_CHAR(p.data_inicio, 'DD/MM/YYYY') as data_inicio, p.status 
            FROM projetos p
            JOIN estampos e ON p.id = e.projeto_id
            ORDER BY p.id, e.id;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({error:err.message});
    }
});

// ==========================================
// ROTA 2: Lista as Peças de um Estampo (Para a Tela 2)
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
        console.error(err.message);
        res.status(500).send('Erro ao buscar as peças do estampo');
    }
});

// ==========================================
// ROTA 3: Lista os Processos de uma Peça
// ==========================================
app.get('/api/pecas/:id/processos', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM processos WHERE peca_id = $1 ORDER BY ordem_execucao ASC',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro ao buscar processos');
    }
});

// ==========================================
// ROTA 4: Iniciar Apontamento (Terminal do Operador)
// ==========================================
app.post('/api/apontamentos/iniciar', async (req, res) => {
    try {
        const { processo_id, operador_id } = req.body;
        
        const result = await pool.query(
            `INSERT INTO apontamentos (processo_id, operador_id, data_hora_inicio) 
             VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *`,
            [processo_id, operador_id]
        );
        
        res.json({ sucesso: true, apontamento: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro ao iniciar a operação. Verifique se o ID do Operador existe.');
    }
});

// Inicia o Servidor
app.listen(3000, () => {
    console.log('✅ Servidor Back-end rodando na porta 3000');
});