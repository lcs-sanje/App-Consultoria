import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { StudentCRMModule } from './modules/coach/crm/StudentCRMModule.jsx';
import { AnamnesisAndEnergyModule } from './modules/coach/anamnesis/AnamnesisAndEnergyModule.jsx';
import { WorkoutBuilderModule } from './modules/coach/workout-builder/WorkoutBuilderModule.jsx';
import { DietBuilderModule } from './modules/coach/diet-builder/DietBuilderModule.jsx';
import { CatalogManagerModule } from './modules/coach/catalog-manager/CatalogManagerModule.jsx';
import { StudentWorkoutModule } from './modules/student/one-handed-workout/StudentWorkoutModule.jsx';
import { StudentDietModule } from './modules/student/daily-diet/StudentDietModule.jsx';
import { StudentCheckinModule } from './modules/student/checkin/StudentCheckinModule.jsx';

/**
 * REGISTRO MODULAR DE TELAS (PLUG & PLAY)
 * Qualquer módulo pode ser editado ou substituído individualmente sem afetar os demais.
 */
const COACH_MODULES = [
  { id: 'crm', label: '1. Alunos, Pagamentos & Feedbacks', Component: StudentCRMModule },
  { id: 'anamnesis', label: '2. Anamnese & Fórmulas GET', Component: AnamnesisAndEnergyModule },
  { id: 'workout', label: '3. Prescrição Treino (Força + Cardio)', Component: WorkoutBuilderModule },
  { id: 'diet', label: '4. Prescrição Dieta & Equivalências', Component: DietBuilderModule },
  { id: 'catalogs', label: '5. Repertórios (Exercícios & Alimentos)', Component: CatalogManagerModule },
];

const STUDENT_MODULES = [
  { id: 'workout', label: 'Treino (1 Mão)', Component: StudentWorkoutModule },
  { id: 'diet', label: 'Dieta & Água', Component: StudentDietModule },
  { id: 'checkin', label: 'Check-in / Datas', Component: StudentCheckinModule },
];

function MainWorkspace() {
  const {
    viewMode,
    setViewMode,
    activeCoachTab,
    setActiveCoachTab,
    activeStudentTab,
    setActiveStudentTab,
    students,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    resetDemoData,
  } = useApp();

  const ActiveCoachComponent =
    COACH_MODULES.find((m) => m.id === activeCoachTab)?.Component || StudentCRMModule;
  const ActiveStudentComponent =
    STUDENT_MODULES.find((m) => m.id === activeStudentTab)?.Component || StudentWorkoutModule;

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-stone-800 flex flex-col">
      {/* HEADER GLOBAL: Alternador Profissional vs Aluno + Seletor Rápido de Aluno */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200 px-4 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center font-black text-stone-50 text-xs tracking-wider shadow-sm">
              EF+N
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight truncate">
                Consultoria Integrada • Educação Física & Nutrição
              </h1>
              <p className="text-xs text-stone-500 truncate">
                Gestão de Alunos, Treinamento Resistido/Aeróbio e Nutrição Esportiva
              </p>
            </div>
          </div>

          {/* Seletor de Aluno Ativo + Alternador de Visão (Profissional vs Aluno 1 Mão) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-stone-100 border border-stone-300 rounded-xl px-3 py-1.5">
              <span className="text-xs text-stone-500 font-semibold whitespace-nowrap">
                Aluno Ativo:
              </span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white text-stone-900">
                    {s.name} ({s.weightKg}kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex p-1 bg-stone-100 border border-stone-300 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('coach')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'coach'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Visão Profissional (Você)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('student')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === 'student'
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Visão do Aluno (1 Mão)
              </button>
            </div>

            <button
              type="button"
              onClick={resetDemoData}
              title="Restaurar dados originais de demonstração"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-clay-100 hover:bg-clay-200 text-clay-800 border border-clay-300 transition-colors whitespace-nowrap"
            >
              ↺ Resetar Demo
            </button>
          </div>
        </div>
      </header>

      {/* CORPO PRINCIPAL */}
      {viewMode === 'coach' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
          {/* Barra de Módulos do Profissional */}
          <nav className="flex flex-wrap gap-2 bg-stone-200/70 p-2 rounded-2xl border border-stone-300/80">
            {COACH_MODULES.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveCoachTab(mod.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeCoachTab === mod.id
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-700 hover:bg-white/80 hover:text-stone-900'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </nav>

          {/* Renderização Isolada do Módulo Selecionado */}
          <ActiveCoachComponent />
        </main>
      ) : (
        /* VISÃO DO ALUNO: SIMULADOR MOBILE-FIRST "ONE-HANDED UX" (ZONA DO POLEGAR) */
        <main className="flex-1 w-full max-w-md mx-auto px-3 pt-4 flex flex-col">
          {/* Banner compacto do aluno */}
          <div className="mb-3 px-4 py-3 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-sage-700 block">
                Modo Academia • Controle com 1 Mão
              </span>
              <span className="text-sm font-extrabold text-stone-900 truncate block">
                {selectedStudent?.name}
              </span>
            </div>
            <div className="text-right text-[11px] text-stone-500 shrink-0">
              <div>
                Feedback:{' '}
                <strong className="text-clay-700">{selectedStudent?.nextFeedbackDate}</strong>
              </div>
              <div>
                Plano: <strong className="text-stone-800">{selectedStudent?.paymentDueDate}</strong>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <ActiveStudentComponent />
          </div>

          {/* BOTTOM NAVIGATION BAR (FIXA NA ZONA DO POLEGAR DO ALUNO) */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-stone-200 shadow-lg">
            <div className="max-w-md mx-auto grid grid-cols-3 gap-2 p-2.5">
              {STUDENT_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveStudentTab(mod.id)}
                  className={`py-3 px-2 rounded-2xl text-xs font-extrabold transition-all truncate ${
                    activeStudentTab === mod.id
                      ? 'bg-sage-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {mod.label}
                </button>
              ))}
            </div>
          </nav>
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainWorkspace />
    </AppProvider>
  );
}
