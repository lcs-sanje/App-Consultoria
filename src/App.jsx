import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { StudentCRMModule } from './modules/coach/crm/StudentCRMModule.jsx';
import { AnamnesisAndEnergyModule } from './modules/coach/anamnesis/AnamnesisAndEnergyModule.jsx';
import { WorkoutBuilderModule } from './modules/coach/workout-builder/WorkoutBuilderModule.jsx';
import { DietBuilderModule } from './modules/coach/diet-builder/DietBuilderModule.jsx';
import { CatalogManagerModule } from './modules/coach/catalog-manager/CatalogManagerModule.jsx';
import { StudentHomeModule } from './modules/student/home/StudentHomeModule.jsx';
import { StudentWorkoutModule } from './modules/student/one-handed-workout/StudentWorkoutModule.jsx';
import { StudentDietModule } from './modules/student/daily-diet/StudentDietModule.jsx';
import { StudentCheckinModule } from './modules/student/checkin/StudentCheckinModule.jsx';

/**
 * REGISTRO MODULAR DE TELAS (PLUG & PLAY)
 * Separação total entre o Sistema Web do Profissional e o Aplicativo Mobile do Aluno.
 */
const COACH_MODULES = [
  {
    id: 'crm',
    shortLabel: '1. Alunos & Datas (CRM)',
    fullTitle: 'Gestão de Alunos, Pagamentos e Feedbacks',
    Component: StudentCRMModule,
  },
  {
    id: 'anamnesis',
    shortLabel: '2. Anamnese & Cálculo GET',
    fullTitle: 'Anamnese Integrada, Antropometria e Fórmulas Energéticas',
    Component: AnamnesisAndEnergyModule,
  },
  {
    id: 'workout',
    shortLabel: '3. Prescrição de Treino',
    fullTitle: 'Prescrição de Treinamento Resistido, Aeróbio e Volume Semanal',
    Component: WorkoutBuilderModule,
  },
  {
    id: 'diet',
    shortLabel: '4. Prescrição de Dieta',
    fullTitle: 'Planejamento Alimentar, Macronutrientes e Equivalências',
    Component: DietBuilderModule,
  },
  {
    id: 'catalogs',
    shortLabel: '5. Repertórios (Exerc. & Alim.)',
    fullTitle: 'Biblioteca de Exercícios e Banco de Alimentos (TACO/TBCA)',
    Component: CatalogManagerModule,
  },
];

const STUDENT_MODULES = [
  { id: 'home', label: 'Início', Component: StudentHomeModule },
  { id: 'workout', label: 'Treino 1-Mão', Component: StudentWorkoutModule },
  { id: 'diet', label: 'Dieta & Água', Component: StudentDietModule },
  { id: 'checkin', label: 'Check-in', Component: StudentCheckinModule },
];

/**
 * AMBIENTE 0: PORTAL DE ESCOLHA (SEPARAÇÃO CLARA ENTRE PROFISSIONAL E ALUNO)
 */
function EnvironmentPortal() {
  const {
    setViewMode,
    students,
    selectedStudentId,
    setSelectedStudentId,
    setActiveStudentTab,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-stone-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sage-100 border border-sage-300 text-sage-800 text-xs font-extrabold uppercase tracking-wider">
            Ecossistema Integrado • Educação Física & Nutrição
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
            Escolha qual aplicativo deseja acessar
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">
            O sistema possui duas interfaces independentes conectadas em tempo real: o{' '}
            <strong>Painel Clínico/Esportivo do Profissional</strong> e o{' '}
            <strong>Aplicativo Mobile do Aluno</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Aplicativo do Profissional */}
          <div className="bg-white border-2 border-stone-200 hover:border-stone-900 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-50 flex items-center justify-center font-black text-sm">
                PRO
              </div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-clay-700">
                Visão Desktop / Consultório
              </span>
              <h2 className="text-xl font-black text-stone-900">
                Portal do Profissional (Você)
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ambiente completo para gestão de alunos, controle de datas de pagamento e feedback,
                anamnese de 7 blocos, comparativo de 8 fórmulas de TMB/GET, montagem de treino
                resistido/aeróbio e prescrição nutricional.
              </p>
              <ul className="space-y-1.5 text-xs text-stone-700 pt-1">
                <li>• Controle de Vencimentos e Check-ins (CRM)</li>
                <li>• Fórmulas Mifflin, Cunningham, Tinsley, Pollock, US Navy e ACSM</li>
                <li>• Auditoria de Séries Semanais e Equivalência de Alimentos</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('coach')}
              className="w-full py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs tracking-wide shadow-sm transition-all"
            >
              Entrar no Portal do Profissional →
            </button>
          </div>

          {/* Card 2: Aplicativo do Aluno */}
          <div className="bg-white border-2 border-sage-300 hover:border-sage-600 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sage-600 text-white flex items-center justify-center font-black text-sm">
                APP
              </div>
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-sage-700">
                Visão Mobile • Ergonomia de 1 Mão
              </span>
              <h2 className="text-xl font-black text-stone-900">
                Aplicativo do Aluno (Modo Academia)
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Interface limpa, sem poluição visual e projetada para uso com apenas o polegar na
                academia. Cargas pré-preenchidas da última sessão, conclusão em 1 toque, timer de
                descanso automático e substituição de alimentos/exercícios.
              </p>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-stone-500">
                  Selecione qual aluno deseja simular:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.goal}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveStudentTab('home');
                setViewMode('student');
              }}
              className="w-full py-3.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-extrabold text-xs tracking-wide shadow-sm transition-all"
            >
              Abrir Aplicativo do Aluno →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AMBIENTE 1: SISTEMA EXCLUSIVO DO PROFISSIONAL (SIDEBAR + WORKSPACE DESKTOP)
 */
function CoachApplication() {
  const {
    setViewMode,
    activeCoachTab,
    setActiveCoachTab,
    setActiveStudentTab,
    students,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    resetDemoData,
  } = useApp();

  const currentModule =
    COACH_MODULES.find((m) => m.id === activeCoachTab) || COACH_MODULES[0];
  const ActiveCoachComponent = currentModule.Component;

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-stone-800 flex flex-col lg:flex-row">
      {/* SIDEBAR LATERAL DO PROFISSIONAL */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-stone-200 p-4 flex flex-col justify-between gap-4 shrink-0">
        <div className="space-y-5">
          {/* Identidade do Portal do Profissional */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-stone-900 flex items-center justify-center font-black text-stone-50 text-xs">
                PRO
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-extrabold text-stone-900 truncate">
                  Portal do Profissional
                </h1>
                <p className="text-[11px] text-stone-500 truncate">
                  Ed. Física & Nutrição
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('portal')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
              title="Voltar à tela de seleção de aplicativo"
            >
              ⇄ Portal
            </button>
          </div>

          {/* Caixa do Aluno em Atendimento */}
          <div className="p-3.5 rounded-2xl bg-sage-50/80 border border-sage-300 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sage-800 block">
              Aluno em Atendimento:
            </span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-white border border-sage-300 rounded-xl px-3 py-2 text-xs font-extrabold text-stone-900 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.weightKg}kg)
                </option>
              ))}
            </select>
            <div className="text-[11px] text-stone-600 flex justify-between pt-0.5">
              <span>{selectedStudent?.age} anos</span>
              <span>•</span>
              <span>{selectedStudent?.heightCm} cm</span>
              <span>•</span>
              <span>BF: {selectedStudent?.bodyFatPercent}%</span>
            </div>
          </div>

          {/* Navegação Vertical dos Módulos Profissionais */}
          <nav className="space-y-1.5">
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Módulos de Trabalho
            </span>
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {COACH_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setActiveCoachTab(mod.id)}
                  className={`w-auto lg:w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeCoachTab === mod.id
                      ? 'bg-stone-900 text-stone-50 shadow-sm'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {mod.shortLabel}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Rodapé da Sidebar: Simular App do Aluno ou Resetar Demo */}
        <div className="space-y-2 pt-3 border-t border-stone-200">
          <button
            type="button"
            onClick={() => {
              setActiveStudentTab('home');
              setViewMode('student');
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold bg-sage-600 hover:bg-sage-700 text-white shadow-sm transition-all"
          >
            📱 Ver no App do Aluno ({selectedStudent?.name?.split(' ')[0]})
          </button>
          <button
            type="button"
            onClick={resetDemoData}
            className="w-full py-2 px-3 rounded-xl text-[11px] font-semibold bg-clay-100 hover:bg-clay-200 text-clay-800 border border-clay-300 transition-colors"
          >
            ↺ Restaurar Dados de Demonstração
          </button>
        </div>
      </aside>

      {/* ÁREA DE TRABALHO PRINCIPAL DO PROFISSIONAL */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-clay-700 block">
              Paciente / Aluno Selecionado: {selectedStudent?.name}
            </span>
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              {currentModule.fullTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 font-semibold">
              Próximo Feedback: <strong>{selectedStudent?.nextFeedbackDate}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 font-semibold">
              Vencimento Plano: <strong>{selectedStudent?.paymentDueDate}</strong>
            </span>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
          <ActiveCoachComponent />
        </main>
      </div>
    </div>
  );
}

/**
 * AMBIENTE 2: APLICATIVO EXCLUSIVO DO ALUNO (EXPERIÊNCIA MOBILE INDEPENDENTE)
 */
function StudentMobileApplication() {
  const {
    setViewMode,
    activeStudentTab,
    setActiveStudentTab,
    students,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
  } = useApp();

  const ActiveStudentComponent =
    STUDENT_MODULES.find((m) => m.id === activeStudentTab)?.Component || StudentWorkoutModule;

  return (
    <div className="min-h-screen bg-stone-200/80 text-stone-800 flex flex-col">
      {/* Barra Superior Externa de Simulação (Separada da Tela do Celular do Aluno) */}
      <div className="bg-stone-900 text-stone-200 px-4 py-2 text-xs">
        <div className="max-w-md mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-400" />
            <span className="text-[11px] text-stone-300 font-semibold">Aluno logado:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('portal')}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold"
            >
              ⇄ Portal
            </button>
            <button
              type="button"
              onClick={() => setViewMode('coach')}
              className="px-2.5 py-1 rounded-lg bg-sage-700 hover:bg-sage-600 text-white text-[11px] font-bold"
            >
              ← Painel do Profissional
            </button>
          </div>
        </div>
      </div>

      {/* Container Mobile Nativo do Aluno */}
      <div className="flex-1 w-full max-w-md mx-auto bg-[#F5F4F0] min-h-screen shadow-xl border-x border-stone-300/80 flex flex-col">
        {/* Header Exclusivo do Aplicativo do Aluno */}
        <header className="bg-white border-b border-stone-200 px-4 py-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-sage-700 block">
              App do Aluno • Consultoria Integrada
            </span>
            <h1 className="text-sm font-black text-stone-900 truncate">
              {selectedStudent?.name}
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-clay-100 text-clay-800 border border-clay-300">
            Semana {selectedStudent?.workoutPlan?.currentWeek || 1}/
            {selectedStudent?.workoutPlan?.totalWeeks || 8}
          </span>
        </header>

        {/* Conteúdo da Aba Mobile Ativa */}
        <main className="flex-1 px-3.5 pt-4">
          <ActiveStudentComponent />
        </main>

        {/* BARRA DE NAVEGAÇÃO INFERIOR DO ALUNO (ZONA DO POLEGAR / 1 MÃO) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 bg-white/95 backdrop-blur border-t border-stone-200 shadow-lg">
          <div className="grid grid-cols-4 gap-1.5 p-2">
            {STUDENT_MODULES.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveStudentTab(mod.id)}
                className={`py-3 px-1.5 rounded-2xl text-[11px] font-extrabold transition-all text-center ${
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
      </div>
    </div>
  );
}

function RootRouter() {
  const { viewMode } = useApp();
  if (viewMode === 'portal') return <EnvironmentPortal />;
  if (viewMode === 'student') return <StudentMobileApplication />;
  return <CoachApplication />;
}

export default function App() {
  return (
    <AppProvider>
      <RootRouter />
    </AppProvider>
  );
}
