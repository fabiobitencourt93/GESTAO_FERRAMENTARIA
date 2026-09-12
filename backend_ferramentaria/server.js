const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');


const app = express();
const port = process.env.PORT || 3000;

// Configuração de Middlewares
app.use(cors()); // Se for colocar em produção, restrinja para a URL da Vercel
app.use(express.json());

// Configuração do Banco de Dados (Use o Session Pooler IPv4)
const pool = new Pool({
    // Lembre-se da Dívida Técnica: cadastre a variável DATABASE_URL no Render
    // para não deixar sua senha exposta aqui!
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.qvttpmwhvaokwmefafle:gestaoferramentaria@aws-0-us-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

// ==========================================
// ROTA DE HEALTH CHECK (Para o cron-job.org)
// ==========================================
app.get('/api/ping', (req, res) => {
    res.json({ status: 'Servidor MES acordado e rodando!' });
});

// ==========================================
// ROTA 1: Lista Geral de Projetos e Estampos
// ==========================================
app.get('/api/projetos', async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id AS projeto_id,
                p.nome AS projeto, 
                p.status, /* AQUI ESTÁ A CORREÇÃO: Puxando o status do banco */
                e.nome AS estampo, 
                e.id AS estampo_id
            FROM projetos p
            LEFT JOIN estampos e ON p.id = e.projeto_id
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
app.get('/api/pecas/:id/processos', async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                pr.*, 
                pe.pos AS posicao_peca, 
                pe.nome AS nome_peca,
                (SELECT MIN(data_hora_inicio) FROM apontamentos WHERE processo_id = pr.id AND data_hora_fim IS NULL) as data_hora_inicio
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
// ROTA 6: Relatório de Desempenho
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
                pe.nome AS peca,
                SUM(pr.tempo_planejado_min) AS total_planejado,
                SUM(COALESCE(tr.total_realizado_min, 0)) AS total_realizado
            FROM processos pr
            JOIN pecas pe ON pr.peca_id = pe.id
            JOIN estampos e ON pe.estampo_id = e.id
            JOIN projetos p ON e.projeto_id = p.id
            LEFT JOIN tempo_real tr ON pr.id = tr.processo_id
            GROUP BY p.nome, pe.nome
            ORDER BY p.nome, pe.nome;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na Rota 6:", err.message);
        res.status(500).send('Erro ao buscar relatório');
    }
});

// ==========================================
// ROTA 7: Status Ao Vivo dos Alunos (Chão de Fábrica)
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
                a.data_hora_inicio
            FROM operadores o
            LEFT JOIN apontamentos a ON o.id = a.operador_id AND a.data_hora_fim IS NULL
            LEFT JOIN processos pr ON a.processo_id = pr.id
            LEFT JOIN pecas pe ON pr.peca_id = pe.id
            ORDER BY o.nome ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na Rota Ao Vivo:", err.message);
        res.status(500).send('Erro ao buscar status ao vivo');
    }
});

// ==========================================
// ROTA 8: Buscar Apontamentos Abertos (Esquecidos)
// ==========================================
app.get('/api/apontamentos/abertos', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.processo_id,
                o.id AS id_aluno,
                o.nome AS aluno,
                pr.nome_operacao AS operacao,
                a.data_hora_inicio AS inicio
            FROM apontamentos a
            JOIN operadores o ON a.operador_id = o.id
            JOIN processos pr ON a.processo_id = pr.id
            WHERE a.data_hora_fim IS NULL
            ORDER BY a.data_hora_inicio ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro na Rota de Apontamentos Abertos:", err.message);
        res.status(500).send('Erro ao buscar dados');
    }
});

// ==========================================
// ROTA 9: Listar Operadores (Alunos)
// ==========================================
app.get('/api/operadores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM operadores ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao listar alunos:", err.message);
        res.status(500).send('Erro ao buscar alunos');
    }
});

// ==========================================
// ROTA 10: Cadastrar Novo Operador (Aluno)
// ==========================================
app.post('/api/operadores', async (req, res) => {
    try {
        const { id, nome } = req.body;
        const result = await pool.query(
            'INSERT INTO operadores (id, nome) VALUES ($1, $2) RETURNING *',
            [id, nome]
        );
        res.json(result.rows[0]);
    } catch (err) {
        // Código 23505 é o erro padrão do PostgreSQL para "ID Duplicado"
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Este ID de crachá já está cadastrado no sistema.' });
        }
        console.error("Erro ao cadastrar aluno:", err.message);
        res.status(500).send('Erro interno ao cadastrar aluno');
    }
});

// ==========================================
// ROTA 11: Excluir Operador (Aluno)
// ==========================================
app.delete('/api/operadores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM operadores WHERE id = $1', [id]);
        res.json({ message: 'Aluno removido com sucesso' });
    } catch (err) {
        // Se o aluno tiver apontamentos amarrados a ele, o banco não deixará excluir por segurança (chave estrangeira)
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Não é possível excluir este aluno pois ele possui horas de produção registradas.' });
        }
        console.error("Erro ao excluir aluno:", err.message);
        res.status(500).send('Erro interno ao excluir aluno');
    }
});

// ==========================================
// ROTAS DE ENGENHARIA (CRUD Peças e Processos)
// ==========================================

// Lista todos os projetos para o menu dropdown
app.get('/api/projetos', async (req, res) => {
    try {
        // O * garante que o banco vai devolver todas as colunas disponíveis
        const result = await pool.query('SELECT * FROM projetos');
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar projetos:", err.message);
        res.status(500).send('Erro ao buscar projetos');
    }
});

// AQUI VEM O SEU app.listen...
// app.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });

// Busca todas as peças e empacota os processos dentro delas
app.get('/api/projetos/:id/engenharia', async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Busca as peças do projeto
        const pecas = await pool.query(`
            SELECT pe.id, pe.nome, pe.pos 
            FROM pecas pe
            JOIN estampos e ON pe.estampo_id = e.id
            WHERE e.projeto_id = $1
            ORDER BY pe.pos ASC
        `, [id]);

        // 2. Busca os processos dessas peças e anexa ao JSON
        for (let peca of pecas.rows) {
            const processos = await pool.query(`
                SELECT id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida
                FROM processos
                WHERE peca_id = $1
                ORDER BY ordem_execucao ASC
            `, [peca.id]);
            
            peca.processos = processos.rows;
        }

        res.json(pecas.rows);
    } catch (err) {
        console.error("Erro na Engenharia:", err);
        res.status(500).send('Erro ao buscar engenharia');
    }
});

// Salva a edição de um processo específico
app.put('/api/processos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida } = req.body;
        
        await pool.query(`
            UPDATE processos 
            SET ordem_execucao = $1, nome_operacao = $2, tempo_planejado_min = $3, maquina_sugerida = $4
            WHERE id = $5
        `, [ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida, id]);
        
        res.json({ message: 'Processo atualizado' });
    } catch (err) {
        res.status(500).send('Erro ao atualizar processo');
    }
});

// ==========================================
// ROTA: Criar Nova Peça (Vinculada ao Projeto/Estampo)
// ==========================================
app.post('/api/pecas', async (req, res) => {
    try {
        const { estampo_id, nome, pos } = req.body;
        await pool.query(
            'INSERT INTO pecas (estampo_id, nome, pos) VALUES ($1, $2, $3)',
            [estampo_id, nome, pos]
        );
        res.json({ message: 'Peça cadastrada com sucesso' });
    } catch (err) {
        console.error("Erro ao criar peça:", err.message);
        res.status(500).send('Erro interno ao criar peça');
    }
});

// ==========================================
// ROTA: Criar Novo Processo (Vinculado à Peça)
// ==========================================
app.post('/api/processos', async (req, res) => {
    try {
        const { peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida } = req.body;
        await pool.query(
            'INSERT INTO processos (peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida) VALUES ($1, $2, $3, $4, $5)',
            [peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida]
        );
        res.json({ message: 'Processo cadastrado com sucesso' });
    } catch (err) {
        console.error("Erro ao criar processo:", err.message);
        res.status(500).send('Erro interno ao criar processo');
    }
});

// ==========================================
// ROTA: Excluir Peça
// ==========================================
app.delete('/api/pecas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM pecas WHERE id = $1', [id]);
        res.json({ message: 'Peça removida com sucesso' });
    } catch (err) {
        // Erro 23503: Violação de chave estrangeira (a peça já tem processos atrelados)
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Não é possível excluir esta peça pois ela já possui processos ou apontamentos.' });
        }
        res.status(500).send('Erro interno ao excluir peça');
    }
});

// ==========================================
// ROTA: Excluir Processo (Operação)
// ==========================================
app.delete('/api/processos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM processos WHERE id = $1', [id]);
        res.json({ message: 'Processo removido com sucesso' });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Não é possível excluir este processo pois ele já possui apontamentos de produção abertos.' });
        }
        res.status(500).send('Erro interno ao excluir processo');
    }
});

// ==========================================
// ROTA: Encerrar Apontamento e Marcar 100% Concluído
// ==========================================
app.put('/api/apontamentos/finalizar-100', async (req, res) => {
    const { processo_id, operador_id } = req.body;
    try {
        // 1. Para o cronômetro do aluno
        await pool.query(`
            UPDATE apontamentos 
            SET data_hora_fim = CURRENT_TIMESTAMP 
            WHERE processo_id = $1 AND operador_id = $2 AND data_hora_fim IS NULL
        `, [processo_id, operador_id]);

        // 2. Marca a operação como 100% no roteiro
        await pool.query(`
            UPDATE processos 
            SET status = 'Concluído' 
            WHERE id = $1
        `, [processo_id]);

        res.json({ message: 'Operação marcada como 100%!' });
    } catch (error) {
        console.error("Erro ao concluir 100%:", error);
        res.status(500).send('Erro interno ao concluir.');
    }
});

// ==========================================
// ROTA: Lançamento Manual (Retroativo com Data e Hora exatas)
// ==========================================
app.post('/api/apontamentos/manual', async (req, res) => {
    const { processo_id, operador_id, data_hora_inicio, data_hora_fim } = req.body;
    
    try {
        await pool.query(`
            INSERT INTO apontamentos (processo_id, operador_id, data_hora_inicio, data_hora_fim)
            VALUES ($1, $2, $3, $4)
        `, [processo_id, operador_id, data_hora_inicio, data_hora_fim]);

        res.json({ message: 'Apontamento retroativo salvo com sucesso!' });
    } catch (error) {
        console.error("Erro no apontamento manual:", error);
        res.status(500).send('Erro interno ao salvar apontamento manual.');
    }
});

// ==========================================
// TAREFA AUTOMÁTICA: Fechamento de Turno (16h00)
// ==========================================
// Os asteriscos significam: '0' (Minuto zero), '16' (Hora 16), e os outros (*) significam todos os dias e meses.
cron.schedule('0 16 * * *', async () => {
    console.log('⏰ Executando fechamento automático de turno (16h00)...');
    try {
        // Atualiza todos os apontamentos que estão em aberto (NULL)
        const result = await pool.query(`
            UPDATE apontamentos 
            SET data_hora_fim = CURRENT_TIMESTAMP 
            WHERE data_hora_fim IS NULL
        `);
        console.log(`✅ Fechamento automático concluído. ${result.rowCount} operações abertas foram encerradas.`);
    } catch (error) {
        console.error('❌ Erro no fechamento automático:', error);
    }
}, {
    scheduled: true,
    timezone: "America/Sao_Paulo" // Garante que será às 16h no fuso horário de Sorocaba/SP
});

// ==========================================
// ROTA: Cadastrar novo Projeto e Estampo 
// ==========================================
app.post('/api/projetos', async (req, res) => {
    try {
        // Agora recebemos a variável 'tipo' enviada pelo React
        const { nome, data_inicio, data_fim, tipo } = req.body; 
        
        if (!nome) return res.status(400).json({ error: 'O nome é obrigatório.' });
        if (!data_inicio) return res.status(400).json({ error: 'A data de início é obrigatória.' });
        if (!tipo) return res.status(400).json({ error: 'O tipo do estampo é obrigatório.' });

        const resultProjeto = await pool.query(
            'INSERT INTO projetos (nome, data_inicio, data_fim) VALUES ($1, $2, $3) RETURNING *', 
            [nome, data_inicio, data_fim || null]
        );
        
        const projetoCriado = resultProjeto.rows[0];

        // Gravamos a variável 'tipo' diretamente no banco
        const resultEstampo = await pool.query(
            'INSERT INTO estampos (nome, projeto_id, tipo) VALUES ($1, $2, $3) RETURNING *',
            [projetoCriado.nome, projetoCriado.id, tipo]
        );

        res.json({ projeto: projetoCriado, estampo: resultEstampo.rows[0] });

    } catch (err) {
        console.error("Erro SQL:", err.message);
        res.status(500).json({ erroBanco: err.message });
    }
});

// ==========================================
// ROTA: Concluir Projeto (Atualizar Status)
// ==========================================
app.put('/api/projetos/:id/concluir', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "UPDATE projetos SET status = 'Concluído', data_fim = CURRENT_DATE WHERE id = $1", 
            [id]
        );
        res.json({ message: "Projeto concluído com sucesso" });
    } catch (err) {
        res.status(500).json({ erroBanco: err.message });
    }
});

// ==========================================
// ROTA: Apagar Projeto (Deletar)
// ==========================================
app.delete('/api/projetos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Apaga a ferramenta primeiro (filho) para não dar erro de restrição, depois o projeto (pai)
        await pool.query('DELETE FROM estampos WHERE projeto_id = $1', [id]);
        await pool.query('DELETE FROM projetos WHERE id = $1', [id]);
        
        res.json({ message: "Projeto excluído com sucesso" });
    } catch (err) {
        res.status(500).json({ erroBanco: err.message });
    }
});

// ==========================================
// ROTA: Buscar Alertas (Apontamentos Abertos)
// ==========================================
app.get('/api/alertas', async (req, res) => {
    try {
        // Ajuste 'apontamentos' e 'hora_fim' para os nomes exatos que você usa no seu banco
        const query = `
            SELECT id, operacao 
            FROM apontamentos 
            WHERE hora_fim IS NULL; 
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar alertas:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Inicialização do Servidor
// ==========================================
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
