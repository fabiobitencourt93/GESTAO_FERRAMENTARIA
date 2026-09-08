import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Projetos from './Projetos';
import PecasEstampo from './PecasEstampo';
// 1. ESTA LINHA PRECISA EXISTIR:
import ProcessosPeca from './ProcessosPeca'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Projetos />} />
        <Route path="/estampo/:id" element={<PecasEstampo />} />
        {/* 2. ESTA LINHA PRECISA EXISTIR: */}
        <Route path="/peca/:id/processos" element={<ProcessosPeca />} /> 
      </Routes>
    </Router>
  );
}

export default App;