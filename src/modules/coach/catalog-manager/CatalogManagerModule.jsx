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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveCatalog('exercises')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              activeCatalog === 'exercises'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            🏋️ Repertório de Exercícios ({exercisesCatalog.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCatalog('foods')}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              activeCatalog === 'foods'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            🥗 Repertório de Alimentos TACO/TBCA ({foodsCatalog.length})
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar no repertório..."
          className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white w-full sm:w-72"
        />
      </div>

      {activeCatalog === 'exercises' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário Novo Exercício */}
          <form
            onSubmit={handleCreateExercise}
            className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 h-fit"
          >
            <h4 className="text-sm font-bold text-white">+ Cadastrar Novo Exercício</h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome do Exercício</label>
              <input
                type="text"
                required
                value={exForm.name}
                onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                placeholder="Ex: Remada Baixa Unilateral no Cabo"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Grupo Muscular Principal</label>
              <select
                value={exForm.primaryMuscle}
                onChange={(e) => setExForm({ ...exForm, primaryMuscle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                {MUSCLE_GROUPS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Músculos Sinergistas (separados por vírgula)
              </label>
              <input
                type="text"
                value={exForm.secondaryMusclesText}
                onChange={(e) => setExForm({ ...exForm, secondaryMusclesText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Equipamento</label>
                <input
                  type="text"
                  value={exForm.equipment}
                  onChange={(e) => setExForm({ ...exForm, equipment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Padrão Movimento</label>
                <input
                  type="text"
                  value={exForm.pattern}
                  onChange={(e) => setExForm({ ...exForm, pattern: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Dicas Biomecânicas</label>
              <textarea
                rows={2}
                value={exForm.cues}
                onChange={(e) => setExForm({ ...exForm, cues: e.target.value })}
                placeholder="Ex: Manter escápulas retraídas..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Salvar no Repertório de Exercícios
            </button>
          </form>

          {/* Lista do Repertório de Exercícios */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.map((ex) => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{ex.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                    {ex.primaryMuscle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Equipamento: <strong className="text-slate-200">{ex.equipment}</strong> • Padrão:{' '}
                  {ex.pattern}
                </p>
                {ex.secondaryMuscles?.length > 0 && (
                  <p className="text-[11px] text-slate-400">
                    Sinergistas: {ex.secondaryMuscles.join(', ')}
                  </p>
                )}
                {ex.cues && <p className="text-[11px] text-slate-300 italic">{ex.cues}</p>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulário Novo Alimento */}
          <form
            onSubmit={handleCreateFood}
            className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 h-fit"
          >
            <h4 className="text-sm font-bold text-white">+ Cadastrar Novo Alimento / Receita</h4>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome do Alimento</label>
              <input
                type="text"
                required
                value={foodForm.name}
                onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                placeholder="Ex: Crepioca Proteica"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Grupo de Equivalência Automática
              </label>
              <select
                value={foodForm.group}
                onChange={(e) => setFoodForm({ ...foodForm, group: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
                <label className="block text-xs text-slate-400 mb-1">Calorias / 100g</label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.kcalPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, kcalPer100g: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Proteínas (g/100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.proteinPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, proteinPer100g: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Carboidratos (g/100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.carbsPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, carbsPer100g: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Lipídios (g/100g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={foodForm.fatPer100g}
                  onChange={(e) => setFoodForm({ ...foodForm, fatPer100g: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Medida Caseira</label>
                <input
                  type="text"
                  value={foodForm.measureName}
                  onChange={(e) => setFoodForm({ ...foodForm, measureName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Gramas da Medida</label>
                <input
                  type="number"
                  value={foodForm.measureGrams}
                  onChange={(e) => setFoodForm({ ...foodForm, measureGrams: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Salvar no Repertório de Alimentos
            </button>
          </form>

          {/* Lista do Repertório de Alimentos */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFoods.map((fd) => (
              <div
                key={fd.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{fd.name}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    {fd.source}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{fd.group}</p>
                <div className="text-xs font-semibold text-slate-200">
                  100g: <strong className="text-white">{fd.kcalPer100g} kcal</strong> • P:{' '}
                  <span className="text-rose-300">{fd.proteinPer100g}g</span> • C:{' '}
                  <span className="text-amber-300">{fd.carbsPer100g}g</span> • G:{' '}
                  <span className="text-sky-300">{fd.fatPer100g}g</span> • Fib:{' '}
                  {fd.fiberPer100g}g
                </div>
                {fd.householdMeasures?.[0] && (
                  <p className="text-[11px] text-emerald-400">
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
