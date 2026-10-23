import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import { calcOneRepMax, calcHeartRateZones } from '../../../core/formulas/trainingFormulas.js';

export function StudentWorkoutModule() {
  const {
    selectedStudent,
    exercisesCatalog,
    cardioModalities,
    logStudentSet,
    swapStudentExercise,
  } = useApp();

  const sessions = selectedStudent?.workoutPlan?.sessions || [];
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || '');
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  const [showSwapDrawer, setShowSwapDrawer] = useState(false);

  // Cronômetro de Descanso Automático Flutuante
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isRestRunning, setIsRestRunning] = useState(false);

  // Cronômetro de Cardio / HIIT
  const [cardioTimerSec, setCardioTimerSec] = useState(0);
  const [cardioRunning, setCardioRunning] = useState(false);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  const exercisesList = activeSession?.exercises || [];
  const currentWorkoutItem =
    exercisesList[activeExerciseIdx] || exercisesList[0] || null;

  const exerciseMap = useMemo(
    () => new Map(exercisesCatalog.map((e) => [e.id, e])),
    [exercisesCatalog]
  );

  const currentExerciseInfo = currentWorkoutItem
    ? exerciseMap.get(currentWorkoutItem.exerciseId)
    : null;

  const activeSetIndex = useMemo(() => {
    if (!currentWorkoutItem?.setsDetail) return 0;
    const idx = currentWorkoutItem.setsDetail.findIndex((s) => !s.completed);
    return idx === -1 ? currentWorkoutItem.setsDetail.length - 1 : idx;
  }, [currentWorkoutItem]);

  const activeSet = currentWorkoutItem?.setsDetail?.[activeSetIndex] || {
    setNumber: 1,
    type: 'S',
    label: 'Trabalho',
    lastWeightKg: 20,
    lastReps: 10,
    completed: false,
  };

  // Estado local de 1 mão pré-preenchido automaticamente com a última sessão!
  const [draftWeight, setDraftWeight] = useState(activeSet.lastWeightKg || 20);
  const [draftReps, setDraftReps] = useState(activeSet.lastReps || 10);

  useEffect(() => {
    setDraftWeight(Number(activeSet.lastWeightKg) || 20);
    setDraftReps(Number(activeSet.lastReps) || 10);
  }, [activeSessionId, activeExerciseIdx, activeSetIndex, activeSet.lastWeightKg, activeSet.lastReps]);

  // Efeito do Timer de Descanso
  useEffect(() => {
    if (!isRestRunning || restSecondsLeft <= 0) {
      if (restSecondsLeft <= 0) setIsRestRunning(false);
      return undefined;
    }
    const timer = setInterval(() => {
      setRestSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isRestRunning, restSecondsLeft]);

  // Efeito do Timer de Cardio
  useEffect(() => {
    if (!cardioRunning) return undefined;
    const timer = setInterval(() => {
      setCardioTimerSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cardioRunning]);

  if (!selectedStudent || !activeSession) return null;

  const totalSetsInSession = exercisesList.reduce(
    (acc, item) => acc + (item.setsDetail?.length || 0),
    0
  );
  const completedSetsInSession = exercisesList.reduce(
    (acc, item) =>
      acc + (item.setsDetail?.filter((s) => s.completed).length || 0),
    0
  );
  const progressPct =
    totalSetsInSession > 0
      ? Math.round((completedSetsInSession / totalSetsInSession) * 100)
      : 0;

  // Ação Principal com 1 Toque (Polegar)
  const handleCompleteSetOneTap = () => {
    if (!currentWorkoutItem) return;

    logStudentSet(
      selectedStudent.id,
      activeSession.id,
      currentWorkoutItem.id,
      activeSetIndex,
      draftWeight,
      draftReps,
      true
    );

    const prescribedRest = Number(currentWorkoutItem.restSeconds) || 90;
    setRestSecondsLeft(prescribedRest);
    setIsRestRunning(true);

    const isLastSetOfExercise =
      activeSetIndex >= (currentWorkoutItem.setsDetail?.length || 1) - 1;
    if (isLastSetOfExercise && activeExerciseIdx < exercisesList.length - 1) {
      setTimeout(() => {
        setActiveExerciseIdx((prev) => Math.min(exercisesList.length - 1, prev + 1));
      }, 350);
    }
  };

  const handleToggleExistingSet = (idx, setObj) => {
    logStudentSet(
      selectedStudent.id,
      activeSession.id,
      currentWorkoutItem.id,
      idx,
      setObj.lastWeightKg,
      setObj.lastReps,
      !setObj.completed
    );
  };

  const formatClock = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const oneRmInfo = calcOneRepMax({ weightKg: draftWeight, reps: draftReps });
  const hrZones = calcHeartRateZones({
    age: selectedStudent.age,
    restingHr: selectedStudent.restingHr || 60,
  });

  const substituteExercises = useMemo(() => {
    if (!currentExerciseInfo) return [];
    const explicitSubs = (currentExerciseInfo.substituteIds || [])
      .map((id) => exerciseMap.get(id))
      .filter(Boolean);
    if (explicitSubs.length > 0) return explicitSubs;
    return exercisesCatalog.filter(
      (e) =>
        e.id !== currentExerciseInfo.id &&
        e.primaryMuscle === currentExerciseInfo.primaryMuscle
    );
  }, [currentExerciseInfo, exerciseMap, exercisesCatalog]);

  const cardio = activeSession.cardioPrescription || {};
  const cardioModality =
    cardioModalities.find((m) => m.id === cardio.modalityId) || cardioModalities[0];

  return (
    <div className="space-y-4 pb-36">
      {/* Seletor de Divisão (Treino A, B, C) e Barra de Progresso Limpa */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3.5 space-y-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sessions.map((sess) => (
            <button
              key={sess.id}
              type="button"
              onClick={() => {
                setActiveSessionId(sess.id);
                setActiveExerciseIdx(0);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                sess.id === activeSession.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {sess.code}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-stone-800 truncate">{activeSession.title}</span>
            <span className="font-extrabold text-sage-700 whitespace-nowrap">
              {completedSetsInSession}/{totalSetsInSession} séries ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-sage-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pílulas de Navegação Rápida entre Exercícios da Sessão (Com quebra limpa, sem espremer texto) */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
          Exercícios da Sessão (Toque para alternar):
        </span>
        <div className="flex flex-wrap gap-2">
          {exercisesList.map((item, idx) => {
            const ex = exerciseMap.get(item.exerciseId);
            const allDone = (item.setsDetail || []).every((s) => s.completed);
            const isCurrent = idx === activeExerciseIdx;
            const shortName = ex?.name
              ? ex.name.length > 22
                ? `${ex.name.slice(0, 22).trim()}…`
                : ex.name
              : 'Exercício';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveExerciseIdx(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                  isCurrent
                    ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                    : allDone
                    ? 'bg-sage-100 border-sage-300 text-sage-800'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {allDone ? `✓ ${idx + 1}. ` : `${idx + 1}. `}
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* CARD PRINCIPAL DO EXERCÍCIO ATIVO — ERGONOMIA DE UMA MÃO (THUMB ZONE) */}
      {currentWorkoutItem && currentExerciseInfo && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-4 shadow-sm">
          {/* Cabeçalho Limpo do Exercício */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-sage-100 text-sage-800 border border-sage-200">
                  {currentExerciseInfo.primaryMuscle}
                </span>
                <span className="text-[11px] font-bold text-clay-700">
                  {currentWorkoutItem.technique}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-stone-900 mt-1 leading-snug">
                {currentExerciseInfo.name}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Meta: <strong>{currentWorkoutItem.workSets} séries</strong> •{' '}
                <strong>{currentWorkoutItem.repRange} reps</strong> •{' '}
                <strong className="text-sage-700">{currentWorkoutItem.targetRir}</strong> •
                Descanso: <strong>{currentWorkoutItem.restSeconds}s</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSwapDrawer(!showSwapDrawer)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-clay-100 hover:bg-clay-200 text-clay-900 border border-clay-300 whitespace-nowrap"
            >
              ⇄ Aparelho Ocupado
            </button>
          </div>

          {/* Dica rápida do treinador */}
          {(currentWorkoutItem.notes || currentExerciseInfo.cues) && (
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700">
              <strong>Dica:</strong> {currentWorkoutItem.notes || currentExerciseInfo.cues}
            </div>
          )}

          {/* Gaveta de Troca de Exercício em 1 Toque */}
          {showSwapDrawer && (
            <div className="p-3 rounded-2xl bg-clay-50 border border-clay-300 space-y-2">
              <div className="text-xs font-bold text-clay-900">
                Aparelho ocupado? Toque para trocar por um substituto equivalente:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {substituteExercises.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      swapStudentExercise(
                        selectedStudent.id,
                        activeSession.id,
                        currentWorkoutItem.id,
                        sub.id
                      );
                      setShowSwapDrawer(false);
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate">{sub.name}</div>
                      <div className="text-[11px] text-stone-500">
                        Equipamento: {sub.equipment}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-clay-800 whitespace-nowrap">
                      Usar este →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lista Compacta das Séries do Exercício */}
          <div className="space-y-1.5">
            {(currentWorkoutItem.setsDetail || []).map((s, idx) => {
              const isCurrentSet = idx === activeSetIndex && !s.completed;
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleExistingSet(idx, s)}
                  className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    s.completed
                      ? 'bg-sage-50 border-sage-300 text-sage-900'
                      : isCurrentSet
                      ? 'bg-stone-100 border-stone-900 text-stone-900 ring-1 ring-stone-900/15'
                      : 'bg-stone-50 border-stone-200 text-stone-500'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase whitespace-nowrap ${
                        s.type === 'W'
                          ? 'bg-clay-100 text-clay-800'
                          : s.type === 'T'
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Série {idx + 1} • {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-extrabold whitespace-nowrap">
                    <span>{s.lastWeightKg} kg</span>
                    <span>×</span>
                    <span>{s.lastReps} reps</span>
                    <span className="text-base">{s.completed ? '✓' : '○'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAINEL DE CONTROLE COM UMA MÃO (ZONA DO POLEGAR — ZERO DIGITAÇÃO) */}
          <div className="p-4 rounded-2xl bg-stone-50 border-2 border-sage-400 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sage-800">
                Série {activeSetIndex + 1} ({activeSet.label}) — Pré-preenchida
              </span>
              <span className="text-[11px] text-stone-600">
                1RM Est.: <strong>{oneRmInfo.average} kg</strong>
              </span>
            </div>

            {/* Controle de Carga (kg) com Botões Grandes para o Polegar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500 font-semibold">
                <span>CARGA (KG)</span>
                <span>Ajuste com 1 toque</span>
              </div>
              <div className="grid grid-cols-5 gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Math.max(0, Number((w - 2.5).toFixed(1))))}
                  className="py-3 rounded-xl bg-white active:bg-stone-100 border border-stone-300 text-xs font-extrabold text-stone-700"
                >
                  -2.5
                </button>
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Math.max(0, Number((w - 1).toFixed(1))))}
                  className="py-3 rounded-xl bg-white active:bg-stone-100 border border-stone-300 text-sm font-extrabold text-stone-700"
                >
                  -1
                </button>
                <div className="py-2 rounded-xl bg-sage-100 border border-sage-300 text-center">
                  <span className="text-xl font-black text-stone-900">{draftWeight}</span>
                  <span className="block text-[10px] text-sage-800 font-bold">KG</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Number((w + 1).toFixed(1)))}
                  className="py-3 rounded-xl bg-white active:bg-stone-100 border border-stone-300 text-sm font-extrabold text-stone-900"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Number((w + 2.5).toFixed(1)))}
                  className="py-3 rounded-xl bg-white active:bg-stone-100 border border-stone-300 text-xs font-extrabold text-sage-800"
                >
                  +2.5
                </button>
              </div>
            </div>

            {/* Controle de Repetições com Botões Grandes para o Polegar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500 font-semibold">
                <span>REPETIÇÕES REALIZADAS</span>
                <span>Meta: {currentWorkoutItem.repRange} reps</span>
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <button
                  type="button"
                  onClick={() => setDraftReps((r) => Math.max(1, r - 1))}
                  className="py-3 rounded-xl bg-white active:bg-stone-100 border border-stone-300 text-base font-extrabold text-stone-700"
                >
                  - 1 rep
                </button>
                <div className="py-2 rounded-xl bg-sage-100 border border-sage-300 text-center">
                  <span className="text-xl font-black text-stone-900">{draftReps}</span>
                  <span className="block text-[10px] text-sage-800 font-bold">REPS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftReps((r) => r + 1)}
                  className="py-3 rounded-xl bg-white active:bg-stone-100 border border-stone-300 text-base font-extrabold text-stone-900"
                >
                  + 1 rep
                </button>
              </div>
            </div>

            {/* BOTÃO GIGANTE DE 1 TOQUE (CONCLUIR SÉRIE + INICIAR DESCANSO) */}
            <button
              type="button"
              onClick={handleCompleteSetOneTap}
              className="w-full py-4 rounded-2xl bg-sage-600 hover:bg-sage-700 active:scale-[0.99] text-white font-black text-base tracking-wide shadow-md transition-all"
            >
              ✓ CONCLUIR SÉRIE {activeSetIndex + 1} ({draftWeight}kg × {draftReps} reps)
            </button>
          </div>
        </div>
      )}

      {/* CARD DO TREINO AERÓBIO PRESCRITO NA SESSÃO */}
      {cardio.enabled && (
        <div className="bg-white border border-clay-300 rounded-3xl p-4 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-clay-100 text-clay-800 border border-clay-200">
                Cardio Prescrito Pós-Musculação
              </span>
              <h3 className="text-base font-extrabold text-stone-900 mt-1">
                {cardioModality?.name} — {cardio.durationMin} minutos
              </h3>
            </div>
            <span className="text-xs font-extrabold text-clay-800">
              Alvo: {cardio.targetZone} (
              {hrZones.zones.find((z) => z.zone === cardio.targetZone)?.minBpm}-
              {hrZones.zones.find((z) => z.zone === cardio.targetZone)?.maxBpm} bpm)
            </span>
          </div>

          {cardio.method === 'interval' ? (
            <div className="p-3 rounded-2xl bg-clay-50 border border-clay-200 space-y-1 text-xs">
              <div className="font-bold text-stone-900">
                Protocolo Intervalado ({cardio.intervalsCount} Tiros):
              </div>
              <div className="text-[#7D3527] font-semibold">
                Estímulo Forte ({cardio.workSeconds}s): {cardio.workIntensityDesc}
              </div>
              <div className="text-sage-800 font-semibold">
                Recuperação ({cardio.restSeconds}s): {cardio.restIntensityDesc}
              </div>
            </div>
          ) : (
            <div className="text-xs text-stone-600">
              Ritmo Contínuo Estável{' '}
              {cardio.speedKmh > 0 && `• Velocidade: ${cardio.speedKmh} km/h`}{' '}
              {cardio.inclinePct > 0 && `• Inclinação: ${cardio.inclinePct}%`}
            </div>
          )}

          {cardio.notes && <p className="text-xs text-stone-500">{cardio.notes}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-lg font-black text-stone-900">⏱ {formatClock(cardioTimerSec)}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCardioRunning(!cardioRunning)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold ${
                  cardioRunning
                    ? 'bg-clay-600 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {cardioRunning ? 'Pausar Cardio' : 'Iniciar Cronômetro Cardio'}
              </button>
              {cardioTimerSec > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCardioRunning(false);
                    setCardioTimerSec(0);
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200"
                >
                  Zerar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BARRA FLUTUANTE DE DESCANSO AUTOMÁTICO (NÃO-INTRUSIVA NO RODAPÉ) */}
      {(isRestRunning || restSecondsLeft > 0) && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-stone-900 text-stone-50 border border-stone-700 rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sage-300 block">
              Descanso Entre Séries
            </span>
            <span className="text-2xl font-black text-white">
              ⏳ {formatClock(restSecondsLeft)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRestSecondsLeft((s) => Math.max(0, s - 15))}
              className="px-2.5 py-2 rounded-xl bg-stone-800 text-xs font-bold text-stone-200 border border-stone-700"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={() => setRestSecondsLeft((s) => s + 15)}
              className="px-2.5 py-2 rounded-xl bg-stone-800 text-xs font-bold text-stone-200 border border-stone-700"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={() => {
                setRestSecondsLeft(0);
                setIsRestRunning(false);
              }}
              className="px-3 py-2 rounded-xl bg-clay-600 text-xs font-extrabold text-white"
            >
              Pular
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
