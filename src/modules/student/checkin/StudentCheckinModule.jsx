import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext.jsx';

export function StudentCheckinModule() {
  const { selectedStudent, registerStudentFeedback } = useApp();

  const [weightKg, setWeightKg] = useState(selectedStudent?.weightKg || 80);
  const [dietAdherence, setDietAdherence] = useState(9);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [jointPainNotes, setJointPainNotes] = useState('Zero dores articulares');
  const [studentNotes, setStudentNotes] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!selectedStudent) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    registerStudentFeedback(selectedStudent.id, {
      weightKg,
      dietAdherence,
      sleepQuality,
      energyLevel,
      jointPainNotes,
      studentNotes,
    });
    setSentSuccess(true);
    setStudentNotes('');
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Status do Plano e Datas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-sky-400 block">
            Data de Feedback
          </span>
          <span className="text-sm font-black text-white mt-0.5 block">
            {selectedStudent.nextFeedbackDate}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block">
            Renovação do Plano
          </span>
          <span className="text-sm font-black text-white mt-0.5 block">
            {selectedStudent.paymentDueDate}
          </span>
        </div>
      </div>

      {/* Formulário de Feedback de Uma Mão */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4"
      >
        <div>
          <h3 className="text-base font-extrabold text-white">
            📋 Enviar Check-in de Feedback
          </h3>
          <p className="text-xs text-slate-400">
            Responda rapidamente com 1 mão para ajustes de treino e dieta.
          </p>
        </div>

        {/* Peso em Jejum com Botões Grandes */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 block">
            Peso Corporal em Jejum (kg)
          </span>
          <div className="grid grid-cols-3 gap-3 items-center">
            <button
              type="button"
              onClick={() => setWeightKg((w) => Number((w - 0.2).toFixed(1)))}
              className="py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-black text-slate-200"
            >
              - 0.2 kg
            </button>
            <div className="py-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-center">
              <span className="text-xl font-black text-white">{weightKg}</span>
              <span className="block text-[10px] text-indigo-300 font-bold">KG</span>
            </div>
            <button
              type="button"
              onClick={() => setWeightKg((w) => Number((w + 0.2).toFixed(1)))}
              className="py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-black text-white"
            >
              + 0.2 kg
            </button>
          </div>
        </div>

        {/* Nota de Adesão à Dieta (1 Toque) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-300 block">
            Nota de Adesão à Dieta na Semana: <strong className="text-emerald-400">{dietAdherence}/10</strong>
          </span>
          <div className="grid grid-cols-5 gap-2">
            {[6, 7, 8, 9, 10].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDietAdherence(val)}
                className={`py-2.5 rounded-xl text-xs font-black border ${
                  dietAdherence === val
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Nota {val}
              </button>
            ))}
          </div>
        </div>

        {/* Energia no Treino e Sono */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-1">
              Qualidade do Sono ({sleepQuality}/5)
            </span>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSleepQuality(v)}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    sleepQuality === v
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-300 block mb-1">
              Energia no Treino ({energyLevel}/5)
            </span>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEnergyLevel(v)}
                  className={`py-2 rounded-lg text-xs font-bold ${
                    energyLevel === v
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Seleção Rápida de Conforto Articular */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-300 block">
            Articulações / Dores no Treino
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Zero dores articulares',
              'Leve desconforto em Ombro',
              'Leve desconforto em Joelho',
              'Cansaço / Fadiga Lombar',
            ].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setJointPainNotes(opt)}
                className={`p-2.5 rounded-xl text-xs font-bold border text-left ${
                  jointPainNotes === opt
                    ? 'bg-indigo-600/30 border-indigo-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={2}
          value={studentNotes}
          onChange={(e) => setStudentNotes(e.target.value)}
          placeholder="Observação opcional para o treinador/nutricionista..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white"
        />

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/25"
        >
          ✓ ENVIAR FEEDBACK DA SEMANA
        </button>

        {sentSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 text-center">
            ✅ Check-in enviado com sucesso! Seu peso e histórico já foram atualizados no painel do
            profissional.
          </div>
        )}
      </form>
    </div>
  );
}
