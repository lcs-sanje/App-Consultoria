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
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    sess.id === activeSession?.id
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {sess.code}: {sess.title.slice(0, 24)}
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddDivision}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-clay-100 hover:bg-clay-200 text-clay-900 border border-clay-300"
              >
                + Nova Divisão
              </button>
            </div>

            <button
              type="button"
              onClick={syncWorkoutKcalWithNutrition}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sage-100 text-sage-900 border border-sage-300 hover:bg-sage-200"
              title="Envia o gasto calórico desta sessão (Musculação + Cardio) para a calculadora de GET da Dieta"
            >
              Sincronizar Gasto ({resistanceSessionKcal + cardioSessionKcal} kcal) com Dieta
            </button>
          </div>

          {activeSession && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-200">
              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase text-stone-500 font-bold mb-1">
                  Título da Sessão ({activeSession.code})
                </label>
                <input
                  type="text"
                  value={activeSession.title}
                  onChange={(e) => updateActiveSession({ title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase text-stone-500 font-bold mb-1">
                  Frequência na Semana
                </label>
                <select
                  value={activeSession.weeklyFrequency || 1}
                  onChange={(e) =>
                    updateActiveSession({ weeklyFrequency: Number(e.target.value) })
                  }
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                >
                  <option value={1}>1x por semana</option>
                  <option value={2}>2x por semana</option>
                  <option value={3}>3x por semana</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase text-stone-500 font-bold mb-1">
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Barra de Adição Rápida de Exercício Resistido */}
        {activeSession && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-clay-800">
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
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 sm:w-48"
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
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
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
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white whitespace-nowrap shadow-sm"
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
                  className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 shrink-0 rounded-lg bg-sage-100 border border-sage-300 text-sage-800 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="text-sm font-extrabold text-stone-900 truncate">
                          {exInfo?.name || 'Exercício'}
                        </h5>
                        <p className="text-[11px] text-stone-500">
                          Alvo Principal:{' '}
                          <strong className="text-sage-800">{exInfo?.primaryMuscle}</strong>
                          {exInfo?.secondaryMuscles?.length > 0 &&
                            ` • Sinergistas: ${exInfo.secondaryMuscles.join(', ')}`}{' '}
                          • Equipamento: {exInfo?.equipment}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(item.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F6E6E2] text-[#7D3527] hover:bg-[#EBD2CC]"
                    >
                      Remover
                    </button>
                  </div>

                  {/* Parâmetros de Prescrição */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">
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
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">
                        Faixa de Reps
                      </label>
                      <input
                        type="text"
                        value={item.repRange}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, { repRange: e.target.value })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">
                        Intensidade (RIR/PSE)
                      </label>
                      <input
                        type="text"
                        value={item.targetRir}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, { targetRir: e.target.value })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">
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
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">
                        Método / Técnica
                      </label>
                      <select
                        value={item.technique}
                        onChange={(e) =>
                          handleUpdateExerciseItem(item.id, { technique: e.target.value })
                        }
                        className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-xs text-stone-900"
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
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BLOCO DE TREINAMENTO AERÓBIO MULTI-MODALIDADES (Contínuo & Intervalado HIIT) */}
        {activeSession && (
          <div className="bg-white border border-clay-300 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(activeCardio.enabled)}
                  onChange={(e) => handleUpdateCardio({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <h4 className="text-sm font-extrabold text-stone-900">
                    Prescrição de Treinamento Aeróbio ({activeSession.code})
                  </h4>
                  <p className="text-xs text-stone-500">
                    Suporte a Corrida, Caminhada Inclinada, Bike, Escada, Remo, Elíptico, Natação e HIIT
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-clay-100 text-clay-900 border border-clay-300">
                Gasto Estimado Cardio: {cardioSessionKcal} kcal
              </span>
            </div>

            {activeCardio.enabled && (
              <div className="space-y-4 pt-3 border-t border-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Modalidade Aeróbia
                    </label>
                    <select
                      value={activeCardio.modalityId}
                      onChange={(e) => handleUpdateCardio({ modalityId: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    >
                      {cardioModalities.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.name} (~{mod.defaultMet} METs)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Método de Treino
                    </label>
                    <select
                      value={activeCardio.method}
                      onChange={(e) => handleUpdateCardio({ method: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    >
                      <option value="steady">Contínuo Estável (LISS / MISS)</option>
                      <option value="interval">Intervalado (HIIT / Tiros / Fartlek)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Duração Total (minutos)
                    </label>
                    <input
                      type="number"
                      value={activeCardio.durationMin}
                      onChange={(e) =>
                        handleUpdateCardio({ durationMin: Number(e.target.value) })
                      }
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                </div>

                {/* Parâmetros específicos (Velocidade/Inclinação ACSM + Zona de FC) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Zona de FC Alvo (Karvonen)
                    </label>
                    <select
                      value={activeCardio.targetZone || 'Z2'}
                      onChange={(e) => handleUpdateCardio({ targetZone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
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
                        <label className="block text-xs font-semibold text-stone-600 mb-1">
                          Velocidade (km/h) • Pace: {acsmCardioRes.paceFormatted}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={activeCardio.speedKmh || 0}
                          onChange={(e) =>
                            handleUpdateCardio({ speedKmh: Number(e.target.value) })
                          }
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-600 mb-1">
                          Inclinação (%) • VO2: {acsmCardioRes.vo2MlKgMin}
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={activeCardio.inclinePct || 0}
                          onChange={(e) =>
                            handleUpdateCardio({ inclinePct: Number(e.target.value) })
                          }
                          className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Bloco Intervalado (HIIT / Tiros) */}
                {activeCardio.method === 'interval' && (
                  <div className="p-3.5 rounded-xl bg-clay-50 border border-clay-300 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-clay-800 font-bold mb-1">
                        Nº de Tiros / Séries
                      </label>
                      <input
                        type="number"
                        value={activeCardio.intervalsCount || 8}
                        onChange={(e) =>
                          handleUpdateCardio({ intervalsCount: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#7D3527] font-bold mb-1">
                        Estímulo Forte (segundos)
                      </label>
                      <input
                        type="number"
                        step={5}
                        value={activeCardio.workSeconds || 30}
                        onChange={(e) =>
                          handleUpdateCardio({ workSeconds: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-sage-800 font-bold mb-1">
                        Recuperação Ativa (segundos)
                      </label>
                      <input
                        type="number"
                        step={5}
                        value={activeCardio.restSeconds || 60}
                        onChange={(e) =>
                          handleUpdateCardio({ restSeconds: Number(e.target.value) })
                        }
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
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
                        className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900"
                      />
                      <input
                        type="text"
                        value={activeCardio.restIntensityDesc || ''}
                        placeholder="Instrução da Recuperação (ex: Caminhada a 5.5 km/h)"
                        onChange={(e) =>
                          handleUpdateCardio({ restIntensityDesc: e.target.value })
                        }
                        className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-stone-900"
                      />
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  value={activeCardio.notes || ''}
                  placeholder="Observações do cardio para o aluno..."
                  onChange={(e) => handleUpdateCardio({ notes: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* COLUNA LATERAL (4 cols): Auditoria de Volume Semanal + Zonas de FC */}
      <div className="lg:col-span-4 space-y-6">
        {/* Auditoria de Volume Semanal por Músculo */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h4 className="text-sm font-extrabold text-stone-900">
              Auditoria de Volume Semanal (Séries Válidas)
            </h4>
            <p className="text-xs text-stone-500">
              Soma automática de todas as divisões (Primário = 1.0 • Sinergista = 0.5). Faixa ótima:{' '}
              <strong>10 a 20 séries/sem</strong>.
            </p>
          </div>

          <div className="space-y-2.5">
            {weeklyVolume.map((row) => {
              const pct = Math.min(100, Math.round((row.total / 22) * 100));
              const barColor =
                row.total >= 10 && row.total <= 20
                  ? 'bg-sage-600'
                  : row.total > 20
                  ? 'bg-clay-700'
                  : 'bg-stone-500';
              return (
                <div key={row.muscle} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-stone-800">{row.muscle}</span>
                    <span className="text-stone-500 whitespace-nowrap">
                      <strong className="text-stone-900">{row.total} séries</strong> ({row.direct}{' '}
                      dir + {row.indirect} ind)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zonas de Frequência Cardíaca Calculadas do Aluno */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold text-stone-900">Zonas de FC (Tanaka + Karvonen)</h4>
            <span className="text-xs font-bold text-clay-800 whitespace-nowrap">
              FCmáx: {hrZonesData.maxHr} bpm
            </span>
          </div>
          <div className="space-y-2">
            {hrZonesData.zones.map((z) => (
              <div
                key={z.zone}
                className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-black text-sage-800">{z.zone}</span>{' '}
                  <span className="text-stone-700 font-medium">{z.name}</span>
                </div>
                <span className="font-bold text-stone-900 whitespace-nowrap">
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
