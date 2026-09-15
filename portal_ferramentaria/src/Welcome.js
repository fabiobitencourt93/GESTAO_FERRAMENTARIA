import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight, Wrench } from 'lucide-react';

function Welcome() {
  const navigate = useNavigate();
  const [imagemFerramenta, setImagemFerramenta] = useState(null);

  // Manipula o upload da imagem e gera uma pré-visualização local
  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagemFerramenta(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIrParaProjetos = () => {
    navigate('/projetos');
  };

  return (
    <div style={{ 
      backgroundColor: '#F8F9FA', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      fontFamily: "'Inter', sans-serif",
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '36px', 
        borderRadius: '20px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)', 
        maxWidth: '480px', 
        width: '100%', 
        textAlign: 'center',
        border: '1px solid #E5E7EB'
      }}>
        
        {/* Logo / Ícone de Ferramentaria */}
        <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: '#F0F9FF', borderRadius: '50%', marginBottom: '16px' }}>
          <Wrench size={36} color="#0284C7" />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>
          Gestão de Ferramentaria
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 28px 0' }}>
          Faça o upload da imagem da ferramenta em destaque para iniciar o painel.
        </p>

        {/* ÁREA DE UPLOAD DA IMAGEM */}
        <label style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          border: '2px dashed #CBD5E1', 
          borderRadius: '12px', 
          height: '220px', 
          backgroundColor: '#F9FAFB', 
          cursor: 'pointer', 
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.2s',
          marginBottom: '24px'
        }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUploadImage} 
            style={{ display: 'none' }} 
          />

          {imagemFerramenta ? (
            <img 
              src={imagemFerramenta} 
              alt="Ferramenta preview" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
              <Upload size={32} color="#0284C7" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Clique para enviar imagem da ferramenta</span>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>PNG, JPG ou WEBP</span>
            </div>
          )}
        </label>

        {/* BOTÃO DE TRANSIÇÃO PARA PROJETOS */}
        <button 
          onClick={handleIrParaProjetos}
          style={{ 
            width: '100%', 
            padding: '14px', 
            backgroundColor: '#0284C7', 
            color: '#FFFFFF', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: '700', 
            fontSize: '15px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
            transition: 'background-color 0.2s'
          }}
        >
          <span>Acessar Projetos</span>
          <ArrowRight size={18} />
        </button>

      </div>
    </div>
  );
}

export default Welcome;