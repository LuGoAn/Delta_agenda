/**
 * Delta Agenda - Unified Application Script
 * (Bypasses local browser CORS restrictions for file:// double-click execution)
 */

// ==========================================================================
// 1. UTILITIES (Formerly utils.js)
// ==========================================================================

function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function formatLocalDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    // Create date in local timezone
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatLocalDateShort(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
}

function addDays(dateStr, days) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    date.setDate(date.getDate() + days);
    return formatDate(date);
}

function getDaysDiff(dateStr1, dateStr2) {
    const parts1 = dateStr1.split('-');
    const parts2 = dateStr2.split('-');
    const d1 = new Date(parseInt(parts1[0]), parseInt(parts1[1]) - 1, parseInt(parts1[2]));
    const d2 = new Date(parseInt(parts2[0]), parseInt(parts2[1]) - 1, parseInt(parts2[2]));
    const diffTime = d2 - d1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function $(selector, parent = document) {
    return parent.querySelector(selector);
}

function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

function generateUUID() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
}

// ==========================================================================
// 2. AUTHENTICATION MODULE (Formerly auth.js)
// ==========================================================================

const USERS_KEY = 'delta_users';
const SESSION_KEY = 'delta_current_user';

function getUsers() {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function signupUser(username, password) {
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) {
        return { success: false, message: 'Nome de usuário e senha são obrigatórios.' };
    }

    const users = getUsers();
    if (users[trimmedUser]) {
        return { success: false, message: 'Este nome de usuário já está em uso.' };
    }

    users[trimmedUser] = {
        username: username.trim(),
        password: password
    };
    saveUsers(users);

    return loginUser(username, password);
}

function loginUser(username, password) {
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser || !password) {
        return { success: false, message: 'Nome de usuário e senha são obrigatórios.' };
    }

    const users = getUsers();
    const user = users[trimmedUser];

    if (!user || user.password !== password) {
        return { success: false, message: 'Usuário ou senha incorretos.' };
    }

    localStorage.setItem(SESSION_KEY, user.username);
    return { success: true, username: user.username };
}

function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
}

function getCurrentUser() {
    return localStorage.getItem(SESSION_KEY);
}

// ==========================================================================
// 3. DEMO DATA MODULE (Formerly demo-data.js)
// ==========================================================================

function loadDemoData(username) {
    const eventsKey = `delta_events_${username}`;
    
    if (localStorage.getItem(eventsKey)) {
        return; // Already has data
    }

    const now = new Date('2026-06-01T17:56:24-03:00');
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const demoEvents = [
        {
            id: generateUUID(),
            title: 'Prova de Matemática',
            date: `${year}-${month}-20`,
            time: '08:00',
            description: 'Matéria: Bhaskara, adição e subtração.',
            category: 'Estudo',
            completed: false,
            isMainEvent: true,
            prepTasks: [
                { id: generateUUID(), date: `${year}-${month}-15`, title: 'Estudar Bhaskara', completed: true },
                { id: generateUUID(), date: `${year}-${month}-16`, title: 'Resolver exercícios de Bhaskara', completed: true },
                { id: generateUUID(), date: `${year}-${month}-17`, title: 'Revisar multiplicação e divisão', completed: false },
                { id: generateUUID(), date: `${year}-${month}-18`, title: 'Revisão geral de Matemática', completed: false },
                { id: generateUUID(), date: `${year}-${month}-19`, title: 'Simulado de Matemática', completed: false }
            ]
        },
        {
            id: generateUUID(),
            title: 'Consulta de Rotina',
            date: `${year}-${month}-30`,
            time: '14:30',
            description: 'Consulta médica com Dr. Silva (Cardiologista).',
            category: 'Consulta',
            completed: false,
            isMainEvent: true,
            prepTasks: [
                { id: generateUUID(), date: `${year}-${month}-25`, title: 'Iniciar medicação recomendada', completed: false },
                { id: generateUUID(), date: `${year}-${month}-27`, title: 'Fazer exame solicitado', completed: false },
                { id: generateUUID(), date: `${year}-${month}-29`, title: 'Separar documentos e exames', completed: false }
            ]
        },
        {
            id: generateUUID(),
            title: 'Apresentação do Projeto Delta',
            date: `${year}-${month}-10`,
            time: '19:30',
            description: 'Apresentação acadêmica da agenda inteligente Delta para a banca.',
            category: 'Trabalho',
            completed: false,
            isMainEvent: true,
            prepTasks: [
                { id: generateUUID(), date: `${year}-${month}-07`, title: 'Revisar conteúdo do Projeto Delta', completed: true },
                { id: generateUUID(), date: `${year}-${month}-08`, title: 'Ajustar slides da apresentação', completed: false },
                { id: generateUUID(), date: `${year}-${month}-09`, title: 'Ensaio final cronometrado', completed: false }
            ]
        },
        {
            id: generateUUID(),
            title: 'Cortar o cabelo',
            date: `${year}-${month}-04`,
            time: '16:00',
            description: 'Salão de beleza Studio Delta.',
            category: 'Pessoal',
            completed: true,
            isMainEvent: true,
            prepTasks: []
        },
        {
            id: generateUUID(),
            title: 'Comprar presente de aniversário',
            date: `${year}-${month}-12`,
            time: '12:00',
            description: 'Aniversário da minha mãe.',
            category: 'Pessoal',
            completed: false,
            isMainEvent: true,
            prepTasks: []
        }
    ];

    localStorage.setItem(eventsKey, JSON.stringify(demoEvents));
}

// ==========================================================================
// 4. SCHEDULER & CONFLICT RESOLUTION MODULE (Formerly scheduler.js)
// ==========================================================================

const DAILY_BUDGET = 3;

function getUserEvents(username) {
    const eventsKey = `delta_events_${username}`;
    const eventsJson = localStorage.getItem(eventsKey);
    return eventsJson ? JSON.parse(eventsJson) : [];
}

function saveUserEvents(username, events) {
    const eventsKey = `delta_events_${username}`;
    localStorage.setItem(eventsKey, JSON.stringify(events));
}

function getWorkloadPerDay(events) {
    const workload = {};
    
    events.forEach(event => {
        if (event.completed) return;
        
        const tasks = event.prepTasks || [];
        tasks.forEach(task => {
            if (task.completed) return;
            
            const dateStr = task.date;
            workload[dateStr] = (workload[dateStr] || 0) + 1;
        });
    });
    
    return workload;
}

function findAvailableDate(targetDate, workload, eventDate) {
    let current = targetDate;
    
    for (let i = 0; i < 14; i++) {
        const count = workload[current] || 0;
        if (count < DAILY_BUDGET) {
            return current;
        }
        current = addDays(current, -1);
    }
    
    return targetDate;
}

function createSmartEvent(username, { title, date, time, description, category, prepDays, studyContent }) {
    const events = getUserEvents(username);
    const newEvent = {
        id: generateUUID(),
        title,
        date,
        time: time || '',
        description: description || '',
        category,
        completed: false,
        isMainEvent: true,
        prepTasks: []
    };

    const rawTasks = [];
    
    if (category === 'Estudo') {
        const days = parseInt(prepDays) || 5;
        const content = studyContent || 'conteúdo principal';
        
        if (days >= 1) rawTasks.push({ offset: -days, title: `Iniciar estudos de ${content}` });
        if (days >= 2) {
            for (let i = days - 1; i > 1; i--) {
                if (i === 4) rawTasks.push({ offset: -4, title: `Resolver exercícios práticos de ${content}` });
                else if (i === 3) rawTasks.push({ offset: -3, title: `Revisar tópicos complexos de ${content}` });
                else if (i === 2) rawTasks.push({ offset: -2, title: `Desenvolver mapa mental / resumo` });
                else rawTasks.push({ offset: -i, title: `Aprofundar estudos em ${content}` });
            }
        }
        if (days >= 2) rawTasks.push({ offset: -1, title: `Revisão geral e simulado final` });
        
    } else if (category === 'Consulta') {
        rawTasks.push({ offset: -5, title: 'Confirmar horário e iniciar medicação/preparo se houver' });
        rawTasks.push({ offset: -3, title: 'Realizar exames laboratoriais ou buscar resultados pendentes' });
        rawTasks.push({ offset: -1, title: 'Separar documentos pessoais e exames anteriores' });
        
    } else if (category === 'Trabalho') {
        rawTasks.push({ offset: -3, title: `Revisar conteúdo e estruturar roteiro do trabalho` });
        rawTasks.push({ offset: -2, title: `Desenhar, ajustar e formatar os slides / apresentação` });
        rawTasks.push({ offset: -1, title: 'Fazer ensaio geral cronometrado da apresentação' });
    }

    const currentWorkload = getWorkloadPerDay(events);
    rawTasks.sort((a, b) => a.offset - b.offset);
    
    rawTasks.forEach(raw => {
        const idealDate = addDays(date, raw.offset);
        const resolvedDate = findAvailableDate(idealDate, currentWorkload, date);
        currentWorkload[resolvedDate] = (currentWorkload[resolvedDate] || 0) + 1;
        
        newEvent.prepTasks.push({
            id: generateUUID(),
            date: resolvedDate,
            title: raw.title,
            completed: false,
            idealDate: idealDate
        });
    });

    events.push(newEvent);
    saveUserEvents(username, events);
    return newEvent;
}

function createManualEvent(username, { title, date, time, description, category }) {
    const events = getUserEvents(username);
    const newEvent = {
        id: generateUUID(),
        title,
        date,
        time: time || '',
        description: description || '',
        category,
        completed: false,
        isMainEvent: true,
        prepTasks: []
    };
    
    events.push(newEvent);
    saveUserEvents(username, events);
    return newEvent;
}

function updateEvent(username, updatedEvent) {
    const events = getUserEvents(username);
    const index = events.findIndex(e => e.id === updatedEvent.id);
    
    if (index !== -1) {
        events[index] = updatedEvent;
        saveUserEvents(username, events);
        return true;
    }
    return false;
}

function deleteEvent(username, eventId) {
    const events = getUserEvents(username);
    const filtered = events.filter(e => e.id !== eventId);
    saveUserEvents(username, filtered);
}

function toggleEventStatus(username, eventId, taskId = null) {
    const events = getUserEvents(username);
    const event = events.find(e => e.id === eventId);
    
    if (!event) return null;
    
    if (taskId) {
        const task = event.prepTasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
        }
    } else {
        event.completed = !event.completed;
        if (event.completed) {
            event.prepTasks.forEach(t => t.completed = true);
        }
    }
    
    saveUserEvents(username, events);
    return event;
}

// ==========================================================================
// 5. AI SERVICE MODULE (Formerly ai-service.js)
// ==========================================================================

let chatContext = {
    step: 'idle',
    extractedData: null
};

function resetChatContext() {
    chatContext = {
        step: 'idle',
        extractedData: null
    };
}

function runOfflineParser(message) {
    const text = message.toLowerCase().trim();
    
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

    const now = new Date('2026-06-01T17:56:24-03:00');
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    
    let dateStr = '';
    let category = 'Outro';
    let title = '';

    if (text.includes('prova') || text.includes('estudo') || text.includes('estudar') || text.includes('exame acad') || text.includes('teste')) {
        category = 'Estudo';
    } else if (text.includes('consulta') || text.includes('médic') || text.includes('dentista') || text.includes('exame méd') || text.includes('terapia')) {
        category = 'Consulta';
    } else if (text.includes('projeto') || text.includes('trabalho') || text.includes('apresenta') || text.includes('reuni') || text.includes('job')) {
        category = 'Trabalho';
    } else if (text.includes('compromisso') || text.includes('pessoal') || text.includes('academia') || text.includes('aniversario') || text.includes('niver')) {
        category = 'Pessoal';
    }

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
        dateStr = formatDate(addDays(formatDate(now), 7));
    }

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

async function runLocalLLM(message, settings) {
    const provider = settings.aiProvider || 'ollama';
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
            const endpoint = `${apiUrl.replace(/\/$/, '')}/v1/chat/completions`;
            
            response = await fetch(endpoint, {
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

function processLLMResult(parsed, originalMessage) {
    const now = new Date('2026-06-01T17:56:24-03:00');
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

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

async function processMessage(message, settings = {}) {
    if (chatContext.step !== 'idle') {
        return runOfflineParser(message);
    }

    if (settings.aiEnabled) {
        return await runLocalLLM(message, settings);
    }

    return runOfflineParser(message);
}

// ==========================================================================
// 6. CALENDAR MODULE (Formerly calendar.js)
// ==========================================================================

let currentYear, currentMonth;
let selectedDateStr;
let activeUser = '';

const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function initCalendar(username) {
    activeUser = username;
    
    const baseDate = new Date('2026-06-01T17:56:24-03:00');
    currentYear = baseDate.getFullYear();
    currentMonth = baseDate.getMonth();
    selectedDateStr = formatDate(baseDate);
    
    setupCalendarListeners();
    renderCalendar();
    renderDayAgenda();
}

function setupCalendarListeners() {
    $('#prev-month-btn').replaceWith($('#prev-month-btn').cloneNode(true));
    $('#next-month-btn').replaceWith($('#next-month-btn').cloneNode(true));
    $('#today-btn').replaceWith($('#today-btn').cloneNode(true));
    $('#add-event-manual-btn').replaceWith($('#add-event-manual-btn').cloneNode(true));
    $('#close-event-modal-btn').replaceWith($('#close-event-modal-btn').cloneNode(true));
    $('#btn-cancel-event').replaceWith($('#btn-cancel-event').cloneNode(true));
    $('#manual-event-form').replaceWith($('#manual-event-form').cloneNode(true));

    $('#prev-month-btn').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    $('#next-month-btn').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    $('#today-btn').addEventListener('click', () => {
        const today = new Date('2026-06-01T17:56:24-03:00');
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();
        selectedDateStr = formatDate(today);
        renderCalendar();
        renderDayAgenda();
    });

    const modal = $('#manual-event-modal');
    
    $('#add-event-manual-btn').addEventListener('click', () => {
        $('#manual-event-form').reset();
        $('#edit-event-id').value = '';
        $('#event-date').value = selectedDateStr;
        modal.classList.remove('hidden');
    });

    $('#close-event-modal-btn').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    $('#btn-cancel-event').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    $('#manual-event-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const eventId = $('#edit-event-id').value;
        const title = $('#event-title').value;
        const date = $('#event-date').value;
        const time = $('#event-time').value;
        const category = $('#event-category').value;
        const description = $('#event-description').value;

        if (eventId) {
            const events = getUserEvents(activeUser);
            const existing = events.find(e => e.id === eventId);
            if (existing) {
                existing.title = title;
                existing.date = date;
                existing.time = time;
                existing.category = category;
                existing.description = description;
                updateEvent(activeUser, existing);
            }
        } else {
            createManualEvent(activeUser, { title, date, time, description, category });
        }

        modal.classList.add('hidden');
        renderCalendar();
        renderDayAgenda();
        
        document.dispatchEvent(new CustomEvent('delta-data-changed'));
    });
}

function renderCalendar() {
    $('#current-month-year').textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    
    const daysGrid = $('#calendar-days-grid');
    daysGrid.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    const events = getUserEvents(activeUser);

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
        const dateStr = `${prevYearVal}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        
        createDayElement(dayNum, dateStr, true, daysGrid, events);
    }

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        createDayElement(dayNum, dateStr, false, daysGrid, events);
    }

    const gridTotalSlots = 42;
    const remainingSlots = gridTotalSlots - (startDayOfWeek + totalDays);
    
    for (let i = 1; i <= remainingSlots; i++) {
        const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateStr = `${nextYearVal}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        createDayElement(i, dateStr, true, daysGrid, events);
    }
}

function createDayElement(dayNum, dateStr, isAdjacent, container, events) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    if (isAdjacent) dayDiv.classList.add('adjacent-month');
    
    if (dateStr === selectedDateStr) {
        dayDiv.classList.add('selected');
    }

    if (dateStr === '2026-06-01') {
        dayDiv.classList.add('today-marker');
    }

    const numberSpan = document.createElement('span');
    numberSpan.className = 'day-number';
    numberSpan.textContent = dayNum;
    dayDiv.appendChild(numberSpan);

    const mainEventsOnDay = events.filter(e => e.date === dateStr);
    const prepTasksOnDay = [];
    events.forEach(e => {
        if (e.completed) return;
        const tasks = e.prepTasks || [];
        tasks.forEach(t => {
            if (t.date === dateStr) {
                prepTasksOnDay.push({ task: t, parentEvent: e });
            }
        });
    });

    const hasEvents = mainEventsOnDay.length > 0 || prepTasksOnDay.length > 0;
    
    if (hasEvents) {
        dayDiv.classList.add('has-events');
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'day-dots';

        mainEventsOnDay.forEach(e => {
            const dot = document.createElement('span');
            dot.className = `dot cat-${e.category.toLowerCase()}`;
            if (e.completed) dot.classList.add('completed');
            dotsContainer.appendChild(dot);
        });

        prepTasksOnDay.forEach(item => {
            const dot = document.createElement('span');
            dot.className = `dot dot-prep cat-${item.parentEvent.category.toLowerCase()}`;
            if (item.task.completed) dot.classList.add('completed');
            dotsContainer.appendChild(dot);
        });

        dayDiv.appendChild(dotsContainer);
        
        const totalCount = mainEventsOnDay.length + prepTasksOnDay.length;
        if (totalCount >= 4) {
            dayDiv.classList.add('congested-day');
            const alertIcon = document.createElement('div');
            alertIcon.className = 'day-congested-alert';
            alertIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            dayDiv.appendChild(alertIcon);
        }
    }

    dayDiv.addEventListener('click', () => {
        const prevSelected = $('.calendar-day.selected');
        if (prevSelected) prevSelected.classList.remove('selected');
        
        dayDiv.classList.add('selected');
        selectedDateStr = dateStr;
        
        const clickedParts = dateStr.split('-');
        const clickedMonth = parseInt(clickedParts[1]) - 1;
        const clickedYear = parseInt(clickedParts[0]);
        if (clickedMonth !== currentMonth || clickedYear !== currentYear) {
            currentMonth = clickedMonth;
            currentYear = clickedYear;
            renderCalendar();
        }

        renderDayAgenda();
    });

    container.appendChild(dayDiv);
}

function renderDayAgenda() {
    $('#selected-day-label').textContent = formatLocalDate(selectedDateStr);
    
    const agendaList = $('#agenda-events-list');
    const noEventsMsg = $('#no-events-message');
    
    agendaList.innerHTML = '';
    
    const events = getUserEvents(activeUser);
    
    const mainEventsOnDay = events.filter(e => e.date === selectedDateStr);
    const prepTasksOnDay = [];
    events.forEach(e => {
        const tasks = e.prepTasks || [];
        tasks.forEach(t => {
            if (t.date === selectedDateStr) {
                prepTasksOnDay.push({ task: t, parentEvent: e });
            }
        });
    });

    const totalItems = mainEventsOnDay.length + prepTasksOnDay.length;
    
    if (totalItems === 0) {
        noEventsMsg.classList.remove('hidden');
        return;
    }
    
    noEventsMsg.classList.add('hidden');

    mainEventsOnDay.forEach(event => {
        const itemCard = document.createElement('div');
        itemCard.className = `agenda-card border-cat-${event.category.toLowerCase()}`;
        if (event.completed) itemCard.classList.add('completed');
        
        itemCard.innerHTML = `
            <div class="agenda-card-left">
                <input type="checkbox" class="agenda-checkbox" data-event-id="${event.id}" ${event.completed ? 'checked' : ''}>
                <div class="agenda-details">
                    <span class="category-badge cat-${event.category.toLowerCase()}">${event.category}</span>
                    <h4 class="event-title">${event.title}</h4>
                    <p class="event-desc">${event.description || 'Sem descrição.'}</p>
                    ${event.time ? `<span class="event-time"><i class="fa-regular fa-clock"></i> ${event.time}</span>` : ''}
                </div>
            </div>
            <div class="agenda-card-right">
                <button class="btn-icon edit-event-btn" data-event-id="${event.id}"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon delete-event-btn text-danger" data-event-id="${event.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        agendaList.appendChild(itemCard);
    });

    prepTasksOnDay.forEach(item => {
        const task = item.task;
        const parent = item.parentEvent;
        
        const itemCard = document.createElement('div');
        itemCard.className = `agenda-card prep-card border-cat-${parent.category.toLowerCase()}`;
        if (task.completed) itemCard.classList.add('completed');
        
        let conflictShiftLabel = '';
        if (task.idealDate && task.idealDate !== task.date) {
            conflictShiftLabel = `<span class="conflict-badge" title="Remanejado para evitar sobrecarga (planejado original para ${formatLocalDateShort(task.idealDate)})"><i class="fa-solid fa-shuffle"></i> Remanejado</span>`;
        }

        itemCard.innerHTML = `
            <div class="agenda-card-left">
                <input type="checkbox" class="agenda-checkbox" data-event-id="${parent.id}" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <div class="agenda-details">
                    <div class="prep-tag-row">
                        <span class="category-badge cat-prep cat-${parent.category.toLowerCase()}">Tarefa Preparatória de ${parent.category}</span>
                        ${conflictShiftLabel}
                    </div>
                    <h4 class="event-title">${task.title}</h4>
                    <p class="event-desc-sub"><i class="fa-solid fa-link"></i> Associado a: <strong>${parent.title}</strong> (dia ${formatLocalDateShort(parent.date)})</p>
                </div>
            </div>
            <div class="agenda-card-right">
            </div>
        `;
        agendaList.appendChild(itemCard);
    });

    $$('.agenda-checkbox', agendaList).forEach(cb => {
        cb.addEventListener('change', (e) => {
            const eventId = cb.getAttribute('data-event-id');
            const taskId = cb.getAttribute('data-task-id');
            
            toggleEventStatus(activeUser, eventId, taskId);
            renderCalendar();
            renderDayAgenda();
            document.dispatchEvent(new CustomEvent('delta-data-changed'));
        });
    });

    $$('.edit-event-btn', agendaList).forEach(btn => {
        btn.addEventListener('click', () => {
            const eventId = btn.getAttribute('data-event-id');
            const events = getUserEvents(activeUser);
            const event = events.find(e => e.id === eventId);
            
            if (event) {
                $('#edit-event-id').value = event.id;
                $('#event-title').value = event.title;
                $('#event-date').value = event.date;
                $('#event-time').value = event.time;
                $('#event-category').value = event.category;
                $('#event-description').value = event.description;
                
                $('#manual-event-modal').classList.remove('hidden');
            }
        });
    });

    $$('.delete-event-btn', agendaList).forEach(btn => {
        btn.addEventListener('click', () => {
            const eventId = btn.getAttribute('data-event-id');
            if (confirm('Tem certeza que deseja excluir este compromisso? Todas as tarefas preparatórias associadas a ele também serão removidas.')) {
                deleteEvent(activeUser, eventId);
                renderCalendar();
                renderDayAgenda();
                document.dispatchEvent(new CustomEvent('delta-data-changed'));
            }
        });
    });
}

// ==========================================================================
// 7. APP SYSTEM CONTROLLER (Formerly app.js logic)
// ==========================================================================

let currentTheme = 'dark';
let chatHistory = [];

let aiSettings = {
    aiEnabled: false,
    aiProvider: 'ollama',
    aiUrl: 'http://localhost:11434',
    aiModel: 'llama3.1'
};

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSettings();
    setupAuthListeners();
    setupDashboardListeners();
    setupChatListeners();
    setupSettingsListeners();
    
    const cachedUser = getCurrentUser();
    if (cachedUser) {
        loginSuccess(cachedUser);
    }
});

function initTheme() {
    const savedTheme = localStorage.getItem('delta_theme') || 'dark';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();

    $('#theme-toggle').replaceWith($('#theme-toggle').cloneNode(true));
    
    $('#theme-toggle').addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('delta_theme', currentTheme);
        updateThemeIcon();
    });
}

function updateThemeIcon() {
    const icon = $('#theme-toggle i');
    if (currentTheme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

function initSettings() {
    const savedSettings = localStorage.getItem('delta_ai_settings');
    if (savedSettings) {
        aiSettings = JSON.parse(savedSettings);
    }
    
    $('#settings-ai-enabled').checked = aiSettings.aiEnabled;
    $('#settings-ai-provider').value = aiSettings.aiProvider;
    $('#settings-ai-url').value = aiSettings.aiUrl;
    $('#settings-ai-model').value = aiSettings.aiModel;
    
    toggleAISettingsFields(aiSettings.aiEnabled);
    updateAIStatusBadge();
}

function toggleAISettingsFields(enabled) {
    const fieldsDiv = $('#ai-settings-fields');
    if (enabled) {
        fieldsDiv.classList.remove('disabled-fields');
    } else {
        fieldsDiv.classList.add('disabled-fields');
    }
}

function updateAIStatusBadge() {
    const badge = $('#ai-status-badge');
    if (aiSettings.aiEnabled) {
        badge.textContent = `IA: ${aiSettings.aiModel}`;
        badge.className = 'ai-badge online-mode';
    } else {
        badge.textContent = 'Modo Offline';
        badge.className = 'ai-badge offline-mode';
    }
}

function setupAuthListeners() {
    const form = $('#auth-form');
    const msgDiv = $('#auth-message');
    let isRegisterMode = false;

    function toggleAuthMode(toRegister) {
        isRegisterMode = toRegister;
        msgDiv.classList.add('hidden');

        const cardHeaderTitle = $('.auth-header h2');
        const cardHeaderDesc = $('.auth-header p');
        const primaryBtn = $('#btn-login');
        const secondaryBtn = $('#btn-register');

        if (isRegisterMode) {
            cardHeaderTitle.textContent = 'Criar Nova Conta';
            cardHeaderDesc.textContent = 'Cadastre seu usuário e senha para começar a usar a Delta.';
            primaryBtn.innerHTML = 'Cadastrar e Entrar <i class="fa-solid fa-user-plus"></i>';
            secondaryBtn.innerHTML = 'Voltar para Login <i class="fa-solid fa-arrow-left"></i>';
        } else {
            cardHeaderTitle.textContent = 'Bem-vindo à Agenda Inteligente';
            cardHeaderDesc.textContent = 'Organize sua rotina acadêmica e pessoal com facilidade.';
            primaryBtn.innerHTML = 'Entrar <i class="fa-solid fa-arrow-right-to-bracket"></i>';
            secondaryBtn.innerHTML = 'Criar Conta <i class="fa-solid fa-user-plus"></i>';
        }
    }

    $('#btn-login').replaceWith($('#btn-login').cloneNode(true));
    $('#btn-register').replaceWith($('#btn-register').cloneNode(true));
    $('#logout-btn').replaceWith($('#logout-btn').cloneNode(true));

    $('#btn-login').addEventListener('click', (e) => {
        e.preventDefault();
        const username = $('#username').value.trim();
        const password = $('#password').value;

        if (!username || !password) {
            showAuthError('Nome de usuário e senha são obrigatórios.');
            return;
        }

        if (isRegisterMode) {
            const result = signupUser(username, password);
            if (result.success) {
                loginSuccess(result.username);
                toggleAuthMode(false);
            } else {
                showAuthError(result.message);
            }
        } else {
            const result = loginUser(username, password);
            if (result.success) {
                loginSuccess(result.username);
            } else {
                showAuthError(result.message);
            }
        }
    });

    $('#btn-register').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode(!isRegisterMode);
    });

    $('#logout-btn').addEventListener('click', () => {
        logoutUser();
        activeUser = '';
        $('#username').value = '';
        $('#password').value = '';
        toggleAuthMode(false);
        $('#auth-screen').classList.remove('hidden');
        $('#app-screen').classList.add('hidden');
        resetChatContext();
    });
}

function showAuthError(message) {
    const msgDiv = $('#auth-message');
    msgDiv.textContent = message;
    msgDiv.className = 'alert-message error animate-pulse';
    msgDiv.classList.remove('hidden');
}

function loginSuccess(username) {
    activeUser = username;
    
    $('#auth-screen').classList.add('hidden');
    $('#app-screen').classList.remove('hidden');
    $('#auth-message').classList.add('hidden');
    
    $('#user-display-name').textContent = username;

    loadDemoData(username);
    
    initCalendar(username);
    renderDashboardStats();
    initChatHistory();
}

function setupDashboardListeners() {
    document.addEventListener('delta-data-changed', () => {
        renderDashboardStats();
    });
}

function renderDashboardStats() {
    const events = getUserEvents(activeUser);
    
    const juneEvents = events.filter(e => {
        const parts = e.date.split('-');
        return parts[0] === '2026' && parts[1] === '06';
    });

    $('#stat-events-count').textContent = juneEvents.length;

    let completedCount = 0;
    events.forEach(e => {
        if (e.completed) completedCount++;
        const tasks = e.prepTasks || [];
        tasks.forEach(t => {
            if (t.completed) completedCount++;
        });
    });
    $('#stat-tasks-completed').textContent = completedCount;

    const baseDate = new Date('2026-06-01T17:56:24-03:00');
    let closestItem = null;
    let closestDiff = Infinity;

    events.forEach(e => {
        if (!e.completed) {
            const diff = new Date(e.date) - baseDate;
            if (diff >= 0 && diff < closestDiff) {
                closestDiff = diff;
                closestItem = e.title;
            }
        }
        
        const tasks = e.prepTasks || [];
        tasks.forEach(t => {
            if (!t.completed) {
                const diff = new Date(t.date) - baseDate;
                if (diff >= 0 && diff < closestDiff) {
                    closestDiff = diff;
                    closestItem = `${t.title} (${e.title})`;
                }
            }
        });
    });

    const nextActivitySpan = $('#stat-next-activity');
    if (closestItem) {
        nextActivitySpan.textContent = closestItem;
        if (closestItem.length > 22) {
            nextActivitySpan.textContent = closestItem.substring(0, 19) + '...';
        }
        nextActivitySpan.title = closestItem;
    } else {
        nextActivitySpan.textContent = 'Nenhuma';
    }
}

function initChatHistory() {
    chatHistory = [
        {
            sender: 'bot',
            text: 'Olá! Sou seu Assistente Inteligente Delta. 🧠\n\nEscreva qualquer compromisso em linguagem natural e eu organizarei sua agenda automaticamente! \n\nExemplo:\n- "Tenho prova de matemática dia 20"\n- "Consulta médica dia 30"\n- "Preciso apresentar um projeto dia 10"'
        }
    ];
    renderChatMessages();
}

function renderChatMessages() {
    const chatContainer = $('#chat-messages-container');
    chatContainer.innerHTML = '';

    chatHistory.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-bubble ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`;
        
        const bubbleContent = document.createElement('div');
        bubbleContent.className = 'bubble-text';
        bubbleContent.innerHTML = msg.text.replace(/\n/g, '<br>');
        msgDiv.appendChild(bubbleContent);

        chatContainer.appendChild(msgDiv);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function setupChatListeners() {
    const form = $('#chat-input-form');
    const input = $('#chat-input');

    form.replaceWith(form.cloneNode(true));
    
    $('#chat-input-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = $('#chat-input').value.trim();
        if (!text) return;

        chatHistory.push({ sender: 'user', text: text });
        renderChatMessages();
        $('#chat-input').value = '';

        chatHistory.push({ sender: 'bot', text: '<span class="typing-indicator"><i class="fa-solid fa-circle animate-typing-1"></i><i class="fa-solid fa-circle animate-typing-2"></i><i class="fa-solid fa-circle animate-typing-3"></i> Pensando...</span>' });
        renderChatMessages();

        try {
            const aiResponse = await processMessage(text, aiSettings);
            chatHistory.pop();

            if (aiResponse.success) {
                chatHistory.push({ sender: 'bot', text: aiResponse.reply });
                
                if (aiResponse.isComplete && aiResponse.data) {
                    createSmartEvent(activeUser, aiResponse.data);
                    renderCalendar();
                    renderDayAgenda();
                    renderDashboardStats();
                }
            } else {
                chatHistory.push({ sender: 'bot', text: 'Desculpe, ocorreu uma inconsistência ao processar seu pedido. Pode repetir com outros termos?' });
            }
        } catch (err) {
            chatHistory.pop();
            chatHistory.push({ sender: 'bot', text: 'Erro de comunicação com o serviço de IA. Mas não se preocupe! Você ainda pode criar compromissos usando o botão de adição manual!' });
        }

        renderChatMessages();
    });
}

function setupSettingsListeners() {
    const settingsModal = $('#settings-modal');
    
    $('#settings-toggle').replaceWith($('#settings-toggle').cloneNode(true));
    $('#close-settings-modal-btn').replaceWith($('#close-settings-modal-btn').cloneNode(true));
    $('#btn-cancel-settings').replaceWith($('#btn-cancel-settings').cloneNode(true));
    $('#settings-ai-enabled').replaceWith($('#settings-ai-enabled').cloneNode(true));
    $('#btn-test-ai-conn').replaceWith($('#btn-test-ai-conn').cloneNode(true));
    $('#settings-form').replaceWith($('#settings-form').cloneNode(true));

    $('#settings-toggle').addEventListener('click', () => {
        initSettings();
        $('#ai-test-result').textContent = '';
        settingsModal.classList.remove('hidden');
    });

    $('#close-settings-modal-btn').addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    $('#btn-cancel-settings').addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    $('#settings-ai-enabled').addEventListener('change', (e) => {
        toggleAISettingsFields(e.target.checked);
    });

    $('#btn-test-ai-conn').addEventListener('click', async () => {
        const provider = $('#settings-ai-provider').value;
        const url = $('#settings-ai-url').value.trim();
        const model = $('#settings-ai-model').value.trim();
        
        const testLabel = $('#ai-test-result');
        testLabel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';
        testLabel.className = 'test-result-label connecting';

        try {
            if (provider === 'ollama') {
                const response = await fetch(`${url.replace(/\/$/, '')}/api/tags`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const models = data.models || [];
                    const found = models.some(m => m.name.startsWith(model));
                    
                    if (found) {
                        testLabel.innerHTML = `<i class="fa-solid fa-circle-check"></i> Sucesso! Conectado e modelo "${model}" pronto.`;
                        testLabel.className = 'test-result-label success';
                    } else {
                        testLabel.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Conectado! Mas modelo "${model}" não foi encontrado.`;
                        testLabel.className = 'test-result-label warning';
                    }
                } else {
                    throw new Error(`HTTP status: ${response.status}`);
                }
            } else {
                const response = await fetch(`${url.replace(/\/$/, '')}/v1/models`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    testLabel.innerHTML = `<i class="fa-solid fa-circle-check"></i> Sucesso! Conectado ao KoboldCPP.`;
                    testLabel.className = 'test-result-label success';
                } else {
                    throw new Error(`HTTP status: ${response.status}`);
                }
            }
        } catch (err) {
            testLabel.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Falha! Verifique o servidor local ou configurações de CORS.`;
            testLabel.className = 'test-result-label error';
        }
    });

    $('#settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        aiSettings.aiEnabled = $('#settings-ai-enabled').checked;
        aiSettings.aiProvider = $('#settings-ai-provider').value;
        aiSettings.aiUrl = $('#settings-ai-url').value.trim();
        aiSettings.aiModel = $('#settings-ai-model').value.trim();
        
        localStorage.setItem('delta_ai_settings', JSON.stringify(aiSettings));
        
        updateAIStatusBadge();
        settingsModal.classList.add('hidden');
        resetChatContext();
    });
}
