const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.qvttpmwhvaokwmefafle:gestaoferramentaria@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

// ==========================================
// FUNÇÃO INTELIGENTE: Pega a turma ativa
// ==========================================
const getTurmaAtiva = async () => {
    const res = await pool.query('SELECT id FROM turmas WHERE ativa = true LIMIT 1');
    return res.rows.length > 0 ? res.rows[0].id : 1;
};

// ==========================================
// ROTAS DE TURMAS / SEMESTRES (NOVO)
// ==========================================
app.get('/api/turmas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM turmas ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/turmas', async (req, res) => {
    try {
        const { nome } = req.body;
        // Ao criar uma turma nova, desativa as antigas e ativa a nova
        await pool.query('UPDATE turmas SET ativa = false');
        const result = await pool.query('INSERT INTO turmas (nome, ativa) VALUES ($1, true) RETURNING *', [nome]);
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/turmas/:id/ativar', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE turmas SET ativa = false');
        await pool.query('UPDATE turmas SET ativa = true WHERE id = $1', [id]);
        res.json({ message: "Turma ativada com sucesso!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ROTA 1: Lista Geral de Projetos (FILTRADO POR TURMA)
// ==========================================
app.get('/api/projetos', async (req, res) => {
    try {
        const turma_id = req.query.turma_id || await getTurmaAtiva();
        const query = `
            SELECT 
                p.id AS projeto_id, p.nome AS projeto, p.status,
                TO_CHAR(p.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                TO_CHAR(p.data_fim, 'DD/MM/YYYY') AS data_fim,
                TO_CHAR(p.data_conclusao, 'DD/MM/YYYY') AS data_conclusao,
                e.nome AS estampo, e.id AS estampo_id, e.tipo AS tipo
            FROM projetos p
            LEFT JOIN estampos e ON p.id = e.projeto_id
            WHERE p.turma_id = $1
            ORDER BY p.id DESC;
        `;
        const result = await pool.query(query, [turma_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ROTA: Cadastrar novo Projeto e Estampo (COM TURMA)
// ==========================================
app.post('/api/projetos', async (req, res) => {
    try {
        const { nome, data_inicio, data_fim, tipo, turma_id } = req.body; 
        const idTurmaFinal = turma_id || await getTurmaAtiva();

        if (!nome || !data_inicio || !tipo) return res.status(400).json({ error: 'Dados obrigatórios faltando.' });

        const resultProjeto = await pool.query(
            'INSERT INTO projetos (nome, data_inicio, data_fim, turma_id) VALUES ($1, $2, $3, $4) RETURNING *', 
            [nome, data_inicio, data_fim || null, idTurmaFinal]
        );
        
        const projetoCriado = resultProjeto.rows[0];

        const resultEstampo = await pool.query(
            'INSERT INTO estampos (nome, projeto_id, tipo) VALUES ($1, $2, $3) RETURNING *',
            [projetoCriado.nome, projetoCriado.id, tipo]
        );

        res.json({ projeto: projetoCriado, estampo: resultEstampo.rows[0] });
    } catch (err) { res.status(500).json({ erroBanco: err.message }); }
});

app.put('/api/projetos/:id/concluir', async (req, res) => {
    try {
        await pool.query("UPDATE projetos SET status = 'Concluído', data_conclusao = CURRENT_DATE WHERE id = $1", [req.params.id]);
        res.json({ message: "Projeto concluído com sucesso" });
    } catch (err) { res.status(500).json({ erroBanco: err.message }); }
});

app.put('/api/projetos/:id/reabrir', async (req, res) => {
    try {
        await pool.query("UPDATE projetos SET status = 'Em Execução', data_conclusao = NULL WHERE id = $1", [req.params.id]);
        res.json({ message: "Projeto reaberto" });
    } catch (err) { res.status(500).json({ erroBanco: err.message }); }
});

app.delete('/api/projetos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM estampos WHERE projeto_id = $1', [req.params.id]);
        await pool.query('DELETE FROM projetos WHERE id = $1', [req.params.id]);
        res.json({ message: "Projeto excluído" });
    } catch (err) { res.status(500).json({ erroBanco: err.message }); }
});

app.get('/api/estampos/:id/pecas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pecas WHERE estampo_id = $1 ORDER BY pos ASC', [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/pecas/:id/processos', async (req, res) => {
    try {
        const query = `
            SELECT pr.*, pe.pos AS posicao_peca, pe.nome AS nome_peca,
            (SELECT MIN(data_hora_inicio) FROM apontamentos WHERE processo_id = pr.id AND data_hora_fim IS NULL) as data_hora_inicio
            FROM processos pr JOIN pecas pe ON pr.peca_id = pe.id
            WHERE pr.peca_id = $1 ORDER BY pr.ordem_execucao ASC
        `;
        const result = await pool.query(query, [req.params.id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/apontamentos/iniciar', async (req, res) => {
    try {
        const result = await pool.query('INSERT INTO apontamentos (processo_id, operador_id, data_hora_inicio) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *', [req.body.processo_id, req.body.operador_id]);
        res.json({ message: 'Operação iniciada', apontamento: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/apontamentos/finalizar', async (req, res) => {
    try {
        const result = await pool.query(`UPDATE apontamentos SET data_hora_fim = CURRENT_TIMESTAMP, ocorrencia = $3 WHERE processo_id = $1 AND operador_id = $2 AND data_hora_fim IS NULL RETURNING *`, [req.body.processo_id, req.body.operador_id, req.body.ocorrencia || null]); 
        if (result.rowCount === 0) return res.status(403).json({ error: 'Operação não encontrada.' });
        res.json({ message: 'Operação finalizada!', apontamento: result.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ROTA: Encerrar Apontamento 100% (COM AUTO-APONTAMENTO E XP)
// ==========================================
app.put('/api/apontamentos/finalizar-100', async (req, res) => {
    const { processo_id, operador_id, ocorrencia } = req.body;
    try {
        // Descobre qual era o tempo planejado da operação (será usado para o XP e para o Auto-apontamento)
        const procQuery = await pool.query('SELECT tempo_planejado_min FROM processos WHERE id = $1', [processo_id]);
        const tempoPlanejado = procQuery.rows[0]?.tempo_planejado_min || 1;

        // 1. Tenta parar o cronômetro caso o aluno tenha dado o Play antes
        const result = await pool.query(`
            UPDATE apontamentos 
            SET data_hora_fim = CURRENT_TIMESTAMP, ocorrencia = $3
            WHERE processo_id = $1 AND operador_id = $2 AND data_hora_fim IS NULL
            RETURNING id
        `, [processo_id, operador_id, ocorrencia || null]);

        // 2. SE O ALUNO CLICOU DIRETO EM 100% (Esqueceu de dar o Play)
        if (result.rowCount === 0) {
            // Cria um apontamento retroativo instantâneo com o tempo perfeito!
            await pool.query(`
                INSERT INTO apontamentos (processo_id, operador_id, data_hora_inicio, data_hora_fim, ocorrencia)
                VALUES ($1, $2, CURRENT_TIMESTAMP - (CAST($3 AS NUMERIC) * INTERVAL '1 minute'), CURRENT_TIMESTAMP, $4)
            `, [processo_id, operador_id, tempoPlanejado, ocorrencia || null]);
        }

        // 3. Marca a operação como Concluída no roteiro
        await pool.query(`UPDATE processos SET status = 'Concluído' WHERE id = $1`, [processo_id]);

        // ==========================================
        // 4. GAMIFICAÇÃO: INJEÇÃO DE XP NO ALUNO
        // ==========================================
        const xpGanho = tempoPlanejado * 5; // Regra: 5 XP por cada minuto trabalhado/planejado
        
        await pool.query(`
            UPDATE operadores 
            SET xp_acumulado = COALESCE(xp_acumulado, 0) + $1 
            WHERE id = $2
        `, [xpGanho, operador_id]);

        res.json({ message: `Operação 100% concluída! Aluno ganhou ${xpGanho} XP!` });
    } catch (error) {
        console.error("Erro no 100%:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/apontamentos/manual', async (req, res) => {
    try {
        await pool.query(`INSERT INTO apontamentos (processo_id, operador_id, data_hora_inicio, data_hora_fim) VALUES ($1, $2, $3, $4)`, [req.body.processo_id, req.body.operador_id, req.body.data_hora_inicio, req.body.data_hora_fim]);
        res.json({ message: 'Apontamento retroativo salvo!' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/apontamentos/:id/ocorrencia', async (req, res) => {
    try {
        await pool.query("UPDATE apontamentos SET ocorrencia = $1 WHERE id = $2", [req.body.ocorrencia, req.params.id]);
        res.json({ message: "Ocorrência registrada com sucesso!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// RELATÓRIOS (FILTRADOS POR TURMA DOS PROJETOS)
// ==========================================
app.get('/api/relatorios/desempenho', async (req, res) => {
    try {
        const turma_id = req.query.turma_id || await getTurmaAtiva();
        const query = `
            WITH tempo_real AS (
                SELECT processo_id, SUM(EXTRACT(EPOCH FROM (data_hora_fim - data_hora_inicio)) / 60.0) AS total_realizado_min
                FROM apontamentos WHERE data_hora_fim IS NOT NULL GROUP BY processo_id
            )
            SELECT p.nome AS projeto, pe.nome AS peca, SUM(pr.tempo_planejado_min) AS total_planejado, SUM(COALESCE(tr.total_realizado_min, 0)) AS total_realizado
            FROM processos pr JOIN pecas pe ON pr.peca_id = pe.id JOIN estampos e ON pe.estampo_id = e.id JOIN projetos p ON e.projeto_id = p.id LEFT JOIN tempo_real tr ON pr.id = tr.processo_id
            WHERE p.turma_id = $1 GROUP BY p.nome, pe.nome ORDER BY p.nome, pe.nome;
        `;
        const result = await pool.query(query, [turma_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/relatorios/processos', async (req, res) => {
    try {
        const turma_id = req.query.turma_id || await getTurmaAtiva();
        const query = `
            SELECT proj.nome AS projeto, pec.nome AS peca, pr.nome_operacao AS processo, pr.maquina_sugerida AS maquina, pr.tempo_planejado_min AS planejado, COALESCE(SUM(EXTRACT(EPOCH FROM (a.data_hora_fim - a.data_hora_inicio))/60), 0) AS realizado
            FROM processos pr JOIN pecas pec ON pr.peca_id = pec.id JOIN estampos est ON pec.estampo_id = est.id JOIN projetos proj ON est.projeto_id = proj.id LEFT JOIN apontamentos a ON a.processo_id = pr.id
            WHERE proj.turma_id = $1 GROUP BY proj.nome, pec.nome, pr.nome_operacao, pr.maquina_sugerida, pr.tempo_planejado_min, pr.ordem_execucao ORDER BY proj.nome, pec.nome, pr.ordem_execucao;
        `;
        const result = await pool.query(query, [turma_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ocorrencias', async (req, res) => {
    try {
        const turma_id = req.query.turma_id || await getTurmaAtiva();
        const query = `
            SELECT a.id, a.ocorrencia, TO_CHAR(a.data_hora_fim, 'DD/MM/YYYY HH24:MI') AS data_registro, o.nome AS operador, pr.nome_operacao AS operacao, pec.nome AS peca, proj.nome AS projeto
            FROM apontamentos a LEFT JOIN operadores o ON a.operador_id = o.id JOIN processos pr ON a.processo_id = pr.id JOIN pecas pec ON pr.peca_id = pec.id JOIN estampos est ON pec.estampo_id = est.id JOIN projetos proj ON est.projeto_id = proj.id
            WHERE a.ocorrencia IS NOT NULL AND TRIM(a.ocorrencia) <> '' AND proj.turma_id = $1 ORDER BY a.data_hora_fim DESC;
        `;
        const result = await pool.query(query, [turma_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ROTA 8: Status Ao Vivo dos Alunos (AGORA ORDENADO POR XP!)
// ==========================================
app.get('/api/relatorios/ao-vivo', async (req, res) => {
    try {
        const turma_id = req.query.turma_id || await getTurmaAtiva();
        const query = `
            SELECT 
                o.id AS operador_id, 
                o.nome AS operador_nome, 
                COALESCE(o.xp_acumulado, 0) AS xp_acumulado,
                FLOOR(COALESCE(o.xp_acumulado, 0) / 100) + 1 AS nivel,
                pr.nome_operacao, 
                pr.maquina_sugerida, 
                pe.nome AS nome_peca, 
                a.data_hora_inicio,
                a.processo_id, 
                (SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(data_hora_fim))) / 60 
                 FROM apontamentos 
                 WHERE operador_id = o.id AND data_hora_fim IS NOT NULL) AS ocioso_minutos
            FROM operadores o 
            LEFT JOIN apontamentos a ON o.id = a.operador_id AND a.data_hora_fim IS NULL 
            LEFT JOIN processos pr ON a.processo_id = pr.id 
            LEFT JOIN pecas pe ON pr.peca_id = pe.id
            WHERE o.turma_id = $1 
            ORDER BY COALESCE(o.xp_acumulado, 0) DESC, o.nome ASC;
        `;
        const result = await pool.query(query, [turma_id]);
        res.json(result.rows);
    } catch (err) { 
        console.error("Erro na Rota Ao Vivo:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// ==========================================
// ALUNOS (FILTRADO POR TURMA)
// ==========================================
app.get('/api/operadores', async (req, res) => {
    try {
        const turma_id = req.query.turma_id || await getTurmaAtiva();
        const result = await pool.query('SELECT * FROM operadores WHERE turma_id = $1 ORDER BY nome ASC', [turma_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/operadores', async (req, res) => {
    try {
        const { id, nome, turma_id } = req.body;
        const idTurmaFinal = turma_id || await getTurmaAtiva();
        const result = await pool.query('INSERT INTO operadores (id, nome, turma_id) VALUES ($1, $2, $3) RETURNING *', [id, nome, idTurmaFinal]);
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Este crachá já está cadastrado.' });
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/operadores/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM operadores WHERE id = $1', [req.params.id]);
        res.json({ message: 'Aluno removido' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/projetos/:id/engenharia', async (req, res) => {
    try {
        const pecas = await pool.query(`SELECT pe.id, pe.nome, pe.pos FROM pecas pe JOIN estampos e ON pe.estampo_id = e.id WHERE e.projeto_id = $1 ORDER BY pe.pos ASC`, [req.params.id]);
        for (let peca of pecas.rows) {
            const processos = await pool.query(`SELECT id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida FROM processos WHERE peca_id = $1 ORDER BY ordem_execucao ASC`, [peca.id]);
            peca.processos = processos.rows;
        }
        res.json(pecas.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/processos/:id', async (req, res) => {
    try {
        const { ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida } = req.body;
        await pool.query(`UPDATE processos SET ordem_execucao = $1, nome_operacao = $2, tempo_planejado_min = $3, maquina_sugerida = $4 WHERE id = $5`, [ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida, req.params.id]);
        res.json({ message: 'Processo atualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pecas', async (req, res) => {
    try {
        const { estampo_id, projeto_id, nome, pos } = req.body;
        let idFinal = estampo_id || projeto_id;
        let checarEstampo = await pool.query('SELECT id FROM estampos WHERE id = $1', [idFinal]);
        if (checarEstampo.rows.length === 0) checarEstampo = await pool.query('SELECT id FROM estampos WHERE projeto_id = $1', [idFinal]);
        if (checarEstampo.rows.length === 0) {
            const novoEstampo = await pool.query('INSERT INTO estampos (projeto_id, nome, tipo) VALUES ($1, $2, $3) RETURNING id', [idFinal, nome || 'Estampo Padrão', 'Outro']);
            idFinal = novoEstampo.rows[0].id;
        } else {
            idFinal = checarEstampo.rows[0].id;
        }
        const resultado = await pool.query('INSERT INTO pecas (estampo_id, nome, pos, tratamento_termico) VALUES ($1, $2, $3, $4) RETURNING *', [idFinal, nome, pos, 'N/A']);
        res.status(201).json({ message: 'Peça cadastrada com sucesso!', peca: resultado.rows[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/processos', async (req, res) => {
    try {
        await pool.query('INSERT INTO processos (peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida) VALUES ($1, $2, $3, $4, $5)', [req.body.peca_id, req.body.ordem_execucao, req.body.nome_operacao, req.body.tempo_planejado_min, req.body.maquina_sugerida]);
        res.json({ message: 'Processo cadastrado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/pecas/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM pecas WHERE id = $1', [req.params.id]);
        res.json({ message: 'Peça removida' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/processos/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM processos WHERE id = $1', [req.params.id]);
        res.json({ message: 'Processo removido' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

cron.schedule('0 16 * * *', async () => {
    try {
        await pool.query(`UPDATE apontamentos SET data_hora_fim = CURRENT_TIMESTAMP WHERE data_hora_fim IS NULL`);
    } catch (error) { console.error('Erro no cron:', error); }
}, { scheduled: true, timezone: "America/Sao_Paulo" });

app.post('/api/auth/login', (req, res) => {
    if (req.body.senha === (process.env.ADMIN_PASSWORD || '260817')) res.status(200).json({ message: 'OK' });
    else res.status(401).json({ error: 'Senha incorreta' });
});

app.put('/api/projetos/:id/status', async (req, res) => {
    try {
        const result = await pool.query('UPDATE projetos SET status = $1, data_conclusao = COALESCE($2, data_conclusao) WHERE id = $3 RETURNING *', [req.body.status, req.body.data_conclusao || null, req.params.id]);
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put(['/api/projetos/:id', '/api/projetos/:id/editar'], async (req, res) => {
    try {
        const { nome, tipo, data_inicio, data_fim, data_conclusao, status } = req.body;
        await pool.query(
            `UPDATE projetos SET nome = COALESCE($1, nome), data_inicio = COALESCE($2, data_inicio), data_fim = COALESCE($3, data_fim), data_conclusao = COALESCE($4, data_conclusao), status = COALESCE($5, status) WHERE id = $6`,
            [nome || null, data_inicio || null, data_fim || null, data_conclusao || null, status || null, req.params.id]
        );
        if (tipo) {
            await pool.query(`UPDATE estampos SET nome = COALESCE($1, nome), tipo = COALESCE($2, tipo) WHERE projeto_id = $3`, [nome || null, tipo || null, req.params.id]);
        }
        res.json({ message: "Projeto atualizado!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
}); 






// ==========================================
// ROTAS DE ESTOQUE (MATERIAIS E COMPONENTES)
// ==========================================

// 1. Listar todo o estoque
app.get('/api/estoque', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM estoque_itens ORDER BY categoria, descricao ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Cadastrar novo material/componente
app.post('/api/estoque', async (req, res) => {
    try {
        const { codigo_interno, descricao, categoria, especificacao, estoque_minimo } = req.body;
        
        // Forçamos 'Unid' como unidade de medida conforme sua regra
        const result = await pool.query(
            `INSERT INTO estoque_itens (codigo_interno, descricao, categoria, especificacao, unidade_medida, estoque_minimo) 
             VALUES ($1, $2, $3, $4, 'Unid', $5) RETURNING *`,
            [codigo_interno || null, descricao, categoria, especificacao, estoque_minimo || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { 
        if (err.code === '23505') return res.status(400).json({ error: 'Já existe um item com este código interno.' });
        res.status(500).json({ error: err.message }); 
    }
});


// 2.1 Editar material do estoque
app.put('/api/estoque/:id', async (req, res) => {
    try {
        const { codigo_interno, descricao, categoria, especificacao, estoque_minimo } = req.body;
        await pool.query(
            `UPDATE estoque_itens 
             SET codigo_interno = $1, descricao = $2, categoria = $3, especificacao = $4, estoque_minimo = $5 
             WHERE id = $6`,
            [codigo_interno || null, descricao, categoria, especificacao, estoque_minimo || 0, req.params.id]
        );
        res.json({ message: 'Item atualizado com sucesso!' });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Já existe um item com este código interno.' });
        res.status(500).json({ error: err.message });
    }
});

// 2.2 Excluir material do estoque
app.delete('/api/estoque/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM estoque_itens WHERE id = $1', [req.params.id]);
        res.json({ message: 'Item excluído com sucesso!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});



// 3. Movimentar Estoque (Entrada ou Saída Inteligente)
app.post('/api/estoque/movimentar', async (req, res) => {
    const { item_id, tipo_movimento, quantidade, operador_id, projeto_id, observacao } = req.body;
    
    try {
        await pool.query('BEGIN'); // Inicia uma transação segura (Kardex + Saldo)
        
        // Salva o registro no histórico de movimentações
        await pool.query(
            `INSERT INTO estoque_movimentacoes (item_id, tipo_movimento, quantidade, operador_id, projeto_id, observacao) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [item_id, tipo_movimento, quantidade, operador_id || null, projeto_id || null, observacao]
        );

        // Atualiza a quantidade na tabela principal somando ou subtraindo
        const sinal = tipo_movimento === 'Entrada' ? '+' : '-';
        await pool.query(
            `UPDATE estoque_itens SET quantidade_atual = quantidade_atual ${sinal} $1 WHERE id = $2`,
            [quantidade, item_id]
        );

        await pool.query('COMMIT'); // Salva as duas operações juntas
        res.json({ message: `Movimentação de ${tipo_movimento} realizada com sucesso!` });
    } catch (err) { 
        await pool.query('ROLLBACK'); // Desfaz se algo der errado, evitando falhas no saldo
        res.status(500).json({ error: err.message }); 
    }
});




app.listen(port, () => { console.log(`Servidor rodando na porta ${port}`); });