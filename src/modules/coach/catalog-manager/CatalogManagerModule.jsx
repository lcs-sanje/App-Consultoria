import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext.jsx';
import { MUSCLE_GROUPS } from '../../../data/exercisesCatalog.js';
import { FOOD_GROUPS } from '../../../data/foodsCatalog.js';

export function CatalogManagerModule() {
  const { exercisesCatalog, foodsCatalog, addCustomExercise, addCustomFood } = useApp();
  const [activeCatalog, setActiveCatalog] = useState('exercises'); // 'exercises' | 'foods'
  const [search, setSearch] = useState('');

  // Form Novo Exercício
  const [exForm, setExForm] = useState({
    name: '',
    primaryMuscle: 'Peitoral',
    secondaryMusclesText: 'Tríceps, Deltoide Anterior',
    equipment: 'Halteres',
    pattern: 'Empurrar Horizontal',
    cues: '',
  });

  // Form Novo Alimento
  const [foodForm, setFoodForm] = useState({
    name: '',
    group: 'Carboidratos / Tubérculos / Grãos',
    kcalPer100g: 120,
    proteinPer100g: 3,
    carbsPer100g: 25,
    fatPer100g: 1,
    fiberPer100g: 2,
    measureName: 'Colher de sopa cheia',
    measureGrams: 30,
  });

  const handleCreateExercise = (e) => {
    e.preventDefault();
    if (!exForm.name.trim()) return;
    addCustomExercise({
      ...exForm,
      secondaryMuscles: exForm.secondaryMusclesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setExForm({ ...exForm, name: '', cues: '' });
  };

  const handleCreateFood = (e) => {
    e.preventDefault();
    if (!foodForm.name.trim()) return;
    addCustomFood(foodForm);
    setFoodForm({ ...foodForm, name: '' });
  };

  const filteredExercises = exercisesCatalog.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.primaryMuscle.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFoods = foodsCatalog.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.group.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Seletor de Catálogo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCatalog('exercises')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCatalog === 'exercises'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
            }`}
          >
            Repertório de Exercícios ({exercisesCatalog.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalog('foods')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeCatalog === 'foods'
                ? 'bg-sage-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
            }`}
          >
            Repertório de Alimentos TACO/TBCA ({foodsCatalog.length})
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar no repertório..."
          className="bg-stone-50 border border-stone-300 rounded-xl px-4 py-2 text-xs text-stone-900 w-full sm:w-72"
        />
      </div>

      {activeCatalog === 'exercises' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário Novo Exercício */}
          <form
            onSubmit={handleCreateExercise}
            className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 space-y-3 h-fit shadow-sm"
          >
            <h4 className="text-sm font-extrabold text-stone-900">+ Cadastrar Novo Exercício</h4>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Nome do Exercício
              </label>
              <input
                type="text"
                required
                value={exForm.name}
                onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                placeholder="Ex: Remada Baixa Unilateral no Cabo"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Grupo Muscular Principal
              </label>
              <select
                value={exForm.primaryMuscle}
                onChange={(e) => setExForm({ ...exForm, primaryMuscle: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              >
                {MUSCLE_GROUPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Músculos Sinergistas (separados por vírgula)
              </label>
              <input
                type="text"
                value={exForm.secondaryMusclesText}
                onChange={(e) => setExForm({ ...exForm, secondaryMusclesText: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Equipamento
                </label>
                <input
                  type="text"
                  value={exForm.equipment}
                  onChange={(e) => setExForm({ ...exForm, equipment: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Padrão Movimento
                </label>
                <input
                  type="text"
                  value={exForm.pattern}
                  onChange={(e) => setExForm({ ...exForm, pattern: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Dicas Biomecânicas
              </label>
              <textarea
                rows={2}
                value={exForm.cues}
                onChange={(e) => setExForm({ ...exForm, cues: e.target.value })}
                placeholder="Ex: Manter escápulas retraídas..."
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white"
            >
              Salvar no Repertório de Exercícios
            </button>
          </form>

          {/* Lista do Repertório de Exercícios */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1.5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-xs font-extrabold text-stone-900">{ex.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sage-100 text-sage-800 border border-sage-200 whitespace-nowrap">
                    {ex.primaryMuscle}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Equipamento: <strong className="text-stone-900">{ex.equipment}</strong> • Padrão:{' '}
                  {ex.pattern}
                </p>
                {ex.secondaryMuscles?.length > 0 && (
                  <p className="text-[11px] text-stone-500">
                    Sinergistas: {ex.secondaryMuscles.join(', ')}
                  </p>
                )}
                {ex.cues && <p className="text-[11px] text-stone-600 italic">{ex.cues}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário Novo Alimento */}
          <form
            onSubmit={handleCreateFood}
            className="lg:col-span-4 bg-white border border-stone-200 rounded-2xl p-5 space-y-3 h-fit shadow-sm"
          >
            <h4 className="text-sm font-extrabold text-stone-900">
              + Cadastrar Novo Alimento / Receita
            </h4>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Nome do Alimento
              </label>
              <input
                type="text"
                required
                value={foodForm.name}
                onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                placeholder="Ex: Crepioca Proteica"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Grupo de Equivalência Automática
              </label>
              <select
                value={foodForm.group}
                onChange={(e) => setFoodForm({ ...foodForm, group: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
              >
                {FOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Calorias / 100g
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.kcalPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, kcalPer100g: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Proteínas (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.proteinPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, proteinPer100g: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Carboidratos (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.carbsPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, carbsPer100g: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Lipídios (g/100g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.fatPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, fatPer100g: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Medida Caseira
                </label>
                <input
                  type="text"
                  value={foodForm.measureName}
                  onChange={(e) => setFoodForm({ ...foodForm, measureName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Gramas da Medida
                </label>
                <input
                  type="number"
                  value={foodForm.measureGrams}
                  onChange={(e) => setFoodForm({ ...foodForm, measureGrams: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-sage-600 hover:bg-sage-700 text-white"
            >
              Salvar no Repertório de Alimentos
            </button>
          </form>

          {/* Lista do Repertório de Alimentos */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFoods.map((fd) => (
              <div
                key={fd.id}
                className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1.5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-xs font-extrabold text-stone-900">{fd.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-clay-100 text-clay-800 border border-clay-200 whitespace-nowrap">
                    {fd.source}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">{fd.group}</p>
                <div className="text-xs font-semibold text-stone-700">
                  100g: <strong className="text-stone-900">{fd.kcalPer100g} kcal</strong> • P:{' '}
                  <span className="text-clay-800 font-bold">{fd.proteinPer100g}g</span> • C:{' '}
                  <span className="text-sage-800 font-bold">{fd.carbsPer100g}g</span> • G:{' '}
                  <span className="text-stone-800 font-bold">{fd.fatPer100g}g</span> • Fib:{' '}
                  {fd.fiberPer100g}g
                </div>
                {fd.householdMeasures?.[0] && (
                  <p className="text-[11px] text-sage-700 font-bold">
                    Medida Caseira: 1 {fd.householdMeasures[0].name} ={' '}
                    {fd.householdMeasures[0].grams}g
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
