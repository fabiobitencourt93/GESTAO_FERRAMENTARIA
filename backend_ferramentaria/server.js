const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cron = require('node-cron');

const app = express();
const port = process.env.PORT || 3000;

// Configuração de Middlewares
app.use(cors()); 
app.use(express.json());

// Configuração do Banco de Dados (Supabase Pooler - IPv4 Seguro - Porta 5432)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.qvttpmwhvaokwmefafle:gestaoferramentaria@aws-0-us-west-2.pooler.supabase.com:5432/postgres';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

// ==========================================
// ROTA DE EMERGÊNCIA: ATUALIZAR BANCO DE DADOS
// ==========================================
app.get('/api/atualizar-banco', async (req, res) => {
    try {
        await pool.query('ALTER TABLE estampos ADD COLUMN IF NOT EXISTS tipo VARCHAR(100);');
        await pool.query('ALTER TABLE projetos ADD COLUMN IF NOT EXISTS data_conclusao DATE;');
        await pool.query('ALTER TABLE apontamentos ADD COLUMN IF NOT EXISTS ocorrencia TEXT;');
        res.send("<h1>Sucesso absoluto!</h1><p>As colunas foram criadas no Supabase. Pode voltar para o seu sistema que a lista de projetos vai carregar!</p>");
    } catch (err) {
        res.status(500).send(`<h1>Erro detalhado do Banco:</h1><pre>${err.message}</pre>`);
    }
});

// ROTA DE TESTE DE BANCO DE DADOS
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'Conexão com o Supabase OK!', hora_banco: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ status: 'FALHA NA CONEXÃO COM O BANCO', erro: err.message });
    }
});


// Teste de conexão ao iniciar o servidor
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ ERRO AO CONECTAR NO SUPABASE:', err.message);
    } else {
        console.log('✅ CONECTADO AO SUPABASE COM SUCESSO! Hora do banco:', res.rows[0].now);
    }
});

// ==========================================
// ROTA DE HEALTH CHECK
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
                p.status,
                TO_CHAR(p.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                TO_CHAR(p.data_fim, 'DD/MM/YYYY') AS data_fim,
                TO_CHAR(p.data_conclusao, 'DD/MM/YYYY') AS data_conclusao,
                e.nome AS estampo, 
                e.id AS estampo_id,
                e.tipo AS tipo
            FROM projetos p
            LEFT JOIN estampos e ON p.id = e.projeto_id
            ORDER BY p.id;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ROTA: Cadastrar novo Projeto e Estampo 
// ==========================================
app.post('/api/projetos', async (req, res) => {
    try {
        const { nome, data_inicio, data_fim, tipo } = req.body; 
        
        if (!nome) return res.status(400).json({ error: 'O nome é obrigatório.' });
        if (!data_inicio) return res.status(400).json({ error: 'A data de início é obrigatória.' });
        if (!tipo) return res.status(400).json({ error: 'O tipo do estampo é obrigatório.' });

        const resultProjeto = await pool.query(
            'INSERT INTO projetos (nome, data_inicio, data_fim) VALUES ($1, $2, $3) RETURNING *', 
            [nome, data_inicio, data_fim || null]
        );
        
        const projetoCriado = resultProjeto.rows[0];

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
            "UPDATE projetos SET status = 'Concluído', data_conclusao = CURRENT_DATE WHERE id = $1", 
            [id]
        );
        res.json({ message: "Projeto concluído com sucesso" });
    } catch (err) {
        res.status(500).json({ erroBanco: err.message });
    }
});

// ==========================================
// ROTA: Reabrir Projeto
// ==========================================
app.put('/api/projetos/:id/reabrir', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "UPDATE projetos SET status = 'Em Andamento', data_conclusao = NULL WHERE id = $1", 
            [id]
        );
        res.json({ message: "Projeto reaberto com sucesso" });
    } catch (err) {
        res.status(500).json({ erroBanco: err.message });
    }
});

// ==========================================
// ROTA: Apagar Projeto
// ==========================================
app.delete('/api/projetos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM estampos WHERE projeto_id = $1', [id]);
        await pool.query('DELETE FROM projetos WHERE id = $1', [id]);
        res.json({ message: "Projeto excluído com sucesso" });
    } catch (err) {
        res.status(500).json({ erroBanco: err.message });
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
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 3: Roteiro de Fabricação (Processos da Peça)
// ==========================================
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
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 5: Finalizar Apontamento (Stop - Parcial)
// ==========================================
app.put('/api/apontamentos/finalizar', async (req, res) => {
    try {
        const { processo_id, operador_id, ocorrencia } = req.body;
        
        const result = await pool.query(`
            UPDATE apontamentos 
            SET 
                data_hora_fim = CURRENT_TIMESTAMP,
                ocorrencia = $3 
            WHERE processo_id = $1 
              AND operador_id = $2 
              AND data_hora_fim IS NULL 
            RETURNING *
        `, [processo_id, operador_id, ocorrencia || null]); 

        if (result.rowCount === 0) {
            return res.status(403).json({ error: 'Operação não encontrada, já finalizada ou ID do aluno incorreto.' });
        }

        res.json({ message: 'Operação finalizada com sucesso!', apontamento: result.rows[0] });
    } catch (err) {
        res.status(500).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
    }
});

// ==========================================
// ROTA 5.1: Encerrar Apontamento e Marcar 100% Concluído
// ==========================================
app.put('/api/apontamentos/finalizar-100', async (req, res) => {
    const { processo_id, operador_id, ocorrencia } = req.body;
    try {
        // 1. Para o cronômetro do aluno e salva a ocorrência
        await pool.query(`
            UPDATE apontamentos 
            SET data_hora_fim = CURRENT_TIMESTAMP,
                ocorrencia = $3
            WHERE processo_id = $1 AND operador_id = $2 AND data_hora_fim IS NULL
        `, [processo_id, operador_id, ocorrencia || null]);

        // 2. Marca a operação como 100% no roteiro
        await pool.query(`
            UPDATE processos 
            SET status = 'Concluído' 
            WHERE id = $1
        `, [processo_id]);

        res.json({ message: 'Operação 100% concluída e ocorrência salva!' });
    } catch (error) {
        console.error("Erro ao concluir 100%:", error);
        res.status(500).send('Erro interno ao concluir.');
    }
});

// ==========================================
// ROTA: Lançamento Manual (Retroativo)
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
        res.status(500).send('Erro interno ao salvar apontamento manual.');
    }
});

// ==========================================
// ROTA: Registrar Ocorrência Avulsa (Edição Posterior)
// ==========================================
app.put('/api/apontamentos/:id/ocorrencia', async (req, res) => {
    try {
        const { id } = req.params;
        const { ocorrencia } = req.body;
        await pool.query(
            "UPDATE apontamentos SET ocorrencia = $1 WHERE id = $2", 
            [ocorrencia, id]
        );
        res.json({ message: "Ocorrência registrada com sucesso!" });
    } catch (err) {
        res.status(500).json({ erroBanco: err.message });
    }
});

// ==========================================
// ROTA 6: Relatório de Desempenho (Visão por Peça)
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
        res.status(500).send('Erro ao buscar relatório');
    }
});

// ==========================================
// ROTA 6.1: Relatório Detalhado de Processos e Atrasos
// ==========================================
app.get('/api/relatorios/processos', async (req, res) => {
    try {
        const query = `
            SELECT 
                proj.nome AS projeto,
                pec.nome AS peca,
                pr.nome_operacao AS processo,
                pr.maquina_sugerida AS maquina,
                pr.tempo_planejado_min AS planejado,
                COALESCE(SUM(EXTRACT(EPOCH FROM (a.data_hora_fim - a.data_hora_inicio))/60), 0) AS realizado
            FROM processos pr
            JOIN pecas pec ON pr.peca_id = pec.id
            JOIN estampos est ON pec.estampo_id = est.id
            JOIN projetos proj ON est.projeto_id = proj.id
            LEFT JOIN apontamentos a ON a.processo_id = pr.id
            GROUP BY proj.nome, pec.nome, pr.nome_operacao, pr.maquina_sugerida, pr.tempo_planejado_min, pr.ordem_execucao
            ORDER BY proj.nome, pec.nome, pr.ordem_execucao;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ROTA 7: Histórico de Ocorrências (Completo e Validado)
// ==========================================
app.get('/api/ocorrencias', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id,
                a.ocorrencia,
                TO_CHAR(a.data_hora_fim, 'DD/MM/YYYY HH24:MI') AS data_registro,
                o.nome AS operador,
                pr.nome_operacao AS operacao,
                pec.nome AS peca,
                proj.nome AS projeto
            FROM apontamentos a
            LEFT JOIN operadores o ON a.operador_id = o.id
            JOIN processos pr ON a.processo_id = pr.id
            JOIN pecas pec ON pr.peca_id = pec.id
            JOIN estampos est ON pec.estampo_id = est.id
            JOIN projetos proj ON est.projeto_id = proj.id
            WHERE a.ocorrencia IS NOT NULL AND TRIM(a.ocorrencia) <> ''
            ORDER BY a.data_hora_fim DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ROTA 8: Status Ao Vivo dos Alunos
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
        console.error("Erro na Rota Ao Vivo:", err.message);
        res.status(500).send('Erro ao buscar status ao vivo');
    }
});

// ==========================================
// ROTA 9: Buscar Apontamentos Abertos (Esquecidos)
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
        res.status(500).send('Erro ao buscar dados');
    }
});

// ==========================================
// ROTAS DE OPERADORES E ENGENHARIA (CRUD)
// ==========================================
app.get('/api/operadores', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM operadores ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send('Erro ao buscar alunos');
    }
});

app.post('/api/operadores', async (req, res) => {
    try {
        const { id, nome } = req.body;
        const result = await pool.query(
            'INSERT INTO operadores (id, nome) VALUES ($1, $2) RETURNING *',
            [id, nome]
        );
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Este ID de crachá já está cadastrado.' });
        res.status(500).send('Erro interno ao cadastrar aluno');
    }
});

app.delete('/api/operadores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM operadores WHERE id = $1', [id]);
        res.json({ message: 'Aluno removido com sucesso' });
    } catch (err) {
        if (err.code === '23503') return res.status(400).json({ error: 'Aluno possui horas registradas.' });
        res.status(500).send('Erro ao excluir aluno');
    }
});

app.get('/api/projetos/:id/engenharia', async (req, res) => {
    try {
        const { id } = req.params;
        const pecas = await pool.query(`
            SELECT pe.id, pe.nome, pe.pos 
            FROM pecas pe
            JOIN estampos e ON pe.estampo_id = e.id
            WHERE e.projeto_id = $1
            ORDER BY pe.pos ASC
        `, [id]);

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
        res.status(500).send('Erro ao buscar engenharia');
    }
});

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
// ROTA: CADASTRAR PEÇA (CORRIGIDA COM TRATAMENTO TÉRMICO)
// ==========================================
app.post('/api/pecas', async (req, res) => {
    try {
        const { estampo_id, projeto_id, nome, pos } = req.body;
        let idFinal = estampo_id || projeto_id;

        if (!idFinal) {
            return res.status(400).json({ error: 'ID do projeto/estampo não informado.' });
        }

        // 1. Verifica se esse ID já pertence diretamente à tabela estampos
        let checarEstampo = await pool.query('SELECT id FROM estampos WHERE id = $1', [idFinal]);

        // 2. Se não encontrou, busca o estampo vinculado a este projeto
        if (checarEstampo.rows.length === 0) {
            checarEstampo = await pool.query('SELECT id FROM estampos WHERE projeto_id = $1', [idFinal]);
        }

        // 3. Se o projeto não tinha estampo, cria o estampo automaticamente
        if (checarEstampo.rows.length === 0) {
            const novoEstampo = await pool.query(
                'INSERT INTO estampos (projeto_id, nome, tipo) VALUES ($1, $2, $3) RETURNING id',
                [idFinal, nome || 'Estampo Padrão', 'Outro']
            );
            idFinal = novoEstampo.rows[0].id;
        } else {
            idFinal = checarEstampo.rows[0].id;
        }

        // 4. SOLUÇÃO DO ERRO: Inserindo 'N/A' no tratamento_termico para satisfazer o banco!
        const resultado = await pool.query(
            'INSERT INTO pecas (estampo_id, nome, pos, tratamento_termico) VALUES ($1, $2, $3, $4) RETURNING *',
            [idFinal, nome, pos, 'N/A']
        );

        res.status(201).json({ message: 'Peça cadastrada com sucesso!', peca: resultado.rows[0] });
    } catch (err) {
        console.error('ERRO SQL PEÇAS:', err.message);
        res.status(500).json({ error: 'Erro ao criar peça: ' + err.message });
    }
});


app.post('/api/processos', async (req, res) => {
    try {
        const { peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida } = req.body;
        await pool.query(
            'INSERT INTO processos (peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida) VALUES ($1, $2, $3, $4, $5)',
            [peca_id, ordem_execucao, nome_operacao, tempo_planejado_min, maquina_sugerida]
        );
        res.json({ message: 'Processo cadastrado' });
    } catch (err) {
        res.status(500).send('Erro ao criar processo');
    }
});

app.delete('/api/pecas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM pecas WHERE id = $1', [id]);
        res.json({ message: 'Peça removida' });
    } catch (err) {
        if (err.code === '23503') return res.status(400).json({ error: 'Peça já possui processos.' });
        res.status(500).send('Erro ao excluir peça');
    }
});

app.delete('/api/processos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM processos WHERE id = $1', [id]);
        res.json({ message: 'Processo removido' });
    } catch (err) {
        if (err.code === '23503') return res.status(400).json({ error: 'Processo já possui apontamentos.' });
        res.status(500).send('Erro ao excluir processo');
    }
});

// ==========================================
// TAREFA AUTOMÁTICA: Fechamento de Turno (16h00)
// ==========================================
cron.schedule('0 16 * * *', async () => {
    console.log('⏰ Executando fechamento automático de turno (16h00)...');
    try {
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
    timezone: "America/Sao_Paulo" 
});


// ==========================================
// ROTA: Autenticação Segura da Administração
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { senha } = req.body;
    
    // A senha real deve ser configurada nas Variáveis de Ambiente (Environment) do Render!
    const senhaCorreta = process.env.ADMIN_PASSWORD || '260817';

    if (senha === senhaCorreta) {
        res.status(200).json({ message: 'Autenticado com sucesso' });
    } else {
        res.status(401).json({ error: 'Senha incorreta' });
    }
});


//==========================================
// ROTA: ALTERAR STATUS DO PROJETO
//==========================================
app.put('/api/projetos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, data_conclusao } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE projetos SET status = $1 WHERE id = $2 RETURNING *',
            [status, data_conclusao, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao atualizar status:", err);
        res.status(500).json({ error: 'Erro interno ao atualizar status.' });
    }
});

// ==========================================
// ROTA: Editar Projeto e Estampo
// ==========================================
app.put('/api/projetos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, tipo, data_inicio, data_fim } = req.body;

        // 1. Atualiza a tabela projetos
        await pool.query(
            `UPDATE projetos 
             SET nome = $1, data_inicio = $2, data_fim = $3 
             WHERE id = $4`,
            [nome, data_inicio || null, data_fim || null, id]
        );

        // 2. Atualiza ou insere o tipo na tabela estampos associada
        await pool.query(
            `UPDATE estampos 
             SET nome = $1, tipo = $2 
             WHERE projeto_id = $3`,
            [nome, tipo, id]
        );

        res.json({ message: "Projeto atualizado com sucesso!" });
    } catch (err) {
        console.error("Erro ao editar projeto:", err.message);
        res.status(500).json({ error: err.message });
    }
});

//==================================================================
// ROTA: Editar projeto completo (Nome, Início, Fim, Conclusão Real)
//==================================================================
app.put('/api/projetos/:id/editar', async (req, res) => {
    const { id } = req.params;
    const { nome, data_inicio, data_fim, data_conclusao } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE projetos SET projeto = $1, data_inicio = $2, data_fim = $3, data_conclusao = $4 WHERE id = $5 RETURNING *',
            [nome, data_inicio, data_fim, data_conclusao, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao editar projeto:", err);
        res.status(500).json({ error: 'Erro interno ao editar o projeto.' });
    }
});


// ==========================================
// Inicialização do Servidor
// ==========================================
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});