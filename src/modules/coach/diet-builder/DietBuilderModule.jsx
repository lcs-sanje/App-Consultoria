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
      const nextDay = typeof updater === 'function' ? updater(currentDay) : { ...currentDay, ...updater };
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
      {/* Painel Superior Flutuante: Resumo de Calorias e Macronutrientes em Tempo Real */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDayKey('trainingDay')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDayKey === 'trainingDay'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              🏋️ Cardápio Dia de Treino ({dietPlan.days?.trainingDay?.targetKcal} kcal)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDayKey('restDay')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDayKey === 'restDay'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              🛋️ Cardápio Dia de Descanso ({dietPlan.days?.restDay?.targetKcal} kcal)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Meta do Dia (kcal):</span>
              <input
                type="number"
                step={50}
                value={activeDay.targetKcal || 2500}
                onChange={(e) => updateActiveDay({ targetKcal: Number(e.target.value) })}
                className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMeal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              + Nova Refeição
            </button>
          </div>
        </div>

        {/* Cards de Macronutrientes (g, g/kg e %) */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Calorias Prescritas</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {dayMacros.kcal}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {activeDay.targetKcal} kcal
              </span>
            </div>
            <span
              className={`text-[11px] font-semibold ${
                Math.abs(kcalDiff) <= 80
                  ? 'text-emerald-400'
                  : kcalDiff > 0
                  ? 'text-amber-400'
                  : 'text-sky-400'
              }`}
            >
              {kcalDiff > 0 ? `+${kcalDiff} kcal` : `${kcalDiff} kcal`} da meta
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30">
            <span className="text-[11px] uppercase font-bold text-rose-300">Proteínas</span>
            <div className="text-xl font-extrabold text-white mt-1">{dayMacros.protein} g</div>
            <span className="text-[11px] text-rose-300 font-semibold">
              {dayMacros.proteinPerKg} g/kg • {dayMacros.proteinPct}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
            <span className="text-[11px] uppercase font-bold text-amber-300">Carboidratos</span>
            <div className="text-xl font-extrabold text-white mt-1">{dayMacros.carbs} g</div>
            <span className="text-[11px] text-amber-300 font-semibold">
              {dayMacros.carbsPerKg} g/kg • {dayMacros.carbsPct}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30">
            <span className="text-[11px] uppercase font-bold text-sky-300">Lipídios (Gorduras)</span>
            <div className="text-xl font-extrabold text-white mt-1">{dayMacros.fat} g</div>
            <span className="text-[11px] text-sky-300 font-semibold">
              {dayMacros.fatPerKg} g/kg • {dayMacros.fatPct}%
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
            <span className="text-[11px] uppercase font-bold text-emerald-300">Fibras</span>
            <div className="text-xl font-extrabold text-white mt-1">{dayMacros.fiber} g</div>
            <span className="text-[11px] text-slate-400">Meta ideal: 25–38g</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30">
            <span className="text-[11px] uppercase font-bold text-indigo-300">Meta Hídrica</span>
            <div className="text-xl font-extrabold text-white mt-1">{hydrationInfo.liters} L</div>
            <span className="text-[11px] text-indigo-300">
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
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
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
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-400"
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
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-sm font-bold text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <strong>{mealMacros.kcal} kcal</strong> • P: {mealMacros.protein}g • C:{' '}
                    {mealMacros.carbs}g • G: {mealMacros.fat}g
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeal(meal.id)}
                    className="text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Excluir Refeição
                  </button>
                </div>
              </div>

              {/* Itens da Refeição */}
              <div className="space-y-2">
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
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-white">{food.name}</span>
                          <span className="ml-2 text-[11px] text-emerald-400 font-semibold">
                            ({householdText})
                          </span>
                          <div className="text-[11px] text-slate-400">
                            {m.kcal} kcal • Prot: {m.protein}g • Carb: {m.carbs}g • Gord: {m.fat}g •
                            Fibra: {m.fiber}g
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step={5}
                              value={item.grams}
                              onChange={(e) =>
                                handleUpdateItemGrams(meal.id, item.id, e.target.value)
                              }
                              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white text-right"
                            />
                            <span className="text-xs text-slate-400">g</span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewSubstitutesForItem(isPreviewingSubs ? null : item.id)
                            }
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25"
                          >
                            ⇄ Ver Equivalências ({food.group.split('/')[0]})
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(meal.id, item.id)}
                            className="px-2 py-1 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Gaveta de Equivalências Calculadas Automaticamente */}
                      {isPreviewingSubs && (
                        <div className="p-3 rounded-lg bg-slate-900 border border-indigo-500/30 space-y-2">
                          <div className="text-[11px] font-bold text-indigo-300">
                            Lista de Substituição Equivalente Automática para {item.grams}g de{' '}
                            {food.name}:
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {substitutes.map((sub) => (
                              <div
                                key={sub.foodId}
                                className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]"
                              >
                                <div className="font-bold text-white">{sub.name}</div>
                                <div className="text-emerald-400 font-semibold">
                                  {sub.householdText}
                                </div>
                                <div className="text-slate-400">
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
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  value={selectedMealForAdd === meal.id ? selectedFoodToAdd : foodsCatalog[0]?.id}
                  onChange={(e) => {
                    setSelectedMealForAdd(meal.id);
                    setSelectedFoodToAdd(e.target.value);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
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
                    className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    placeholder="Gramas"
                  />
                  <span className="text-xs text-slate-400">g</span>
                  <button
                    type="button"
                    onClick={() => handleAddFoodItemToMeal(meal.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white whitespace-nowrap"
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
