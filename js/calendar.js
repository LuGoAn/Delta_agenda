/**
 * Delta Calendar - Interactive Calendar Module
 */

import { $, $$, formatDate, formatLocalDate, formatLocalDateShort, generateUUID } from './utils.js';
import { getUserEvents, createManualEvent, updateEvent, deleteEvent, toggleEventStatus } from './scheduler.js';

function getVirtualToday() {
    const realToday = new Date();
    if (realToday.getFullYear() === 2026 && realToday.getMonth() === 5) {
        return realToday;
    }
    return new Date('2026-06-01T17:56:24-03:00');
}

// Calendar State
let currentYear, currentMonth; // Month index (0-11)
let selectedDateStr; // "YYYY-MM-DD"
let activeUser = '';

// Months of the year in Portuguese
const MONTH_NAMES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function initCalendar(username) {
    activeUser = username;
    
    // Set initially to June 2026 (presentation month)
    const baseDate = getVirtualToday();
    currentYear = baseDate.getFullYear();
    currentMonth = baseDate.getMonth();
    
    selectedDateStr = formatDate(baseDate);
    
    setupCalendarListeners();
    renderCalendar();
    renderDayAgenda();
}

function setupCalendarListeners() {
    // Navigation buttons
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
        const today = getVirtualToday();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();
        selectedDateStr = formatDate(today);
        renderCalendar();
        renderDayAgenda();
    });

    // Form manual creation/editing
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
            // Edit mode: fetch existing and update fields
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
            // Creation mode
            createManualEvent(activeUser, { title, date, time, description, category });
        }

        modal.classList.add('hidden');
        renderCalendar();
        renderDayAgenda();
        
        // Dispatch custom event to refresh dashboard stats
        document.dispatchEvent(new CustomEvent('delta-data-changed'));
    });
}

// Render monthly calendar grid
export function renderCalendar() {
    $('#current-month-year').textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    
    const daysGrid = $('#calendar-days-grid');
    daysGrid.innerHTML = '';
    
    // Day 1 of current month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Find starting weekday (0-6)
    const startDayOfWeek = firstDay.getDay();
    
    // Total days in current month
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Total days in previous month
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    const events = getUserEvents(activeUser);

    // 1. Render empty days of previous month (greyed out)
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYearVal = currentMonth === 0 ? currentYear - 1 : currentYear;
        const dateStr = `${prevYearVal}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        
        createDayElement(dayNum, dateStr, true, daysGrid, events);
    }

    // 2. Render actual days of the current month
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        createDayElement(dayNum, dateStr, false, daysGrid, events);
    }

    // 3. Render leading days of next month (greyed out)
    const gridTotalSlots = 42; // standard 6 rows * 7 columns grid
    const remainingSlots = gridTotalSlots - (startDayOfWeek + totalDays);
    
    // If remainingSlots is 14 or more, we can fit inside 35 slots (5 rows) to look tighter
    const finalSlots = remainingSlots >= 7 ? remainingSlots - 7 : remainingSlots;
    
    for (let i = 1; i <= (remainingSlots >= 7 ? remainingSlots : remainingSlots); i++) {
        const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYearVal = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateStr = `${nextYearVal}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        createDayElement(i, dateStr, true, daysGrid, events);
    }
}

// Generate single day square in the calendar grid
function createDayElement(dayNum, dateStr, isAdjacent, container, events) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    if (isAdjacent) dayDiv.classList.add('adjacent-month');
    
    // Highlight selected day
    if (dateStr === selectedDateStr) {
        dayDiv.classList.add('selected');
    }

    // Check if it's the current date
    if (dateStr === formatDate(getVirtualToday())) {
        dayDiv.classList.add('today-marker');
    }

    // Render day number
    const numberSpan = document.createElement('span');
    numberSpan.className = 'day-number';
    numberSpan.textContent = dayNum;
    dayDiv.appendChild(numberSpan);

    // Filter events for this day
    const mainEventsOnDay = events.filter(e => e.date === dateStr);
    
    // Filter preparatory tasks for this day
    const prepTasksOnDay = [];
    events.forEach(e => {
        if (e.completed) return; // Skip prep tasks for completed events
        const tasks = e.prepTasks || [];
        tasks.forEach(t => {
            if (t.date === dateStr) {
                prepTasksOnDay.push({ task: t, parentEvent: e });
            }
        });
    });

    const hasEvents = mainEventsOnDay.length > 0 || prepTasksOnDay.length > 0;
    
    // Add dots/bullets if there are items on this day
    if (hasEvents) {
        dayDiv.classList.add('has-events');
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'day-dots';

        // Dots for Main Events
        mainEventsOnDay.forEach(e => {
            const dot = document.createElement('span');
            dot.className = `dot cat-${e.category.toLowerCase()}`;
            if (e.completed) dot.classList.add('completed');
            dotsContainer.appendChild(dot);
        });

        // Dots for Prep Tasks (dashed or smaller)
        prepTasksOnDay.forEach(item => {
            const dot = document.createElement('span');
            dot.className = `dot dot-prep cat-${item.parentEvent.category.toLowerCase()}`;
            if (item.task.completed) dot.classList.add('completed');
            dotsContainer.appendChild(dot);
        });

        dayDiv.appendChild(dotsContainer);
        
        // Load budget overload indicator
        const totalCount = mainEventsOnDay.length + prepTasksOnDay.length;
        if (totalCount >= 4) {
            dayDiv.classList.add('congested-day');
            const alertIcon = document.createElement('div');
            alertIcon.className = 'day-congested-alert';
            alertIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            dayDiv.appendChild(alertIcon);
        }
    }

    // Click handler to select day
    dayDiv.addEventListener('click', () => {
        // Deselect previous
        const prevSelected = $('.calendar-day.selected');
        if (prevSelected) prevSelected.classList.remove('selected');
        
        dayDiv.classList.add('selected');
        selectedDateStr = dateStr;
        
        // If user clicks on adjacent month day, automatically slide month!
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

// Render selected day details and agenda items
export function renderDayAgenda() {
    $('#selected-day-label').textContent = formatLocalDate(selectedDateStr);
    
    const agendaList = $('#agenda-events-list');
    const noEventsMsg = $('#no-events-message');
    
    agendaList.innerHTML = '';
    
    const events = getUserEvents(activeUser);
    
    // Filter active items for this day
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

    // 1. Render Main Events (compromissos principais)
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

    // 2. Render Preparatory Tasks (tarefas preparatórias automatizadas)
    prepTasksOnDay.forEach(item => {
        const task = item.task;
        const parent = item.parentEvent;
        
        const itemCard = document.createElement('div');
        itemCard.className = `agenda-card prep-card border-cat-${parent.category.toLowerCase()}`;
        if (task.completed) itemCard.classList.add('completed');
        
        // Show indicator if the task was shifted by the conflict resolver!
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
                <!-- Prep tasks cannot be deleted or edited individually (they are binded to the main event) -->
            </div>
        `;
        agendaList.appendChild(itemCard);
    });

    // Setup interactive handlers inside the day list
    $$('.agenda-checkbox', agendaList).forEach(cb => {
        cb.addEventListener('change', (e) => {
            const eventId = cb.getAttribute('data-event-id');
            const taskId = cb.getAttribute('data-task-id'); // will be null for main events
            
            toggleEventStatus(activeUser, eventId, taskId);
            
            // Re-render
            renderCalendar();
            renderDayAgenda();
            
            // Dispatch custom event to refresh dashboard stats
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
                
                // Dispatch custom event to refresh dashboard stats
                document.dispatchEvent(new CustomEvent('delta-data-changed'));
            }
        });
    });
}
export { selectedDateStr };
