/**
 * MÓDULO CORE: Fórmulas de Fisiologia do Exercício, Gasto de Treino, 1RM, Zonas de FC e Auditoria de Volume
 */

/**
 * Equação Universal de METs (Compêndio de Atividades Físicas - Ainsworth):
 * kcal/min = (MET * 3.5 * PesoKg) / 200
 */
export function calcMetsSessionKcal({ met = 5.0, weightKg = 70, durationMin = 50 }) {
  const kcalPerMin = (Number(met) * 3.5 * Number(weightKg)) / 200;
  return Math.round(kcalPerMin * Number(durationMin));
}

/**
 * Equações Metabólicas do ACSM (American College of Sports Medicine)
 * Caminhada (<= 6.4 km/h): VO2 = (0.1 * S) + (1.8 * S * G) + 3.5
 * Corrida (> 6.4 km/h):    VO2 = (0.2 * S) + (0.9 * S * G) + 3.5
 * Onde S = velocidade em m/min (km/h * 16.6667) e G = inclinação em decimal (ex: 5% = 0.05)
 */
export function calcACSMCardioKcal({
  speedKmh = 9.0,
  inclinePercent = 1.0,
  weightKg = 70,
  durationMin = 30,
}) {
  const v = Number(speedKmh) || 0;
  const G = (Number(inclinePercent) || 0) / 100;
  const S = v * 16.6667; // m/min
  const isRunning = v > 6.4;

  const vo2MlKgMin = isRunning
    ? 0.2 * S + 0.9 * S * G + 3.5
    : 0.1 * S + 1.8 * S * G + 3.5;

  // 1 L O2 consumido ~= 5 kcal
  const kcalPerMin = ((vo2MlKgMin * Number(weightKg)) / 1000) * 5;
  const totalKcal = Math.round(kcalPerMin * Number(durationMin));
  const paceMinKm = v > 0 ? 60 / v : 0;
  const paceMinutes = Math.floor(paceMinKm);
  const paceSeconds = Math.round((paceMinKm - paceMinutes) * 60);

  return {
    isRunning,
    vo2MlKgMin: Number(vo2MlKgMin.toFixed(1)),
    equivalentMet: Number((vo2MlKgMin / 3.5).toFixed(1)),
    totalKcal,
    paceFormatted:
      v > 0 ? `${paceMinutes}:${String(paceSeconds).padStart(2, '0')} /km` : '--',
  };
}

/**
 * Estimativa de 1 Repetição Máxima (1RM) - Epley e Brzycki
 */
export function calcOneRepMax({ weightKg = 80, reps = 8 }) {
  const w = Number(weightKg) || 0;
  const r = Math.max(1, Math.min(30, Number(reps) || 1));
  if (w <= 0) return { epley: 0, brzycki: 0, average: 0 };
  if (r === 1) return { epley: w, brzycki: w, average: w };

  const epley = w * (1 + r / 30);
  const brzycki = w / (1.0278 - 0.0278 * r);
  const average = (epley + brzycki) / 2;

  return {
    epley: Number(epley.toFixed(1)),
    brzycki: Number(brzycki.toFixed(1)),
    average: Number(average.toFixed(1)),
  };
}

/**
 * Zonas de Frequência Cardíaca (Tanaka 2001 + Reserva Cardíaca de Karvonen)
 */
export function calcHeartRateZones({ age = 30, restingHr = 62 }) {
  const maxHr = Math.round(208 - 0.7 * Number(age));
  const rHr = Number(restingHr) || 60;
  const reserve = Math.max(40, maxHr - rHr);

  const calcKarvonen = (pct) => Math.round(reserve * pct + rHr);

  return {
    maxHr,
    restingHr: rHr,
    zones: [
      {
        zone: 'Z1',
        name: 'Recuperação Ativa',
        intensityPct: '50% - 60%',
        minBpm: calcKarvonen(0.5),
        maxBpm: calcKarvonen(0.6),
        color: 'text-sky-400',
      },
      {
        zone: 'Z2',
        name: 'Base Aeróbia / Oxidação Lipídica (LISS)',
        intensityPct: '60% - 70%',
        minBpm: calcKarvonen(0.6),
        maxBpm: calcKarvonen(0.7),
        color: 'text-emerald-400',
      },
      {
        zone: 'Z3',
        name: 'Aeróbio Moderado / Tempo (MISS)',
        intensityPct: '70% - 80%',
        minBpm: calcKarvonen(0.7),
        maxBpm: calcKarvonen(0.8),
        color: 'text-amber-400',
      },
      {
        zone: 'Z4',
        name: 'Limiar Anaeróbio / Forte',
        intensityPct: '80% - 90%',
        minBpm: calcKarvonen(0.8),
        maxBpm: calcKarvonen(0.9),
        color: 'text-orange-400',
      },
      {
        zone: 'Z5',
        name: 'Esforço Máximo / VO2máx (HIIT/Tiros)',
        intensityPct: '90% - 100%',
        minBpm: calcKarvonen(0.9),
        maxBpm: maxHr,
        color: 'text-rose-400',
      },
    ],
  };
}

/**
 * Auditoria Automática de Volume Semanal por Grupo Muscular
 * Soma séries de trabalho válidas (ignora séries de aquecimento 'W' e reconhecimento 'F').
 * Músculo Primário = 1.0 série por série válida
 * Músculo Sinergista/Secundário = 0.5 série por série válida
 */
export function calcWeeklyMuscleVolume(sessions = [], exercisesCatalog = []) {
  const exerciseMap = new Map(exercisesCatalog.map((ex) => [ex.id, ex]));
  const volumeByMuscle = {};

  sessions.forEach((session) => {
    const freqMultiplier = Number(session.weeklyFrequency) || 1;
    (session.exercises || []).forEach((item) => {
      const ex = exerciseMap.get(item.exerciseId);
      if (!ex) return;

      // Conta apenas séries válidas de trabalho (Working Sets, Top Sets, Back-off Sets)
      const validSetsCount = Array.isArray(item.setsDetail)
        ? item.setsDetail.filter((s) => s.type !== 'W' && s.type !== 'F').length
        : Number(item.workSets) || 0;

      const effectiveSets = validSetsCount * freqMultiplier;
      if (effectiveSets <= 0) return;

      const primary = ex.primaryMuscle;
      if (primary) {
        if (!volumeByMuscle[primary]) {
          volumeByMuscle[primary] = { direct: 0, indirect: 0, total: 0 };
        }
        volumeByMuscle[primary].direct += effectiveSets;
        volumeByMuscle[primary].total += effectiveSets;
      }

      (ex.secondaryMuscles || []).forEach((sec) => {
        if (!volumeByMuscle[sec]) {
          volumeByMuscle[sec] = { direct: 0, indirect: 0, total: 0 };
        }
        volumeByMuscle[sec].indirect += effectiveSets * 0.5;
        volumeByMuscle[sec].total += effectiveSets * 0.5;
      });
    });
  });

  return Object.entries(volumeByMuscle)
    .map(([muscle, data]) => ({
      muscle,
      direct: Number(data.direct.toFixed(1)),
      indirect: Number(data.indirect.toFixed(1)),
      total: Number(data.total.toFixed(1)),
    }))
    .sort((a, b) => b.total - a.total);
}
