/**
 * SCHEMA DECLARATIVO DA ANAMNESE INTEGRADA (EDUCAÇÃO FÍSICA + NUTRIÇÃO)
 * Adicionar, remover ou editar perguntas aqui reflete automaticamente na interface sem quebrar componentes.
 */

export const ANAMNESIS_BLOCKS_SCHEMA = [
  {
    id: 'block_routine',
    title: '1. Rotina, Ocupação e NEAT',
    subtitle: 'Base para cálculo do gasto energético diário fora da academia',
    fields: [
      {
        key: 'occupation',
        label: 'Profissão / Ocupação Principal',
        type: 'text',
        placeholder: 'Ex: Engenheiro de Software (Home Office)',
      },
      {
        key: 'neatProfile',
        label: 'Nível de Movimento no Trabalho',
        type: 'select',
        options: [
          'Trabalho sentado a maior parte do dia (< 4.500 passos)',
          'Deslocamento moderado / Em pé parte do dia (5.000 - 8.000 passos)',
          'Rotina ativa andando bastante (8.500 - 12.000 passos)',
          'Trabalho fisicamente pesado / braçal (> 12.000 passos)',
        ],
      },
      {
        key: 'wakeSleepSchedule',
        label: 'Horário que acorda e horário que dorme',
        type: 'text',
        placeholder: 'Ex: Acordo às 06:30 / Durmo às 23:00',
      },
      {
        key: 'preferredWorkoutTime',
        label: 'Horário fixo ou preferencial de treino',
        type: 'text',
        placeholder: 'Ex: 18:30 (após o expediente)',
      },
    ],
  },
  {
    id: 'block_clinical',
    title: '2. Triagem Clínica, Saúde & PAR-Q',
    subtitle: 'Segurança cardiovascular, metabólica, exames e medicamentos',
    fields: [
      {
        key: 'parqAlert',
        label: 'PAR-Q: Dor no peito, tontura ou restrição médica cardíaca?',
        type: 'select',
        options: [
          'Não — Apto para exercício sem restrições cardíacas',
          'Sim — Possuo recomendação médica específica (detalhar abaixo)',
        ],
      },
      {
        key: 'clinicalConditions',
        label: 'Condições Clínicas / Patologias Diagnosticadas',
        type: 'textarea',
        placeholder: 'Ex: Resistência à insulina, hipotireoidismo, gastrite, refluxo, hipertensão, SOP...',
      },
      {
        key: 'medicationsAndErgogenics',
        label: 'Medicamentos Contínuos, Anticoncepcionais ou Recursos Ergogênicos',
        type: 'textarea',
        placeholder: 'Liste medicamentos, dosagens ou reposição hormonal em uso',
      },
      {
        key: 'labExamsSummary',
        label: 'Resumo de Exames Bioquímicos Recentes',
        type: 'textarea',
        placeholder: 'Ex: Glicemia 88, HbA1c 5.1%, Vitamina D 38, Ferritina 110, TSH 1.9...',
      },
    ],
  },
  {
    id: 'block_gi_sleep',
    title: '3. Sono, Estresse e Saúde Gastrointestinal',
    subtitle: 'Recuperação neuromuscular, digestão e função intestinal',
    fields: [
      {
        key: 'sleepHoursAndQuality',
        label: 'Horas de sono por noite e qualidade da recuperação',
        type: 'text',
        placeholder: 'Ex: 7h por noite, sono contínuo e reparador',
      },
      {
        key: 'stressImpact',
        label: 'Nível de Estresse (1-10) e impacto no apetite',
        type: 'text',
        placeholder: 'Ex: Nota 7/10 — vontade de comer doces no fim da tarde',
      },
      {
        key: 'bristolScale',
        label: 'Funcionamento Intestinal e Escala de Bristol',
        type: 'select',
        options: [
          'Diário Normal — Bristol Tipo 3 ou 4 (Saudável)',
          'Constipado / Ressecado — Bristol Tipo 1 ou 2',
          'Pastoso / Diarreico — Bristol Tipo 5, 6 ou 7',
        ],
      },
      {
        key: 'digestiveSymptoms',
        label: 'Sintomas Digestivos (gases, estufamento, azia, refluxo)',
        type: 'text',
        placeholder: 'Ex: Estufamento leve quando consome leite integral',
      },
    ],
  },
  {
    id: 'block_training',
    title: '4. Histórico de Treino, Logística e Lesões',
    subtitle: 'Base para prescrição do treinamento resistido e aeróbio',
    fields: [
      {
        key: 'trainingExperience',
        label: 'Nível de Experiência na Musculação',
        type: 'select',
        options: [
          'Iniciante (< 6 meses ou retornando de pausa)',
          'Intermediário (6 meses a 2 anos consistentes)',
          'Avançado (> 2 anos de treino consistente e bom controle motor)',
        ],
      },
      {
        key: 'weeklyAvailability',
        label: 'Disponibilidade Semanal (Dias e minutos por sessão)',
        type: 'text',
        placeholder: 'Ex: 5x na semana (Seg a Sex), máximo 60 min por sessão',
      },
      {
        key: 'preferredCardioModalities',
        label: 'Modalidades Aeróbias Preferidas',
        type: 'text',
        placeholder: 'Ex: Caminhada inclinada na esteira, Bike ergométrica e Escada',
      },
      {
        key: 'jointInjuries',
        label: 'Mapeamento de Dores Articulares, Lesões ou Limitações Biomecânicas',
        type: 'textarea',
        placeholder: 'Ex: Desconforto no ombro direito em desenvolvimento muito aberto; condromalácia patelar leve.',
      },
      {
        key: 'musclePriorities',
        label: 'Grupamentos Musculares Prioritários',
        type: 'text',
        placeholder: 'Ex: Peitoral superior, Deltoide lateral e Dorsais',
      },
    ],
  },
  {
    id: 'block_nutrition',
    title: '5. Comportamento Alimentar, Alergias e Preferências',
    subtitle: 'Personalização do cardápio para máxima adesão',
    fields: [
      {
        key: 'allergiesAndIntolerances',
        label: 'Alergias, Intolerâncias ou Restrições Alimentares',
        type: 'text',
        placeholder: 'Ex: Intolerância leve à lactose (prefere derivados zero lactose)',
      },
      {
        key: 'favoriteFoods',
        label: 'Alimentos Favoritos (que faz questão de ter na dieta)',
        type: 'textarea',
        placeholder: 'Ex: Pão francês pela manhã, arroz, feijão, frango, carne moída, banana, doce de leite...',
      },
      {
        key: 'dislikedFoods',
        label: 'Aversões Alimentares (o que não come de jeito nenhum)',
        type: 'text',
        placeholder: 'Ex: Batata doce, peixe cozido, abacate',
      },
      {
        key: 'mealsPerDayRoutine',
        label: 'Número de Refeições Viáveis e Logística (Marmita / Restaurante)',
        type: 'text',
        placeholder: 'Ex: 4 refeições/dia (Café, Almoço marmita, Lanche da tarde, Jantar em casa)',
      },
      {
        key: 'currentWaterAndAlcohol',
        label: 'Consumo Atual de Água e Bebidas Alcoólicas',
        type: 'text',
        placeholder: 'Ex: ~2L de água/dia; 2 a 3 cervejas no sábado',
      },
    ],
  },
  {
    id: 'block_supplements',
    title: '6. Suplementação Atual e Desejada',
    subtitle: 'Ergogênicos nutricionais e proteínas',
    fields: [
      {
        key: 'supplementsOwned',
        label: 'Suplementos que já possui ou deseja manter no plano',
        type: 'textarea',
        placeholder: 'Ex: Whey Protein Concentrado, Creatina Monohidratada (5g/dia), Cafeína 200mg',
      },
    ],
  },
];
