# Guia de Aprendizado e Execução — App de Consultoria (EF + Nutrição)

Bem-vindo ao seu projeto! Este documento foi escrito passo a passo para quem está **iniciando na programação**, explicando **como abrir o aplicativo**, **como estudar cada arquivo**, **como subir para o GitHub** e **quais cuidados de segurança tomar**.

---

## 1. Como Abrir e Rodar o Aplicativo no seu Computador (CachyOS / Arch Linux)

Existem **duas formas** de abrir o projeto: o **Modo Rápido** (funciona agora mesmo sem instalar nada) e o **Modo Profissional React + Vite** (o padrão usado pelo mercado).

### Opção A: Modo Rápido (Para ver funcionando em 5 segundos)
Como o seu Linux já tem o `python3` instalado, você pode criar um pequeno servidor local para abrir o arquivo `preview-navegador.html`:
1. Abra o seu **Terminal** dentro da pasta do projeto (`/home/lcs-sanje/Documentos/Agentes/App Consultoria`).
2. Digite o comando abaixo e aperte **Enter**:
   ```bash
   python3 -m http.server 8080
   ```
3. Abra o seu navegador (Chrome, Brave, Firefox) e acesse:
   👉 **`http://localhost:8080/preview-navegador.html`**
4. Para desligar o servidor no terminal quando terminar, basta apertar **`Ctrl + C`**.

---

### Opção B: Modo Profissional com Node.js e Vite (Recomendado para seus estudos)
No desenvolvimento moderno em **JavaScript e React**, usamos o **Node.js** e o **npm** (gerenciador de pacotes) junto com o **Vite** (que atualiza a tela instantaneamente toda vez que você salva um arquivo no editor!).

#### Passo 1: Instalar o Node.js no seu CachyOS (apenas na primeira vez)
Abra o seu terminal e rode:
```bash
sudo pacman -S nodejs npm
```
*(Ele pedirá a senha do seu computador. Depois de instalar, você pode confirmar digitando `node -v` e `npm -v`).*

#### Passo 2: Instalar as bibliotecas do projeto (apenas na primeira vez)
Dentro da pasta do projeto (`cd "/home/lcs-sanje/Documentos/Agentes/App Consultoria"`), rode:
```bash
npm install
```
> **O que esse comando faz?** Ele lê o arquivo `package.json` e baixa o React e o Tailwind CSS para dentro de uma pasta chamada `node_modules/`.

#### Passo 3: Iniciar o servidor de desenvolvimento
Sempre que quiser programar e ver o aplicativo rodando, digite:
```bash
npm run dev
```
O terminal mostrará um endereço parecido com **`http://localhost:5173`** — basta abrir no navegador! Qualquer alteração que você fizer nos arquivos dentro de `src/` atualizará a página automaticamente.

---

## 2. Como Subir o seu Projeto para o GitHub (Passo a Passo)

O **Git** é uma "máquina do tempo" que salva o histórico do seu código no seu computador. O **GitHub** é o site na nuvem onde você guarda esse histórico com segurança.

*(O Git `2.56.0` já está instalado no seu computador!)*

### Passo 1: Configurar seu nome e e-mail no Git (apenas na 1ª vez no computador)
No terminal, digite (trocando pelos seus dados):
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@exemplo.com"
```

### Passo 2: Inicializar o Git na pasta do projeto e salvar a 1ª versão (Commit)
Dentro da pasta do projeto, execute um comando por vez:
```bash
# 1. Inicia o controle de versão na pasta
git init

# 2. Define o nome do ramo principal como 'main'
git branch -M main

# 3. Prepara todos os arquivos (respeitando o bloqueio de segurança do .gitignore)
git add .

# 4. Cria o seu primeiro ponto salvo (commit)
git commit -m "Estrutura inicial modular do App de Consultoria EF e Nutricao"
```

### Passo 3: Enviar para a sua conta do GitHub
1. Crie uma conta (ou faça login) em [https://github.com](https://github.com).
2. Clique no botão **`+` (New repository)** no canto superior direito.
3. Dê um nome para o repositório, por exemplo: `app-consultoria-integrada`.
4. **Dica de Ouro:** Marque a opção **🔒 Private (Privado)** — assim só você vê o código da sua consultoria!
5. **Não** marque a opção *"Add a README file"* (pois já temos um). Clique em **Create repository**.
6. Copie os dois últimos comandos que o GitHub mostrará na tela e cole no seu terminal:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/app-consultoria-integrada.git
   git push -u origin main
   ```

### Fluxo do Dia a Dia (Sempre que você alterar o código no futuro)
Sempre que terminar de estudar ou criar uma melhoria no app, rode estes 3 comandos para atualizar seu backup no GitHub:
```bash
git add .
git commit -m "Descreva aqui o que voce alterou (ex: Adicionei novos alimentos)"
git push
```

---

## 3. Boas Práticas de Segurança (Fundamental para Área da Saúde / LGPD)

Como **Profissional de Educação Física e Nutricionista**, seu aplicativo lidará no futuro com **dados pessoais sensíveis** (peso, exames de sangue, patologias na anamnese, fotos de evolução e datas de pagamento). Siga estas **5 Regras de Ouro**:

1. **Nunca suba senhas ou chaves de banco de dados para o GitHub (`.env` vs `.gitignore`):**
   - Já deixei criado na pasta o arquivo [`.gitignore`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/.gitignore). Ele impede que arquivos `.env` (onde ficam senhas de banco de dados) e a pasta pesada `node_modules/` sejam enviados ao GitHub.
   - Use o arquivo [`.env.example`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/.env.example) apenas como modelo sem senhas reais.
2. **Nunca coloque dados reais de pacientes/alunos direto no código (`initialMockData.js`):**
   - Os alunos que estão em `src/data/initialMockData.js` são **fictícios** para seu estudo. Dados reais de alunos nunca devem ser escritos diretamente no código-fonte.
3. **Cuidado com o `LocalStorage` em computadores compartilhados:**
   - Nesta Fase 1 de aprendizado, o aplicativo salva as alterações no navegador (`localStorage`). Isso é excelente para aprender sem precisar pagar servidor, mas lembre-se de que qualquer pessoa que usar o mesmo navegador no seu computador poderá ver esses dados de teste.
4. **Quando for colocar alunos reais online (Fase 4 — Supabase/Backend):**
   - Usaremos **Autenticação Individual** (cada aluno tem seu login e senha).
   - Ativaremos **RLS (*Row Level Security*)** no banco de dados: uma regra de segurança que garante que o Aluno A jamais consiga acessar a dieta, fotos ou exames do Aluno B, mesmo que tente alterar o endereço da página.
5. **Fotos de Evolução Física (Frente, Costas, Perfil):**
   - Quando implementarmos o upload de fotos na nuvem, os arquivos devem ficar em *Buckets Privados* com links temporários assinados (*Signed URLs*), e nunca em links públicos abertos na internet.

---

## 4. Mapa de Estudos: Onde Mexer para Aprender sem Medo?

Como o projeto foi feito de forma **modular**, você pode praticar alterando um arquivo por vez:

1. **Quer aprender como funcionam listas e objetos em JavaScript?**
   - Abra [`src/data/foodsCatalog.js`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/src/data/foodsCatalog.js) ou [`src/data/exercisesCatalog.js`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/src/data/exercisesCatalog.js) e adicione um alimento ou exercício novo seguindo o modelo dos anteriores.
2. **Quer entender como transformar fórmulas matemáticas da faculdade em código?**
   - Abra [`src/core/formulas/energyFormulas.js`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/src/core/formulas/energyFormulas.js) e veja como *Harris-Benedict*, *Mifflin-St Jeor*, *Cunningham* e *Tinsley* são apenas funções que recebem `{ weightKg, heightCm, age }` e retornam o resultado!
3. **Quer mudar as perguntas da Anamnese?**
   - Abra [`src/data/anamnesisSchema.js`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/src/data/anamnesisSchema.js) e adicione um novo bloco ou pergunta. A tela de Anamnese criará o campo sozinha!
4. **Quer entender como o React cria telas interativas?**
   - Compare [`StudentWorkoutModule.jsx`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/src/modules/student/one-handed-workout/StudentWorkoutModule.jsx) (Visão do Aluno com 1 mão) com [`WorkoutBuilderModule.jsx`](file:///home/lcs-sanje/Documentos/Agentes/App%20Consultoria/src/modules/coach/workout-builder/WorkoutBuilderModule.jsx) (Visão do Profissional).
