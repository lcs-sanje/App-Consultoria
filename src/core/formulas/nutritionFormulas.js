/**
 * MÓDULO CORE: Fórmulas Nutricionais, Macronutrientes, Hidratação e Equivalência Automática
 */

export function calcFoodMacros(food, grams = 100) {
  if (!food) {
    return { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, grams: 0 };
  }
  const factor = (Number(grams) || 0) / 100;
  return {
    grams: Math.round(Number(grams) || 0),
    kcal: Math.round((food.kcalPer100g || 0) * factor),
    protein: Number(((food.proteinPer100g || 0) * factor).toFixed(1)),
    carbs: Number(((food.carbsPer100g || 0) * factor).toFixed(1)),
    fat: Number(((food.fatPer100g || 0) * factor).toFixed(1)),
    fiber: Number(((food.fiberPer100g || 0) * factor).toFixed(1)),
  };
}

/**
 * Converte gramas na medida caseira mais próxima cadastrada no alimento
 */
export function formatHouseholdMeasure(food, grams = 100) {
  if (!food || !food.householdMeasures || food.householdMeasures.length === 0) {
    return `${grams}g`;
  }
  const measure = food.householdMeasures[0];
  if (!measure || !measure.grams) return `${grams}g`;

  const ratio = Number(grams) / Number(measure.grams);
  const rounded = Math.round(ratio * 2) / 2; // arredonda para múltiplos de 0.5
  if (rounded <= 0) return `~0.5 ${measure.name}`;
  return `${rounded} ${measure.name} (~${Math.round(grams)}g)`;
}

/**
 * Calcula os macronutrientes de uma refeição inteira
 */
export function calcMealMacros(items = [], foodsCatalog = []) {
  const foodMap = new Map(foodsCatalog.map((f) => [f.id, f]));
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  items.forEach((item) => {
    const food = foodMap.get(item.foodId);
    if (!food) return;
    const m = calcFoodMacros(food, item.grams);
    totals.kcal += m.kcal;
    totals.protein += m.protein;
    totals.carbs += m.carbs;
    totals.fat += m.fat;
    totals.fiber += m.fiber;
  });

  return {
    kcal: Math.round(totals.kcal),
    protein: Number(totals.protein.toFixed(1)),
    carbs: Number(totals.carbs.toFixed(1)),
    fat: Number(totals.fat.toFixed(1)),
    fiber: Number(totals.fiber.toFixed(1)),
  };
}

/**
 * Calcula o resumo diário completo (g totais, g/kg de peso corporal e % calórico)
 */
export function calcDayMacros(meals = [], foodsCatalog = [], weightKg = 70) {
  const w = Math.max(1, Number(weightKg) || 70);
  const day = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

  meals.forEach((meal) => {
    const m = calcMealMacros(meal.items || [], foodsCatalog);
    day.kcal += m.kcal;
    day.protein += m.protein;
    day.carbs += m.carbs;
    day.fat += m.fat;
    day.fiber += m.fiber;
  });

  const totalKcal = Math.max(1, day.kcal);

  return {
    kcal: Math.round(day.kcal),
    protein: Number(day.protein.toFixed(1)),
    carbs: Number(day.carbs.toFixed(1)),
    fat: Number(day.fat.toFixed(1)),
    fiber: Number(day.fiber.toFixed(1)),
    proteinPerKg: Number((day.protein / w).toFixed(2)),
    carbsPerKg: Number((day.carbs / w).toFixed(2)),
    fatPerKg: Number((day.fat / w).toFixed(2)),
    proteinPct: Math.round(((day.protein * 4) / totalKcal) * 100),
    carbsPct: Math.round(((day.carbs * 4) / totalKcal) * 100),
    fatPct: Math.round(((day.fat * 9) / totalKcal) * 100),
  };
}

/**
 * Calculadora Automática de Equivalência / Substituição Alimentar
 * Calcula a gramatura exata do alimento substituto para manter as mesmas calorias
 * ou o mesmo macronutriente dominante do grupo alimentar.
 */
export function calcEquivalentSubstitutes({
  baseFood,
  baseGrams = 100,
  foodsCatalog = [],
  matchCriterion = 'auto', // 'auto' | 'kcal' | 'protein' | 'carbs' | 'fat'
}) {
  if (!baseFood) return [];
  const baseMacros = calcFoodMacros(baseFood, baseGrams);

  // Define o critério automático de equivalência pelo grupo do alimento
  let criterion = matchCriterion;
  if (criterion === 'auto') {
    if (baseFood.group === 'Proteínas Magras' || baseFood.group === 'Proteínas / Ovos / Laticínios') {
      criterion = 'protein';
    } else if (baseFood.group === 'Carboidratos / Tubérculos / Grãos' || baseFood.group === 'Frutas') {
      criterion = 'carbs';
    } else if (baseFood.group === 'Gorduras / Oleaginosas') {
      criterion = 'fat';
    } else {
      criterion = 'kcal';
    }
  }

  const candidates = foodsCatalog.filter(
    (f) => f.id !== baseFood.id && f.group === baseFood.group
  );

  return candidates
    .map((targetFood) => {
      let equivalentGrams = baseGrams;
      if (criterion === 'protein' && targetFood.proteinPer100g > 0) {
        equivalentGrams = (baseMacros.protein / targetFood.proteinPer100g) * 100;
      } else if (criterion === 'carbs' && targetFood.carbsPer100g > 0) {
        equivalentGrams = (baseMacros.carbs / targetFood.carbsPer100g) * 100;
      } else if (criterion === 'fat' && targetFood.fatPer100g > 0) {
        equivalentGrams = (baseMacros.fat / targetFood.fatPer100g) * 100;
      } else if (targetFood.kcalPer100g > 0) {
        equivalentGrams = (baseMacros.kcal / targetFood.kcalPer100g) * 100;
      }

      const roundedGrams = Math.max(5, Math.round(equivalentGrams / 5) * 5);
      const macros = calcFoodMacros(targetFood, roundedGrams);

      return {
        foodId: targetFood.id,
        name: targetFood.name,
        grams: roundedGrams,
        householdText: formatHouseholdMeasure(targetFood, roundedGrams),
        macros,
        criterionUsed: criterion,
      };
    })
    .slice(0, 6);
}

/**
 * Meta de Hidratação Diária (35 a 50 ml/kg)
 */
export function calcHydrationTarget({ weightKg = 70, mlPerKg = 40 }) {
  const totalMl = Math.round((Number(weightKg) || 70) * (Number(mlPerKg) || 40));
  return {
    totalMl,
    liters: Number((totalMl / 1000).toFixed(2)),
  };
}
