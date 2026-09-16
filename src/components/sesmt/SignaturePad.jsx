import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X } from 'lucide-react';

export default function SignaturePad({ 
  value = null, 
  onChange, 
  label = 'Assinatura Digital',
  placeholder = 'Assine com o dedo ou caneta touch neste espaço'
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(value));
  const [isOpen, setIsOpen] = useState(Boolean(value));

  // Configurar resolução do canvas conforme tamanho real
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';

    // Se já havia assinatura em base64, restaurar
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = value;
    }
  }, [isOpen]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      // Ignora se o ponteiro já foi liberado
    }
    const dataUrl = canvas.toDataURL('image/png');
    if (onChange) onChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    if (onChange) onChange('');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <PenTool size={15} color="#0891b2" />
          <span style={styles.title}>{label}</span>
          {hasSignature && (
            <span style={styles.signedBadge}>
              <Check size={12} /> Assinado
            </span>
          )}
        </div>

        {!isOpen ? (
          <button 
            type="button" 
            onClick={() => setIsOpen(true)} 
            style={styles.openBtn}
          >
            + Assinar na Tela
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={handleClear} 
              style={styles.clearBtn}
              title="Limpar assinatura"
            >
              <RotateCcw size={13} /> Limpar
            </button>
            <button 
              type="button" 
              onClick={() => {
                if (!hasSignature) setIsOpen(false);
                else setIsOpen(false);
              }} 
              style={styles.closeBtn}
              title="Fechar painel de assinatura"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div style={styles.padWrapper}>
          <canvas
            ref={canvasRef}
            style={styles.canvas}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          <div style={styles.guideLine}>
            <span>{placeholder}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.75rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  title: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#334155'
  },
  signedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#15803d',
    backgroundColor: '#dcfce7',
    padding: '0.15rem 0.45rem',
    borderRadius: '999px'
  },
  openBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.3rem 0.65rem',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#0891b2',
    cursor: 'pointer'
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.55rem',
    backgroundColor: '#ffffff',
    border: '1px solid #fecaca',
    borderRadius: '5px',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#dc2626',
    cursor: 'pointer'
  },
  closeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer'
  },
  padWrapper: {
    position: 'relative',
    backgroundColor: '#ffffff',
    border: '2px dashed #cbd5e1',
    borderRadius: '6px',
    height: '120px',
    overflow: 'hidden',
    touchAction: 'none'
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
    touchAction: 'none',
    cursor: 'crosshair'
  },
  guideLine: {
    position: 'absolute',
    bottom: '8px',
    left: '12px',
    right: '12px',
    pointerEvents: 'none',
    borderTop: '1px dotted #cbd5e1',
    paddingTop: '2px',
    display: 'flex',
    justifyContent: 'center',
    fontSize: '0.68rem',
    color: '#94a3b8'
  }
};
