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
    <div className="space-y-4 pb-28">
      {/* Status do Plano e Datas */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 grid grid-cols-2 gap-3 text-center shadow-sm">
        <div className="p-3 rounded-2xl bg-clay-50 border border-clay-200">
          <span className="text-[10px] font-bold uppercase text-clay-800 block">
            Data de Feedback
          </span>
          <span className="text-sm font-black text-stone-900 mt-0.5 block">
            {selectedStudent.nextFeedbackDate}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200">
          <span className="text-[10px] font-bold uppercase text-sage-800 block">
            Renovação do Plano
          </span>
          <span className="text-sm font-black text-stone-900 mt-0.5 block">
            {selectedStudent.paymentDueDate}
          </span>
        </div>
      </div>

      {/* Formulário de Feedback de Uma Mão */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-stone-200 rounded-3xl p-4 space-y-4 shadow-sm"
      >
        <div>
          <h3 className="text-base font-extrabold text-stone-900">
            Enviar Check-in de Feedback
          </h3>
          <p className="text-xs text-stone-500">
            Responda rapidamente com 1 mão para ajustes de treino e dieta.
          </p>
        </div>

        {/* Peso em Jejum com Botões Grandes */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
          <span className="text-xs font-bold text-stone-700 block">
            Peso Corporal em Jejum (kg)
          </span>
          <div className="grid grid-cols-3 gap-3 items-center">
            <button
              type="button"
              onClick={() => setWeightKg((w) => Number((w - 0.2).toFixed(1)))}
              className="py-3 rounded-xl bg-white border border-stone-300 text-sm font-black text-stone-700"
            >
              - 0.2 kg
            </button>
            <div className="py-2 rounded-xl bg-sage-100 border border-sage-300 text-center">
              <span className="text-xl font-black text-stone-900">{weightKg}</span>
              <span className="block text-[10px] text-sage-800 font-bold">KG</span>
            </div>
            <button
              type="button"
              onClick={() => setWeightKg((w) => Number((w + 0.2).toFixed(1)))}
              className="py-3 rounded-xl bg-white border border-stone-300 text-sm font-black text-stone-900"
            >
              + 0.2 kg
            </button>
          </div>
        </div>

        {/* Nota de Adesão à Dieta (1 Toque) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-stone-700 block">
            Nota de Adesão à Dieta na Semana:{' '}
            <strong className="text-sage-700">{dietAdherence}/10</strong>
          </span>
          <div className="grid grid-cols-5 gap-2">
            {[6, 7, 8, 9, 10].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDietAdherence(val)}
                className={`py-2.5 rounded-xl text-xs font-black border ${
                  dietAdherence === val
                    ? 'bg-sage-600 border-sage-600 text-white shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
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
            <span className="text-xs font-bold text-stone-700 block mb-1">
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
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 text-stone-600 border border-stone-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-stone-700 block mb-1">
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
                      ? 'bg-clay-600 text-white'
                      : 'bg-stone-50 text-stone-600 border border-stone-200'
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
          <span className="text-xs font-bold text-stone-700 block">
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
                    ? 'bg-clay-100 border-clay-400 text-clay-900'
                    : 'bg-stone-50 border-stone-200 text-stone-600'
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
          className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs text-stone-900"
        />

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-black text-sm shadow-md"
        >
          ✓ ENVIAR FEEDBACK DA SEMANA
        </button>

        {sentSuccess && (
          <div className="p-3 rounded-xl bg-sage-100 border border-sage-300 text-xs font-bold text-sage-800 text-center">
            Check-in enviado com sucesso! Seu peso e histórico já foram atualizados no painel do
            profissional.
          </div>
        )}
      </form>
    </div>
  );
}
