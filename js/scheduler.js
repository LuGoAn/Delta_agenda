/**
 * Delta Calendar - Scheduler & Conflict Resolution Module
 */

import { addDays, getDaysDiff, formatDate, generateUUID } from './utils.js';

const DAILY_BUDGET = 3; // Maximum preparatory tasks per day

// Get user events from localStorage
export function getUserEvents(username) {
    const eventsKey = `delta_events_${username}`;
    const eventsJson = localStorage.getItem(eventsKey);
    return eventsJson ? JSON.parse(eventsJson) : [];
}

// Save user events to localStorage
export function saveUserEvents(username, events) {
    const eventsKey = `delta_events_${username}`;
    localStorage.setItem(eventsKey, JSON.stringify(events));
}

// Calculate the preparatory task workload for each day for the user
export function getWorkloadPerDay(events) {
    const workload = {}; // Map of "YYYY-MM-DD" -> count of prep tasks
    
    events.forEach(event => {
        if (event.completed) return; // Skip completed main events (their tasks are inactive/done)
        
        const tasks = event.prepTasks || [];
        tasks.forEach(task => {
            if (task.completed) return; // Skip completed tasks
            
            const dateStr = task.date;
            workload[dateStr] = (workload[dateStr] || 0) + 1;
        });
    });
    
    return workload;
}

// Conflict Resolution Algorithm: Find the best day for a preparatory task
// It starts at targetDate and searches backward. It returns the nearest day that has space.
function findAvailableDate(targetDate, workload, eventDate) {
    let current = targetDate;
    
    // We search backward from the target date up to 14 days or until we find space.
    // We cannot push tasks into the future past the main event's date!
    // We also should not schedule prep tasks on or after the event day itself (unless it's day-of specific, which is already handled).
    for (let i = 0; i < 14; i++) {
        // If current date is valid, and its workload is less than the budget, select it!
        const count = workload[current] || 0;
        if (count < DAILY_BUDGET) {
            return current;
        }
        
        // Move backward one day
        current = addDays(current, -1);
    }
    
    // Fallback: If everything is overloaded, return the original target date
    return targetDate;
}

// Generate preparatory tasks based on category and details, with conflict resolution!
export function createSmartEvent(username, { title, date, time, description, category, prepDays, studyContent }) {
    const events = getUserEvents(username);
    
    // 1. Create the main event object
    const mainEventId = generateUUID();
    const newEvent = {
        id: mainEventId,
        title,
        date,
        time: time || '',
        description: description || '',
        category,
        completed: false,
        isMainEvent: true,
        prepTasks: []
    };

    // 2. Generate standard raw preparatory tasks based on category rules
    const rawTasks = [];
    
    if (category === 'Estudo') {
        const days = parseInt(prepDays) || 5;
        const content = studyContent || 'conteúdo principal';
        
        // Standard Study tasks (e.g. 5 days)
        // We generate these retroactively: e.g. T-5, T-4, T-3, T-2, T-1
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
        // Standard Consultation tasks: T-5, T-3, T-1
        rawTasks.push({ offset: -5, title: 'Confirmar horário e iniciar medicação/preparo se houver' });
        rawTasks.push({ offset: -3, title: 'Realizar exames laboratoriais ou buscar resultados pendentes' });
        rawTasks.push({ offset: -1, title: 'Separar documentos pessoais e exames anteriores' });
        
    } else if (category === 'Trabalho') {
        // Standard Work/Presentation tasks: T-3, T-2, T-1
        rawTasks.push({ offset: -3, title: `Revisar conteúdo e estruturar roteiro do trabalho` });
        rawTasks.push({ offset: -2, title: `Desenhar, ajustar e formatar os slides / apresentação` });
        rawTasks.push({ offset: -1, title: 'Fazer ensaio geral cronometrado da apresentação' });
    }

    // 3. Apply Conflict Resolution Algorithm
    // Get existing workload of active tasks
    const currentWorkload = getWorkloadPerDay(events);
    
    // Sort tasks from furthest to closest to the event date to place them logically
    rawTasks.sort((a, b) => a.offset - b.offset);
    
    rawTasks.forEach(raw => {
        const idealDate = addDays(date, raw.offset);
        
        // Find the best date using the conflict resolver
        const resolvedDate = findAvailableDate(idealDate, currentWorkload, date);
        
        // Register the resolved date in the temporary workload map so subsequent tasks don't pile up there
        currentWorkload[resolvedDate] = (currentWorkload[resolvedDate] || 0) + 1;
        
        newEvent.prepTasks.push({
            id: generateUUID(),
            date: resolvedDate,
            title: raw.title,
            completed: false,
            idealDate: idealDate // Keep track of the original plan for presentation debug
        });
    });

    // 4. Save and return
    events.push(newEvent);
    saveUserEvents(username, events);
    
    return newEvent;
}

// Add a manual event (no preparatory tasks)
export function createManualEvent(username, { title, date, time, description, category }) {
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

// Edit an event (preserves ID, handles manual/smart edit)
export function updateEvent(username, updatedEvent) {
    const events = getUserEvents(username);
    const index = events.findIndex(e => e.id === updatedEvent.id);
    
    if (index !== -1) {
        events[index] = updatedEvent;
        saveUserEvents(username, events);
        return true;
    }
    return false;
}

// Delete an event
export function deleteEvent(username, eventId) {
    const events = getUserEvents(username);
    const filtered = events.filter(e => e.id !== eventId);
    saveUserEvents(username, filtered);
}

// Complete/Toggle a task or main event
export function toggleEventStatus(username, eventId, taskId = null) {
    const events = getUserEvents(username);
    const event = events.find(e => e.id === eventId);
    
    if (!event) return null;
    
    if (taskId) {
        // Toggle prep task status
        const task = event.prepTasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
        }
    } else {
        // Toggle main event status
        event.completed = !event.completed;
        
        // Auto complete all prep tasks if main event is completed
        if (event.completed) {
            event.prepTasks.forEach(t => t.completed = true);
        }
    }
    
    saveUserEvents(username, events);
    return event;
}
