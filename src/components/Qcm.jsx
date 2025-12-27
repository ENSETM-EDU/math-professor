import { useState } from "react";

export const Qcm = ({ question, options, onAnswer, onNext, flat = false, isLast = true }) => {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  return (
    <div className={`qcm-card ${flat ? 'flat' : ''}`}>
      <h3 className="qcm-question">{question}</h3>
      <div className="qcm-options">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={answered}
            className={`qcm-opt ${selected === i ? 'selected' : ''} ${answered && selected !== i ? 'unselected' : ''}`}
            onClick={() => {
              setSelected(i);
              setAnswered(true);
              onAnswer(opt);
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
          <button
            className="qcm-next-btn"
            onClick={onNext}
          >
            {isLast ? "OK" : "Suivant"}
          </button>
        </div>
      )}

      <style>{`
        .qcm-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          margin-top: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          pointer-events: auto;
          display: flex;
          flex-direction: column;
        }
        .qcm-card.flat {
          background: transparent;
          box-shadow: none;
          border: none;
          padding: 0;
          margin: 0;
          width: 100%;
        }
        .qcm-question {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #1e293b;
          font-weight: 600;
        }
        .flat .qcm-question {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .qcm-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .flat .qcm-options {
          gap: 0.75rem;
        }
        .qcm-opt {
          padding: 0.75rem 1rem;
          text-align: left;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #475569;
          font-weight: 500;
        }
        .flat .qcm-opt {
          padding: 1rem 1.5rem;
          font-size: 1.1rem;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(79, 70, 229, 0.2);
        }
        .qcm-opt:hover:not(:disabled) {
          background: rgba(79, 70, 229, 0.1);
          border-color: rgba(79, 70, 229, 0.4);
        }
        .qcm-opt.selected {
          background: #4f46e5 !important;
          color: white !important;
          border-color: #4f46e5;
        }
        .qcm-opt.unselected {
          opacity: 0.6;
        }
        .qcm-opt:disabled {
          cursor: default;
        }
        .qcm-next-btn {
          padding: 0.75rem 2.5rem;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
        }
        .qcm-next-btn:hover {
          background: #4338ca;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(79, 70, 229, 0.3);
        }
        .flat .qcm-next-btn {
          font-size: 1.2rem;
          padding: 1rem 4rem;
        }
      `}</style>
    </div>
  );
};
