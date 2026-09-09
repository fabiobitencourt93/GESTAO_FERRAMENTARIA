import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Bell, Plus, Trash2, Users } from 'lucide-react';

function GerenciarAlunos() {
  const navigate = useNavigate();
  // Estado temporário para visualização. Depois conectaremos ao GET/POST do Supabase.
  const [alunos] = useState([
    { id: 20261, nome: 'Allan' },
    { id: 20265, nome: 'Fabio' }
  ]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Gerenciar Alunos</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <Bell size={24} />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Cadastrar Novo Aluno</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="number" placeholder="ID (Crachá)" style={{ width: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
            <input type="text" placeholder="Nome do Aluno" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
            <button style={{ backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer' }}><Plus size={20} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alunos.map(aluno => (
            <div key={aluno.id} style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={20} color="#6B7280" />
                <span style={{ fontWeight: '600', color: '#111827' }}>{aluno.nome}</span>
                <span style={{ fontSize: '13px', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '6px' }}>ID: {aluno.id}</span>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GerenciarAlunos;