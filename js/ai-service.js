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
    
    // Conversation state machine for Study content/days
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

    // Greetings and Help triggers (Conversational Gatekeeper)
    const greetings = ['olá', 'ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem', 'eae', 'e ai', 'opa', 'hello', 'hi', 'helo'];
    const helpWords = ['ajuda', 'como funciona', 'como usar', 'o que você faz', 'o que voce faz', 'ajudar'];
    
    const isGreeting = greetings.some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g));
    const isHelp = helpWords.some(h => text.includes(h));
    
    if (isGreeting || isHelp) {
        return {
            success: true,
            isComplete: false,
            reply: 'Olá! Sou o seu Assistente Delta. 🧠\n\nPosso agendar seus compromissos e planejar suas tarefas preparatórias automaticamente para evitar sobrecarga!\n\nExperimente dizer algo como:\n• "Tenho prova de cálculo dia 20"\n• "Consulta médica amanhã"\n• "Apresentação de projeto dia 10"',
            data: null
        };
    }

    // Check for deletion/clear actions
    if (text.includes('apagar') || text.includes('excluir') || text.includes('remover') || text.includes('limpar')) {
        let action = { type: 'none' };
        let reply = '';
        
        // Detect Date in the message (ex: "dia 10", "dia 5", "amanhã")
        const now = new Date('2026-06-01T17:56:24-03:00');
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        let parsedDate = '';
        
        const dayRegex = /dia\s+(\d+)/i;
        const matchDay = text.match(dayRegex);
        if (matchDay) {
            const dayVal = String(matchDay[1]).padStart(2, '0');
            parsedDate = `${currentYear}-${currentMonth}-${dayVal}`;
        } else if (text.includes('hoje')) {
            parsedDate = formatDate(now);
        } else if (text.includes('amanhã') || text.includes('amanha')) {
            parsedDate = formatDate(addDays(formatDate(now), 1));
        }
        
        // Classify delete actions
        if (text.includes('provas') || text.includes('estudos') || text.includes('estudo') || (text.includes('prova') && !parsedDate)) {
            action = { type: 'delete_category', targetCategory: 'Estudo' };
            reply = 'Entendido! Removi todas as provas e planos de estudos da sua agenda.';
        } else if (text.includes('consultas') || text.includes('consulta') || text.includes('médico') || text.includes('dentista')) {
            action = { type: 'delete_category', targetCategory: 'Consulta' };
            reply = 'Entendido! Removi todas as consultas médicas da sua agenda.';
        } else if (text.includes('tudo') || text.includes('agenda completa') || text.includes('limpar tudo')) {
            action = { type: 'delete_all' };
            reply = 'Entendido! Limpei toda a sua agenda de compromissos.';
        } else if (parsedDate) {
            let targetTitle = '';
            if (text.includes('prova')) targetTitle = 'prova';
            else if (text.includes('consulta')) targetTitle = 'consulta';
            else if (text.includes('trabalho') || text.includes('apresentação') || text.includes('apresentacao')) targetTitle = 'apresentação';
            else {
                // e.g. "apague o cortar o cabelo do dia 5"
                const matchTitle = text.match(/(?:apagar|excluir|remover|limpar)\s+(?:o|a|os|as)?\s*(.*?)\s*(?:do\s+)?dia/i);
                if (matchTitle && matchTitle[1] && !matchTitle[1].includes('compromisso') && !matchTitle[1].includes('evento')) {
                    targetTitle = matchTitle[1].trim();
                }
            }
            
            if (targetTitle) {
                action = { type: 'delete_event', targetTitle: targetTitle, targetDate: parsedDate };
                const dayLabel = parsedDate.split('-')[2];
                reply = `Entendido! Excluí o compromisso contendo "${targetTitle}" agendado para o dia ${dayLabel}.`;
            } else {
                action = { type: 'delete_day', targetDate: parsedDate };
                const dayLabel = parsedDate.split('-')[2];
                reply = `Entendido! Removi todos os compromissos agendados para o dia ${dayLabel}.`;
            }
        } else {
            // Check for months: "junho", "julho", etc.
            const monthsMap = {
                'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3, 'abril': 4, 'maio': 5, 'junho': 6,
                'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
            };
            
            let foundMonth = null;
            for (const [mName, mVal] of Object.entries(monthsMap)) {
                if (text.includes(mName)) {
                    foundMonth = { name: mName, val: mVal };
                    break;
                }
            }
            
            if (foundMonth) {
                action = { type: 'delete_month', targetMonth: foundMonth.val, targetYear: 2026 };
                reply = `Entendido! Excluí todos os compromissos do mês de ${foundMonth.name.charAt(0).toUpperCase() + foundMonth.name.slice(1)} de 2026.`;
            } else {
                let targetTitle = text
                    .replace('apagar', '')
                    .replace('excluir', '')
                    .replace('remover', '')
                    .replace('limpar', '')
                    .replace('o evento', '')
                    .replace('a prova', '')
                    .replace('a consulta', '')
                    .trim();
                if (targetTitle.length > 2) {
                    action = { type: 'delete_event', targetTitle: targetTitle };
                    reply = `Entendido! Excluí todos os eventos contendo "${targetTitle}" da sua agenda.`;
                }
            }
        }
        
        if (action.type !== 'none') {
            return {
                success: true,
                isComplete: false,
                reply: reply,
                data: null,
                chatAction: action
            };
        }
    }

    // Check for completion action
    if (text.includes('concluir') || text.includes('concluido') || text.includes('concluído') || text.includes('feito') || text.includes('marcar feito') || text.includes('marcar como feito')) {
        let targetTitle = text
            .replace('concluir', '')
            .replace('concluido', '')
            .replace('concluído', '')
            .replace('feito', '')
            .replace('marcar feito', '')
            .replace('marcar como feito', '')
            .replace('a prova de', '')
            .replace('o evento', '')
            .replace('a tarefa', '')
            .trim();
            
        if (targetTitle.length > 2) {
            return {
                success: true,
                isComplete: false,
                reply: `Entendido! Marquei os compromissos relacionados a "${targetTitle}" como concluídos!`,
                data: null,
                chatAction: { type: 'complete_event', targetTitle: targetTitle }
            };
        }
    }

    // Heuristic Date/Category indicators
    const now = new Date('2026-06-01T17:56:24-03:00');
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    
    let dateStr = '';
    let category = '';
    let title = '';

    // Detect Category with contextual keywords
    if (text.includes('prova') || text.includes('estudo') || text.includes('estudar') || text.includes('exame acad') || (text.includes('teste') && text.length > 5)) {
        category = 'Estudo';
    } else if (text.includes('consulta') || text.includes('médic') || text.includes('dentista') || text.includes('exame méd') || text.includes('terapia')) {
        category = 'Consulta';
    } else if (text.includes('projeto') || text.includes('trabalho') || text.includes('apresenta') || text.includes('reuni') || text.includes('job')) {
        category = 'Trabalho';
    } else if (text.includes('compromisso') || text.includes('pessoal') || text.includes('academia') || text.includes('aniversario') || text.includes('niver') || text.includes('cortar')) {
        category = 'Pessoal';
    }

    // Detect Date indicators
    const dayRegex = /dia\s+(\d+)/i;
    const matchDay = text.match(dayRegex);
    const hasDateIndicator = matchDay || text.includes('hoje') || text.includes('amanhã') || text.includes('amanha');
    
    if (matchDay) {
        const dayVal = String(matchDay[1]).padStart(2, '0');
        dateStr = `${currentYear}-${currentMonth}-${dayVal}`;
    } else if (text.includes('hoje')) {
        dateStr = formatDate(now);
    } else if (text.includes('amanhã') || text.includes('amanha')) {
        dateStr = formatDate(addDays(formatDate(now), 1));
    }

    // Gatekeeper fallback: If no clear scheduling category OR no date indicator was found,
    // we assume the user is conversing and we ask for clarification instead of scheduling dummy data!
    if (!category && !hasDateIndicator) {
        return {
            success: true,
            isComplete: false,
            reply: 'Não entendi muito bem. Você gostaria de agendar um compromisso? 📅\n\nPor favor, diga o que deseja agendar e a data (ex: "Academia amanhã" ou "Prova de Cálculo dia 20").',
            data: null
        };
    }

    // Fallbacks if only one of them is present
    if (!category) category = 'Outro';
    if (!dateStr) dateStr = formatDate(addDays(formatDate(now), 7)); // default 7 days ahead

    // Extract Title based on category
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
        title = message.charAt(0).toUpperCase() + message.slice(1);
        if (title.length > 30) title = title.substring(0, 27) + '...';
    }

    chatContext.extractedData = {
        title,
        date: dateStr,
        time: '14:00',
        description: `Agendado via Assistente Inteligente Delta: "${message}"`,
        category,
        prepDays: 3,
        studyContent: ''
    };

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
    const provider = settings.aiProvider || 'ollama';
    const apiUrl = settings.aiUrl || 'http://localhost:11434';
    const model = settings.aiModel || 'llama3.1';
    
    const now = new Date('2026-06-01T17:56:24-03:00');
    const currentDateStr = formatDate(now);

    const systemPrompt = `Você é o interpretador de linguagem natural da agenda inteligente "Delta".
Seu objetivo primário é identificar se o usuário deseja agendar um compromisso (isSchedulingIntent: true) ou se está apenas cumprimentando, fazendo uma pergunta geral ou batendo papo (isSchedulingIntent: false).

A data de hoje é ${currentDateStr} (Segunda-feira).

Você DEVE responder UNICAMENTE no formato JSON válido abaixo, sem textos extras ou blocos de markdown.

Estrutura JSON:
{
  "isSchedulingIntent": true ou false,
  "reply": "Caso isSchedulingIntent seja false, escreva aqui uma resposta amigavel e prestativa respondendo ao cumprimento ou duvida do usuario, explicando como ele pode agendar compromissos. Se for true, deixe vazio (string vazia).",
  "title": "Caso seja agendamento, titulo resumido e elegante do evento (ex: Prova de Matematica, Consulta Cardiologista, Apresentacao de Projeto). Vazio se nao for agendamento.",
  "date": "Caso seja agendamento, data no formato YYYY-MM-DD. Vazio se nao for agendamento.",
  "category": "Caso seja agendamento, escolha obrigatoriamente entre: Estudo, Trabalho, Consulta, Pessoal, Outro. Vazio se nao.",
  "studyContent": "Se for Estudo, quais conteudos especificos estudar (vazio se nao especificado)",
  "prepDays": 3 // Numero inteiro de dias de antecedencia para tarefas preparatorias (padrao 3 se for Estudo)
}

Diretrizes importantes:
1. Se o usuario disser coisas como "Ola", "Oi", "Tudo bem?", "Como funciona?", retorne isSchedulingIntent = false, e escreva uma resposta amigavel no campo "reply".
2. Se o usuario pedir para agendar (ex: "tenho prova dia 20" ou "consulta medica amanha"), retorne isSchedulingIntent = true, e extraia os campos title, date e category corretamente.
3. Se a mensagem for vaga, sem sentido ou apenas texto aleatorio (ex: "teste", "asd"), retorne isSchedulingIntent = false, e escreva no "reply" que nao entendeu e instrua amigavelmente como agendar.`;

    try {
        let response;
        
        if (provider === 'ollama') {
            const endpoint = `${apiUrl.replace(/\/$/, '')}/api/generate`;
            
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    prompt: systemPrompt,
                    stream: false,
                    options: {
                        temperature: 0.1
                    },
                    format: 'json'
                })
            });
            
            if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
            const resData = await response.json();
            const parsed = JSON.parse(resData.response.trim());
            return processLLMResult(parsed, message);
            
        } else {
            const endpoint = `${apiUrl.replace(/\/$/, '')}/v1/v1/chat/completions`; // fixed endpoint
            const correctEndpoint = `${apiUrl.replace(/\/$/, '')}/v1/chat/completions`;
            
            response = await fetch(correctEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'user', content: systemPrompt }
                    ],
                    temperature: 0.1,
                    response_format: { type: 'json_object' }
                })
            });
            
            if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
            const resData = await response.json();
            const content = resData.choices[0].message.content.trim();
            const parsed = JSON.parse(content);
            return processLLMResult(parsed, message);
        }
        
    } catch (err) {
        console.error('Erro na chamada da IA Local, caindo de volta na Heurística:', err);
        return {
            ...runOfflineParser(message),
            isFallback: true,
            errorMsg: err.message
        };
    }
}

// Post-process the extracted parameters from LLM and format nicely
function processLLMResult(parsed, originalMessage) {
    const now = new Date('2026-06-01T17:56:24-03:00');
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    // Check if it is a scheduling intent
    const isSchedulingIntent = parsed.isSchedulingIntent === true;
    
    if (!isSchedulingIntent) {
        return {
            success: true,
            isComplete: false, // does not schedule
            reply: parsed.reply || 'Não entendi muito bem. Como posso te ajudar hoje? 📅\n\nTente dizer algo como "Tenho prova de cálculo dia 20".',
            data: null
        };
    }

    let title = parsed.title || 'Compromisso';
    let date = parsed.date || `${currentYear}-${currentMonth}-08`;
    let category = parsed.category || 'Outro';
    let prepDays = parseInt(parsed.prepDays) || 3;
    let studyContent = parsed.studyContent || '';

    const validCategories = ['Estudo', 'Trabalho', 'Consulta', 'Pessoal', 'Outro'];
    if (!validCategories.includes(category)) {
        category = 'Outro';
    }

    const extracted = {
        title,
        date,
        time: '14:00',
        description: `Processado por IA local Delta: "${originalMessage}"`,
        category,
        prepDays,
        studyContent
    };

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

    return {
        success: true,
        isComplete: true,
        reply: `Perfeito! Agenda atualizada! Agendei o evento "${title}" para o dia ${date.split('-')[2]}/${date.split('-')[1]} e organizei todas as tarefas no planejador.`,
        data: extracted
    };
}

// Main process message endpoint
export async function processMessage(message, settings = {}) {
    const text = message.toLowerCase().trim();
    
    // Se for ação de deletar/limpar ou de concluir/marcar feito, interceptamos
    // para processar offline com 100% de acerto instantaneamente.
    const isDeleteAction = text.includes('apagar') || text.includes('excluir') || text.includes('remover') || text.includes('limpar');
    const isCompleteAction = text.includes('concluir') || text.includes('concluido') || text.includes('concluído') || text.includes('feito');

    if (chatContext.step !== 'idle' || isDeleteAction || isCompleteAction) {
        return runOfflineParser(message);
    }

    if (settings.aiEnabled) {
        return await runLocalLLM(message, settings);
    }

    return runOfflineParser(message);
}
