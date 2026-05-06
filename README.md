# NutriSystem - Gestão Inteligente para Nutricionistas

NutriSystem é uma plataforma moderna e intuitiva projetada para nutricionistas que desejam otimizar o atendimento aos seus pacientes. A aplicação permite o cadastro completo de pacientes, acompanhamento de medidas antropométricas e a geração inteligente de planos alimentares utilizando Inteligência Artificial.

![NutriSystem Screenshot](./public/screenshot.png)

## 🚀 Funcionalidades

- **Dashboard Geral**: Visualização rápida de métricas e próximos atendimentos.
- **Gestão de Pacientes**: Cadastro detalhado, incluindo histórico médico, hábitos e objetivos.
- **Acompanhamento de Evolução**: Registro de peso, medidas e percentual de gordura com visualização gráfica.
- **Plano Alimentar Inteligente**: Geração de planos personalizados utilizando a API do Google Gemini, adaptados às necessidades e restrições de cada paciente.
- **Autenticação Segura**: Sistema de login e registro utilizando Supabase Auth.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React.js](https://reactjs.org/) com [Vite](https://vitejs.dev/)
- **Estilização**: CSS Moderno (Vanilla)
- **Banco de Dados & Autenticação**: [Supabase](https://supabase.com/)
- **Inteligência Artificial**: [Google Gemini API](https://ai.google.dev/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)

## 📦 Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/egondobrasil/sistema_nutricionista.git
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione:
    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
    VITE_GEMINI_API_KEY=sua_chave_do_gemini
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 🌐 Deploy

O projeto está configurado para deploy automático na **Vercel**.

---
Desenvolvido com ❤️ para facilitar a vida dos profissionais de nutrição.
