# Especificação de Produto e Arquitetura (PRD)
## Aplicativo Web de Consultoria Integrada: Educação Física & Nutrição

---

## 1. Visão Geral do Produto

Aplicativo Web Progressivo (**PWA**) desenvolvido em **JavaScript e React**, projetado especificamente para uma consultoria online comandada por um profissional com **dupla atuação (Educação Física + Nutrição)**.

### 1.1. Proposta de Valor Central
Diferente de plataformas genéricas que separam o treino da dieta em sistemas desconectados, este aplicativo unifica **Prescrição de Treinamento (Resistido e Aeróbio)**, **Planejamento Nutricional** e **Gestão de Alunos (CRM/Financeiro/Feedbacks)** em um único ecossistema:
- **Para o Profissional (Você):** Produtividade máxima na montagem integrada de treinos e dietas, visão 360º do aluno, alertas de vencimento de pagamentos e feedbacks, e cruzamento automático entre gasto calórico do treino e ingestão energética da dieta.
- **Para o Aluno:** Interface limpa, rápida, sem poluição visual e projetada sob o conceito **One-Handed UX (Uso com Uma Mão)**, permitindo registrar séries, cargas, cardio e refeições na academia com o polegar e sem precisar digitar.

---

## 2. Princípios de Design e Usabilidade (UI/UX)

### 2.1. Visão do Aluno: Mobile-First & "One-Handed UX" (Zona do Polegar)
Na academia, o aluno está frequentemente com uma mão ocupada (segurando garrafa, toalha ou apoiado no aparelho), suado e com pressa entre as séries.
1. **Ergonomia da Zona do Polegar (*Thumb Zone*):**
   - Todos os botões de ação principal ficam no **terço inferior da tela**.
   - Navegação principal fixa no rodapé (*Bottom Tab Bar*) com apenas 4 abas: `Hoje`, `Treino`, `Dieta`, `Evolução`.
2. **Registro de Treino Sem Digitação (*Zero-Typing Workout Log*):**
   - **Pré-preenchimento Inteligente:** Os campos de carga (`kg`) e repetições de cada série já vêm preenchidos com os valores realizados pelo aluno na **última sessão**.
   - **Confirmação em 1 Toque:** Se o aluno manteve a carga e as repetições planejadas, basta **1 toque** no botão grande `✓ Concluir Série`.
   - **Ajuste Rápido sem Teclado:** Caso tenha alterado a carga ou repetições, botões grandes de incremento rápido (`-2.5`, `-1`, `+1`, `+2.5`) ou seletor deslizante (*swipe/wheel*) permitem ajustar com o polegar sem abrir o teclado do celular.
3. **Timer de Descanso Automático e Não-Intrusivo:**
   - Ao marcar uma série como concluída, o cronômetro de descanso estipulado pelo treinador inicia automaticamente em uma **barra flutuante no rodapé**, com botões rápidos (`-15s`, `+15s`, `Pular`) e aviso sonoro/vibratório suave ao final.
4. **Zero Poluição Visual & Alto Contraste:**
   - Tipografia grande e legível à distância do braço.
   - Modo Escuro (*Dark Mode*) nativo para economizar bateria e evitar ofuscamento em ambientes de academia, além de Modo Claro limpo.
5. **Funcionamento Offline-First (PWA):**
   - Academias frequentemente possuem sinal instável. O treino do dia e a dieta ficam salvos localmente no dispositivo e sincronizam automaticamente em segundo plano assim que houver conexão.

### 2.2. Visão do Profissional: Desktop-First & Alta Produtividade
1. **Layout em Painéis (Split-View):** Ao abrir o perfil de um aluno no computador, você pode visualizar a **Anamnese/Último Feedback** de um lado enquanto edita o **Treino** ou a **Dieta** do outro, sem precisar trocar de aba.
2. **Templates, Clonagem e Atalhos:** Criação de blocos de treino, refeições padrão e protocolos que podem ser importados para um aluno e personalizados em segundos.
3. **Cálculos em Tempo Real:** Volume semanal de séries por grupamento muscular e soma de calorias/macronutrientes atualizados instantaneamente a cada alteração.

---

## 3. Módulo do Profissional: Gestão de Alunos, Pagamentos e Feedbacks

### 3.1. Dashboard Operacional (Tela Inicial do Profissional)
Visão executiva do dia com indicadores acionáveis:
- **Fila de Feedbacks do Dia / Atrasados:** Alunos cujo check-in venceu hoje ou que já enviaram o formulário de feedback aguardando sua análise.
- **Alertas de Pagamento e Renovação:** Alunos com mensalidade/plano vencendo nos próximos 5 dias, vencendo hoje ou em atraso.
- **Alertas de Vencimento de Planejamento:** Alunos cuja periodização de treino ou dieta está na última semana.

### 3.2. Controle Completo de Alunos (CRM da Consultoria)
Tabela/Painel filtrável com busca instantânea contendo:
- **Dados do Aluno:** Nome, foto, objetivo principal (Hipertrofia, Emagrecimento, Recomposição Corporal, Performance, Saúde), tipo de plano (Treino, Dieta ou Combo Integrado).
- **Status do Aluno:**
  - `🟢 Ativo / Em dia`
  - `🟡 Aguardando Anamnese`
  - `🔵 Feedback Recebido (Pendente de Análise)`
  - `🟠 Feedback Atrasado (Aluno não enviou)`
  - `🔴 Pagamento Pendente / Vencido`
  - `⚪ Pausado / Inativo`
- **Controle de Datas Críticas:**
  - **Data do Último Pagamento** e **Data do Próximo Vencimento** (com cálculo automático por ciclo: mensal, trimestral, semestral, anual).
  - **Data do Último Feedback** e **Data do Próximo Feedback** (configurável por aluno: semanal, quinzenal ou mensal).
  - **Vigência do Treino Atual** (ex.: *Semana 4 de 8*) e **Última Atualização da Dieta**.
- **Ações Rápidas em 1 Clique:** Enviar lembrete de feedback/pagamento via WhatsApp (link direto com mensagem pré-formatada), registrar pagamento recebido, abrir prescrição.

### 3.3. Prontuário Unificado e Estrutura Completa da Anamnese Integrada (Educação Física + Nutrição)

Para que o aluno preencha pelo celular sem cansaço (em etapas curtas com barra de progresso) e você receba um diagnóstico clínico-esportivo completo, a **Anamnese Integrada** é dividida em **7 Blocos Estratégicos**:

#### Bloco 1: Dados Biométricos, Objetivo e Rotina Diária (Base do NEAT)
- **Identificação:** Nome completo, data de nascimento (idade calculada), sexo biológico, profissão.
- **Medidas Base:** Peso atual em jejum (`kg`), estatura (`cm`), peso habitual nos últimos 6 meses.
- **Objetivo Principal e Secundário:** Emagrecimento/Definição, Hipertrofia Muscular, Recomposição Corporal, Performance Esportiva, Condicionamento/Saúde.
- **Nível de Atividade Ocupacional (Fora da Academia — Cálculo do NEAT):**
  - Trabalho predominantemente sentado (escritório/home office)
  - Trabalho com deslocamentos moderados / em pé parte do dia
  - Trabalho braçal / fisicamente intenso
  - Média de passos diários (caso utilize smartwatch/celular: `< 4.000`, `4.000–7.000`, `7.000–10.000`, `> 10.000`).
- **Rotina de Horários:** Horário que acorda, horário que dorme, horários de trabalho/estudo e **horário fixo ou preferencial de treino** (crucial para posicionar as refeições Pré e Pós-Treino).

#### Bloco 2: Triagem de Saúde, Histórico Clínico e PAR-Q (Segurança Física e Metabólica)
- **Questionário PAR-Q (Prontidão para Atividade Física):**
  - Algum médico já afirmou que você possui problema cardíaco?
  - Sente dor ou desconforto no peito durante atividades físicas ou em repouso?
  - Apresenta tonturas, vertigens ou perda de consciência?
  - Faz uso de medicamentos para pressão arterial ou coração?
- **Patologias e Condições Clínicas Diagnosticadas:**
  - Diabetes / Resistência à Insulina, Hipertensão, Dislipidemias (Colesterol/Triglicerídeos altos), Hipotireoidismo/Hipertireoidismo, SOP (Síndrome dos Ovários Policísticos), Gastrite, Refluxo (DRGE), Esteatose Hepática, Anemia.
- **Fármacos, Hormônios e Anticoncepcionais:**
  - Medicamentos de uso contínuo (nome, dosagem e horário).
  - Uso atual ou pregresso de recursos ergogênicos farmacológicos / TRT / reposição hormonal.
- **Saúde Feminina (exibido condicionalmente):**
  - Ciclo menstrual regular ou irregular, uso de método contraceptivo, sintomas intensos de TPM (retenção, compulsão por doces, cólicas), gestante ou lactante.
- **Upload de Exames Laboratoriais Recentes (PDF/Foto):** Hemograma, Glicemia/HbA1c, Insulina, Perfil Lipídico, TSH/T4L, Testosterona, Vitamina D, B12, Ferritina, TGO/TGP, Creatinina.

#### Bloco 3: Sinais, Sintomas, Sono, Estresse e Saúde Gastrointestinal
- **Sono e Recuperação:**
  - Horas efetivas de sono por noite, qualidade do sono (`1 a 5`), se acorda cansado ou desperta durante a noite.
- **Nível de Estresse e Ansiedade:** Escala de `1 a 10` e se o estresse afeta o apetite (aumenta a fome/beliscos ou fecha o estômago).
- **Saúde Intestinal e Digestiva:**
  - Frequência evacuatória (diária, a cada 2–3 dias, constipação).
  - **Escala de Bristol Visual (Tipo 1 a 7):** Seleção visual rápida do formato das fezes.
  - Presença de distensão abdominal (estufamento), gases excessivos, azia, má digestão após comer determinados alimentos.
- **Sinais Clínicos Nutricionais:** Queda de cabelo, unhas fracas/quebradiças, câimbras frequentes, fadiga vespertina, dor de cabeça recorrente.

#### Bloco 4: Histórico de Treinamento, Logística e Mapeamento de Lesões (Educação Física)
- **Nível de Experiência no Treino Resistido:**
  - Iniciante (nunca treinou ou parado há $> 6$ meses)
  - Intermediário ($6$ meses a $2$ anos de treino consistente)
  - Avançado ($> 2$ anos de treino ininterrupto e domínio técnico)
- **Experiência com Treino Aeróbio:**
  - Modalidades que já pratica ou gosta (Corrida, Bike, Escada, Natação, Remo, Elíptico, Pular Corda) e modalidades que não gosta ou não pode fazer.
- **Logística Semanal:**
  - Quantos dias na semana **realmente** consegue treinar (`2 a 7 dias`) e quais dias da semana.
  - Tempo máximo disponível por sessão (ex.: `40 min`, `60 min`, `90 min`) — incluindo ou separando o tempo de cardio.
  - Local de treino: Academia completa, Academia de condomínio (com upload opcional de fotos dos aparelhos), Casa / Calistenia.
- **Mapeamento Articular e Biomecânico (Dores e Limitações):**
  - Seleção rápida de regiões com dor, lesão prévia ou cirurgia: **Ombro (Manguito/Impacto), Cotovelo, Punho, Coluna Cervical, Coluna Lombar (Hérnia/Protusão), Quadril, Joelho (LCA/Menisco/Condromalácia), Tornozelo**.
  - Exercícios específicos que causam dor ou desconforto e exercícios favoritos / pontos musculares que mais deseja priorizar.

#### Bloco 5: Anamnese Alimentar, Comportamento e Preferências (Nutrição)
- **Restrições e Alergias:** Intolerância à lactose, doença celíaca/sensibilidade ao glúten, APLV, alergia a frutos do mar/oleaginosas, vegetarianismo/veganismo.
- **Aversões vs. Alimentos Favoritos:**
  - Lista de seleção rápida de fontes de **Proteínas**, **Carboidratos**, **Gorduras**, **Frutas** e **Vegetais** que o aluno *ama comer todos os dias* vs. alimentos que *não come de jeito nenhum*.
- **Logística Alimentar:**
  - Quem cozinha/prepara as refeições? Leva marmita para o trabalho ou come em restaurante/quilo?
  - Quantas refeições por dia cabem confortavelmente na rotina (`3 a 6 refeições`)?
  - Orçamento mensal estimado para dieta e suplementação (`Econômico / Básico`, `Intermediário`, `Livre`).
- **Comportamento Alimentar e Hidratação:**
  - Consumo atual de água por dia (`litros`), consumo de café/estimulantes, consumo de bebidas alcoólicas (tipo, frequência e quantidade no fim de semana).
  - Horários de maior fome ou vontade de comer doces/beliscar.
- **Recordatório Alimentar Habitual:** Descrição rápida do que costuma comer atualmente no Café da Manhã, Almoço, Lanches e Jantar.

#### Bloco 6: Suplementação Atual
- Quais suplementos já possui em casa ou já utiliza (Whey Protein, Creatina, Cafeína/Pré-treino, Multivitamínico, Ômega-3, etc.) e se deseja incluir suplementos no protocolo.

#### Bloco 7: Avaliação Antropométrica e Fotos Padronizadas
- **Medidas de Perimetria / Circunferências (`cm`)** — *Com vídeo/ilustração ensinando o aluno da consultoria online a medir com fita métrica em casa*:
  - Pescoço, Tórax/Peitoral, Cintura (menor perímetro), Abdômen (cicatriz umbilical), Quadril (maior proeminência glútea), Braço Direito/Esquerdo (relaxado e contraído), Coxa Medial Direita/Esquerda, Panturrilha Direita/Esquerda.
- **Dobras Cutâneas (`mm`) ou Bioimpedância (Opcional — para atendimento híbrido/presencial ou caso o aluno tenha avaliação física externa):**
  - Tricipital, Subescapular, Bicipital, Peitoral, Axilar Média, Supra-ilíaca, Abdominal, Coxa, Panturrilha Medial.
- **Fotos do Padrão Inicial:**
  - Guia na tela para envio de 4 fotos padronizadas (Frente relaxado, Perfil direito, Costas relaxado + Poses de contração opcionais).

---

## 4. Módulo de Prescrição de Treinamento (Resistido + Aeróbio)

### 4.1. Treinamento Resistido (Musculação / Força / Calistenia)
- **Estrutura de Periodização e Divisão:**
  - Divisões livres (`Treino A, B, C, D, E, F`, `Upper/Lower`, `Full Body`, `Push/Pull/Legs`) associadas ou não a dias específicos da semana.
- **Parâmetros Prescritivos por Exercício:**
  - **Tipo de Série:** Aquecimento (`W`), Reconhecimento/Feeder (`F`), Série de Trabalho/Válida (`S`), Top Set (`T`), Back-off Set (`B`).
  - **Séries e Faixa de Repetições:** Ex.: `3 x 8-12` ou prescrição individualizada série a série.
  - **Controle de Intensidade:** RIR (Repetições em Reserva, ex.: `RIR 1-2`), PSE/RPE (`0-10`) ou `% de 1RM`.
  - **Intervalo de Descanso:** Configurado em segundos (ex.: `90s`, `120s`, `180s`), alimentando diretamente o cronômetro do aluno.
  - **Cadência (Opcional):** Ex.: `3-0-1-0`.
  - **Técnicas Avançadas de Intensidade:** Agrupamento visual para *Bi-set*, *Tri-set*, *Drop-set*, *Rest-Pause*, *Cluster Set*, *Myo-Reps* e *Pico de Contração*.
  - **Exercício Substituto Pré-Aprovado:** Você pode deixar 1 ou 2 opções equivalentes vinculadas (ex.: *Supino Reto Barra $\rightarrow$ Supino Reto Halteres*). Se o aparelho estiver ocupado na academia, o aluno troca com 1 toque sem quebrar o planejamento.
- **Auditoria Automática de Volume Semanal (Painel do Treinador):**
  - Enquanto você monta os treinos da semana, o sistema soma automaticamente o número de **séries válidas semanais por grupamento muscular** (Peitoral, Dorsal, Deltoide Anterior/Lateral/Posterior, Quadríceps, Isquiotibiais, Glúteos, Bíceps, Tríceps, Panturrilhas, Abdômen), contabilizando músculos principais (peso 1.0) e sinergistas (peso 0.5).

### 4.2. Treinamento Aeróbio de Diferentes Modalidades
Prescrição estruturada para múltiplas modalidades cardiorrespiratórias, integrada ou separada da sessão de musculação:
- **Modalidades Suportadas:**
  - Corrida (Esteira ou Rua/Pista)
  - Ciclismo (Bike Ergometrica, Spinning ou Ciclismo de Estrada/MTB)
  - Natação
  - Remo Indoor (Rower)
  - Escada (Stairmaster)
  - Elíptico / Transport
  - Pular Corda / HIIT Funcional
  - Caminhada (Plana ou Inclinada)
- **Formatos de Prescrição Aeróbia:**
  1. **Contínuo Estável (LISS / MISS):**
     - Duração total (minutos) ou Distância alvo (`km`).
     - Intensidade alvo por **Zona de Frequência Cardíaca** (`Z1` a `Z5`, calculadas automaticamente pela idade/FC de repouso do aluno), **Pace alvo** (`min/km`), **Velocidade/Inclinação** (`km/h` e `%`), **Cadência/RPM** ou **PSE** (`0-10`).
  2. **Intervalado (HIIT / Tiros / Fartlek):**
     - Construtor de blocos estruturados:
       - `Aquecimento` (ex.: 5 min leve Z1/Z2)
       - `Bloco Principal` (ex.: `8 tiros` de `30s Forte (PSE 9 / 16 km/h)` por `60s Recuperação (PSE 3 / 6 km/h)`)
       - `Volta à Calma` (ex.: 5 min leve)
     - Na tela do aluno, esse treino intervalado gera um **Timer de Intervalos Guiado** (avisa quando acelerar e quando recuperar).
- **Estimativa de Gasto Energético (METs):**
  - Cálculo automático das calorias estimadas da sessão aeróbia com base no peso do aluno, modalidade, duração e intensidade, enviando esse dado direto para o cálculo de Gasto Energético Total (GET) no módulo de Nutrição.

### 4.3. Grande Repertório de Exercícios (Biblioteca Customizável)
- **Base Pré-Cadastrada + Criação Livre:** Centenas de exercícios já estruturados e possibilidade de adicionar seus próprios exercícios.
- **Metadados de Cada Exercício:**
  - Nome principal e nomes alternativos populares.
  - Músculo Alvo Primário e Músculos Secundários/Sinergistas.
  - Padrão de Movimento (Empurrar Horizontal, Empurrar Vertical, Puxar Horizontal, Puxar Vertical, Dominante de Joelho, Dominante de Quadril, Isolado, Core, etc.).
  - Equipamento necessário (Barra, Halter, Polia/Cabo, Máquina Articulada, Smith, Peso Corporal, Elástico, Kettlebell).
  - Link de vídeo curto/GIF demonstrativo e instruções-chave de execução ("*Dicas do Treinador*").

---

## 5. Módulo de Prescrição Nutricional e Banco de Alimentos

### 5.1. Avaliação Energética e Integração Treino-Dieta
- **Cálculo de Taxa Metabólica Basal (TMB):**
  - Fórmulas selecionáveis: *Mifflin-St Jeor*, *Harris-Benedict*, *Cunningham (1980)*, *Katch-McArdle (Cunningham 1991)*, *Tinsley (Peso Total e MLG)*, *FAO/OMS* e *Fórmula de Bolso (`kcal/kg`)*.
- **Cálculo do Gasto Energético Total (GET) Integrado:**
  - Duas modalidades de cálculo selecionáveis pelo profissional (veja todas as equações matemáticas na **Seção 6**):
    1. **Método Clássico (Fator de Atividade Geral):** $\text{GET} = \text{TMB} \times \text{FAF}$.
    2. **Método Integrado de Precisão (Fisiologia do Exercício):** Soma de $\text{TMB} + \text{NEAT (Rotina)} + \text{EAT (Treino Resistido + Aeróbio em METs)} + \text{ETA (Efeito Térmico dos Alimentos)}$.
- **Ciclagem de Calorias e Carboidratos (*Carb Cycling*):**
  - Permite criar variações rápidas do plano alimentar para:
    - **Dia de Treino Intenso / Membros Inferiores (Alto Carbo)**
    - **Dia de Treino Moderado / Membros Superiores (Médio Carbo)**
    - **Dia de Descanso / Cardio Leve (Baixo Carbo / Normocalórico)**

### 5.2. Estruturação do Plano Alimentar
- **Divisão por Refeições:** Nome da refeição, horário sugerido e observações (ex.: *Refeição Pré-Treino — consumir 60 a 90 min antes*).
- **Painel de Macronutrientes Flutuante (Tempo Real):**
  - Exibe continuamente:
    - **Calorias Totais (`kcal`)** vs. Meta
    - **Proteínas (`g` tot., `g/kg` de peso e `%`)** — *com separação opcional entre proteína de alto valor biológico e vegetal*
    - **Carboidratos (`g` tot., `g/kg` de peso e `%`)**
    - **Lipídios (`g` tot., `g/kg` de peso e `%`)**
    - **Fibras (`g`)** e **Meta Hídrica Diária (`Litros/dia` baseada em `ml/kg`)**
- **Sistema Inteligente de Substituições / Equivalências:**
  - Ao adicionar um alimento (ex.: *150g de Arroz Branco Cozido*), com **1 clique** você pode inserir uma lista de alimentos substitutos do mesmo grupo (ex.: *Batata Inglesa Cozida, Mandioca, Macarrão, Aveia*) e o sistema **calcula automaticamente a gramatura exata de cada substituto** para entregar as mesmas calorias/carboidratos.
- **Prescrição de Suplementos e Manipulados:**
  - Seção dedicada para Creatina, Whey Protein, Cafeína, Beta-Alanina, Eletrólitos, Vitaminas e Fitoterápicos, com dose, horário e forma de uso.

### 5.3. Grande Repertório de Alimentos
- **Tabelas Unificadas:** Integração dos principais bancos de dados nutricionais validados:
  - **TACO** (Tabela Brasileira de Composição de Alimentos - UNICAMP)
  - **TBCA** (USP) / **IBGE**
  - **USDA** (para alimentos específicos)
  - **Suplementos e Produtos Comerciais** (Whey, barras proteicas, iogurtes proteicos, pães, etc.)
  - **Alimentos e Receitas Personalizadas:** Você pode cadastrar preparações (ex.: *Panqueca Proteica da Consultoria*) informando os ingredientes, e o sistema calcula os macros totais da receita.
- **Dupla Unidade de Medida (`Gramas` + `Medida Caseira`):**
  - Todo alimento possui peso em gramas (`g`/`ml`) e conversão automática para medidas caseiras práticas (colher de sopa, colher de arroz, escumadeira, concha, fatia, unidade P/M/G, *scoop*).

---

## 6. Compêndio de Fórmulas: Gasto Calórico, TMB, Composição Corporal e Fisiologia

Todas as equações abaixo ficarão encapsuladas no módulo `src/utils/physiologyFormulas.js` do aplicativo, permitindo que você compare os resultados de todas as equações simultaneamente na tela do aluno e escolha a mais adequada para o perfil dele.

**Variáveis Padrão:**
- $P$ = Peso corporal total em `kg`
- $E$ = Estatura em `cm`
- $I$ = Idade em `anos`
- $\text{MLG}$ = Massa Livre de Gordura (*Fat-Free Mass* / FFM) em `kg`
- $\%G$ = Percentual de Gordura Corporal

---

### 6.1. Equações de Taxa Metabólica Basal (TMB / TMR)

1. **Mifflin-St Jeor (1990)** — *Recomendada para população geral, sobrepeso e obesidade:*
   - **Homens:**
     $$\text{TMB} = (10 \times P) + (6,25 \times E) - (5 \times I) + 5$$
   - **Mulheres:**
     $$\text{TMB} = (10 \times P) + (6,25 \times E) - (5 \times I) - 161$$

2. **Harris-Benedict (1919 — Original)** — *Clássica para eutróficos fisicamente ativos:*
   - **Homens:**
     $$\text{TMB} = 66,473 + (13,7516 \times P) + (5,0033 \times E) - (6,755 \times I)$$
   - **Mulheres:**
     $$\text{TMB} = 655,0955 + (9,5634 \times P) + (1,8496 \times E) - (4,6756 \times I)$$

3. **Harris-Benedict Revisada por Roza & Shizgal (1984):**
   - **Homens:**
     $$\text{TMB} = 88,362 + (13,397 \times P) + (4,799 \times E) - (5,677 \times I)$$
   - **Mulheres:**
     $$\text{TMB} = 447,593 + (9,247 \times P) + (3,098 \times E) - (4,330 \times I)$$

4. **Cunningham (1980)** — *Padrão-ouro para atletas e praticantes avançados com alto volume muscular (requer $\text{MLG}$):*
   $$\text{TMB} = 500 + (22 \times \text{MLG})$$

5. **Katch-McArdle / Cunningham (1991)** — *Para indivíduos treinados com $\%$ de gordura conhecido (requer $\text{MLG}$):*
   $$\text{TMB} = 370 + (21,6 \times \text{MLG})$$

6. **Tinsley et al. (2018)** — *Desenvolvida especificamente para fisiculturistas e praticantes de musculação:*
   - **Versão por Peso Corporal Total ($P$) — quando não há $\text{MLG}$:**
     $$\text{TMB} = (24,8 \times P) + 10$$
   - **Versão por Massa Livre de Gordura ($\text{MLG}$):**
     $$\text{TMB} = (25,9 \times \text{MLG}) + 284$$

7. **FAO / OMS / UNU (2001):**
   - **Homens:**
     - $18\text{ a }30\text{ anos}$: $\text{TMB} = (15,057 \times P) + 692,2$
     - $30\text{ a }60\text{ anos}$: $\text{TMB} = (11,472 \times P) + 873,1$
     - $> 60\text{ anos}$: $\text{TMB} = (11,711 \times P) + 587,7$
   - **Mulheres:**
     - $18\text{ a }30\text{ anos}$: $\text{TMB} = (14,818 \times P) + 486,6$
     - $30\text{ a }60\text{ anos}$: $\text{TMB} = (8,126 \times P) + 845,6$
     - $> 60\text{ anos}$: $\text{TMB} = (9,082 \times P) + 658,5$

8. **Fórmula Rápida de Bolso (`kcal/kg` de Peso Corporal):**
   - $\text{Meta Calórica Direta} = P \times \text{Fator Escolhido}$ (ex.: $20\text{ a }25\text{ kcal/kg}$ para cutting; $28\text{ a }32\text{ kcal/kg}$ para manutenção; $35\text{ a }45\text{ kcal/kg}$ para bulking).

---

### 6.2. Cálculo do Gasto Energético Total (GET)

O aplicativo oferece **dois métodos de cálculo do GET** para você escolher no painel do aluno:

#### Método A: Multiplicador Clássico de Atividade Física ($\text{FAF}$)
$$\text{GET} = \text{TMB} \times \text{FAF}$$
- **Sedentário** (pouco ou nenhum exercício): $\text{FAF} = 1,20$
- **Levemente Ativo** (treino leve $1\text{ a }3\text{ dias/sem}$): $\text{FAF} = 1,375$
- **Moderadamente Ativo** (treino moderado $3\text{ a }5\text{ dias/sem}$): $\text{FAF} = 1,55$
- **Muito Ativo** (treino intenso $6\text{ a }7\text{ dias/sem}$): $\text{FAF} = 1,725$
- **Extremamente Ativo** (treino muito pesado diário + trabalho físico ou 2 sessões/dia): $\text{FAF} = 1,90$

#### Método B: Modelo Desmembrado Integrado ($\text{TMB} + \text{NEAT} + \text{EAT}_{\text{Treino}} + \text{ETA}$)
Ideal para quem prescreve o treino e a dieta juntos, pois diferencia o **Dia de Treino** do **Dia de Descanso**:
$$\text{GET}_{\text{Dia}} = (\text{TMB} \times \text{Fator Ocupacional NEAT}) + \text{Gasto do Treino Resistido} + \text{Gasto do Treino Aeróbio} + \text{ETA}$$
- **Fator Ocupacional ($\text{NEAT}$ fora da academia):**
  - Acamado/Inativo: $1,10$ | Escritório/Sentado: $1,20$ | Em pé/Deslocamento moderado: $1,35$ | Trabalho Braçal/Ativo: $1,50$.
- **$\text{ETA}$ (Efeito Térmico dos Alimentos — opcional):** Adição de $10\%$ sobre o total ou cálculo específico por macronutriente (Proteína: $20\text{–}30\%$, Carboidrato: $5\text{–}10\%$, Lipídio: $0\text{–}3\%$).

---

### 6.3. Fórmulas de Gasto Calórico do Exercício ($\text{EAT}$: Resistido e Aeróbio)

#### 1. Equação Universal por Equivalente Metabólico ($\text{METs}$ — Compêndio de Ainsworth)
$$\text{Gasto da Sessão (kcal)} = \frac{\text{MET} \times 3,5 \times P\ (\text{kg})}{200} \times \text{Duração (minutos)}$$

**Tabela de METs Pré-Configurada no Aplicativo:**
| Modalidade / Intensidade | Valor de MET |
| :--- | :---: |
| **Musculação Leve / Adaptação / Circuitos leves** | $3,5$ |
| **Musculação Moderada / Hipertrofia Tradicional (descanso $60\text{–}120\text{s}$)** | $5,0$ |
| **Musculação Intensa / Alta Densidade / Grandes Grupamentos (Inferiores)** | $6,0$ |
| **Caminhada no Plano ($5,0\text{ km/h}$)** | $3,5$ |
| **Caminhada Rápida ($6,5\text{ km/h}$) ou Esteira Inclinada ($5\text{–}10\%$)** | $5,3\text{ a }6,5$ |
| **Corrida Leve ($8,0\text{ km/h}$ — Pace $7:30\text{/km}$)** | $8,3$ |
| **Corrida Moderada ($10,0\text{ km/h}$ — Pace $6:00\text{/km}$)** | $9,8$ |
| **Corrida Forte ($12,0\text{ km/h}$ — Pace $5:00\text{/km}$)** | $11,5$ |
| **Corrida Muito Forte ($14,0\text{ km/h}$ — Pace $4:17\text{/km}$)** | $12,8$ |
| **Ciclismo / Bike Ergométrica Leve a Moderada** | $5,5\text{ a }6,8$ |
| **Ciclismo Vigoroso / Spinning** | $8,5\text{ a }10,5$ |
| **Escada Ergométrica (Stairmaster)** | $9,0$ |
| **Elíptico / Transport Moderado a Vigoroso** | $5,0\text{ a }8,0$ |
| **Remo Indoor Moderado a Vigoroso** | $7,0\text{ a }10,0$ |
| **Natação Moderada a Intensa** | $6,0\text{ a }9,8$ |
| **Pular Corda / HIIT Peso Corporal** | $8,8\text{ a }11,0$ |

#### 2. Equações Metabólicas do ACSM (*American College of Sports Medicine*)
Quando você prescreve velocidade exata ($v$ em $\text{km/h}$, convertida para $S = v \times 16,67\text{ m/min}$) e inclinação ($G$ em decimal, ex.: $5\% = 0,05$) na esteira:
- **Caminhada ($3,2\text{ a }6,4\text{ km/h}$):**
  $$\text{VO}_2\ (\text{ml}\cdot\text{kg}^{-1}\cdot\text{min}^{-1}) = (0,1 \times S) + (1,8 \times S \times G) + 3,5$$
- **Corrida ($> 6,5\text{ km/h}$):**
  $$\text{VO}_2\ (\text{ml}\cdot\text{kg}^{-1}\cdot\text{min}^{-1}) = (0,2 \times S) + (0,9 \times S \times G) + 3,5$$
- **Conversão de $\text{VO}_2$ para Calorias ($\text{kcal}$):**
  $$\text{kcal/min} = \frac{\text{VO}_2 \times P\ (\text{kg})}{1000} \times 5$$

---

### 6.4. Fórmulas de Composição Corporal (Cálculo de $\%G$ e $\text{MLG}$)

Para alimentar as fórmulas de **Cunningham**, **Katch-McArdle** e **Tinsley (MLG)**:

1. **Conversão de Densidade Corporal ($D_c$) em Percentual de Gordura (Equação de Siri, 1961):**
   $$\%G = \left(\frac{495}{D_c}\right) - 450$$
   $$\text{Massa Gorda (kg)} = P \times \left(\frac{\%G}{100}\right) \quad \longrightarrow \quad \text{MLG (kg)} = P - \text{Massa Gorda}$$

2. **Protocolo de Jackson & Pollock — 3 Dobras Cutâneas ($\Sigma_3$ em $\text{mm}$):**
   - **Homens** (*Peitoral + Abdominal + Coxa*):
     $$D_c = 1,10938 - (0,0008267 \times \Sigma_3) + (0,0000016 \times \Sigma_3^2) - (0,0002574 \times I)$$
   - **Mulheres** (*Tríceps + Supra-ilíaca + Coxa*):
     $$D_c = 1,0994921 - (0,0009929 \times \Sigma_3) + (0,0000023 \times \Sigma_3^2) - (0,0001392 \times I)$$

3. **Protocolo de Jackson & Pollock — 7 Dobras Cutâneas ($\Sigma_7$ em $\text{mm}$):**
   (*Peitoral + Axilar Média + Tríceps + Subescapular + Abdominal + Supra-ilíaca + Coxa*)
   - **Homens:**
     $$D_c = 1,112 - (0,00043499 \times \Sigma_7) + (0,00000055 \times \Sigma_7^2) - (0,00028826 \times I)$$
   - **Mulheres:**
     $$D_c = 1,097 - (0,00046971 \times \Sigma_7) + (0,00000056 \times \Sigma_7^2) - (0,00012828 \times I)$$

4. **Protocolo da Marinha dos EUA (*US Navy Method*) por Circunferências (`cm`)** — *Ideal para Consultoria 100% Online onde o aluno mede apenas com fita métrica:*
   - **Homens** (Cintura, Pescoço e Estatura em $\text{cm}$):
     $$\%G = \frac{495}{1,0324 - 0,19077 \times \log_{10}(\text{Cintura} - \text{Pescoço}) + 0,15456 \times \log_{10}(E)} - 450$$
   - **Mulheres** (Cintura, Quadril, Pescoço e Estatura em $\text{cm}$):
     $$\%G = \frac{495}{1,29579 - 0,35004 \times \log_{10}(\text{Cintura} + \text{Quadril} - \text{Pescoço}) + 0,22100 \times \log_{10}(E)} - 450$$

---

### 6.5. Fórmulas de Prescrição de Treino (Força & Cárdio) e Equivalência Alimentar

1. **Estimativa de 1 Repetição Máxima ($\text{1RM}$):**
   - **Fórmula de Epley:** $\text{1RM} = \text{Carga} \times \left(1 + \frac{\text{Repetições}}{30}\right)$
   - **Fórmula de Brzycki:** $\text{1RM} = \frac{\text{Carga}}{1,0278 - (0,0278 \times \text{Repetições})}$

2. **Zonas de Frequência Cardíaca (Tanaka + Karvonen):**
   - **FC Máxima Estimada (Tanaka et al., 2001):** $\text{FC}_{\text{máx}} = 208 - (0,7 \times I)$
   - **FC Alvo (Karvonen — reserva cardíaca):**
     $$\text{FC}_{\text{alvo}} = \left[(\text{FC}_{\text{máx}} - \text{FC}_{\text{repouso}}) \times \%\text{Intensidade}\right] + \text{FC}_{\text{repouso}}$$

3. **Cálculo Automático de Equivalência / Substituição Alimentar:**
   Para substituir um Alimento Base $A$ (quantidade $Q_A$ em gramas) por um Alimento Substituto $B$, mantendo o mesmo macronutriente principal ou calorias:
   $$Q_B\ (\text{g}) = Q_A\ (\text{g}) \times \left(\frac{\text{Kcal ou Macro por 100g de } A}{\text{Kcal ou Macro por 100g de } B}\right)$$

---

## 7. Experiência do Aluno: Detalhamento da Interface "Uma Mão"

### 7.1. Tela 1: `Hoje` (Resumo Diário Rápido)
- Saudação limpa + Contador de sequência de dias ativos (*Streak*).
- **Card do Treino do Dia:** Ex.: `Treino B - Dorsal e Bíceps + 20 min Cardio` com botão grande **[ ▶ Iniciar Treino ]** na parte inferior.
- **Progresso Nutricional e Hidratação:**
  - Barra de água com botão rápido **[ + 250ml ]** e **[ + 500ml ]**.
  - Checklist rápido das refeições do dia.
- **Aviso de Check-in / Renovação (quando aplicável):** Card discreto avisando quando é dia de enviar feedback ao treinador.

### 7.2. Tela 2: `Treino` (Modo Academia — Controle com o Polegar)
```
+---------------------------------------+
|  TREINO A: PEITO E TRÍCEPS   ⏱ 24:10  |
|  Progresso: ██████░░░░ 60%            |
+---------------------------------------+
|  3. Supino Inclinado com Halteres     |
|  Meta: 3 séries • 8 a 10 reps • RIR 1 |
|  [ ▶ Ver Vídeo ]   [ ⇄ Trocar Exerc. ]|
|                                       |
|  Série 1 (Feita)   28 kg  x  10   ✅  |
|  Série 2 (Feita)   28 kg  x   9   ✅  |
|                                       |
|  ┌─── SÉRIE 3 (ATUAL) ──────────────┐ |
|  │  Carga (kg)        Repetições    │ |
|  │  [-]  28  [+]      [-]  9  [+]   │ |
|  │                                  │ |
|  │  [     ✓ CONCLUIR SÉRIE 3     ]  │ | <-- Botão amplo na Zona do Polegar
|  └──────────────────────────────────┘ |
+---------------------------------------+
| ⏳ Descanso: 01:12  [-15s] [Pular]    | <-- Barra flutuante inferior
+---------------------------------------+
```
- **Fluxo com 1 Mão:**
  1. Os valores `28 kg` e `9 reps` já estão preenchidos com base na série/treino anterior.
  2. Se o aluno fez exatamente isso, ele aperta apenas **[ ✓ CONCLUIR SÉRIE 3 ]**.
  3. Se aumentou para `30 kg`, ele toca uma vez no botão **`[+]`** da carga (incremento configurável) e toca em **[ ✓ CONCLUIR SÉRIE 3 ]**.
  4. O cronômetro de descanso começa sozinho na barra inferior e, quando todas as séries acabam, a tela desliza suavemente para o próximo exercício.
  5. Ao finalizar a musculação, se houver **Cardio Prescrito**, o card do aeróbio já aparece em seguida com a modalidade, zona/velocidade e botão de iniciar cronômetro.

### 7.3. Tela 3: `Dieta` (Consulta Rápida e Substituição Interativa)
- Visualização limpa por refeição do dia (com alternância simples entre *Cardápio de Dia de Treino* e *Cardápio de Dia de Descanso*).
- **Calculadora de Substituição em 1 Toque:**
  - O aluno toca em um alimento da refeição (ex.: *120g de Peito de Frango Grelhado*) $\rightarrow$ abre um *bottom sheet* (gaveta inferior) com as opções equivalentes autorizadas por você (ex.: *150g de Tilápia*, *110g de Patinho Moído*, *4 Ovos Inteiros*).
- **Botão "Gerar Lista de Compras":** Agrupa os alimentos da dieta por categoria (Açougue, Hortifruti, Mercearia, Laticínios) com quantidades semanais estimadas.

### 7.4. Tela 4: `Evolução & Feedback`
- **Check-in Guiado (Formulário de Feedback Rápido):**
  - No dia estipulado pelo profissional, o aluno responde em menos de 2 minutos usando *sliders* de 1 mão:
    - Peso corporal em jejum (`kg`)
    - Nota de adesão à dieta na semana (`0 a 10`)
    - Nível de energia nos treinos, qualidade do sono e funcionamento intestinal (`1 a 5 estrelas`)
    - Alguma dor articular ou dificuldade em algum exercício?
    - Upload guiado de fotos comparativas (Frente, Costas, Perfil).
- **Gráficos de Progresso Motivacionais:**
  - Evolução do peso corporal e medidas.
  - Evolução de cargas nos exercícios principais (Recordes Pessoais / PRs batidos).
  - Taxa de consistência mensal (treinos concluídos vs. planejados).

---

## 8. Funcionalidades Extras Recomendadas (Diferenciais Competitivos)

Para tornar o aplicativo ainda mais completo e valioso para sua consultoria no futuro, foram incluídas na arquitetura as seguintes funcionalidades estratégicas:

1. **Detector Automático de Estagnação ou Queda de Rendimento (Alertas para Você):**
   - O sistema avisa no seu painel quando um aluno:
     - Fica mais de 4 dias sem registrar treino.
     - Relata dor articular em um exercício específico.
     - Aumenta a carga em determinado exercício por 3 sessões seguidas no topo da faixa de repetições (sugerindo progressão) ou reduz repetições consecutivamente (sinalizando fadiga excessiva).
2. **Gerador de PDF / Exportação Limpa:**
   - Caso algum aluno prefira imprimir a dieta para colar na geladeira, 1 clique gera um PDF minimalista com sua identidade visual.
3. **Biblioteca de Conteúdos Exclusivos (Mini-Academy):**
   - Espaço simples para você deixar guias rápidos fixos para todos os alunos (ex.: *"Como pesar alimentos corretamente (cru vs. cozido)"*, *"O que fazer em refeições livres"*, *"Como interpretar o RIR na musculação"*), reduzindo dúvidas repetitivas no seu WhatsApp.
4. **Comparador Lado a Lado de Feedbacks (Para o Profissional):**
   - Ao abrir o feedback de hoje do aluno, o sistema coloca automaticamente as fotos, peso e relatos do **feedback anterior** ao lado do atual, além de mostrar quantos treinos ele concluiu no período e a evolução de tonelagem.

---

## 9. Arquitetura Técnica Sugerida (JavaScript & React)

### 9.1. Stack Tecnológica
- **Frontend:**
  - **React 18+ com Vite** (rápido, leve e excelente experiência de desenvolvimento em JavaScript/JSX).
  - **Tailwind CSS:** Estilização utilitária para interfaces limpas, sem poluição visual, responsivas e com suporte nativo a *Dark Mode*.
  - **Lucide React:** Ícones minimalistas e leves.
  - **Zustand + TanStack Query (React Query):** Gerenciamento de estado simples e persistência local (*Offline-First*) para que o aluno nunca perca os dados do treino na academia.
  - **Vite PWA Plugin:** Transforma o aplicativo web em um aplicativo instalável no Android e iOS direto pelo navegador, sem custos ou burocracia de lojas de aplicativos (App Store / Play Store).
  - **Recharts:** Gráficos leves para evolução de peso, cargas e macronutrientes.
- **Backend & Banco de Dados (Opções Escaláveis):**
  - **Fase Inicial / MVP Local-First:** Persistência via `IndexedDB` / `LocalStorage` com importação/exportação JSON para testar todos os fluxos rapidamente.
  - **Produção (Multi-usuário Online):** **Supabase** (PostgreSQL + Autenticação de Profissional/Aluno + Storage para fotos de evolução e vídeos de exercícios) ou **Node.js + Prisma + PostgreSQL**.

### 9.2. Estrutura de Pastas Proposta (React)
```text
src/
├── assets/                  # Logos, ícones e ilustrações leves
├── components/
│   ├── common/              # Botões grandes (Thumb-Zone), Steppers (+/-), Modais, Inputs
│   ├── coach/               # Componentes exclusivos da visão do Profissional
│   │   ├── StudentCRM/      # Tabela de alunos, alertas de pagamento e feedback
│   │   ├── AnamnesisView/   # Prontuário completo, antropometria e painel de TMB/GET
│   │   ├── WorkoutBuilder/  # Construtor de treino resistido + aeróbio + contador de séries
│   │   ├── DietBuilder/     # Construtor de dieta + calculadora de macros e substituições
│   │   └── LibraryManager/  # Gestão do banco de exercícios e alimentos
│   └── student/             # Componentes exclusivos da visão do Aluno (One-Handed UX)
│       ├── ActiveWorkout/   # Card de série 1-toque, steppers de carga, timer flutuante
│       ├── CardioPlayer/    # Timer intervalado/contínuo de aeróbio
│       ├── DailyDiet/       # Checklist de refeições, água e substituição em 1 toque
│       ├── AnamnesisForm/   # Questionário inicial passo a passo (7 blocos)
│       └── CheckinFlow/     # Formulário rápido de feedback e fotos
├── data/
│   ├── exercisesSeed.js     # Repertório inicial de exercícios categorizados
│   └── foodsSeed.js         # Repertório inicial de alimentos (TACO/TBCA + medidas caseiras)
├── hooks/                   # Hooks customizados (useRestTimer, useMacroCalc, useVolumeCalc)
├── pages/
│   ├── coach/               # Dashboard, Perfil do Aluno, Prescrição, Bibliotecas
│   └── student/             # Hoje, Treino, Dieta, Evolução
├── services/                # Comunicação com API / Banco de Dados / Sincronização Offline
└── utils/
    └── physiologyFormulas.js # Equações de TMB, GET, METs, ACSM, Pollock, Navy, Karvonen e 1RM
```

### 9.3. Modelagem Principal de Dados (Resumo das Entidades)
- **`Users`:** `id`, `name`, `role` (`coach` | `student`), `email`, `phone`, `avatar`.
- **`StudentProfiles`:** `userId`, `birthDate`, `sex`, `height`, `currentWeight`, `bodyFat`, `leanMass`, `goal`, `anamnesisData` (7 blocos), `anthropometry` (circunferências e dobras), `energyCalculation` (`formulaUsed`, `bmr`, `neatFactor`, `eatWorkout`, `tdee`, `calorieTarget`), `planType`, `paymentDueDate`, `paymentStatus`, `nextFeedbackDate`, `feedbackFrequencyDays`.
- **`Exercises` (Repertório):** `id`, `name`, `modality` (`resistance` | `cardio`), `primaryMuscle`, `secondaryMuscles[]`, `equipment`, `movementPattern`, `defaultMet`, `videoUrl`, `instructions`.
- **`Foods` (Repertório):** `id`, `name`, `category`, `sourceTable` (`TACO` | `TBCA` | `Custom`), `kcalPer100g`, `proteinPer100g`, `carbsPer100g`, `fatPer100g`, `fiberPer100g`, `householdMeasures[]` (`{ name: 'Colher de sopa', grams: 25 }`).
- **`WorkoutPlans` & `WorkoutSessions`:** Divisões (`A`, `B`, `C`), exercícios prescritos, séries, faixa de reps, RIR/PSE, descanso (`seconds`), substitutos permitidos, e blocos de cardio (`modality`, `type`: `steady` | `interval`, `duration`, `targetZone`, `intervals[]`, `estimatedKcal`).
- **`WorkoutLogs` (Histórico do Aluno):** Registro de cada sessão realizada, data, duração, carga e repetições feitas em cada série (usado para pré-preencher o próximo treino automaticamente).
- **`DietPlans` & `Meals`:** Meta de kcal/macros, tipos de dia (`trainingDay` | `restDay`), refeições, itens alimentares em gramas, medida caseira correspondente e lista de `substitutes[]` calculados.
- **`Feedbacks` (Check-ins):** Data, peso, fotos, notas de adesão, qualidade do sono/energia, observações do aluno e resposta/ajustes do profissional.

---

## 10. Roadmap de Desenvolvimento Recomendado (Fases)

### Fase 1: Fundação, Repertórios, Anamnese e CRM do Profissional (MVP Base)
- Estrutura em React + Tailwind CSS com alternância entre **Visão do Profissional** e **Visão do Aluno**.
- Dashboard de controle de alunos com gestão de **Data de Pagamento**, **Data de Feedback** e alertas visuais de vencimento.
- Prontuário com **Anamnese Integrada (7 Blocos)** e **Calculadora Comparativa de Gasto Calórico** (exibindo lado a lado Mifflin-St Jeor, Harris-Benedict, Cunningham, Katch-McArdle, Tinsley, FAO/OMS, Pollock/Navy e gasto por METs).
- Banco de dados inicial pré-carregado com repertório de **Exercícios** (musculação + modalidades aeróbias) e **Alimentos** (com calorias, macronutrientes e medidas caseiras).

### Fase 2: Prescrição Integrada (Treino Resistido, Aeróbio e Dieta)
- Construtor de Treino Resistido (séries, reps, RIR, descanso, bi-sets, exercícios substitutos) com calculadora automática de séries semanais por músculo.
- Construtor de Treino Aeróbio (contínuo e intervalado HIIT para corrida, bike, escada, elíptico, natação, etc.).
- Construtor de Dieta com cálculo de TMB/GET integrado ao gasto do treino, soma de macros em tempo real (`g`, `g/kg`, `%`) e gerador automático de substituições equivalentes.

### Fase 3: Experiência do Aluno "One-Handed" (Modo Academia & Dieta Interativa)
- Interface Mobile-First com pré-preenchimento automático das cargas da última sessão, botões de ajuste rápido (`+`/`-`) e confirmação de série com **1 toque**.
- Timer de descanso automático na barra inferior e timer guiado para cardio intervalado.
- Visualização da dieta com calculadora de substituição em 1 toque, contador rápido de água e formulário de Feedback (Check-in).

### Fase 4: Inteligência, PWA Offline e Autenticação em Nuvem
- Configuração PWA para instalação no celular do aluno e funcionamento 100% offline dentro da academia.
- Gráficos de evolução (peso, medidas, progressão de cargas e aderência) e exportação de planos em PDF.
- Integração com backend em nuvem (Supabase) para login individual de cada aluno em seu próprio aparelho.
