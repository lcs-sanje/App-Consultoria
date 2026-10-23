import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import {
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
    <div className="space-y-4 pb-28">
      {/* Card de Hidratação em 1 Toque */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sage-700 block">
              Hidratação Diária
            </span>
            <div className="text-lg font-black text-stone-900">
              {(waterCurrent / 1000).toFixed(2)} L{' '}
              <span className="text-xs font-normal text-stone-500">
                de {(waterTarget / 1000).toFixed(2)} L ({waterPct}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, -250)}
              className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-stone-600"
            >
              -250ml
            </button>
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, 250)}
              className="px-3.5 py-2 rounded-xl bg-sage-600 active:scale-95 text-xs font-extrabold text-white"
            >
              +250ml
            </button>
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, 500)}
              className="px-3.5 py-2 rounded-xl bg-stone-900 active:scale-95 text-xs font-extrabold text-white"
            >
              +500ml
            </button>
          </div>
        </div>
        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
          <div
            className="h-full bg-sage-600 transition-all duration-300"
            style={{ width: `${waterPct}%` }}
          />
        </div>
      </div>

      {/* Alternador Dia de Treino vs Dia de Descanso + Macros */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => setDayType('trainingDay')}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              dayType === 'trainingDay'
                ? 'bg-sage-600 text-white shadow-sm'
                : 'text-stone-600'
            }`}
          >
            Dia de Treino
          </button>
          <button
            type="button"
            onClick={() => setDayType('restDay')}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              dayType === 'restDay'
                ? 'bg-clay-600 text-white shadow-sm'
                : 'text-stone-600'
            }`}
          >
            Dia de Descanso
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-semibold block">Calorias</span>
            <span className="text-sm font-black text-stone-900">{dayTotals.kcal}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-clay-50 border border-clay-200">
            <span className="text-[10px] text-clay-800 font-semibold block">Proteína</span>
            <span className="text-sm font-black text-stone-900">{dayTotals.protein}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200">
            <span className="text-[10px] text-sage-800 font-semibold block">Carbo</span>
            <span className="text-sm font-black text-stone-900">{dayTotals.carbs}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-600 font-semibold block">Gordura</span>
            <span className="text-sm font-black text-stone-900">{dayTotals.fat}g</span>
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
              className={`rounded-3xl p-4 border transition-all space-y-3 shadow-sm ${
                meal.completedToday
                  ? 'bg-sage-50/70 border-sage-400'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-sage-700">{meal.time}</span>
                  <h3 className="text-base font-extrabold text-stone-900">{meal.name}</h3>
                  <span className="text-[11px] text-stone-500">
                    {mealMacros.kcal} kcal • P: {mealMacros.protein}g • C: {mealMacros.carbs}g • G:{' '}
                    {mealMacros.fat}g
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleStudentMealCompleted(selectedStudent.id, dayType, meal.id)
                  }
                  className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    meal.completedToday
                      ? 'bg-sage-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-800 border border-stone-300'
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
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-stone-900">{food.name}</div>
                          <div className="text-xs font-extrabold text-sage-800">
                            {item.grams}g — {household}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOpenSubItemId(isOpen ? null : item.id)}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-clay-100 border border-clay-300 text-clay-900 whitespace-nowrap"
                        >
                          ⇄ Substituir
                        </button>
                      </div>

                      {isOpen && (
                        <div className="pt-2 border-t border-stone-200 space-y-1.5">
                          <div className="text-[11px] font-bold text-clay-800">
                            Opções equivalentes para {item.grams}g de {food.name}:
                          </div>
                          {subs.map((s) => (
                            <div
                              key={s.foodId}
                              className="p-2 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="font-semibold text-stone-800">{s.name}</span>
                              <span className="font-extrabold text-sage-800 whitespace-nowrap">
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
                <p className="text-[11px] text-stone-500 italic">{meal.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Suplementação Prescrita */}
      {(dietPlan.supplementsPrescription || []).length > 0 && (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-2 shadow-sm">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-clay-800">
            Suplementação Prescrita
          </h4>
          {(dietPlan.supplementsPrescription || []).map((sup) => (
            <div
              key={sup.id}
              className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs"
            >
              <div className="font-bold text-stone-900">
                {sup.name} — <span className="text-sage-700">{sup.dose}</span>
              </div>
              <div className="text-stone-500 mt-0.5">{sup.timing}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
