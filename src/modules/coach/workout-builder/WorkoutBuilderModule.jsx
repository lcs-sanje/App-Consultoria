import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import { MUSCLE_GROUPS } from '../../../data/exercisesCatalog.js';
import {
  calcWeeklyMuscleVolume,
  calcMetsSessionKcal,
  calcACSMCardioKcal,
  calcHeartRateZones,
} from '../../../core/formulas/trainingFormulas.js';

export function WorkoutBuilderModule() {
  const { selectedStudent, updateStudent, exercisesCatalog, cardioModalities } = useApp();
  const [selectedSessionId, setSelectedSessionId] = useState(
    selectedStudent?.workoutPlan?.sessions?.[0]?.id || 'sess_a'
  );
  const [muscleFilter, setMuscleFilter] = useState('TODOS');
  const [exerciseToAddId, setExerciseToAddId] = useState(exercisesCatalog[0]?.id || '');

  if (!selectedStudent) return null;

  const sessions = selectedStudent.workoutPlan?.sessions || [];
  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;

  const exerciseMap = useMemo(
    () => new Map(exercisesCatalog.map((e) => [e.id, e])),
    [exercisesCatalog]
  );

  // Auditoria de volume semanal por grupamento muscular em tempo real
  const weeklyVolume = useMemo(
    () => calcWeeklyMuscleVolume(sessions, exercisesCatalog),
    [sessions, exercisesCatalog]
  );

  // Zonas de FC (Tanaka + Karvonen) do aluno
  const hrZonesData = useMemo(
    () =>
      calcHeartRateZones({
        age: selectedStudent.age,
        restingHr: selectedStudent.restingHr || 60,
      }),
    [selectedStudent.age, selectedStudent.restingHr]
  );

  const filteredCatalog = useMemo(() => {
    if (muscleFilter === 'TODOS') return exercisesCatalog;
    return exercisesCatalog.filter((e) => e.primaryMuscle === muscleFilter);
  }, [exercisesCatalog, muscleFilter]);

  const updateActiveSession = (updater) => {
    if (!activeSession) return;
    updateStudent(selectedStudent.id, (stu) => {
      const nextSessions = (stu.workoutPlan?.sessions || []).map((s) =>
        s.id === activeSession.id ? (typeof updater === 'function' ? updater(s) : { ...s, ...updater }) : s
      );
      return {
        ...stu,
        workoutPlan: {
          ...stu.workoutPlan,
          sessions: nextSessions,
        },
      };
    });
  };

  const handleAddDivision = () => {
    const nextLetter = String.fromCharCode(65 + sessions.length);
    const newId = `sess_${Date.now()}`;
    const newSession = {
      id: newId,
      code: `Treino ${nextLetter}`,
      title: 'Nova Divisão Muscular',
      weeklyFrequency: 1,
      estimatedResistanceMinutes: 50,
      resistanceMet: 5.0,
      exercises: [],
      cardioPrescription: {
        enabled: true,
        modalityId: 'cardio_corrida_esteira',
        method: 'steady',
        durationMin: 20,
        targetZone: 'Z2',
        speedKmh: 8.5,
        inclinePct: 1.0,
        intervalsCount: 6,
        workSeconds: 30,
        restSeconds: 60,
        workIntensityDesc: 'Tiro forte (PSE 8-9)',
        restIntensityDesc: 'Recuperação leve (PSE 3)',
        notes: '',
      },
    };
    updateStudent(selectedStudent.id, (stu) => ({
      ...stu,
      workoutPlan: {
        ...stu.workoutPlan,
        sessions: [...(stu.workoutPlan?.sessions || []), newSession],
      },
    }));
    setSelectedSessionId(newId);
  };

  const handleAddExerciseToSession = () => {
    const exId = exerciseToAddId || filteredCatalog[0]?.id;
    if (!exId || !activeSession) return;
    const newItem = {
      id: `w_item_${Date.now()}`,
      exerciseId: exId,
      workSets: 3,
      repRange: '8 a 12',
      targetRir: 'RIR 1',
      restSeconds: 90,
      technique: 'Série Normal',
      notes: '',
      setsDetail: [
        { setNumber: 1, type: 'S', label: 'Trabalho', lastWeightKg: 20, lastReps: 10, completed: false },
        { setNumber: 2, type: 'S', label: 'Trabalho', lastWeightKg: 20, lastReps: 10, completed: false },
        { setNumber: 3, type: 'S', label: 'Trabalho', lastWeightKg: 20, lastReps: 10, completed: false },
      ],
    };
    updateActiveSession((s) => ({
      ...s,
      exercises: [...(s.exercises || []), newItem],
    }));
  };

  const handleRemoveExercise = (itemId) => {
    updateActiveSession((s) => ({
      ...s,
      exercises: (s.exercises || []).filter((i) => i.id !== itemId),
    }));
  };

  const handleUpdateExerciseItem = (itemId, partial) => {
    updateActiveSession((s) => ({
      ...s,
      exercises: (s.exercises || []).map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, ...partial };
        // Se alterou workSets, ajusta setsDetail automaticamente mantendo dados anteriores
        if (partial.workSets !== undefined) {
          const targetCount = Math.max(1, Math.min(8, Number(partial.workSets) || 3));
          const currentSets = [...(item.setsDetail || [])];
          while (currentSets.length < targetCount) {
            const last = currentSets[currentSets.length - 1] || {
              lastWeightKg: 20,
              lastReps: 10,
            };
            currentSets.push({
              setNumber: currentSets.length + 1,
              type: 'S',
              label: 'Trabalho',
              lastWeightKg: last.lastWeightKg,
              lastReps: last.lastReps,
              completed: false,
            });
          }
          updated.setsDetail = currentSets.slice(0, targetCount);
        }
        return updated;
      }),
    }));
  };

  const handleUpdateCardio = (partial) => {
    updateActiveSession((s) => ({
      ...s,
      cardioPrescription: {
        ...(s.cardioPrescription || {}),
        ...partial,
      },
    }));
  };

  // Cálculo de gasto calórico da sessão atual (Resistido + Cardio)
  const resistanceSessionKcal = activeSession
    ? calcMetsSessionKcal({
        met: activeSession.resistanceMet || 5.5,
        weightKg: selectedStudent.weightKg,
        durationMin: activeSession.estimatedResistanceMinutes || 50,
      })
    : 0;

  const activeCardio = activeSession?.cardioPrescription || {};
  const activeCardioModality =
    cardioModalities.find((m) => m.id === activeCardio.modalityId) || cardioModalities[0];

  const acsmCardioRes = calcACSMCardioKcal({
    speedKmh: activeCardio.speedKmh || activeCardioModality.defaultSpeedKmh || 8,
    inclinePercent: activeCardio.inclinePct || 1,
    weightKg: selectedStudent.weightKg,
    durationMin: activeCardio.durationMin || 20,
  });

  const cardioSessionKcal = !activeCardio.enabled
    ? 0
    : activeCardioModality?.supportsACSM && Number(activeCardio.speedKmh) > 0
    ? acsmCardioRes.totalKcal
    : calcMetsSessionKcal({
        met: activeCardioModality?.defaultMet || 7.5,
        weightKg: selectedStudent.weightKg,
        durationMin: activeCardio.durationMin || 20,
      });

  const syncWorkoutKcalWithNutrition = () => {
    updateStudent(selectedStudent.id, (stu) => ({
      ...stu,
      energyConfig: {
        ...(stu.energyConfig || {}),
        resistanceKcal: resistanceSessionKcal,
        cardioKcal: cardioSessionKcal,
      },
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* COLUNA PRINCIPAL (8 cols): Construtor de Treino Resistido + Aeróbio */}
      <div className="lg:col-span-8 space-y-6">
        {/* Seletor de Divisões de Treino (A, B, C...) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    sess.id === activeSession?.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {sess.code}: {sess.title.slice(0, 26)}
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddDivision}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700"
              >
                + Nova Divisão
              </button>
            </div>

            <button
              type="button"
              onClick={syncWorkoutKcalWithNutrition}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
              title="Envia o gasto calórico desta sessão (Musculação + Cardio) para a calculadora de GET da Dieta"
            >
              ⚡ Sincronizar Gasto ({resistanceSessionKcal + cardioSessionKcal} kcal) com Dieta
            </button>
          </div>

          {activeSession && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase text-slate-400 font-semibold mb-1">
                  Título da Sessão ({activeSession.code})
                </label>
                <input
                  type="text"
                  value={activeSession.title}
                  onChange={(e) => updateActiveSession({ title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-slate-400 font-semibold mb-1">
                  Frequência na Semana
                </label>
                <select
                  value={activeSession.weeklyFrequency || 1}
                  onChange={(e) =>
                    updateActiveSession({ weeklyFrequency: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={1}>1x por semana</option>
                  <option value={2}>2x por semana</option>
                  <option value={3}>3x por semana</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-slate-400 font-semibold mb-1">
                  Duração Musculação (min)
                </label>
                <input
                  type="number"
                  value={activeSession.estimatedResistanceMinutes || 50}
                  onChange={(e) =>
                    updateActiveSession({
                      estimatedResistanceMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Barra de Adição Rápida de Exercício Resistido */}
        {activeSession && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Adicionar Exercício do Repertório ao {activeSession.code}
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={muscleFilter}
                onChange={(e) => {
                  setMuscleFilter(e.target.value);
                  const nextList =
                    e.target.value === 'TODOS'
                      ? exercisesCatalog
                      : exercisesCatalog.filter((ex) => ex.primaryMuscle === e.target.value);
                  if (nextList[0]) setExerciseToAddId(nextList[0].id);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white sm:w-48"
              >
                <option value="TODOS">Todos os Músculos</option>
                {MUSCLE_GROUPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={exerciseToAddId}
                onChange={(e) => setExerciseToAddId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                {filteredCatalog.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    [{ex.primaryMuscle}] {ex.name} ({ex.equipment})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddExerciseToSession}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white whitespace-nowrap"
              >
                + Incluir no Treino
              </button>
            </div>
          </div>
        )}

        {/* Lista de Exercícios Resistidos Prescritos na Sessão */}
        {activeSession && (
          <div className="space-y-3">
            {(activeSession.exercises || []).map((item, idx) => {
              const exInfo = exerciseMap.get(item.exerciseId);
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-white">
                          {exInfo?.name || 'Exercício'}
                        </h5>
                        <p className="text-[11px] text-slate-400">
                          Alvo Principal:{' '}
                          <strong className="text-indigo-300">{exInfo?.primaryMuscle}</strong>
                          {exInfo?.secondaryMuscles?.length > 0 &&
                            ` • Sinergistas: ${exInfo.secondaryMuscles.join(', ')}`}{' '}
                          • Equipamento: {exInfo?.equipment}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(item.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                    >
                      Remover
                    </button>
                  </div>

                  {/* Parâmetros de Prescrição */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Séries Válidas
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={item.workSets}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, { workSets: Number(e.target.value) })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Faixa de Reps
                      </label>
                      <input
                        type="text"
                        value={item.repRange}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, { repRange: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Intensidade (RIR/PSE)
                      </label>
                      <input
                        type="text"
                        value={item.targetRir}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, { targetRir: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Descanso (seg)
                      </label>
                      <input
                        type="number"
                        step={15}
                        value={item.restSeconds}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, {
                            restSeconds: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] uppercase text-slate-400 font-semibold mb-1">
                        Método / Técnica
                      </label>
                      <select
                        value={item.technique}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, { technique: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        <option value="Série Normal">Série Normal</option>
                        <option value="Top Set + Back-off">Top Set + Back-off</option>
                        <option value="Drop-set na última série">Drop-set na última</option>
                        <option value="Rest-Pause na última série">Rest-Pause</option>
                        <option value="Bi-set c/ próximo">Bi-set</option>
                        <option value="Pico de Contração 1s">Pico de Contração</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.notes || ''}
                      placeholder="Observação biomecânica para o aluno (ex: Cotovelos a 45°, segurar 1s no pico)..."
                      onChange={(e) => handleUpdateExerciseItem(item.id, { notes: e.target.value })}
                      className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BLOCO DE TREINAMENTO AERÓBIO MULTI-MODALIDADES (Contínuo & Intervalado HIIT) */}
        {activeSession && (
          <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(activeCardio.enabled)}
                  onChange={(e) => handleUpdateCardio({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Prescrição de Treinamento Aeróbio ({activeSession.code})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Suporte a Corrida, Caminhada Inclinada, Bike, Escada, Remo, Elíptico, Natação e HIIT
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Gasto Estimado Cardio: {cardioSessionKcal} kcal
              </span>
            </div>

            {activeCardio.enabled && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Modalidade Aeróbia</label>
                    <select
                      value={activeCardio.modalityId}
                      onChange={(e) => handleUpdateCardio({ modalityId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {cardioModalities.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.name} (~{mod.defaultMet} METs)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Método de Treino</label>
                    <select
                      value={activeCardio.method}
                      onChange={(e) => handleUpdateCardio({ method: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="steady">Contínuo Estável (LISS / MISS)</option>
                      <option value="interval">Intervalado (HIIT / Tiros / Fartlek)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Duração Total (minutos)
                    </label>
                    <input
                      type="number"
                      value={activeCardio.durationMin}
                      onChange={(e) =>
                        handleUpdateCardio({ durationMin: Number(e.target.value) })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Parâmetros específicos (Velocidade/Inclinação ACSM + Zona de FC) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Zona de FC Alvo (Karvonen)
                    </label>
                    <select
                      value={activeCardio.targetZone || 'Z2'}
                      onChange={(e) => handleUpdateCardio({ targetZone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {hrZonesData.zones.map((z) => (
                        <option key={z.zone} value={z.zone}>
                          {z.zone} ({z.minBpm}-{z.maxBpm} bpm) — {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeCardioModality?.supportsACSM && (
                    <>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Velocidade Alvo (km/h) — Pace: {acsmCardioRes.paceFormatted}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={activeCardio.speedKmh || 0}
                          onChange={(e) =>
                            handleUpdateCardio({ speedKmh: Number(e.target.value) })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Inclinação da Esteira (%) — VO2 ACSM: {acsmCardioRes.vo2MlKgMin} ml/kg/min
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={activeCardio.inclinePct || 0}
                          onChange={(e) =>
                            handleUpdateCardio({ inclinePct: Number(e.target.value) })
                          }
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Bloco Intervalado (HIIT / Tiros) */}
                {activeCardio.method === 'interval' && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-sky-300 font-bold mb-1">
                        Nº de Tiros / Séries
                      </label>
                      <input
                        type="number"
                        value={activeCardio.intervalsCount || 8}
                        onChange={(e) =>
                          handleUpdateCardio({ intervalsCount: Number(e.target.value) })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-rose-300 font-bold mb-1">
                        Estímulo Forte (segundos)
                      </label>
                      <input
                        type="number"
                        step={5}
                        value={activeCardio.workSeconds || 30}
                        onChange={(e) =>
                          handleUpdateCardio({ workSeconds: Number(e.target.value) })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-emerald-300 font-bold mb-1">
                        Recuperação Ativa (segundos)
                      </label>
                      <input
                        type="number"
                        step={5}
                        value={activeCardio.restSeconds || 60}
                        onChange={(e) =>
                          handleUpdateCardio({ restSeconds: Number(e.target.value) })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={activeCardio.workIntensityDesc || ''}
                        placeholder="Instrução do Tiro (ex: 14 km/h ou PSE 9)"
                        onChange={(e) =>
                          handleUpdateCardio({ workIntensityDesc: e.target.value })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={activeCardio.restIntensityDesc || ''}
                        placeholder="Instrução da Recuperação (ex: Caminhada a 5.5 km/h)"
                        onChange={(e) =>
                          handleUpdateCardio({ restIntensityDesc: e.target.value })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={activeCardio.notes || ''}
                  placeholder="Observações do cardio para o aluno..."
                  onChange={(e) => handleUpdateCardio({ notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* COLUNA LATERAL (4 cols): Auditoria de Volume Semanal + Zonas de FC */}
      <div className="lg:col-span-4 space-y-6">
        {/* Auditoria de Volume Semanal por Músculo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white">
              Auditoria de Volume Semanal (Séries Válidas)
            </h4>
            <p className="text-xs text-slate-400">
              Soma automática de todas as divisões (Músculo Primário = 1.0 • Sinergista = 0.5). Faixa
              ótima de hipertrofia: <strong>10 a 20 séries/sem</strong>.
            </p>
          </div>

          <div className="space-y-2.5">
            {weeklyVolume.map((row) => {
              const pct = Math.min(100, Math.round((row.total / 22) * 100));
              const barColor =
                row.total >= 10 && row.total <= 20
                  ? 'bg-emerald-500'
                  : row.total > 20
                  ? 'bg-rose-500'
                  : 'bg-indigo-500';
              return (
                <div key={row.muscle} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{row.muscle}</span>
                    <span className="text-slate-400">
                      <strong className="text-white">{row.total} séries</strong> ({row.direct} dir +{' '}
                      {row.indirect} ind)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zonas de Frequência Cardíaca Calculadas do Aluno */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Zonas de FC (Tanaka + Karvonen)</h4>
            <span className="text-xs font-bold text-sky-400">
              FCmáx: {hrZonesData.maxHr} bpm
            </span>
          </div>
          <div className="space-y-2">
            {hrZonesData.zones.map((z) => (
              <div
                key={z.zone}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className={`font-extrabold ${z.color}`}>{z.zone}</span>{' '}
                  <span className="text-slate-300 font-medium">{z.name}</span>
                </div>
                <span className="font-bold text-white whitespace-nowrap">
                  {z.minBpm}–{z.maxBpm} bpm
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
