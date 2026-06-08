/**
 * Delta Calendar - Demo Data Module
 */

import { generateUUID } from './utils.js';

function getVirtualToday() {
    const realToday = new Date();
    if (realToday.getFullYear() === 2026 && realToday.getMonth() === 5) {
        return realToday;
    }
    return new Date('2026-06-01T17:56:24-03:00');
}
const now = getVirtualToday();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');

export function loadDemoData(username) {
    const eventsKey = `delta_events_${username}`;
    
    // Check if the user already has events
    if (localStorage.getItem(eventsKey)) {
        return; // Already has data
    }

    const demoEvents = [
        // 1. Prova de Matemática (Estudo) - June 20, 2026
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
        // 2. Consulta Médica (Consulta) - June 30, 2026
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
        // 3. Apresentação do Projeto (Trabalho) - June 10, 2026
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
        // 4. Cortar o Cabelo (Pessoal) - June 4, 2026
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
        // 5. Comprar presente (Pessoal) - June 12, 2026
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

    // Save demo events to localStorage
    localStorage.setItem(eventsKey, JSON.stringify(demoEvents));
}
