Você é um desenvolvedor implementando uma funcionalidade de geração de plano alimentar com IA no sistema "nutricionista_sistema".

---

# 🧪 STACK

- React (Vite)
- Supabase
- Serverless Function
- Google Gemini API

---

# 🎯 OBJETIVO

Permitir gerar, editar e salvar planos alimentares automaticamente com IA.

---

# 🔄 FLUXO

1. Usuário clica em "Gerar Plano Alimentar"
2. Exibir loading
3. Buscar dados do paciente no Supabase
4. Chamar `/api/gerar-plano`
5. Exibir plano gerado
6. Permitir edição
7. Salvar no banco

---

# ⚙️ SERVERLESS FUNCTION

Criar `/api/gerar-plano.js`

## Responsabilidades:

- Receber dados do paciente via POST
- Usar `GOOGLE_API_KEY`
- Chamar API do Gemini
- Retornar JSON estruturado

---

# 🧠 PROMPT DA IA

Utilizar o seguinte prompt:

Você é um nutricionista profissional.

Gere um plano alimentar semanal com base nos dados abaixo.

⚠️ Regras:
- Responda APENAS em JSON válido
- Não use markdown
- Não escreva explicações
- Respeite restrições e alergias

Dados do paciente:
{dados_do_paciente}

Formato obrigatório:

{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["", "", "", "", ""],
        "lanche_manha": ["", "", "", "", ""],
        "almoco": ["", "", "", "", ""],
        "lanche_tarde": ["", "", "", "", ""],
        "jantar": ["", "", "", "", ""]
      }
    }
  ]
}

Regras:
- gerar 7 dias
- 5 opções por refeição
- evitar repetição
- usar alimentos comuns no Brasil

---

# 📊 EXIBIÇÃO

Para cada dia:

- exibir refeições em cards
- cada opção editável

Exemplo:
☀️ Café da manhã
- input editável (5 opções)

---

# 💾 SALVAMENTO

Salvar na tabela `planos_alimentares`:

- paciente_id
- conteudo (JSON completo)

Após salvar:
- exibir sucesso
- atualizar histórico

---

# 📚 HISTÓRICO

- listar planos (mais recente primeiro)
- exibir data
- ao clicar → mostrar conteúdo

---

# ⚠️ REGRAS IMPORTANTES

- nunca expor API KEY no frontend
- chamada deve ser server-side
- tratar erro de geração
- botão "Salvar" só aparece após gerar

---

# 🎨 INTERFACE

- padrão do sistema
- cards por refeição
- botão de geração em destaque

---

# 📤 ENTREGÁVEL

- função `/api/gerar-plano`
- integração frontend
- exibição editável
- salvamento funcional

---

# 🚫 NÃO FAZER

- não usar IA direto no frontend
- não retornar texto fora de JSON
- não salvar sem validação básica

---

# ✅ CRITÉRIO DE SUCESSO

- plano gerado corretamente
- edição funcionando
- dados salvos no Supabase
- histórico funcional
