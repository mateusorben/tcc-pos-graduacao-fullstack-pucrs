# Smart Pantry - TCC Pós-Graduação Fullstack PUCRS

Projeto desenvolvido como Trabalho de Conclusão de Curso. O sistema é uma aplicação fullstack para gerenciamento inteligente de despensa (Smart Pantry).

## Estrutura do Repositório

O projeto está organizado em duas partes principais dentro do diretório `smart-pantry/`:

*   **backend/**: API REST desenvolvida em Node.js com Express e PostgreSQL.
*   **frontend/**: Aplicação web desenvolvida em React com Vite e TailwindCSS.

## Pré-requisitos

Para executar o projeto, você precisará ter instalado em sua máquina:

*   [Node.js](https://nodejs.org/) (Versão LTS recomendada, v18 ou superior)
*   [PostgreSQL](https://www.postgresql.org/) (Banco de dados relacional)

## Configuração e Instalação

Siga os passos abaixo na ordem para configurar e rodar o projeto localmente.

### 1. Configuração do Banco de Dados

1.  Certifique-se de que o serviço do PostgreSQL esteja rodando.
2.  Crie um banco de dados chamado `smart_pantry`.
    *   Via linha de comando (se tiver postgres instalado no path):
        ```bash
        createdb -U postgres smart_pantry
        ```
    *   Ou utilize uma ferramenta visual como **pgAdmin** ou **DBeaver**.

### 2. Configuração do Backend

O backend é responsável pela lógica de negócios e conexão com o banco de dados.

1.  Abra um terminal e navegue até a pasta do backend:
    ```bash
    cd smart-pantry/backend
    ```

2.  Instale as dependências do projeto:
    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:
    *   Crie um arquivo chamado `.env` na raiz da pasta `backend`.
    *   Copie e cole o conteúdo abaixo, **ajustando a `DATABASE_URL`** com seu usuário e senha do Postgres:

    ```env
    # .env
    # Formato: postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
    DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/smart_pantry"
    PORT=3001
    JWT_SECRET="defina_um_segredo_seguro_aqui"
    FRONTEND_URL="http://localhost:5173"
    
    # Configurações de Web Push (Opcionais para rodar localmente)
    # Você pode gerar chaves VAPID usando: npx web-push generate-vapid-keys
    VAPID_PUBLIC_KEY=sua_chave_publica_aqui
    VAPID_PRIVATE_KEY=sua_chave_privada_aqui
    VAPID_EMAIL=mailto:admin@smartpantry.com
    ```

4.  Execute as migrações para criar as tabelas no banco de dados:
    ```bash
    npm run migrate
    ```

5.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    Você verá a mensagem: `Servidor rodando na porta 3001`.

### 3. Configuração do Frontend

O frontend é a interface visual da aplicação.

1.  Abra um **novo terminal** (mantenha o backend rodando) e navegue até a pasta do frontend:
    ```bash
    cd smart-pantry/frontend
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Inicie a aplicação:
    ```bash
    npm run dev
    ```

4.  Acesse a aplicação no seu navegador através do link:
    [http://localhost:5173](http://localhost:5173)

## Scripts Disponíveis

### Backend (`smart-pantry/backend`)
*   `npm run dev`: Inicia o servidor com `nodemon` (reinício automático ao salvar arquivos).
*   `npm start`: Inicia o servidor em modo produção (usando `node`).
*   `npm run migrate`: Executa o script de migração do banco de dados (`src/database/migrate.js`).

### Frontend (`smart-pantry/frontend`)
*   `npm run dev`: Inicia o servidor de desenvolvimento Vite.
*   `npm run build`: Compila a aplicação para produção na pasta `dist`.
*   `npm run preview`: Visualiza o build de produção localmente.
*   `npm run lint`: Executa o ESLint para verificar a qualidade do código.

## Tecnologias Utilizadas

*   **Backend**: Node.js, Express, PostgreSQL, JWT (Autenticação), Web Push.
*   **Frontend**: React, Vite, TailwindCSS, Lucide React (Ícones), Recharts (Gráficos), Sonner (Toasts).
