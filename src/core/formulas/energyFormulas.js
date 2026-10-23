/**
 * MÓDULO CORE: Fórmulas de Taxa Metabólica Basal (TMB) e Gasto Energético Total (GET)
 * Todas as equações são funções puras e modulares.
 */

export function calcMifflinStJeor({ sex = 'M', weightKg = 70, heightCm = 175, age = 30 }) {
  const base = 10 * Number(weightKg) + 6.25 * Number(heightCm) - 5 * Number(age);
  return Math.round(sex === 'M' ? base + 5 : base - 161);
}

export function calcHarrisBenedictOriginal({ sex = 'M', weightKg = 70, heightCm = 175, age = 30 }) {
  if (sex === 'M') {
    return Math.round(
      66.473 + 13.7516 * Number(weightKg) + 5.0033 * Number(heightCm) - 6.755 * Number(age)
    );
  }
  return Math.round(
    655.0955 + 9.5634 * Number(weightKg) + 1.8496 * Number(heightCm) - 4.6756 * Number(age)
  );
}

export function calcHarrisBenedictRevised({ sex = 'M', weightKg = 70, heightCm = 175, age = 30 }) {
  if (sex === 'M') {
    return Math.round(
      88.362 + 13.397 * Number(weightKg) + 4.799 * Number(heightCm) - 5.677 * Number(age)
    );
  }
  return Math.round(
    447.593 + 9.247 * Number(weightKg) + 3.098 * Number(heightCm) - 4.33 * Number(age)
  );
}

export function calcCunningham1980({ leanMassKg = 58 }) {
  return Math.round(500 + 22 * Number(leanMassKg));
}

export function calcKatchMcArdle1991({ leanMassKg = 58 }) {
  return Math.round(370 + 21.6 * Number(leanMassKg));
}

export function calcTinsleyTotalWeight({ weightKg = 70 }) {
  return Math.round(24.8 * Number(weightKg) + 10);
}

export function calcTinsleyLeanMass({ leanMassKg = 58 }) {
  return Math.round(25.9 * Number(leanMassKg) + 284);
}

export function calcFaoWho({ sex = 'M', weightKg = 70, age = 30 }) {
  const w = Number(weightKg);
  const a = Number(age);
  if (sex === 'M') {
    if (a < 30) return Math.round(15.057 * w + 692.2);
    if (a < 60) return Math.round(11.472 * w + 873.1);
    return Math.round(11.711 * w + 587.7);
  }
  if (a < 30) return Math.round(14.818 * w + 486.6);
  if (a < 60) return Math.round(8.126 * w + 845.6);
  return Math.round(9.082 * w + 658.5);
}

export function calcPocketKcalPerKg({ weightKg = 70, kcalPerKg = 30 }) {
  return Math.round(Number(weightKg) * Number(kcalPerKg));
}

/**
 * Retorna um comparativo de todas as equações de TMB simultaneamente
 */
export function calculateAllBMRFormulas({
  sex = 'M',
  weightKg = 70,
  heightCm = 175,
  age = 30,
  leanMassKg = 58,
}) {
  return [
    {
      id: 'mifflin',
      name: 'Mifflin-St Jeor (1990)',
      badge: 'Geral / Sobrepeso',
      description: 'Padrão-ouro para população geral, emagrecimento e sobrepeso.',
      kcal: calcMifflinStJeor({ sex, weightKg, heightCm, age }),
    },
    {
      id: 'cunningham1980',
      name: 'Cunningham (1980)',
      badge: 'Atletas / Avançados (MLG)',
      description: 'Baseada em Massa Livre de Gordura (500 + 22 × MLG). Ideal para hipertrofia avançada.',
      kcal: calcCunningham1980({ leanMassKg }),
    },
    {
      id: 'tinsley_ffm',
      name: 'Tinsley et al. (2018) - por MLG',
      badge: 'Musculação (MLG)',
      description: 'Específica para fisiculturistas e praticantes de força usando Massa Livre de Gordura.',
      kcal: calcTinsleyLeanMass({ leanMassKg }),
    },
    {
      id: 'tinsley_weight',
      name: 'Tinsley et al. (2018) - Peso Total',
      badge: 'Musculação (Peso Total)',
      description: 'Específica para praticantes de musculação quando não há % de gordura.',
      kcal: calcTinsleyTotalWeight({ weightKg }),
    },
    {
      id: 'katch_mcardle',
      name: 'Katch-McArdle / Cunningham (1991)',
      badge: 'Treinados (MLG)',
      description: 'Equação clássica baseada em Massa Livre de Gordura (370 + 21,6 × MLG).',
      kcal: calcKatchMcArdle1991({ leanMassKg }),
    },
    {
      id: 'harris_original',
      name: 'Harris-Benedict (1919)',
      badge: 'Eutróficos Ativos',
      description: 'Equação clássica tradicional para indivíduos eutróficos fisicamente ativos.',
      kcal: calcHarrisBenedictOriginal({ sex, weightKg, heightCm, age }),
    },
    {
      id: 'harris_revised',
      name: 'Harris-Benedict Revisada (Roza & Shizgal)',
      badge: 'Revisada 1984',
      description: 'Versão recalibrada da equação de Harris-Benedict.',
      kcal: calcHarrisBenedictRevised({ sex, weightKg, heightCm, age }),
    },
    {
      id: 'fao_who',
      name: 'FAO / OMS / UNU (2001)',
      badge: 'Clínica / Faixa Etária',
      description: 'Equação estratificada por faixa etária e sexo biológico.',
      kcal: calcFaoWho({ sex, weightKg, age }),
    },
  ];
}

export const ACTIVITY_FACTORS_FAF = [
  { id: 'sedentary', label: 'Sedentário (1.20)', value: 1.2, desc: 'Pouco ou nenhum exercício' },
  { id: 'light', label: 'Levemente Ativo (1.375)', value: 1.375, desc: 'Treino leve 1 a 3 dias/sem' },
  { id: 'moderate', label: 'Moderadamente Ativo (1.55)', value: 1.55, desc: 'Treino moderado 3 a 5 dias/sem' },
  { id: 'very_active', label: 'Muito Ativo (1.725)', value: 1.725, desc: 'Treino intenso 6 a 7 dias/sem' },
  { id: 'extreme', label: 'Extremamente Ativo (1.90)', value: 1.9, desc: 'Treino pesado + rotina física ou 2x/dia' },
];

export const NEAT_OCCUPATIONAL_FACTORS = [
  { id: 'desk', label: 'Trabalho Sentado / Home Office (1.20)', value: 1.2, stepsHint: '< 4.500 passos/dia' },
  { id: 'standing', label: 'Deslocamento Moderado / Em Pé (1.32)', value: 1.32, stepsHint: '5.000 a 8.000 passos/dia' },
  { id: 'active_job', label: 'Rotina Ativa / Andando Muito (1.45)', value: 1.45, stepsHint: '8.500 a 12.000 passos/dia' },
  { id: 'heavy_labor', label: 'Trabalho Braçal / Intenso (1.60)', value: 1.6, stepsHint: '> 12.000 passos/dia' },
];

/**
 * Calcula o Gasto Energético Total (GET) em Dia de Treino e Dia de Descanso
 */
export function calculateTotalDailyEnergyExpenditure({
  bmr = 1700,
  mode = 'integrated', // 'classic' | 'integrated'
  faf = 1.55,
  neatFactor = 1.25,
  resistanceKcal = 280,
  cardioKcal = 220,
  includeTEF = true, // Efeito Térmico dos Alimentos (~8%)
}) {
  const cleanBmr = Number(bmr) || 0;

  if (mode === 'classic') {
    const tdee = Math.round(cleanBmr * Number(faf));
    return {
      mode: 'classic',
      bmr: cleanBmr,
      neatKcal: Math.round(tdee - cleanBmr),
      workoutKcal: 0,
      tefKcal: 0,
      trainingDayTDEE: tdee,
      restDayTDEE: Math.round(cleanBmr * Math.max(1.2, Number(faf) - 0.15)),
    };
  }

  // Modo Integrado (Educação Física + Nutrição):
  // Separa o gasto basal + NEAT ocupacional do gasto específico da sessão de musculação e cardio
  const baseWithNeat = cleanBmr * Number(neatFactor);
  const neatOnly = Math.round(baseWithNeat - cleanBmr);
  const workoutTotal = Math.round((Number(resistanceKcal) || 0) + (Number(cardioKcal) || 0));

  const rawTrainingDay = baseWithNeat + workoutTotal;
  const rawRestDay = baseWithNeat;

  const tefTraining = includeTEF ? Math.round(rawTrainingDay * 0.08) : 0;
  const tefRest = includeTEF ? Math.round(rawRestDay * 0.08) : 0;

  return {
    mode: 'integrated',
    bmr: cleanBmr,
    neatKcal: neatOnly,
    resistanceKcal: Math.round(Number(resistanceKcal) || 0),
    cardioKcal: Math.round(Number(cardioKcal) || 0),
    workoutKcal: workoutTotal,
    tefKcal: tefTraining,
    trainingDayTDEE: Math.round(rawTrainingDay + tefTraining),
    restDayTDEE: Math.round(rawRestDay + tefRest),
  };
}
