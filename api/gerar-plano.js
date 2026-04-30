import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { patientData } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Variável GOOGLE_API_KEY não configurada no servidor.' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    Você é um nutricionista profissional altamente experiente.
    Gere um plano alimentar semanal (7 dias) personalizado com base nos dados do paciente abaixo.

    DADOS DO PACIENTE:
    ${JSON.stringify(patientData, null, 2)}

    DIRETRIZES:
    1. Gere 7 dias completos (Segunda a Domingo).
    2. Cada refeição deve conter exatamente 5 opções variadas.
    3. Use alimentos comuns na cultura brasileira, acessíveis e saudáveis.
    4. Respeite RIGOROSAMENTE as alergias e restrições alimentares mencionadas nos dados.
    5. O plano deve ser equilibrado conforme o objetivo do paciente (ex: emagrecimento, hipertrofia).
    6. Responda APENAS com o JSON no formato solicitado, sem explicações ou markdown.

    FORMATO JSON OBRIGATÓRIO:
    {
      "plano_semanal": [
        {
          "dia": "Segunda-feira",
          "refeicoes": {
            "cafe_da_manha": ["opção 1", "opção 2", "opção 3", "opção 4", "opção 5"],
            "lanche_manha": ["opção 1", "opção 2", "opção 3", "opção 4", "opção 5"],
            "almoco": ["opção 1", "opção 2", "opção 3", "opção 4", "opção 5"],
            "lanche_tarde": ["opção 1", "opção 2", "opção 3", "opção 4", "opção 5"],
            "jantar": ["opção 1", "opção 2", "opção 3", "opção 4", "opção 5"]
          }
        }
        ... (mais 6 dias)
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpeza extra caso a IA inclua blocos de código markdown
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro na API Gemini:', error);
    return res.status(500).json({ 
      error: 'Falha ao gerar o plano alimentar.', 
      details: error.message 
    });
  }
}
