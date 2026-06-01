/**
 * Delta Calendar - AI Service (Hybrid Parser)
 */

import { formatDate, addDays } from './utils.js';

// Global chat context to maintain follow-up questions state
let chatContext = {
    step: 'idle', // 'idle', 'awaiting_content', 'awaiting_prep_days'
    extractedData: null
};

// Reset chat context
export function resetChatContext() {
    chatContext = {
        step: 'idle',
        extractedData: null
    };
}

// 1. OFFLINE HEURISTIC PARSER (Perfect academic safety net)
function runOfflineParser(message) {
    const text = message.toLowerCase().trim();
    
    // Check if we are in the middle of a multi-turn conversation
    if (chatContext.step === 'awaiting_content') {
        chatContext.extractedData.studyContent = message;
        chatContext.step = 'awaiting_prep_days';
        return {
            success: true,
            isComplete: false,
            reply: 'Quantos dias antes você deseja começar a estudar? (Ex: 5)',
            data: chatContext.extractedData
        };
    }
    
    if (chatContext.step === 'awaiting_prep_days') {
        const days = parseInt(text.replace(/[^0-9]/g, '')) || 3;
        chatContext.extractedData.prepDays = days;
        chatContext.step = 'idle';
        
        const finalData = { ...chatContext.extractedData };
        chatContext.extractedData = null;
        
        return {
            success: true,
            isComplete: true,
            reply: `Excelente! Agendei seu compromisso e criei um plano de estudos de ${days} dias para você!`,
            data: finalData
        };
    }

    // --- Start a new parsing flow ---
    const now = new Date('2026-06-01T17:56:24-03:00'); // June 1, 2026 in this sandbox
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    
    let dateStr = '';
    let category = 'Outro';
    let title = '';

    // A. Detect Category
    if (text.includes('prova') || text.includes('estudo') || text.includes('estudar') || text.includes('exame acad') || text.includes('teste')) {
        category = 'Estudo';
    } else if (text.includes('consulta') || text.includes('médic') || text.includes('dentista') || text.includes('exame méd') || text.includes('terapia')) {
        category = 'Consulta';
    } else if (text.includes('projeto') || text.includes('trabalho') || text.includes('apresenta') || text.includes('reuni') || text.includes('job')) {
        category = 'Trabalho';
    } else if (text.includes('compromisso') || text.includes('pessoal') || text.includes('academia') || text.includes('aniversario') || text.includes('niver')) {
        category = 'Pessoal';
    }

    // B. Detect Date (Heuristics for "dia XX", "hoje", "amanhã")
    const dayRegex = /dia\s+(\d+)/i;
    const matchDay = text.match(dayRegex);
    
    if (matchDay) {
        const dayVal = String(matchDay[1]).padStart(2, '0');
        dateStr = `${currentYear}-${currentMonth}-${dayVal}`;
    } else if (text.includes('hoje')) {
        dateStr = formatDate(now);
    } else if (text.includes('amanhã') || text.includes('amanha')) {
        dateStr = formatDate(addDays(formatDate(now), 1));
    } else {
        // Default to 7 days in the future if no date is specified
        dateStr = formatDate(addDays(formatDate(now), 7));
    }

    // C. Extract Title
    if (category === 'Estudo') {
        title = 'Prova';
        if (text.includes('matematica') || text.includes('matemática')) title = 'Prova de Matemática';
        else if (text.includes('historia') || text.includes('história')) title = 'Prova de História';
        else if (text.includes('quimica') || text.includes('química')) title = 'Prova de Química';
        else if (text.includes('portugues') || text.includes('português')) title = 'Prova de Português';
        else if (text.includes('fisica') || text.includes('física')) title = 'Prova de Física';
    } else if (category === 'Consulta') {
        title = 'Consulta Médica';
        if (text.includes('dentista')) title = 'Consulta Dentista';
        else if (text.includes('oftalmo')) title = 'Consulta Oftalmologista';
    } else if (category === 'Trabalho') {
        title = 'Apresentação de Trabalho';
        if (text.includes('projeto')) title = 'Apresentação de Projeto';
        else if (text.includes('reunião') || text.includes('reuniao')) title = 'Reunião de Trabalho';
    } else {
        // Capitalize first letter of message as fallback title
        title = message.charAt(0).toUpperCase() + message.slice(1);
        if (title.length > 30) title = title.substring(0, 27) + '...';
    }

    // D. Build data structure
    chatContext.extractedData = {
        title,
        date: dateStr,
        time: '14:00', // standard fallback time
        description: `Agendado via Assistente Inteligente Delta: "${message}"`,
        category,
        prepDays: 3, // fallback
        studyContent: ''
    };

    // E. Decide follow-up questions
    if (category === 'Estudo') {
        chatContext.step = 'awaiting_content';
        return {
            success: true,
            isComplete: false,
            reply: 'Identifiquei que você tem uma Prova! Quais conteúdos irão cair nessa prova?',
            data: chatContext.extractedData
        };
    } else if (category === 'Consulta') {
        const finalData = { ...chatContext.extractedData };
        chatContext.extractedData = null;
        chatContext.step = 'idle';
        return {
            success: true,
            isComplete: true,
            reply: `Entendido! Agendei sua Consulta Médica para o dia ${finalData.date.split('-')[2]} e criei as tarefas preparatórias automaticamente na sua agenda.`,
            data: finalData
        };
    } else if (category === 'Trabalho') {
        const finalData = { ...chatContext.extractedData };
        chatContext.extractedData = null;
        chatContext.step = 'idle';
        return {
            success: true,
            isComplete: true,
            reply: `Combinado! Agendei sua Apresentação/Trabalho para o dia ${finalData.date.split('-')[2]} e distribuí as tarefas preparatórias para evitar sobrecarga.`,
            data: finalData
        };
    } else {
        const finalData = { ...chatContext.extractedData };
        chatContext.extractedData = null;
        chatContext.step = 'idle';
        return {
            success: true,
            isComplete: true,
            reply: `Certo! Agendei o evento "${finalData.title}" para o dia ${finalData.date.split('-')[2]} com sucesso!`,
            data: finalData
        };
    }
}

// 2. LIVE LOCAL LLM CONNECTOR (Ollama / KoboldCPP compatible)
async function runLocalLLM(message, settings) {
    const provider = settings.aiProvider || 'ollama'; // 'ollama' or 'kobold'
    const apiUrl = settings.aiUrl || 'http://localhost:11434';
    const model = settings.aiModel || 'llama3.1';
    
    const now = new Date('2026-06-01T17:56:24-03:00');
    const currentDateStr = formatDate(now);

    const systemPrompt = `Você é o interpretador de linguagem natural do aplicativo "Delta".
Seu objetivo é extrair parâmetros para agendar um compromisso a partir da mensagem do usuário.
A data atual de hoje é ${currentDateStr} (Segunda-feira).

Você DEVE responder UNICAMENTE no formato JSON válido abaixo, sem texto complementar, marcadores de markdown ou explicações.

Estrutura do JSON esperada:
{
  "title": "Título resumido do evento",
  "date": "Data no formato YYYY-MM-DD",
  "category": "Escolha entre: Estudo, Trabalho, Consulta, Pessoal, Outro",
  "studyContent": "Se for Estudo, quais conteúdos estudar (string vazia se não especificado)",
  "prepDays": 3 // Número inteiro de dias de antecedência para estudar (padrão 3 se for Estudo)
}

Exemplos de extrações:
- "Tenho prova de matemática dia 20" -> {"title": "Prova de Matemática", "date": "2026-06-20", "category": "Estudo", "studyContent": "", "prepDays": 3}
- "Consulta dentista dia 15" -> {"title": "Consulta Dentista", "date": "2026-06-15", "category": "Consulta", "studyContent": "", "prepDays": 0}
- "Apresentação de projeto dia 10" -> {"title": "Apresentação de Projeto", "date": "2026-06-10", "category": "Trabalho", "studyContent": "", "prepDays": 0}

Mensagem do Usuário: "${message}"`;

    try {
        let response;
        
        if (provider === 'ollama') {
            const endpoint = `${apiUrl.replace(/\/$/, '')}/api/generate`;
            
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    prompt: systemPrompt,
                    stream: false,
                    options: {
                        temperature: 0.1
                    },
                    format: 'json' // Enforce JSON format in Ollama!
                })
            });
            
            if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
            const resData = await response.json();
            
            // Ollama stores completion in 'response'
            const parsed = JSON.parse(resData.response.trim());
            return processLLMResult(parsed, message);
            
        } else {
            // KoboldCPP OpenAI compatible endpoint
            const endpoint = `${apiUrl.replace(/\/$/, '')}/v1/chat/completions`;
            
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: systemPrompt }
                    ],
                    temperature: 0.1,
                    response_format: { type: 'json_object' } // Enforce JSON if supported
                })
            });
            
            if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
            const resData = await response.json();
            
            // KoboldCPP returns OpenAI structure
            const content = resData.choices[0].message.content.trim();
            const parsed = JSON.parse(content);
            return processLLMResult(parsed, message);
        }
        
    } catch (err) {
        console.error('Erro na chamada da IA Local, caindo de volta na Heurística:', err);
        // Fallback automatically to heuristic if connection fails
        return {
            ...runOfflineParser(message),
            isFallback: true,
            errorMsg: err.message
        };
    }
}

// Post-process the extracted parameters from LLM and format nicely
function processLLMResult(parsed, originalMessage) {
    // Basic defaults
    const now = new Date('2026-06-01T17:56:24-03:00');
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    let title = parsed.title || 'Compromisso';
    let date = parsed.date || `${currentYear}-${currentMonth}-08`;
    let category = parsed.category || 'Outro';
    let prepDays = parseInt(parsed.prepDays) || 3;
    let studyContent = parsed.studyContent || '';

    // Validate category
    const validCategories = ['Estudo', 'Trabalho', 'Consulta', 'Pessoal', 'Outro'];
    if (!validCategories.includes(category)) {
        category = 'Outro';
    }

    // Structure compiled data
    const extracted = {
        title,
        date,
        time: '14:00',
        description: `Processado por IA local Delta: "${originalMessage}"`,
        category,
        prepDays,
        studyContent
    };

    // If it's a study event, but studyContent or prepDays was not filled by user's first prompt,
    // trigger the multi-turn dialog context!
    if (category === 'Estudo' && (!studyContent || !prepDays)) {
        chatContext.extractedData = extracted;
        chatContext.step = 'awaiting_content';
        return {
            success: true,
            isComplete: false,
            reply: `Entendi que você tem uma prova de ${title.replace('Prova de ', '')} no dia ${date.split('-')[2]}! Quais conteúdos específicos irão cair nessa prova?`,
            data: chatContext.extractedData
        };
    }

    // Complete flow
    return {
        success: true,
        isComplete: true,
        reply: `Perfeito! Agenda atualizada! Agendei o evento "${title}" para o dia ${date.split('-')[2]}/${date.split('-')[1]} e organizei todas as tarefas no planejador.`,
        data: extracted
    };
}

// Main process message endpoint
export async function processMessage(message, settings = {}) {
    // If we are in active multi-turn heuristic questioning, ignore LLM connection and finish the dialog offline
    if (chatContext.step !== 'idle') {
        return runOfflineParser(message);
    }

    // If real local AI is active in settings, run it!
    if (settings.aiEnabled) {
        return await runLocalLLM(message, settings);
    }

    // Otherwise, run offline heuristic rule-engine
    return runOfflineParser(message);
}
