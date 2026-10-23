import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import {
  calcFoodMacros,
  calcMealMacros,
  calcDayMacros,
  formatHouseholdMeasure,
  calcEquivalentSubstitutes,
} from '../../../core/formulas/nutritionFormulas.js';

export function StudentDietModule() {
  const {
    selectedStudent,
    foodsCatalog,
    addStudentWater,
    toggleStudentMealCompleted,
  } = useApp();

  const [dayType, setDayType] = useState('trainingDay'); // 'trainingDay' | 'restDay'
  const [openSubItemId, setOpenSubItemId] = useState(null);

  if (!selectedStudent) return null;

  const dietPlan = selectedStudent.dietPlan || {};
  const activeDay = dietPlan.days?.[dayType] || {
    label: 'Dia de Treino',
    targetKcal: 2500,
    meals: [],
  };

  const foodMap = useMemo(
    () => new Map(foodsCatalog.map((f) => [f.id, f])),
    [foodsCatalog]
  );

  const dayTotals = useMemo(
    () => calcDayMacros(activeDay.meals || [], foodsCatalog, selectedStudent.weightKg),
    [activeDay.meals, foodsCatalog, selectedStudent.weightKg]
  );

  const waterCurrent = Number(selectedStudent.waterIntakeTodayMl) || 0;
  const waterTarget = Number(selectedStudent.waterTargetMl) || 3000;
  const waterPct = Math.min(100, Math.round((waterCurrent / waterTarget) * 100));

  return (
    <div className="space-y-4 pb-24">
      {/* Card de Hidratação em 1 Toque */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
              💧 Hidratação Diária
            </span>
            <div className="text-lg font-black text-white">
              {(waterCurrent / 1000).toFixed(2)} L{' '}
              <span className="text-xs font-normal text-slate-400">
                de {(waterTarget / 1000).toFixed(2)} L ({waterPct}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, -250)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400"
            >
              -250ml
            </button>
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, 250)}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600 active:scale-95 text-xs font-extrabold text-white"
            >
              +250ml
            </button>
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, 500)}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 active:scale-95 text-xs font-extrabold text-white"
            >
              +500ml
            </button>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${waterPct}%` }}
          />
        </div>
      </div>

      {/* Alternador Dia de Treino vs Dia de Descanso + Macros */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDayType('trainingDay')}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              dayType === 'trainingDay'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400'
            }`}
          >
            🏋️ Dia de Treino
          </button>
          <button
            type="button"
            onClick={() => setDayType('restDay')}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              dayType === 'restDay' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            🛋️ Dia de Descanso
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Calorias</span>
            <span className="text-sm font-black text-white">{dayTotals.kcal}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-rose-300 block">Proteína</span>
            <span className="text-sm font-black text-white">{dayTotals.protein}g</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-amber-300 block">Carbo</span>
            <span className="text-sm font-black text-white">{dayTotals.carbs}g</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-sky-300 block">Gordura</span>
            <span className="text-sm font-black text-white">{dayTotals.fat}g</span>
          </div>
        </div>
      </div>

      {/* Lista de Refeições com Check em 1 Toque e Substituições */}
      <div className="space-y-3">
        {(activeDay.meals || []).map((meal) => {
          const mealMacros = calcMealMacros(meal.items || [], foodsCatalog);
          return (
            <div
              key={meal.id}
              className={`rounded-3xl p-4 border transition-all space-y-3 ${
                meal.completedToday
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-emerald-400">{meal.time}</span>
                  <h3 className="text-base font-extrabold text-white">{meal.name}</h3>
                  <span className="text-[11px] text-slate-400">
                    {mealMacros.kcal} kcal • P: {mealMacros.protein}g • C: {mealMacros.carbs}g • G:{' '}
                    {mealMacros.fat}g
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleStudentMealCompleted(selectedStudent.id, dayType, meal.id)
                  }
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                    meal.completedToday
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {meal.completedToday ? '✓ Feita' : 'Marcar Feita'}
                </button>
              </div>

              {/* Alimentos da Refeição */}
              <div className="space-y-2">
                {(meal.items || []).map((item) => {
                  const food = foodMap.get(item.foodId);
                  if (!food) return null;
                  const household = formatHouseholdMeasure(food, item.grams);
                  const isOpen = openSubItemId === item.id;
                  const subs = isOpen
                    ? calcEquivalentSubstitutes({
                        baseFood: food,
                        baseGrams: item.grams,
                        foodsCatalog,
                      })
                    : [];

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white">{food.name}</div>
                          <div className="text-xs font-extrabold text-emerald-400">
                            {item.grams}g — {household}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenSubItemId(isOpen ? null : item.id)}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-900 border border-slate-700 text-indigo-300 whitespace-nowrap"
                        >
                          ⇄ Substituir
                        </button>
                      </div>

                      {isOpen && (
                        <div className="pt-2 border-t border-slate-800 space-y-1.5">
                          <div className="text-[11px] font-bold text-indigo-300">
                            Opções equivalentes para {item.grams}g de {food.name}:
                          </div>
                          {subs.map((s) => (
                            <div
                              key={s.foodId}
                              className="p-2 rounded-xl bg-slate-900 flex items-center justify-between text-xs"
                            >
                              <span className="font-semibold text-slate-200">{s.name}</span>
                              <span className="font-extrabold text-emerald-400">
                                {s.householdText}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {meal.notes && (
                <p className="text-[11px] text-slate-400 italic">💡 {meal.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Suplementação Prescrita */}
      {(dietPlan.supplementsPrescription || []).length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
            ⚡ Suplementação Prescrita
          </h4>
          {(dietPlan.supplementsPrescription || []).map((sup) => (
            <div
              key={sup.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div className="font-bold text-white">
                {sup.name} — <span className="text-emerald-400">{sup.dose}</span>
              </div>
              <div className="text-slate-400 mt-0.5">{sup.timing}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
