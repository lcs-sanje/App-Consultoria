import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import {
  calcFoodMacros,
  calcMealMacros,
  calcDayMacros,
  formatHouseholdMeasure,
  calcEquivalentSubstitutes,
  calcHydrationTarget,
} from '../../../core/formulas/nutritionFormulas.js';

export function DietBuilderModule() {
  const { selectedStudent, updateStudent, foodsCatalog } = useApp();
  const [selectedDayKey, setSelectedDayKey] = useState('trainingDay'); // 'trainingDay' | 'restDay'
  const [selectedMealForAdd, setSelectedMealForAdd] = useState('');
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState(foodsCatalog[0]?.id || '');
  const [gramsToAdd, setGramsToAdd] = useState(100);
  const [previewSubstitutesForItem, setPreviewSubstitutesForItem] = useState(null);

  if (!selectedStudent) return null;

  const dietPlan = selectedStudent.dietPlan || {};
  const activeDay = dietPlan.days?.[selectedDayKey] || {
    label: 'Dia de Treino',
    targetKcal: 2500,
    meals: [],
  };

  const foodMap = useMemo(
    () => new Map(foodsCatalog.map((f) => [f.id, f])),
    [foodsCatalog]
  );

  const dayMacros = useMemo(
    () => calcDayMacros(activeDay.meals || [], foodsCatalog, selectedStudent.weightKg),
    [activeDay.meals, foodsCatalog, selectedStudent.weightKg]
  );

  const hydrationInfo = useMemo(
    () =>
      calcHydrationTarget({
        weightKg: selectedStudent.weightKg,
        mlPerKg: dietPlan.hydrationMlPerKg || 40,
      }),
    [selectedStudent.weightKg, dietPlan.hydrationMlPerKg]
  );

  const updateActiveDay = (updater) => {
    updateStudent(selectedStudent.id, (stu) => {
      const currentDay = stu.dietPlan?.days?.[selectedDayKey] || activeDay;
      const nextDay =
        typeof updater === 'function' ? updater(currentDay) : { ...currentDay, ...updater };
      return {
        ...stu,
        dietPlan: {
          ...stu.dietPlan,
          days: {
            ...(stu.dietPlan?.days || {}),
            [selectedDayKey]: nextDay,
          },
        },
      };
    });
  };

  const handleAddMeal = () => {
    const count = (activeDay.meals || []).length + 1;
    const newMeal = {
      id: `meal_${Date.now()}`,
      name: `Refeição ${count}`,
      time: '15:00',
      completedToday: false,
      notes: '',
      items: [],
    };
    updateActiveDay((d) => ({
      ...d,
      meals: [...(d.meals || []), newMeal],
    }));
  };

  const handleRemoveMeal = (mealId) => {
    updateActiveDay((d) => ({
      ...d,
      meals: (d.meals || []).filter((m) => m.id !== mealId),
    }));
  };

  const handleAddFoodItemToMeal = (mealId) => {
    if (!selectedFoodToAdd) return;
    const newItem = {
      id: `mi_${Date.now()}`,
      foodId: selectedFoodToAdd,
      grams: Number(gramsToAdd) || 100,
    };
    updateActiveDay((d) => ({
      ...d,
      meals: (d.meals || []).map((m) =>
        m.id === mealId ? { ...m, items: [...(m.items || []), newItem] } : m
      ),
    }));
  };

  const handleUpdateItemGrams = (mealId, itemId, newGrams) => {
    updateActiveDay((d) => ({
      ...d,
      meals: (d.meals || []).map((m) => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          items: (m.items || []).map((it) =>
            it.id === itemId ? { ...it, grams: Math.max(0, Number(newGrams) || 0) } : it
          ),
        };
      }),
    }));
  };

  const handleRemoveItem = (mealId, itemId) => {
    updateActiveDay((d) => ({
      ...d,
      meals: (d.meals || []).map((m) =>
        m.id === mealId ? { ...m, items: (m.items || []).filter((it) => it.id !== itemId) } : m
      ),
    }));
  };

  const kcalDiff = dayMacros.kcal - (activeDay.targetKcal || 2500);

  return (
    <div className="space-y-6">
      {/* Painel Superior: Resumo de Calorias e Macronutrientes em Tempo Real */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDayKey('trainingDay')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDayKey === 'trainingDay'
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
              }`}
            >
              Cardápio Dia de Treino ({dietPlan.days?.trainingDay?.targetKcal} kcal)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDayKey('restDay')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDayKey === 'restDay'
                  ? 'bg-clay-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
              }`}
            >
              Cardápio Dia de Descanso ({dietPlan.days?.restDay?.targetKcal} kcal)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-700 font-semibold">
              <span>Meta do Dia (kcal):</span>
              <input
                type="number"
                step={50}
                value={activeDay.targetKcal || 2500}
                onChange={(e) => updateActiveDay({ targetKcal: Number(e.target.value) })}
                className="w-24 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMeal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm"
            >
              + Nova Refeição
            </button>
          </div>
        </div>

        {/* Cards de Macronutrientes (g, g/kg e %) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] uppercase font-bold text-stone-500 block">
              Calorias Prescritas
            </span>
            <div className="text-xl font-black text-stone-900 mt-1">
              {dayMacros.kcal}{' '}
              <span className="text-xs font-normal text-stone-500">
                / {activeDay.targetKcal}
              </span>
            </div>
            <span
              className={`text-[11px] font-bold ${
                Math.abs(kcalDiff) <= 80 ? 'text-sage-700' : 'text-clay-700'
              }`}
            >
              {kcalDiff > 0 ? `+${kcalDiff} kcal` : `${kcalDiff} kcal`} da meta
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-clay-50 border border-clay-200">
            <span className="text-[11px] uppercase font-bold text-clay-800 block">Proteínas</span>
            <div className="text-xl font-black text-stone-900 mt-1">{dayMacros.protein} g</div>
            <span className="text-[11px] text-clay-800 font-bold">
              {dayMacros.proteinPerKg} g/kg • {dayMacros.proteinPct}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200">
            <span className="text-[11px] uppercase font-bold text-sage-800 block">
              Carboidratos
            </span>
            <div className="text-xl font-black text-stone-900 mt-1">{dayMacros.carbs} g</div>
            <span className="text-[11px] text-sage-800 font-bold">
              {dayMacros.carbsPerKg} g/kg • {dayMacros.carbsPct}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] uppercase font-bold text-stone-600 block">
              Lipídios (Gorduras)
            </span>
            <div className="text-xl font-black text-stone-900 mt-1">{dayMacros.fat} g</div>
            <span className="text-[11px] text-stone-600 font-bold">
              {dayMacros.fatPerKg} g/kg • {dayMacros.fatPct}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-sage-50/60 border border-sage-200">
            <span className="text-[11px] uppercase font-bold text-sage-800 block">Fibras</span>
            <div className="text-xl font-black text-stone-900 mt-1">{dayMacros.fiber} g</div>
            <span className="text-[11px] text-stone-500">Meta ideal: 25–38g</span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] uppercase font-bold text-stone-600 block">
              Meta Hídrica
            </span>
            <div className="text-xl font-black text-stone-900 mt-1">{hydrationInfo.liters} L</div>
            <span className="text-[11px] text-stone-600 font-semibold">
              {dietPlan.hydrationMlPerKg || 40} ml/kg ({hydrationInfo.totalMl} ml)
            </span>
          </div>
        </div>
      </div>

      {/* Lista de Refeições do Cardápio Ativo */}
      <div className="space-y-4">
        {(activeDay.meals || []).map((meal) => {
          const mealMacros = calcMealMacros(meal.items || [], foodsCatalog);

          return (
            <div
              key={meal.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="time"
                    value={meal.time || '08:00'}
                    onChange={(e) =>
                      updateActiveDay((d) => ({
                        ...d,
                        meals: d.meals.map((m) =>
                          m.id === meal.id ? { ...m, time: e.target.value } : m
                        ),
                      }))
                    }
                    className="bg-sage-50 border border-sage-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sage-800"
                  />
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) =>
                      updateActiveDay((d) => ({
                        ...d,
                        meals: d.meals.map((m) =>
                          m.id === meal.id ? { ...m, name: e.target.value } : m
                        ),
                      }))
                    }
                    className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-sm font-extrabold text-stone-900"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700">
                    <strong className="text-stone-900">{mealMacros.kcal} kcal</strong> • P:{' '}
                    {mealMacros.protein}g • C: {mealMacros.carbs}g • G: {mealMacros.fat}g
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeal(meal.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F6E6E2] text-[#7D3527] hover:bg-[#EBD2CC] font-bold"
                  >
                    Excluir Refeição
                  </button>
                </div>
              </div>

              {/* Itens da Refeição */}
              <div className="space-y-2.5">
                {(meal.items || []).map((item) => {
                  const food = foodMap.get(item.foodId);
                  if (!food) return null;
                  const m = calcFoodMacros(food, item.grams);
                  const householdText = formatHouseholdMeasure(food, item.grams);
                  const isPreviewingSubs = previewSubstitutesForItem === item.id;
                  const substitutes = isPreviewingSubs
                    ? calcEquivalentSubstitutes({
                        baseFood: food,
                        baseGrams: item.grams,
                        foodsCatalog,
                      })
                    : [];

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold text-stone-900">
                              {food.name}
                            </span>
                            <span className="text-xs text-sage-800 font-bold bg-sage-100 px-2 py-0.5 rounded-md border border-sage-200">
                              {householdText}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-600 mt-1">
                            <strong>{m.kcal} kcal</strong> • Prot: {m.protein}g • Carb: {m.carbs}g •
                            Gord: {m.fat}g • Fibra: {m.fiber}g
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg px-2 py-1">
                            <input
                              type="number"
                              step={5}
                              value={item.grams}
                              onChange={(e) =>
                                handleUpdateItemGrams(meal.id, item.id, e.target.value)
                              }
                              className="w-16 bg-transparent text-xs font-bold text-stone-900 text-right focus:outline-none"
                            />
                            <span className="text-xs text-stone-500 font-semibold">g</span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewSubstitutesForItem(isPreviewingSubs ? null : item.id)
                            }
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-clay-100 text-clay-900 border border-clay-300 hover:bg-clay-200 whitespace-nowrap"
                          >
                            ⇄ Equivalências ({food.group.split('/')[0].trim()})
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(meal.id, item.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-stone-200 text-stone-700 hover:bg-stone-300"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Gaveta de Equivalências Calculadas Automaticamente */}
                      {isPreviewingSubs && (
                        <div className="p-3.5 rounded-xl bg-white border border-clay-300 space-y-2">
                          <div className="text-xs font-bold text-clay-800">
                            Substituições Equivalentes Calculadas Automaticamente para {item.grams}g
                            de {food.name}:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {substitutes.map((sub) => (
                              <div
                                key={sub.foodId}
                                className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px]"
                              >
                                <div className="font-bold text-stone-900">{sub.name}</div>
                                <div className="text-sage-700 font-bold">{sub.householdText}</div>
                                <div className="text-stone-500">
                                  {sub.macros.kcal} kcal | P:{sub.macros.protein}g C:
                                  {sub.macros.carbs}g G:{sub.macros.fat}g
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Barra para Adicionar Alimento na Refeição */}
              <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <select
                  value={selectedMealForAdd === meal.id ? selectedFoodToAdd : foodsCatalog[0]?.id}
                  onChange={(e) => {
                    setSelectedMealForAdd(meal.id);
                    setSelectedFoodToAdd(e.target.value);
                  }}
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                >
                  {foodsCatalog.map((fd) => (
                    <option key={fd.id} value={fd.id}>
                      [{fd.group.split('/')[0].trim()}] {fd.name} ({fd.kcalPer100g} kcal/100g)
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={10}
                    value={gramsToAdd}
                    onChange={(e) => setGramsToAdd(e.target.value)}
                    className="w-24 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-bold"
                    placeholder="Gramas"
                  />
                  <span className="text-xs text-stone-500 font-semibold">g</span>
                  <button
                    type="button"
                    onClick={() => handleAddFoodItemToMeal(meal.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white whitespace-nowrap shadow-sm"
                  >
                    + Adicionar Alimento
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
