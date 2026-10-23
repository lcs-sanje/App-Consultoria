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
        classes: 'bg-[#F6E6E2] text-[#7D3527] border-[#E4C3BC]',
        isAlert: true,
      };
    }
    return {
      label: 'Pagamento em Dia',
      classes: 'bg-sage-100 text-sage-800 border-sage-300',
      isAlert: false,
    };
  };

  const getFeedbackBadge = (stu) => {
    if (stu.nextFeedbackDate < todayStr || stu.feedbackStatus === 'Feedback Atrasado') {
      return {
        label: 'Feedback Atrasado',
        classes: 'bg-clay-200 text-clay-900 border-clay-400',
        isAlert: true,
      };
    }
    if (stu.nextFeedbackDate === todayStr || stu.feedbackStatus === 'Feedback Hoje') {
      return {
        label: 'Feedback Hoje',
        classes: 'bg-clay-100 text-clay-800 border-clay-300',
        isAlert: true,
      };
    }
    return {
      label: 'Check-in em Dia',
      classes: 'bg-stone-100 text-stone-700 border-stone-300',
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
      {/* KPIs Executivos da Consultoria em Tons Pastéis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'ALL'
              ? 'bg-white border-stone-900 shadow-sm ring-1 ring-stone-900/10'
              : 'bg-white/80 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total de Alunos Ativos
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
              CRM Geral
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900">{metrics.total}</span>
            <span className="text-xs text-stone-500">alunos acompanhados</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'FEEDBACK_ALERT' ? 'ALL' : 'FEEDBACK_ALERT')
          }
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'FEEDBACK_ALERT'
              ? 'bg-clay-100/90 border-clay-600 shadow-sm'
              : 'bg-white/80 border-stone-200 hover:border-clay-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-clay-800">
              Feedbacks Hoje / Pendentes
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-clay-100 text-clay-800 border border-clay-300">
              Filtrar Check-ins
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-clay-800">{metrics.feedbackAlerts}</span>
            <span className="text-xs text-stone-600">aguardando revisão de treino/dieta</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setStatusFilter(statusFilter === 'PAYMENT_ALERT' ? 'ALL' : 'PAYMENT_ALERT')
          }
          className={`text-left p-5 rounded-2xl border transition-all ${
            statusFilter === 'PAYMENT_ALERT'
              ? 'bg-[#F8EAE6] border-[#B86B5A] shadow-sm'
              : 'bg-white/80 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7D3527]">
              Pagamentos Vencidos
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F6E6E2] text-[#7D3527] border border-[#E4C3BC]">
              Financeiro
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#7D3527]">{metrics.paymentAlerts}</span>
            <span className="text-xs text-stone-600">pendentes de renovação</span>
          </div>
        </button>
      </div>

      {/* Barra de Busca e Novo Aluno */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aluno por nome ou objetivo (ex: Hipertrofia, Emagrecimento)..."
            className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-sage-600"
          />
          {statusFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 whitespace-nowrap"
            >
              Limpar Filtro
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-sage-600 hover:bg-sage-700 text-white shadow-sm transition-all whitespace-nowrap"
        >
          + Cadastrar Novo Aluno
        </button>
      </div>

      {/* Lista de Alunos — Layout em 2 Andares (Zero Sobreposição) */}
      <div className="grid grid-cols-1 gap-4">
        {filteredStudents.map((stu) => {
          const isSelected = stu.id === selectedStudentId;
          const payBadge = getPaymentBadge(stu);
          const fbBadge = getFeedbackBadge(stu);

          return (
            <div
              key={stu.id}
              onClick={() => setSelectedStudentId(stu.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-4 ${
                isSelected
                  ? 'bg-white border-sage-600 ring-2 ring-sage-600/20 shadow-sm'
                  : 'bg-white/90 border-stone-200 hover:border-stone-300 shadow-sm'
              }`}
            >
              {/* ANDAR SUPERIOR: Dados do Aluno + Botões de Navegação Rápida */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-extrabold text-stone-900">{stu.name}</span>
                    {isSelected && (
                      <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-sage-100 text-sage-800 border border-sage-300">
                        Selecionado
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${payBadge.classes}`}
                    >
                      {payBadge.label}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${fbBadge.classes}`}
                    >
                      {fbBadge.label}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    <strong className="text-stone-900">{stu.goal}</strong> • {stu.age} anos •{' '}
                    {stu.heightCm} cm •{' '}
                    <strong className="text-sage-700">{stu.weightKg} kg</strong> (
                    {stu.bodyFatPercent}% Gordura) • Ciclo {stu.billingCycle}
                  </p>
                </div>

                {/* Ações Diretas nos Módulos */}
                <div
                  className="flex flex-wrap items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setActiveCoachTab('anamnesis');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors"
                  >
                    Anamnese & GET
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setActiveCoachTab('workout');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-clay-100 hover:bg-clay-200 text-clay-900 border border-clay-300 transition-colors"
                  >
                    Prescrever Treino
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setActiveCoachTab('diet');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sage-100 hover:bg-sage-200 text-sage-900 border border-sage-300 transition-colors"
                  >
                    Prescrever Dieta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(stu.id);
                      setViewMode('student');
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-stone-50 transition-colors"
                  >
                    📱 Visão Aluno (1 Mão)
                  </button>
                </div>
              </div>

              {/* ANDAR INFERIOR: Controle de Datas de Pagamento e Feedback (Espaçado e Sem Colisão) */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3.5 border-t border-stone-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Bloco 1: Data de Pagamento */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                      Vencimento do Pagamento
                    </span>
                    <span className="text-xs text-stone-600">
                      Último registro: <strong>{stu.lastPaymentDate}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={stu.paymentDueDate}
                      onChange={(e) =>
                        updateStudent(stu.id, {
                          paymentDueDate: e.target.value,
                          paymentStatus:
                            e.target.value >= todayStr ? 'Em dia' : 'Pagamento Atrasado',
                        })
                      }
                      className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-sage-600"
                    />
                    <button
                      type="button"
                      onClick={() => registerPaymentRenewal(stu.id, 30)}
                      title="Confirmar pagamento recebido e renovar por +30 dias"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white shadow-sm whitespace-nowrap transition-colors"
                    >
                      ✓ Renovar +30d
                    </button>
                  </div>
                </div>

                {/* Bloco 2: Data de Feedback (Check-in) */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                      Próximo Feedback (Check-in)
                    </span>
                    <span className="text-xs text-stone-600">
                      Último envio: <strong>{stu.lastFeedbackDate}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
                      className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:border-clay-600"
                    />
                    <span className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-clay-100 text-clay-800 border border-clay-300 whitespace-nowrap">
                      Ciclo: {stu.feedbackFrequencyDays} dias
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Cadastro de Novo Aluno */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-stone-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-extrabold text-stone-900">
                Cadastrar Novo Aluno na Consultoria
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-stone-500 hover:text-stone-900 text-xs font-bold px-2 py-1 rounded-lg bg-stone-100"
              >
                ✕ Fechar
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Ex: Mariana Costa"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Sexo</label>
                  <select
                    value={newForm.sex}
                    onChange={(e) => setNewForm({ ...newForm, sex: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Idade</label>
                  <input
                    type="number"
                    value={newForm.age}
                    onChange={(e) => setNewForm({ ...newForm, age: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={newForm.heightCm}
                    onChange={(e) => setNewForm({ ...newForm, heightCm: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Peso Inicial (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newForm.weightKg}
                    onChange={(e) => setNewForm({ ...newForm, weightKg: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    % Gordura Estimado
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newForm.bodyFatPercent}
                    onChange={(e) => setNewForm({ ...newForm, bodyFatPercent: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Objetivo Principal
                </label>
                <input
                  type="text"
                  value={newForm.goal}
                  onChange={(e) => setNewForm({ ...newForm, goal: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Data Próximo Pagamento
                  </label>
                  <input
                    type="date"
                    value={newForm.paymentDueDate}
                    onChange={(e) => setNewForm({ ...newForm, paymentDueDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Data Próximo Feedback
                  </label>
                  <input
                    type="date"
                    value={newForm.nextFeedbackDate}
                    onChange={(e) => setNewForm({ ...newForm, nextFeedbackDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sage-600 text-white hover:bg-sage-700"
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
