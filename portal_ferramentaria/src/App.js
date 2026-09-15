import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Projetos from './Projetos';
import PecasEstampo from './PecasEstampo';
import Producao from './Producao';
import Ajustes from './Ajustes';
import Notificacoes from './Notificacoes';
import GerenciarAlunos from './GerenciarAlunos';
import CorrecaoApontamentos from './CorrecaoApontamentos';
import GerenciarEngenharia from './GerenciarEngenharia';
import ApontamentoRetroativo from './ApontamentoRetroativo';
import Dashboard from './Dashboard';
import ProcessosPeca from './ProcessosPeca'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Projetos />} />
        <Route path="/estampo/:id" element={<PecasEstampo />} />
        <Route path="/peca/:id/processos" element={<ProcessosPeca />} />
        <Route path="/producao" element={<Producao />} />
        <Route path="/ajustes" element={<Ajustes />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/alunos" element={<GerenciarAlunos />} />
        
        {/* Mantive a rota curta para as correções funcionar perfeito com seu botão! */}
        <Route path="/correcoes" element={<CorrecaoApontamentos />} /> 
        
        <Route path="/engenharia" element={<GerenciarEngenharia />} />
        <Route path="/retroativo" element={<ApontamentoRetroativo />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    </Router>
  );
}

export default App;