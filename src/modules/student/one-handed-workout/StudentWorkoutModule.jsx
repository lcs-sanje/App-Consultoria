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

  // Encontra a primeira série ainda não concluída do exercício atual
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

  // Progresso total de séries da sessão
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

    // Inicia automaticamente o cronômetro de descanso prescrito pelo treinador
    const prescribedRest = Number(currentWorkoutItem.restSeconds) || 90;
    setRestSecondsLeft(prescribedRest);
    setIsRestRunning(true);

    // Se era a última série deste exercício e há próximo exercício, avança suavemente
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

  // Exercícios substitutos equivalentes (para quando o aparelho está ocupado)
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
    <div className="space-y-4 pb-28">
      {/* Seletor de Divisão (Treino A, B, C) e Barra de Progresso Limpa */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
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
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {sess.code}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white truncate">{activeSession.title}</span>
            <span className="font-extrabold text-emerald-400">
              {completedSetsInSession}/{totalSetsInSession} séries ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pílulas de Navegação Rápida entre Exercícios da Sessão */}
      <div className="flex gap-2 overflow-x-auto py-1">
        {exercisesList.map((item, idx) => {
          const ex = exerciseMap.get(item.exerciseId);
          const allDone = (item.setsDetail || []).every((s) => s.completed);
          const isCurrent = idx === activeExerciseIdx;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveExerciseIdx(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                isCurrent
                  ? 'bg-slate-800 border-indigo-400 text-white'
                  : allDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400'
              }`}
            >
              {allDone ? '✓ ' : `${idx + 1}. `}
              {ex?.name?.split(' ').slice(0, 3).join(' ')}
            </button>
          );
        })}
      </div>

      {/* CARD PRINCIPAL DO EXERCÍCIO ATIVO — ERGONOMIA DE UMA MÃO (THUMB ZONE) */}
      {currentWorkoutItem && currentExerciseInfo && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
          {/* Cabeçalho Limpo do Exercício */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-300">
                  {currentExerciseInfo.primaryMuscle}
                </span>
                <span className="text-[11px] font-semibold text-amber-300">
                  {currentWorkoutItem.technique}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-1 leading-snug">
                {currentExerciseInfo.name}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Meta: <strong>{currentWorkoutItem.workSets} séries</strong> •{' '}
                <strong>{currentWorkoutItem.repRange} reps</strong> •{' '}
                <strong className="text-indigo-300">{currentWorkoutItem.targetRir}</strong> •
                Descanso: <strong>{currentWorkoutItem.restSeconds}s</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSwapDrawer(!showSwapDrawer)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 whitespace-nowrap"
            >
              ⇄ Aparelho Ocupado
            </button>
          </div>

          {/* Dica rápida do treinador */}
          {(currentWorkoutItem.notes || currentExerciseInfo.cues) && (
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300">
              💡 <strong>Dica:</strong> {currentWorkoutItem.notes || currentExerciseInfo.cues}
            </div>
          )}

          {/* Gaveta de Troca de Exercício em 1 Toque */}
          {showSwapDrawer && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
              <div className="text-xs font-bold text-amber-300">
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
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{sub.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Equipamento: {sub.equipment}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">Usar este →</span>
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
                  className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    s.completed
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : isCurrentSet
                      ? 'bg-indigo-950/50 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        s.type === 'W'
                          ? 'bg-amber-500/20 text-amber-300'
                          : s.type === 'T'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Série {idx + 1} • {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-extrabold">
                    <span>{s.lastWeightKg} kg</span>
                    <span>×</span>
                    <span>{s.lastReps} reps</span>
                    <span className="text-base">{s.completed ? '✅' : '○'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAINEL DE CONTROLE COM UMA MÃO (ZONA DO POLEGAR — ZERO DIGITAÇÃO) */}
          <div className="p-4 rounded-2xl bg-slate-950 border-2 border-indigo-500/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                👉 Série {activeSetIndex + 1} ({activeSet.label}) — Pré-preenchida da última sessão
              </span>
              <span className="text-[11px] text-slate-400">
                1RM Est.: <strong>{oneRmInfo.average} kg</strong>
              </span>
            </div>

            {/* Controle de Carga (kg) com Botões Grandes para o Polegar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>CARGA (KG)</span>
                <span>Toque para ajustar sem teclado</span>
              </div>
              <div className="grid grid-cols-5 gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Math.max(0, Number((w - 2.5).toFixed(1))))}
                  className="py-3 rounded-xl bg-slate-900 active:bg-slate-800 border border-slate-700 text-xs font-extrabold text-slate-200"
                >
                  -2.5
                </button>
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Math.max(0, Number((w - 1).toFixed(1))))}
                  className="py-3 rounded-xl bg-slate-900 active:bg-slate-800 border border-slate-700 text-sm font-extrabold text-slate-200"
                >
                  -1
                </button>
                <div className="py-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-center">
                  <span className="text-xl font-black text-white">{draftWeight}</span>
                  <span className="block text-[10px] text-indigo-300 font-bold">KG</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Number((w + 1).toFixed(1)))}
                  className="py-3 rounded-xl bg-slate-900 active:bg-slate-800 border border-slate-700 text-sm font-extrabold text-white"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => setDraftWeight((w) => Number((w + 2.5).toFixed(1)))}
                  className="py-3 rounded-xl bg-slate-900 active:bg-slate-800 border border-slate-700 text-xs font-extrabold text-indigo-300"
                >
                  +2.5
                </button>
              </div>
            </div>

            {/* Controle de Repetições com Botões Grandes para o Polegar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>REPETIÇÕES REALIZADAS</span>
                <span>Meta: {currentWorkoutItem.repRange} reps</span>
              </div>
              <div className="grid grid-cols-3 gap-3 items-center">
                <button
                  type="button"
                  onClick={() => setDraftReps((r) => Math.max(1, r - 1))}
                  className="py-3 rounded-xl bg-slate-900 active:bg-slate-800 border border-slate-700 text-base font-extrabold text-slate-200"
                >
                  - 1 rep
                </button>
                <div className="py-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-center">
                  <span className="text-xl font-black text-white">{draftReps}</span>
                  <span className="block text-[10px] text-indigo-300 font-bold">REPS</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftReps((r) => r + 1)}
                  className="py-3 rounded-xl bg-slate-900 active:bg-slate-800 border border-slate-700 text-base font-extrabold text-white"
                >
                  + 1 rep
                </button>
              </div>
            </div>

            {/* BOTÃO GIGANTE DE 1 TOQUE (CONCLUIR SÉRIE + INICIAR DESCANSO) */}
            <button
              type="button"
              onClick={handleCompleteSetOneTap}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-black text-base tracking-wide shadow-lg shadow-emerald-600/30 transition-all"
            >
              ✓ CONCLUIR SÉRIE {activeSetIndex + 1} ({draftWeight}kg × {draftReps} reps)
            </button>
          </div>
        </div>
      )}

      {/* CARD DO TREINO AERÓBIO PRESCRITO NA SESSÃO */}
      {cardio.enabled && (
        <div className="bg-slate-900 border border-sky-500/40 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-sky-500/20 text-sky-300">
                Cardio Prescrito Pós-Musculação
              </span>
              <h3 className="text-base font-extrabold text-white mt-1">
                {cardioModality?.name} — {cardio.durationMin} minutos
              </h3>
            </div>
            <span className="text-xs font-extrabold text-sky-300">
              Alvo: {cardio.targetZone} (
              {hrZones.zones.find((z) => z.zone === cardio.targetZone)?.minBpm}-
              {hrZones.zones.find((z) => z.zone === cardio.targetZone)?.maxBpm} bpm)
            </span>
          </div>

          {cardio.method === 'interval' ? (
            <div className="p-3 rounded-2xl bg-slate-950 border border-sky-500/30 space-y-1 text-xs">
              <div className="font-bold text-sky-300">
                Protocolo Intervalado ({cardio.intervalsCount} Tiros):
              </div>
              <div className="text-rose-300">
                🔥 Estímulo Forte ({cardio.workSeconds}s): {cardio.workIntensityDesc}
              </div>
              <div className="text-emerald-300">
                💧 Recuperação ({cardio.restSeconds}s): {cardio.restIntensityDesc}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-300">
              Ritmo Contínuo Estável{' '}
              {cardio.speedKmh > 0 && `• Velocidade: ${cardio.speedKmh} km/h`}{' '}
              {cardio.inclinePct > 0 && `• Inclinação: ${cardio.inclinePct}%`}
            </div>
          )}

          {cardio.notes && <p className="text-xs text-slate-400">{cardio.notes}</p>}

          <div className="flex items-center justify-between pt-1">
            <div className="text-lg font-black text-white">⏱ {formatClock(cardioTimerSec)}</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCardioRunning(!cardioRunning)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold ${
                  cardioRunning
                    ? 'bg-amber-600 text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {cardioRunning ? '⏸ Pausar Cardio' : '▶ Iniciar Cronômetro Cardio'}
              </button>
              {cardioTimerSec > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCardioRunning(false);
                    setCardioTimerSec(0);
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"
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
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-indigo-950/95 backdrop-blur border-2 border-indigo-400 rounded-2xl p-3 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
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
              className="px-2.5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 border border-slate-700"
            >
              -15s
            </button>
            <button
              type="button"
              onClick={() => setRestSecondsLeft((s) => s + 15)}
              className="px-2.5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-slate-200 border border-slate-700"
            >
              +15s
            </button>
            <button
              type="button"
              onClick={() => {
                setRestSecondsLeft(0);
                setIsRestRunning(false);
              }}
              className="px-3 py-2 rounded-xl bg-rose-600 text-xs font-extrabold text-white"
            >
              Pular
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
