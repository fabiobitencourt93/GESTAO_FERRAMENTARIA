const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração de conexão segura com o Supabase via Variáveis de Ambiente
const pool = new Pool({
    connectionString: 'postgresql://postgres.qvttpmwhvaokwmefafle:gestaoferramentaria@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
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
        console.error(err);
        res.status(500).json({ 
            error: err.message || "Erro desconhecido", 
            detalheCompleto: JSON.stringify(err, Object.getOwnPropertyNames(err)) 
        });
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

// ==========================================
// ROTA 5: Relatório de Desempenho (Visitantes/Dashboards)
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
        console.error(err.message);
        res.status(500).send('Erro ao gerar relatório de desempenho');
    }
});

app.put('/api/apontamentos/finalizar', async (req, res) => {
    try {
        const { processo_id } = req.body;
        
        // Atualiza o registro em aberto inserindo o horário atual
        const result = await pool.query(`
            UPDATE apontamentos 
            SET data_hora_fim = CURRENT_TIMESTAMP 
            WHERE processo_id = $1 AND data_hora_fim IS NULL 
            RETURNING *
        `, [processo_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Nenhuma operação em andamento encontrada para este processo.' });
        }

        res.json({ message: 'Operação finalizada com sucesso!', apontamento: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro ao finalizar apontamento');
    }
});