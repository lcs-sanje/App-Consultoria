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
  { id: 'workout', label: '🏋️ Treino (1 Mão)', Component: StudentWorkoutModule },
  { id: 'diet', label: '🥗 Dieta & Água', Component: StudentDietModule },
  { id: 'checkin', label: '📋 Check-in / Datas', Component: StudentCheckinModule },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* HEADER GLOBAL: Alternador Profissional vs Aluno + Seletor Rápido de Aluno */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-black text-white text-sm shadow-lg">
              EF+N
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                Consultoria Integrada • Educação Física & Nutrição
              </h1>
              <p className="text-[11px] text-slate-400">
                Arquitetura Modular Independente • Força, Cardio, Dieta e CRM
              </p>
            </div>
          </div>

          {/* Seletor de Aluno Ativo + Alternador de Visão (Profissional vs Aluno 1 Mão) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400 font-semibold">Aluno Ativo:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name} ({s.weightKg}kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('coach')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  viewMode === 'coach'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                💻 Visão Profissional (Você)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('student')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  viewMode === 'student'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 Visão do Aluno (1 Mão)
              </button>
            </div>

            <button
              type="button"
              onClick={resetDemoData}
              title="Restaurar dados originais de demonstração"
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
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
          <nav className="flex flex-wrap gap-2 bg-slate-900/70 p-2 rounded-2xl border border-slate-800">
            {COACH_MODULES.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveCoachTab(mod.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                  activeCoachTab === mod.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-300 hover:bg-slate-800/80'
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
          <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block">
                Modo Academia • Uso com 1 Mão
              </span>
              <span className="text-sm font-extrabold text-white">{selectedStudent?.name}</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div>Feedback: <strong className="text-sky-300">{selectedStudent?.nextFeedbackDate}</strong></div>
              <div>Plano: <strong className="text-slate-200">{selectedStudent?.paymentDueDate}</strong></div>
            </div>
          </div>

          <div className="flex-1">
            <ActiveStudentComponent />
          </div>

          {/* BOTTOM NAVIGATION BAR (FIXA NA ZONA DO POLEGAR DO ALUNO) */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur border-t border-slate-800">
            <div className="max-w-md mx-auto grid grid-cols-3 gap-2 p-2">
              {STUDENT_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveStudentTab(mod.id)}
                  className={`py-3 rounded-2xl text-xs font-extrabold transition-all ${
                    activeStudentTab === mod.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'bg-slate-900 text-slate-400'
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
