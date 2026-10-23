/**
 * MÓDULO CORE: Fórmulas de Composição Corporal e Antropometria
 * Totalmente desacoplado da interface (Funções Puras).
 */

/**
 * Equação de Siri (1961): Converte Densidade Corporal (g/cm³) em % de Gordura
 */
export function calcSiriBodyFat(bodyDensity) {
  if (!bodyDensity || bodyDensity <= 0) return 0;
  const bf = (495 / bodyDensity) - 450;
  return Math.max(2, Math.min(65, Number(bf.toFixed(1))));
}

/**
 * Protocolo de Jackson & Pollock - 3 Dobras Cutâneas (mm)
 * Homens: Peitoral, Abdominal, Coxa
 * Mulheres: Tríceps, Supra-ilíaca, Coxa
 */
export function calcPollock3({
  sex = 'M',
  age = 30,
  pectoral = 0,
  abdominal = 0,
  thigh = 0,
  triceps = 0,
  suprailiac = 0,
}) {
  const sum3 =
    sex === 'M'
      ? Number(pectoral) + Number(abdominal) + Number(thigh)
      : Number(triceps) + Number(suprailiac) + Number(thigh);

  if (sum3 <= 0) return { density: 0, bodyFatPercent: 0, sumMm: 0 };

  const density =
    sex === 'M'
      ? 1.10938 - 0.0008267 * sum3 + 0.0000016 * (sum3 ** 2) - 0.0002574 * age
      : 1.0994921 - 0.0009929 * sum3 + 0.0000023 * (sum3 ** 2) - 0.0001392 * age;

  return {
    density: Number(density.toFixed(4)),
    bodyFatPercent: calcSiriBodyFat(density),
    sumMm: Number(sum3.toFixed(1)),
  };
}

/**
 * Protocolo de Jackson & Pollock - 7 Dobras Cutâneas (mm)
 * Peitoral, Axilar Média, Tríceps, Subescapular, Abdominal, Supra-ilíaca, Coxa
 */
export function calcPollock7({
  sex = 'M',
  age = 30,
  pectoral = 0,
  midaxillary = 0,
  triceps = 0,
  subscapular = 0,
  abdominal = 0,
  suprailiac = 0,
  thigh = 0,
}) {
  const sum7 =
    Number(pectoral) +
    Number(midaxillary) +
    Number(triceps) +
    Number(subscapular) +
    Number(abdominal) +
    Number(suprailiac) +
    Number(thigh);

  if (sum7 <= 0) return { density: 0, bodyFatPercent: 0, sumMm: 0 };

  const density =
    sex === 'M'
      ? 1.112 - 0.00043499 * sum7 + 0.00000055 * (sum7 ** 2) - 0.00028826 * age
      : 1.097 - 0.00046971 * sum7 + 0.00000056 * (sum7 ** 2) - 0.00012828 * age;

  return {
    density: Number(density.toFixed(4)),
    bodyFatPercent: calcSiriBodyFat(density),
    sumMm: Number(sum7.toFixed(1)),
  };
}

/**
 * Protocolo da Marinha dos EUA (US Navy) por Circunferências (cm)
 * Ideal para consultoria online (usa apenas fita métrica).
 */
export function calcUSNavyBodyFat({
  sex = 'M',
  heightCm = 175,
  waistCm = 80,
  neckCm = 38,
  hipCm = 95,
}) {
  const h = Number(heightCm);
  const w = Number(waistCm);
  const n = Number(neckCm);
  const hip = Number(hipCm);

  if (h <= 0 || w <= 0 || n <= 0) return 0;

  let bf = 0;
  if (sex === 'M') {
    if (w - n <= 0) return 0;
    bf =
      495 /
        (1.0324 -
          0.19077 * Math.log10(w - n) +
          0.15456 * Math.log10(h)) -
      450;
  } else {
    if (w + hip - n <= 0) return 0;
    bf =
      495 /
        (1.29579 -
          0.35004 * Math.log10(w + hip - n) +
          0.221 * Math.log10(h)) -
      450;
  }

  return Math.max(3, Math.min(65, Number(bf.toFixed(1))));
}

/**
 * Decomposição em Massa Gorda (MG) e Massa Livre de Gordura (MLG / FFM)
 */
export function calcBodyComposition({ weightKg = 70, bodyFatPercent = 15 }) {
  const weight = Number(weightKg) || 0;
  const bf = Math.max(0, Math.min(70, Number(bodyFatPercent) || 0));
  const fatMassKg = Number(((weight * bf) / 100).toFixed(2));
  const leanMassKg = Number((weight - fatMassKg).toFixed(2));

  return {
    weightKg: weight,
    bodyFatPercent: bf,
    fatMassKg,
    leanMassKg,
  };
}
