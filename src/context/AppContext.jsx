import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { storageAdapter } from '../core/storage/storageAdapter.js';
import { INITIAL_STUDENTS } from '../data/initialMockData.js';
import { INITIAL_EXERCISES_CATALOG, CARDIO_MODALITIES_CATALOG } from '../data/exercisesCatalog.js';
import { INITIAL_FOODS_CATALOG } from '../data/foodsCatalog.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [viewMode, setViewMode] = useState('portal'); // 'portal' | 'coach' | 'student'
  const [activeCoachTab, setActiveCoachTab] = useState('crm'); // 'crm' | 'anamnesis' | 'workout' | 'diet' | 'catalogs'
  const [activeStudentTab, setActiveStudentTab] = useState('home'); // 'home' | 'workout' | 'diet' | 'checkin'

  const [students, setStudents] = useState(() =>
    storageAdapter.load('students', INITIAL_STUDENTS)
  );
  const [exercisesCatalog, setExercisesCatalog] = useState(() =>
    storageAdapter.load('exercises_catalog', INITIAL_EXERCISES_CATALOG)
  );
  const [foodsCatalog, setFoodsCatalog] = useState(() =>
    storageAdapter.load('foods_catalog', INITIAL_FOODS_CATALOG)
  );
  const [selectedStudentId, setSelectedStudentId] = useState(() =>
    INITIAL_STUDENTS[0]?.id || 'stu_1'
  );

  // Sincronização automática com o Storage Adapter
  useEffect(() => {
    storageAdapter.save('students', students);
  }, [students]);

  useEffect(() => {
    storageAdapter.save('exercises_catalog', exercisesCatalog);
  }, [exercisesCatalog]);

  useEffect(() => {
    storageAdapter.save('foods_catalog', foodsCatalog);
  }, [foodsCatalog]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  // Ação genérica e segura para atualizar qualquer propriedade de um aluno
  const updateStudent = (studentId, updater) => {
    setStudents((prev) =>
      prev.map((stu) => {
        if (stu.id !== studentId) return stu;
        const nextData = typeof updater === 'function' ? updater(stu) : { ...stu, ...updater };
        return nextData;
      })
    );
  };

  // Cadastro de novo aluno no CRM
  const addNewStudent = (newStudentPartial) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const id = `stu_${Date.now()}`;
    const baseTemplate = INITIAL_STUDENTS[0];
    const created = {
      ...baseTemplate,
      id,
      name: newStudentPartial.name || 'Novo Aluno',
      email: newStudentPartial.email || '',
      phone: newStudentPartial.phone || '',
      sex: newStudentPartial.sex || 'M',
      age: Number(newStudentPartial.age) || 28,
      heightCm: Number(newStudentPartial.heightCm) || 172,
      weightKg: Number(newStudentPartial.weightKg) || 74,
      bodyFatPercent: Number(newStudentPartial.bodyFatPercent) || 18,
      goal: newStudentPartial.goal || 'Hipertrofia & Recomposição Corporal',
      planType: newStudentPartial.planType || 'Combo Integrado (Treino + Dieta)',
      billingCycle: newStudentPartial.billingCycle || 'Mensal',
      lastPaymentDate: todayStr,
      paymentDueDate: newStudentPartial.paymentDueDate || '2026-11-22',
      paymentStatus: 'Em dia',
      lastFeedbackDate: todayStr,
      nextFeedbackDate: newStudentPartial.nextFeedbackDate || '2026-11-05',
      feedbackFrequencyDays: Number(newStudentPartial.feedbackFrequencyDays) || 14,
      feedbackStatus: 'Em dia',
      waterIntakeTodayMl: 0,
      waterTargetMl: Math.round((Number(newStudentPartial.weightKg) || 74) * 40),
      feedbackHistory: [],
    };
    setStudents((prev) => [created, ...prev]);
    setSelectedStudentId(id);
    return created;
  };

  // Renovação de Pagamento com 1 clique no CRM
  const registerPaymentRenewal = (studentId, daysToAdd = 30) => {
    const today = new Date();
    const nextDue = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().slice(0, 10);
    const nextDueStr = nextDue.toISOString().slice(0, 10);

    updateStudent(studentId, (stu) => ({
      ...stu,
      lastPaymentDate: todayStr,
      paymentDueDate: nextDueStr,
      paymentStatus: 'Em dia',
    }));
  };

  // Registro de novo Feedback (Check-in do aluno)
  const registerStudentFeedback = (studentId, feedbackPayload) => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    updateStudent(studentId, (stu) => {
      const freq = Number(stu.feedbackFrequencyDays) || 14;
      const nextFb = new Date(today.getTime() + freq * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const newEntry = {
        id: `fb_${Date.now()}`,
        date: todayStr,
        weightKg: Number(feedbackPayload.weightKg) || stu.weightKg,
        dietAdherence: Number(feedbackPayload.dietAdherence) || 9,
        sleepQuality: Number(feedbackPayload.sleepQuality) || 4,
        energyLevel: Number(feedbackPayload.energyLevel) || 4,
        jointPainNotes: feedbackPayload.jointPainNotes || 'Sem dores articulares',
        studentNotes: feedbackPayload.studentNotes || '',
        coachReply: feedbackPayload.coachReply || 'Feedback recebido! Em análise pelo treinador.',
      };

      return {
        ...stu,
        weightKg: newEntry.weightKg,
        lastFeedbackDate: todayStr,
        nextFeedbackDate: nextFb,
        feedbackStatus: 'Feedback Recebido',
        feedbackHistory: [newEntry, ...(stu.feedbackHistory || [])],
      };
    });
  };

  // Registro de série na Visão do Aluno (One-Handed UX)
  const logStudentSet = (studentId, sessionId, workoutItemId, setIndex, weightKg, reps, completed) => {
    updateStudent(studentId, (stu) => {
      const nextSessions = (stu.workoutPlan?.sessions || []).map((sess) => {
        if (sess.id !== sessionId) return sess;
        const nextExercises = (sess.exercises || []).map((item) => {
          if (item.id !== workoutItemId) return item;
          const nextSets = (item.setsDetail || []).map((s, idx) => {
            if (idx !== setIndex) return s;
            return {
              ...s,
              lastWeightKg: Number(weightKg),
              lastReps: Number(reps),
              completed: Boolean(completed),
            };
          });
          return { ...item, setsDetail: nextSets };
        });
        return { ...sess, exercises: nextExercises };
      });
      return {
        ...stu,
        workoutPlan: {
          ...stu.workoutPlan,
          sessions: nextSessions,
        },
      };
    });
  };

  // Troca de exercício em 1 toque ("Aparelho Ocupado")
  const swapStudentExercise = (studentId, sessionId, workoutItemId, newExerciseId) => {
    updateStudent(studentId, (stu) => {
      const nextSessions = (stu.workoutPlan?.sessions || []).map((sess) => {
        if (sess.id !== sessionId) return sess;
        const nextExercises = (sess.exercises || []).map((item) => {
          if (item.id !== workoutItemId) return item;
          return { ...item, exerciseId: newExerciseId };
        });
        return { ...sess, exercises: nextExercises };
      });
      return {
        ...stu,
        workoutPlan: { ...stu.workoutPlan, sessions: nextSessions },
      };
    });
  };

  // Registro rápido de água pelo aluno (+250ml / +500ml)
  const addStudentWater = (studentId, deltaMl) => {
    updateStudent(studentId, (stu) => ({
      ...stu,
      waterIntakeTodayMl: Math.max(0, (Number(stu.waterIntakeTodayMl) || 0) + Number(deltaMl)),
    }));
  };

  // Marcar refeição como feita pelo aluno (1 toque)
  const toggleStudentMealCompleted = (studentId, dayKey, mealId) => {
    updateStudent(studentId, (stu) => {
      const targetDay = stu.dietPlan?.days?.[dayKey];
      if (!targetDay) return stu;
      const nextMeals = (targetDay.meals || []).map((m) =>
        m.id === mealId ? { ...m, completedToday: !m.completedToday } : m
      );
      return {
        ...stu,
        dietPlan: {
          ...stu.dietPlan,
          days: {
            ...stu.dietPlan.days,
            [dayKey]: {
              ...targetDay,
              meals: nextMeals,
            },
          },
        },
      };
    });
  };

  // Adicionar exercício ao repertório
  const addCustomExercise = (ex) => {
    const created = {
      id: `ex_custom_${Date.now()}`,
      name: ex.name,
      primaryMuscle: ex.primaryMuscle || 'Peitoral',
      secondaryMuscles: ex.secondaryMuscles || [],
      equipment: ex.equipment || 'Halteres',
      pattern: ex.pattern || ' Geral',
      cues: ex.cues || '',
      substituteIds: ex.substituteIds || [],
    };
    setExercisesCatalog((prev) => [created, ...prev]);
    return created;
  };

  // Adicionar alimento ao repertório
  const addCustomFood = (fd) => {
    const created = {
      id: `fd_custom_${Date.now()}`,
      name: fd.name,
      group: fd.group || 'Carboidratos / Tubérculos / Grãos',
      source: 'Personalizado',
      kcalPer100g: Number(fd.kcalPer100g) || 0,
      proteinPer100g: Number(fd.proteinPer100g) || 0,
      carbsPer100g: Number(fd.carbsPer100g) || 0,
      fatPer100g: Number(fd.fatPer100g) || 0,
      fiberPer100g: Number(fd.fiberPer100g) || 0,
      householdMeasures: [
        {
          name: fd.measureName || 'Porção caseira',
          grams: Number(fd.measureGrams) || 100,
        },
      ],
    };
    setFoodsCatalog((prev) => [created, ...prev]);
    return created;
  };

  const resetDemoData = () => {
    storageAdapter.resetAll();
    setStudents(INITIAL_STUDENTS);
    setExercisesCatalog(INITIAL_EXERCISES_CATALOG);
    setFoodsCatalog(INITIAL_FOODS_CATALOG);
    setSelectedStudentId(INITIAL_STUDENTS[0].id);
  };

  const value = {
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
    exercisesCatalog,
    foodsCatalog,
    cardioModalities: CARDIO_MODALITIES_CATALOG,
    updateStudent,
    addNewStudent,
    registerPaymentRenewal,
    registerStudentFeedback,
    logStudentSet,
    swapStudentExercise,
    addStudentWater,
    toggleStudentMealCompleted,
    addCustomExercise,
    addCustomFood,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser utilizado dentro de um AppProvider');
  }
  return ctx;
}
