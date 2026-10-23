import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext.jsx';

export function StudentCRMModule() {
  const {
    students,
    selectedStudentId,
    setSelectedStudentId,
    setActiveCoachTab,
    setViewMode,
    registerPaymentRenewal,
    addNewStudent,
    updateStudent,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'FEEDBACK_ALERT' | 'PAYMENT_ALERT'
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    sex: 'M',
    age: 28,
    heightCm: 175,
    weightKg: 78,
    bodyFatPercent: 16,
    goal: 'Hipertrofia & Recomposição Corporal',
    billingCycle: 'Mensal',
    paymentDueDate: '2026-11-22',
    nextFeedbackDate: '2026-11-05',
  });

  const todayStr = '2026-10-22';

  const getPaymentBadge = (stu) => {
    if (stu.paymentDueDate < todayStr || stu.paymentStatus === 'Pagamento Atrasado') {
      return {
        label: 'Pagamento Vencido',
        classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        isAlert: true,
      };
    }
    return {
      label: 'Pagamento em Dia',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      isAlert: false,
    };
  };

  const getFeedbackBadge = (stu) => {
    if (stu.nextFeedbackDate < todayStr || stu.feedbackStatus === 'Feedback Atrasado') {
      return {
        label: 'Feedback Atrasado',
        classes: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        isAlert: true,
      };
    }
    if (stu.nextFeedbackDate === todayStr || stu.feedbackStatus === 'Feedback Hoje') {
      return {
        label: 'Feedback Hoje!',
        classes: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        isAlert: true,
      };
    }
    return {
      label: 'Check-in em Dia',
      classes: 'bg-slate-700/60 text-slate-300 border-slate-600',
      isAlert: false,
    };
  };

  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const matchesName =
        stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stu.goal || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesName) return false;

      if (statusFilter === 'PAYMENT_ALERT') {
        return getPaymentBadge(stu).isAlert;
      }
      if (statusFilter === 'FEEDBACK_ALERT') {
        return getFeedbackBadge(stu).isAlert;
      }
      return true;
    });
  }, [students, searchTerm, statusFilter]);

  const metrics = useMemo(() => {
    const total = students.length;
    const paymentAlerts = students.filter((s) => getPaymentBadge(s).isAlert).length;
    const feedbackAlerts = students.filter((s) => getFeedbackBadge(s).isAlert).length;
    return { total, paymentAlerts, feedbackAlerts };
  }, [students]);

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;
    addNewStudent(newForm);
    setShowNewModal(false);
    setNewForm({
      name: '',
      sex: 'M',
      age: 28,
      heightCm: 175,
      weightKg: 78,
      bodyFatPercent: 16,
      goal: 'Hipertrofia & Recomposição Corporal',
      billingCycle: 'Mensal',
      paymentDueDate: '2026-11-22',
      nextFeedbackDate: '2026-11-05',
    });
  };

  return (
    <div className="space-y-6">
      {/* KPIs Executivos da Consultoria */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'ALL'
              ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total de Alunos Ativos
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
              CRM Geral
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{metrics.total}</span>
            <span className="text-xs text-slate-400">alunos acompanhados</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'FEEDBACK_ALERT' ? 'ALL' : 'FEEDBACK_ALERT')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'FEEDBACK_ALERT'
              ? 'bg-sky-950/50 border-sky-400 shadow-lg shadow-sky-500/10'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Feedbacks Hoje / Atrasados
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300">
              Clique p/ Filtrar
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-400">{metrics.feedbackAlerts}</span>
            <span className="text-xs text-slate-400">aguardando revisão de treino/dieta</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'PAYMENT_ALERT' ? 'ALL' : 'PAYMENT_ALERT')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'PAYMENT_ALERT'
              ? 'bg-rose-950/50 border-rose-400 shadow-lg shadow-rose-500/10'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Pagamentos Vencidos
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300">
              Financeiro
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400">{metrics.paymentAlerts}</span>
            <span className="text-xs text-slate-400">pendentes de renovação</span>
          </div>
        </button>
      </div>

      {/* Barra de Busca e Novo Aluno */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex-1 flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aluno por nome ou objetivo (ex: Hipertrofia, Emagrecimento)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {statusFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 whitespace-nowrap"
            >
              Limpar Filtro
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap"
        >
          + Cadastrar Novo Aluno
        </button>
      </div>

      {/* Lista de Alunos com Controle de Datas de Pagamento e Feedback */}
      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map((stu) => {
          const isSelected = stu.id === selectedStudentId;
          const payBadge = getPaymentBadge(stu);
          const fbBadge = getFeedbackBadge(stu);

          return (
            <div
              key={stu.id}
              onClick={() => setSelectedStudentId(stu.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Coluna 1: Identificação e Biometria */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-lg font-bold text-white">{stu.name}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Aluno Selecionado
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${payBadge.classes}`}>
                      {payBadge.label}
                    </span>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${fbBadge.classes}`}>
                      {fbBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-200">{stu.goal}</strong> • {stu.age} anos •{' '}
                    {stu.heightCm} cm • <strong className="text-emerald-400">{stu.weightKg} kg</strong> (
                    {stu.bodyFatPercent}% Gordura) • Plano {stu.billingCycle}
                  </p>
                </div>

                {/* Coluna 2: Controle de Datas Editáveis (Pagamento e Feedback) */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Vencimento do Pagamento
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="date"
                        value={stu.paymentDueDate}
                        onChange={(e) =>
                          updateStudent(stu.id, {
                            paymentDueDate: e.target.value,
                            paymentStatus: e.target.value >= todayStr ? 'Em dia' : 'Pagamento Atrasado',
                          })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => registerPaymentRenewal(stu.id, 30)}
                        title="Confirmar pagamento recebido e renovar por +30 dias"
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 whitespace-nowrap"
                      >
                        ✓ Renovar +30d
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Próximo Feedback (Check-in)
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="date"
                        value={stu.nextFeedbackDate}
                        onChange={(e) =>
                          updateStudent(stu.id, {
                            nextFeedbackDate: e.target.value,
                            feedbackStatus:
                              e.target.value === todayStr
                                ? 'Feedback Hoje'
                                : e.target.value < todayStr
                                ? 'Feedback Atrasado'
                                : 'Em dia',
                          })
                        }
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        a cada {stu.feedbackFrequencyDays}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coluna 3: Ações Diretas nos Módulos */}
                <div
                  className="flex flex-wrap items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setActiveCoachTab('anamnesis');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  >
                    Anamnese & GET
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setActiveCoachTab('workout');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30"
                  >
                    Treino (Força + Cardio)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setActiveCoachTab('diet');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                  >
                    Dieta & Macros
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setViewMode('student');
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                  >
                    📱 Abrir Visão Aluno (1 Mão)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro de Novo Aluno */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Cadastrar Novo Aluno na Consultoria</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕ Fechar
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Ex: Mariana Costa"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sexo</label>
                  <select
                    value={newForm.sex}
                    onChange={(e) => setNewForm({ ...newForm, sex: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Idade</label>
                  <input
                    type="number"
                    value={newForm.age}
                    onChange={(e) => setNewForm({ ...newForm, age: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    value={newForm.heightCm}
                    onChange={(e) => setNewForm({ ...newForm, heightCm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Peso Inicial (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newForm.weightKg}
                    onChange={(e) => setNewForm({ ...newForm, weightKg: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">% Gordura Estimado</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newForm.bodyFatPercent}
                    onChange={(e) => setNewForm({ ...newForm, bodyFatPercent: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Objetivo Principal</label>
                <input
                  type="text"
                  value={newForm.goal}
                  onChange={(e) => setNewForm({ ...newForm, goal: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Data Próximo Pagamento</label>
                  <input
                    type="date"
                    value={newForm.paymentDueDate}
                    onChange={(e) => setNewForm({ ...newForm, paymentDueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Data Próximo Feedback</label>
                  <input
                    type="date"
                    value={newForm.nextFeedbackDate}
                    onChange={(e) => setNewForm({ ...newForm, nextFeedbackDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Criar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
