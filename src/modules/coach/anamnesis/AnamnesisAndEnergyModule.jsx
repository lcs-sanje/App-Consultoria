import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import { ANAMNESIS_BLOCKS_SCHEMA } from '../../../data/anamnesisSchema.js';
import {
  calcPollock3,
  calcPollock7,
  calcUSNavyBodyFat,
  calcBodyComposition,
} from '../../../core/formulas/bodyCompFormulas.js';
import {
  calculateAllBMRFormulas,
  calculateTotalDailyEnergyExpenditure,
  ACTIVITY_FACTORS_FAF,
  NEAT_OCCUPATIONAL_FACTORS,
} from '../../../core/formulas/energyFormulas.js';

export function AnamnesisAndEnergyModule() {
  const { selectedStudent, updateStudent } = useApp();
  const [activeSubTab, setActiveSubTab] = useState('energy'); // 'energy' | 'anthropometry' | 'anamnesis'

  if (!selectedStudent) return null;

  const anth = selectedStudent.anthropometry || {};
  const eCfg = selectedStudent.energyConfig || {
    selectedBmrFormula: 'mifflin',
    mode: 'integrated',
    faf: 1.55,
    neatFactor: 1.25,
    resistanceKcal: 280,
    cardioKcal: 220,
    includeTEF: true,
  };

  // Composição corporal atual do perfil
  const bodyComp = calcBodyComposition({
    weightKg: selectedStudent.weightKg,
    bodyFatPercent: selectedStudent.bodyFatPercent,
  });

  // Protocolos de dobras e circunferências em tempo real
  const pollock3Res = calcPollock3({
    sex: selectedStudent.sex,
    age: selectedStudent.age,
    pectoral: anth.pectoralMm,
    abdominal: anth.abdominalMm,
    thigh: anth.thighMm,
    triceps: anth.tricepsMm,
    suprailiac: anth.suprailiacMm,
  });

  const pollock7Res = calcPollock7({
    sex: selectedStudent.sex,
    age: selectedStudent.age,
    pectoral: anth.pectoralMm,
    midaxillary: anth.midaxillaryMm,
    triceps: anth.tricepsMm,
    subscapular: anth.subscapularMm,
    abdominal: anth.abdominalMm,
    suprailiac: anth.suprailiacMm,
    thigh: anth.thighMm,
  });

  const navyBf = calcUSNavyBodyFat({
    sex: selectedStudent.sex,
    heightCm: selectedStudent.heightCm,
    waistCm: anth.waistCm,
    neckCm: anth.neckCm,
    hipCm: anth.hipCm,
  });

  // Todas as equações de TMB calculadas simultaneamente
  const bmrFormulas = calculateAllBMRFormulas({
    sex: selectedStudent.sex,
    weightKg: selectedStudent.weightKg,
    heightCm: selectedStudent.heightCm,
    age: selectedStudent.age,
    leanMassKg: bodyComp.leanMassKg,
  });

  const activeBmrObj =
    bmrFormulas.find((f) => f.id === eCfg.selectedBmrFormula) || bmrFormulas[0];

  const tdeeResult = calculateTotalDailyEnergyExpenditure({
    bmr: activeBmrObj.kcal,
    mode: eCfg.mode,
    faf: eCfg.faf,
    neatFactor: eCfg.neatFactor,
    resistanceKcal: eCfg.resistanceKcal,
    cardioKcal: eCfg.cardioKcal,
    includeTEF: eCfg.includeTEF,
  });

  const handleUpdateEnergyConfig = (partial) => {
    updateStudent(selectedStudent.id, (stu) => ({
      ...stu,
      energyConfig: {
        ...(stu.energyConfig || {}),
        ...partial,
      },
    }));
  };

  const handleUpdateAnth = (field, value) => {
    updateStudent(selectedStudent.id, (stu) => ({
      ...stu,
      anthropometry: {
        ...(stu.anthropometry || {}),
        [field]: Number(value),
      },
    }));
  };

  const handleUpdateAnamnesis = (key, value) => {
    updateStudent(selectedStudent.id, (stu) => ({
      ...stu,
      anamnesis: {
        ...(stu.anamnesis || {}),
        [key]: value,
      },
    }));
  };

  const applyTdeeToDietTargets = (deltaTrainingKcal = 0, deltaRestKcal = 0) => {
    const trainTarget = Math.round(tdeeResult.trainingDayTDEE + deltaTrainingKcal);
    const restTarget = Math.round(tdeeResult.restDayTDEE + deltaRestKcal);
    updateStudent(selectedStudent.id, (stu) => ({
      ...stu,
      energyConfig: {
        ...(stu.energyConfig || {}),
        trainingDayTargetKcal: trainTarget,
        restDayTargetKcal: restTarget,
      },
      dietPlan: {
        ...stu.dietPlan,
        days: {
          ...stu.dietPlan.days,
          trainingDay: {
            ...stu.dietPlan.days.trainingDay,
            targetKcal: trainTarget,
          },
          restDay: {
            ...stu.dietPlan.days.restDay,
            targetKcal: restTarget,
          },
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Sub-navegação do Módulo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('energy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'energy'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔥 Fórmulas de Gasto Calórico (TMB & GET)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('anthropometry')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'anthropometry'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📐 Antropometria & Composição Corporal (Pollock / Navy)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('anamnesis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'anamnesis'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 Anamnese Integrada (7 Blocos) & Histórico de Feedbacks
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 px-2">
          <span>
            Peso: <strong className="text-white">{selectedStudent.weightKg} kg</strong>
          </span>
          <span>•</span>
          <span>
            Gordura: <strong className="text-amber-400">{selectedStudent.bodyFatPercent}%</strong>
          </span>
          <span>•</span>
          <span>
            Massa Livre (MLG): <strong className="text-emerald-400">{bodyComp.leanMassKg} kg</strong>
          </span>
        </div>
      </div>

      {/* ABA 1: FÓRMULAS DE GASTO CALÓRICO (TMB & GET INTEGRADO) */}
      {activeSubTab === 'energy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Painel Esquerdo: Comparativo de Equações de TMB */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  1. Seleção de Equação de Taxa Metabólica Basal (TMB)
                </h3>
                <p className="text-xs text-slate-400">
                  Compare todas as equações simultaneamente e clique na que deseja utilizar para{' '}
                  {selectedStudent.name}.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                MLG: {bodyComp.leanMassKg} kg
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bmrFormulas.map((formula) => {
                const isSelected = formula.id === eCfg.selectedBmrFormula;
                return (
                  <button
                    key={formula.id}
                    type="button"
                    onClick={() => handleUpdateEnergyConfig({ selectedBmrFormula: formula.id })}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white">{formula.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {formula.badge}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-indigo-400">
                        {formula.kcal}
                      </span>
                      <span className="text-xs text-slate-400">kcal/dia em repouso</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                      {formula.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Painel Direito: Cálculo do GET (Clássico vs Integrado Treino + NEAT + ETA) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">
                2. Gasto Energético Total (GET / TDEE)
              </h3>
              <p className="text-xs text-slate-400">
                Cruze a TMB ({activeBmrObj.name}: <strong>{activeBmrObj.kcal} kcal</strong>) com a
                rotina e o gasto do treino.
              </p>
            </div>

            {/* Alternador Modo Integrado vs Clássico */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleUpdateEnergyConfig({ mode: 'integrated' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  eCfg.mode === 'integrated'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Modo Integrado (NEAT + Treino)
              </button>
              <button
                type="button"
                onClick={() => handleUpdateEnergyConfig({ mode: 'classic' })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  eCfg.mode === 'classic'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Modo Clássico (TMB × FAF)
              </button>
            </div>

            {eCfg.mode === 'integrated' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fator Ocupacional Fora da Academia (NEAT)
                  </label>
                  <select
                    value={eCfg.neatFactor}
                    onChange={(e) => handleUpdateEnergyConfig({ neatFactor: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {NEAT_OCCUPATIONAL_FACTORS.map((nf) => (
                      <option key={nf.id} value={nf.value}>
                        {nf.label} — {nf.stepsHint}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gasto Treino Resistido (kcal)
                    </label>
                    <input
                      type="number"
                      value={eCfg.resistanceKcal}
                      onChange={(e) =>
                        handleUpdateEnergyConfig({ resistanceKcal: Number(e.target.value) })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gasto Sessão Aeróbia (kcal)
                    </label>
                    <input
                      type="number"
                      value={eCfg.cardioKcal}
                      onChange={(e) =>
                        handleUpdateEnergyConfig({ cardioKcal: Number(e.target.value) })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(eCfg.includeTEF)}
                    onChange={(e) => handleUpdateEnergyConfig({ includeTEF: e.target.checked })}
                    className="rounded border-slate-700"
                  />
                  Adicionar Efeito Térmico dos Alimentos (ETA ~8%)
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fator de Atividade Física Geral (FAF)
                </label>
                <select
                  value={eCfg.faf}
                  onChange={(e) => handleUpdateEnergyConfig({ faf: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {ACTIVITY_FACTORS_FAF.map((af) => (
                    <option key={af.id} value={af.value}>
                      {af.label} — {af.desc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Resultado Desmembrado do GET */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-[11px] font-bold uppercase text-indigo-300">
                    GET em Dia de Treino
                  </span>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {tdeeResult.trainingDayTDEE}{' '}
                    <span className="text-xs font-normal text-slate-400">kcal</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    GET em Dia de Descanso
                  </span>
                  <div className="text-2xl font-extrabold text-slate-200 mt-1">
                    {tdeeResult.restDayTDEE}{' '}
                    <span className="text-xs font-normal text-slate-400">kcal</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span>Taxa Metabólica Basal ({activeBmrObj.name}):</span>
                  <strong className="text-slate-200">{tdeeResult.bmr} kcal</strong>
                </div>
                <div className="flex justify-between">
                  <span>Gasto de Rotina / NEAT:</span>
                  <strong className="text-slate-200">+{tdeeResult.neatKcal} kcal</strong>
                </div>
                {eCfg.mode === 'integrated' && (
                  <>
                    <div className="flex justify-between">
                      <span>Treino Resistido + Cardio:</span>
                      <strong className="text-emerald-400">+{tdeeResult.workoutKcal} kcal</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Efeito Térmico dos Alimentos (ETA):</span>
                      <strong className="text-slate-200">+{tdeeResult.tefKcal} kcal</strong>
                    </div>
                  </>
                )}
              </div>

              {/* Botões rápidos para enviar a meta calórica direto para a dieta */}
              <div className="pt-2 space-y-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Aplicar Meta Calórica na Dieta do Aluno (1 Clique):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyTdeeToDietTargets(-450, -450)}
                    className="p-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
                  >
                    Cutting (-450 kcal)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTdeeToDietTargets(0, 0)}
                    className="p-2 rounded-xl text-xs font-bold bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30"
                  >
                    Manutenção (= GET)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTdeeToDietTargets(300, 150)}
                    className="p-2 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                  >
                    Bulking (+300 kcal)
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Meta atual gravada na dieta:{' '}
                  <strong className="text-emerald-400">
                    {selectedStudent.dietPlan?.days?.trainingDay?.targetKcal} kcal
                  </strong>{' '}
                  (Dia de Treino) /{' '}
                  <strong className="text-slate-200">
                    {selectedStudent.dietPlan?.days?.restDay?.targetKcal} kcal
                  </strong>{' '}
                  (Dia de Descanso).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: ANTROPOMETRIA & COMPOSIÇÃO CORPORAL (POLLOCK 3/7 & US NAVY) */}
      {activeSubTab === 'anthropometry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-base font-bold text-white">
              Medidas Corporais, Perimetrias (cm) e Dobras Cutâneas (mm)
            </h3>

            {/* Biometria Base */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Peso Atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedStudent.weightKg}
                  onChange={(e) =>
                    updateStudent(selectedStudent.id, { weightKg: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Estatura (cm)</label>
                <input
                  type="number"
                  value={selectedStudent.heightCm}
                  onChange={(e) =>
                    updateStudent(selectedStudent.id, { heightCm: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Idade (anos)</label>
                <input
                  type="number"
                  value={selectedStudent.age}
                  onChange={(e) =>
                    updateStudent(selectedStudent.id, { age: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">% Gordura Ativo</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedStudent.bodyFatPercent}
                  onChange={(e) =>
                    updateStudent(selectedStudent.id, { bodyFatPercent: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm font-bold text-indigo-300"
                />
              </div>
            </div>

            {/* Perimetrias (Circunferências para US Navy e Evolução) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
                Circunferências / Perimetria em Casa (cm) — Base Protocolo US Navy
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'waistCm', label: 'Cintura (cm)' },
                  { key: 'neckCm', label: 'Pescoço (cm)' },
                  { key: 'hipCm', label: 'Quadril (cm)' },
                  { key: 'chestCm', label: 'Tórax (cm)' },
                  { key: 'armRightCm', label: 'Braço Cont. (cm)' },
                  { key: 'thighRightCm', label: 'Coxa Medial (cm)' },
                  { key: 'calfRightCm', label: 'Panturrilha (cm)' },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs text-slate-400 mb-1">{item.label}</label>
                    <input
                      type="number"
                      step="0.5"
                      value={anth[item.key] || 0}
                      onChange={(e) => handleUpdateAnth(item.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dobras Cutâneas (Jackson & Pollock 3 e 7 Dobras) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
                Dobras Cutâneas (mm) — Protocolos Jackson & Pollock 3 e 7 Dobras
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: 'pectoralMm', label: 'Peitoral (mm)' },
                  { key: 'abdominalMm', label: 'Abdominal (mm)' },
                  { key: 'thighMm', label: 'Coxa (mm)' },
                  { key: 'tricepsMm', label: 'Tríceps (mm)' },
                  { key: 'suprailiacMm', label: 'Supra-ilíaca (mm)' },
                  { key: 'subscapularMm', label: 'Subescapular (mm)' },
                  { key: 'midaxillaryMm', label: 'Axilar Média (mm)' },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs text-slate-400 mb-1">{item.label}</label>
                    <input
                      type="number"
                      step="0.5"
                      value={anth[item.key] || 0}
                      onChange={(e) => handleUpdateAnth(item.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resultados Calculados de Composição Corporal */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white">
              Comparativo de Protocolos de % de Gordura
            </h3>
            <p className="text-xs text-slate-400">
              Clique em <strong>Usar este %G</strong> no protocolo desejado para atualizar a Massa
              Livre de Gordura (MLG) usada nas fórmulas de Cunningham e Tinsley.
            </p>

            <div className="space-y-3">
              {/* US Navy */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-sky-300">
                    Protocolo Marinha dos EUA (US Navy - Fita Métrica)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ideal para consultoria online (Cintura, Pescoço, Quadril e Altura)
                  </p>
                  <div className="text-xl font-extrabold text-white mt-1">{navyBf}% Gordura</div>
                </div>
                <button
                  type="button"
                  onClick={() => updateStudent(selectedStudent.id, { bodyFatPercent: navyBf })}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30"
                >
                  Usar este %G
                </button>
              </div>

              {/* Pollock 3 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-300">
                    Jackson & Pollock — 3 Dobras + Siri
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Soma 3 dobras: {pollock3Res.sumMm} mm • Densidade: {pollock3Res.density} g/cm³
                  </p>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {pollock3Res.bodyFatPercent}% Gordura
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateStudent(selectedStudent.id, {
                      bodyFatPercent: pollock3Res.bodyFatPercent,
                    })
                  }
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                >
                  Usar este %G
                </button>
              </div>

              {/* Pollock 7 */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300">
                    Jackson & Pollock — 7 Dobras + Siri
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Soma 7 dobras: {pollock7Res.sumMm} mm • Densidade: {pollock7Res.density} g/cm³
                  </p>
                  <div className="text-xl font-extrabold text-white mt-1">
                    {pollock7Res.bodyFatPercent}% Gordura
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateStudent(selectedStudent.id, {
                      bodyFatPercent: pollock7Res.bodyFatPercent,
                    })
                  }
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                >
                  Usar este %G
                </button>
              </div>
            </div>

            {/* Resumo Final de Massa Magra vs Gorda */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Composição Corporal Ativa no Perfil
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-xs text-slate-400 block">Massa Livre de Gordura (MLG)</span>
                  <span className="text-lg font-extrabold text-emerald-400">
                    {bodyComp.leanMassKg} kg
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Massa Gorda (MG)</span>
                  <span className="text-lg font-extrabold text-rose-400">
                    {bodyComp.fatMassKg} kg ({bodyComp.bodyFatPercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: PRONTUÁRIO DE ANAMNESE INTEGRADA (7 BLOCOS) & FEEDBACKS */}
      {activeSubTab === 'anamnesis' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {ANAMNESIS_BLOCKS_SCHEMA.map((block) => (
              <div
                key={block.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{block.title}</h4>
                  <p className="text-xs text-slate-400">{block.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {block.fields.map((field) => {
                    const val = selectedStudent.anamnesis?.[field.key] || '';
                    return (
                      <div
                        key={field.key}
                        className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                      >
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={val}
                            onChange={(e) => handleUpdateAnamnesis(field.key, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            value={val}
                            placeholder={field.placeholder}
                            onChange={(e) => handleUpdateAnamnesis(field.key, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        ) : (
                          <input
                            type="text"
                            value={val}
                            placeholder={field.placeholder}
                            onChange={(e) => handleUpdateAnamnesis(field.key, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Coluna Lateral: Histórico de Feedbacks (Check-ins) Lado a Lado */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">
                Histórico de Feedbacks (Check-ins) de {selectedStudent.name}
              </h4>
              {(selectedStudent.feedbackHistory || []).length === 0 ? (
                <p className="text-xs text-slate-400">
                  Nenhum check-in registrado ainda para este aluno.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedStudent.feedbackHistory.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-400">Data: {fb.date}</span>
                        <span className="text-xs font-extrabold text-white">
                          Peso: {fb.weightKg} kg
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Adesão Dieta: <strong>{fb.dietAdherence}/10</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Sono: <strong>{fb.sleepQuality}/5</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Energia: <strong>{fb.energyLevel}/5</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        <strong className="text-slate-400">Articulações:</strong>{' '}
                        {fb.jointPainNotes}
                      </p>
                      <p className="text-xs text-slate-200 italic">&ldquo;{fb.studentNotes}&rdquo;</p>
                      <div className="pt-1 border-t border-slate-800 text-[11px] text-emerald-400">
                        <strong>Conduta Profissional:</strong> {fb.coachReply}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
