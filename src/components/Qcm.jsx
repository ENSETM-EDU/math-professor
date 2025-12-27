import { useState } from "react";

export const Qcm = ({ question, options, onAnswer }) => {
    const [selected, setSelected] = useState(null);

    return (
        <div className="qcm-card">
            <h3 className="qcm-question">{question}</h3>
            <div className="qcm-options">
                {options.map((opt, i) => (
                    <button
                        key={i}
                        className={`qcm-opt ${selected === i ? 'selected' : ''}`}
                        onClick={() => {
                            setSelected(i);
                            onAnswer(opt);
                        }}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            <style>{`
        .qcm-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          margin-top: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          pointer-events: auto;
        }
        .qcm-question {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #1e293b;
          font-weight: 600;
        }
        .qcm-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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
        .qcm-opt:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        .qcm-opt.selected {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
        }
      `}</style>
        </div>
    );
};
