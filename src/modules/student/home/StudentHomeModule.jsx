import React from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import { calcDayMacros } from '../../../core/formulas/nutritionFormulas.js';

export function StudentHomeModule() {
  const {
    selectedStudent,
    foodsCatalog,
    setActiveStudentTab,
    addStudentWater,
  } = useApp();

  if (!selectedStudent) return null;

  const firstSession = selectedStudent.workoutPlan?.sessions?.[0];
  const trainingDayDiet = selectedStudent.dietPlan?.days?.trainingDay || {
    targetKcal: 2500,
    meals: [],
  };

  const dayMacros = calcDayMacros(
    trainingDayDiet.meals || [],
    foodsCatalog,
    selectedStudent.weightKg
  );

  const completedMealsCount = (trainingDayDiet.meals || []).filter(
    (m) => m.completedToday
  ).length;
  const totalMealsCount = (trainingDayDiet.meals || []).length;

  const waterCurrent = Number(selectedStudent.waterIntakeTodayMl) || 0;
  const waterTarget = Number(selectedStudent.waterTargetMl) || 3000;
  const waterPct = Math.min(100, Math.round((waterCurrent / waterTarget) * 100));

  return (
    <div className="space-y-4 pb-28">
      {/* Saudação e Resumo da Periodização */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 space-y-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sage-100 text-sage-800 border border-sage-300">
            Semana {selectedStudent.workoutPlan?.currentWeek || 1} de{' '}
            {selectedStudent.workoutPlan?.totalWeeks || 8}
          </span>
          <span className="text-xs font-semibold text-stone-500">
            Peso atual: <strong className="text-stone-900">{selectedStudent.weightKg} kg</strong>
          </span>
        </div>
        <h2 className="text-xl font-black text-stone-900">
          Olá, {selectedStudent.name.split(' ')[0]}!
        </h2>
        <p className="text-xs text-stone-600">{selectedStudent.goal}</p>
      </div>

      {/* Card Principal: Treino do Dia (Ação Rápida em 1 Toque) */}
      {firstSession && (
        <div className="bg-stone-900 text-stone-50 rounded-3xl p-5 space-y-4 shadow-md">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sage-300 block">
              Seu Treino Prescrito
            </span>
            <h3 className="text-lg font-black text-white">
              {firstSession.code} — {firstSession.title}
            </h3>
            <p className="text-xs text-stone-300">
              {(firstSession.exercises || []).length} exercícios resistidos •{' '}
              {firstSession.estimatedResistanceMinutes} min
              {firstSession.cardioPrescription?.enabled &&
                ` + ${firstSession.cardioPrescription.durationMin} min Cardio`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveStudentTab('workout')}
            className="w-full py-4 rounded-2xl bg-sage-600 hover:bg-sage-500 active:scale-[0.99] text-white font-black text-sm tracking-wide shadow-sm transition-all"
          >
            ▶ ABRIR TREINO (CONTROLE COM 1 MÃO)
          </button>
        </div>
      )}

      {/* Card de Hidratação Rápida */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sage-700 block">
              Meta de Água de Hoje
            </span>
            <div className="text-lg font-black text-stone-900">
              {(waterCurrent / 1000).toFixed(2)} L{' '}
              <span className="text-xs font-normal text-stone-500">
                / {(waterTarget / 1000).toFixed(2)} L ({waterPct}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, 250)}
              className="px-3.5 py-2.5 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-900 border border-sage-300 text-xs font-extrabold"
            >
              +250 ml
            </button>
            <button
              type="button"
              onClick={() => addStudentWater(selectedStudent.id, 500)}
              className="px-3.5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-extrabold"
            >
              +500 ml
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

      {/* Resumo da Dieta do Dia */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-clay-800 block">
              Plano Alimentar do Dia
            </span>
            <div className="text-base font-black text-stone-900">
              {completedMealsCount} de {totalMealsCount} refeições concluídas
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveStudentTab('diet')}
            className="px-3.5 py-2 rounded-xl bg-clay-100 hover:bg-clay-200 text-clay-900 border border-clay-300 text-xs font-extrabold"
          >
            Ver Cardápio →
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-semibold block">Proteínas</span>
            <span className="text-sm font-black text-stone-900">{dayMacros.protein}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-semibold block">Carboidratos</span>
            <span className="text-sm font-black text-stone-900">{dayMacros.carbs}g</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[10px] text-stone-500 font-semibold block">Gorduras</span>
            <span className="text-sm font-black text-stone-900">{dayMacros.fat}g</span>
          </div>
        </div>
      </div>

      {/* Datas Importantes do Aluno (Feedback e Plano) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase text-clay-800 block">
            Próximo Check-in de Feedback
          </span>
          <span className="text-sm font-black text-stone-900">
            {selectedStudent.nextFeedbackDate}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveStudentTab('checkin')}
          className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-extrabold"
        >
          Enviar Feedback
        </button>
      </div>
    </div>
  );
}
