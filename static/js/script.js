let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('quailEvents')) || {};
let editingEventDate = null;

// Инициализация календаря
function initCalendar() {
    populateYearSelect();
    populateMonthSelect();
    renderCalendar();
    displayEvents();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateSelectors();
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateSelectors();
        renderCalendar();
    });
    
    document.getElementById('yearSelect').addEventListener('change', (e) => {
        currentDate.setFullYear(parseInt(e.target.value));
        renderCalendar();
    });
    
    document.getElementById('monthSelect').addEventListener('change', (e) => {
        currentDate.setMonth(parseInt(e.target.value));
        renderCalendar();
    });

    // Обновление итогов при вводе данных
    ['cell1Birds', 'cell1Eggs', 'cell2Birds', 'cell2Eggs', 'cell3Birds', 'cell3Eggs'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateTotals);
    });
}

// Заполнение селекторов годов
function populateYearSelect() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

// Заполнение селекторов месяцев
function populateMonthSelect() {
    const monthSelect = document.getElementById('monthSelect');
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    monthSelect.value = currentDate.getMonth();
}

// Обновление селекторов при навигации
function updateSelectors() {
    document.getElementById('yearSelect').value = currentDate.getFullYear();
    document.getElementById('monthSelect').value = currentDate.getMonth();
}

// Отрисовка календаря
function renderCalendar() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    document.getElementById('currentMonth').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const today = new Date();
    
    // Пустые ячейки для дней предыдущего месяца
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day other-month';
        calendarDays.appendChild(emptyDay);
    }
    
    // Дни текущего месяца
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.innerHTML = `<div>${day}</div>`;
        
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateKey = formatDate(date);
        
        // Проверка на сегодня
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Проверка на события
        if (events[dateKey]) {
            const event = events[dateKey];
            let markersHtml = '';
            
            if (event.cell1 && (event.cell1.birds > 0 || event.cell1.eggs > 0)) {
                markersHtml += `<div class="day-marker cell1-marker">К1: 🐔${event.cell1.birds} 🥚${event.cell1.eggs}</div>`;
            }
            if (event.cell2 && (event.cell2.birds > 0 || event.cell2.eggs > 0)) {
                markersHtml += `<div class="day-marker cell2-marker">К2: 🐔${event.cell2.birds} 🥚${event.cell2.eggs}</div>`;
            }
            if (event.cell3 && (event.cell3.birds > 0 || event.cell3.eggs > 0)) {
                markersHtml += `<div class="day-marker cell3-marker">К3: 🐔${event.cell3.birds} 🥚${event.cell3.eggs}</div>`;
            }
            
            dayElement.innerHTML += markersHtml;
        }
        
        dayElement.addEventListener('click', () => selectDate(date));
        calendarDays.appendChild(dayElement);
    }
}

// Выбор даты
function selectDate(date) {
    const dateKey = formatDate(date);
    document.getElementById('selectedDateDisplay').textContent = formatDisplayDate(dateKey);
    
    // Заполняем форму данными если они есть
    if (events[dateKey]) {
        const event = events[dateKey];
        document.getElementById('cell1Birds').value = event.cell1?.birds || '';
        document.getElementById('cell1Eggs').value = event.cell1?.eggs || '';
        document.getElementById('cell2Birds').value = event.cell2?.birds || '';
        document.getElementById('cell2Eggs').value = event.cell2?.eggs || '';
        document.getElementById('cell3Birds').value = event.cell3?.birds || '';
        document.getElementById('cell3Eggs').value = event.cell3?.eggs || '';
        
        editingEventDate = dateKey;
        document.getElementById('deleteBtn').style.display = 'block';
    } else {
        // Очищаем форму для новой записи
        clearForm();
        editingEventDate = null;
        document.getElementById('deleteBtn').style.display = 'none';
    }
    
    updateTotals();
    showEventForm();
}

// Очистка формы
function clearForm() {
    document.getElementById('cell1Birds').value = '';
    document.getElementById('cell1Eggs').value = '';
    document.getElementById('cell2Birds').value = '';
    document.getElementById('cell2Eggs').value = '';
    document.getElementById('cell3Birds').value = '';
    document.getElementById('cell3Eggs').value = '';
}

// Показать форму события
function showEventForm() {
    document.getElementById('eventModal').style.display = 'flex';
}

// Закрыть форму события
function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
    editingEventDate = null;
}

// Обновление итогов
function updateTotals() {
    const cell1Birds = parseInt(document.getElementById('cell1Birds').value) || 0;
    const cell1Eggs = parseInt(document.getElementById('cell1Eggs').value) || 0;
    const cell2Birds = parseInt(document.getElementById('cell2Birds').value) || 0;
    const cell2Eggs = parseInt(document.getElementById('cell2Eggs').value) || 0;
    const cell3Birds = parseInt(document.getElementById('cell3Birds').value) || 0;
    const cell3Eggs = parseInt(document.getElementById('cell3Eggs').value) || 0;
    
    const totalBirds = cell1Birds + cell2Birds + cell3Birds;
    const totalEggs = cell1Eggs + cell2Eggs + cell3Eggs;
    
    document.getElementById('totalBirds').textContent = totalBirds;
    document.getElementById('totalEggs').textContent = totalEggs;
}

// Сохранение события
function saveEvent() {
    const cell1Birds = parseInt(document.getElementById('cell1Birds').value) || 0;
    const cell1Eggs = parseInt(document.getElementById('cell1Eggs').value) || 0;
    const cell2Birds = parseInt(document.getElementById('cell2Birds').value) || 0;
    const cell2Eggs = parseInt(document.getElementById('cell2Eggs').value) || 0;
    const cell3Birds = parseInt(document.getElementById('cell3Birds').value) || 0;
    const cell3Eggs = parseInt(document.getElementById('cell3Eggs').value) || 0;
    
    // Проверяем, есть ли хотя бы какие-то данные
    if (cell1Birds === 0 && cell1Eggs === 0 && 
        cell2Birds === 0 && cell2Eggs === 0 && 
        cell3Birds === 0 && cell3Eggs === 0) {
        alert('Пожалуйста, введите данные хотя бы для одной клетки');
        return;
    }
    
    const dateKey = editingEventDate || formatDateFromForm();
    
    events[dateKey] = {
        cell1: { birds: cell1Birds, eggs: cell1Eggs },
        cell2: { birds: cell2Birds, eggs: cell2Eggs },
        cell3: { birds: cell3Birds, eggs: cell3Eggs },
        date: dateKey
    };
    
    localStorage.setItem('quailEvents', JSON.stringify(events));
    closeEventModal();
    renderCalendar();
    displayEvents();
}

// Получение даты из формы
function formatDateFromForm() {
    const day = document.getElementById('selectedDateDisplay').textContent.split(' ')[0];
    const months = {
        'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
        'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };
    
    const dateText = document.getElementById('selectedDateDisplay').textContent;
    const [dayStr, monthStr, yearStr] = dateText.split(' ');
    const month = months[monthStr];
    const year = parseInt(yearStr);
    
    const date = new Date(year, month, parseInt(dayStr));
    return formatDate(date);
}

// Удаление события
function deleteEvent() {
    if (editingEventDate && confirm('Удалить запись за эту дату?')) {
        delete events[editingEventDate];
        localStorage.setItem('quailEvents', JSON.stringify(events));
        closeEventModal();
        renderCalendar();
        displayEvents();
    }
}

// Отображение списка событий
function displayEvents() {
    const eventsContainer = document.getElementById('eventsContainer');
    eventsContainer.innerHTML = '';
    
    const sortedDates = Object.keys(events).sort().reverse(); // Новые сверху
    
    if (sortedDates.length === 0) {
        eventsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Записей пока нет</p>';
        return;
    }
    
    sortedDates.forEach(dateKey => {
        const event = events[dateKey];
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        let cellsHtml = '';
        let totalBirds = 0;
        let totalEggs = 0;
        
        if (event.cell1 && (event.cell1.birds > 0 || event.cell1.eggs > 0)) {
            cellsHtml += `
                <div class="cell-display cell1">
                    <h4>🥚 Клетка 1</h4>
                    <div class="cell-stats">
                        <div>Перепелки: ${event.cell1.birds}</div>
                        <div>Яйца: ${event.cell1.eggs}</div>
                    </div>
                </div>
            `;
            totalBirds += event.cell1.birds;
            totalEggs += event.cell1.eggs;
        }
        
        if (event.cell2 && (event.cell2.birds > 0 || event.cell2.eggs > 0)) {
            cellsHtml += `
                <div class="cell-display cell2">
                    <h4>🥚 Клетка 2</h4>
                    <div class="cell-stats">
                        <div>Перепелки: ${event.cell2.birds}</div>
                        <div>Яйца: ${event.cell2.eggs}</div>
                    </div>
                </div>
            `;
            totalBirds += event.cell2.birds;
            totalEggs += event.cell2.eggs;
        }
        
        if (event.cell3 && (event.cell3.birds > 0 || event.cell3.eggs > 0)) {
            cellsHtml += `
                <div class="cell-display cell3">
                    <h4>🥚 Клетка 3</h4>
                    <div class="cell-stats">
                        <div>Перепелки: ${event.cell3.birds}</div>
                        <div>Яйца: ${event.cell3.eggs}</div>
                    </div>
                </div>
            `;
            totalBirds += event.cell3.birds;
            totalEggs += event.cell3.eggs;
        }
        
        eventItem.innerHTML = `
            <div class="event-date">${formatDisplayDate(dateKey)}</div>
            <div class="cells-display">
                ${cellsHtml}
            </div>
            <div class="event-totals">
                Всего: 🐔 ${totalBirds} перепелок, 🥚 ${totalEggs} яиц
            </div>
            <div class="event-actions">
                <button class="edit-btn" onclick="editEvent('${dateKey}')">✏️ Редактировать</button>
                <button class="delete-event-btn" onclick="deleteEventFromList('${dateKey}')">🗑️ Удалить</button>
            </div>
        `;
        eventsContainer.appendChild(eventItem);
    });
}

// Редактирование события
function editEvent(dateKey) {
    const event = events[dateKey];
    const date = new Date(dateKey);
    
    document.getElementById('selectedDateDisplay').textContent = formatDisplayDate(dateKey);
    document.getElementById('cell1Birds').value = event.cell1?.birds || '';
    document.getElementById('cell1Eggs').value = event.cell1?.eggs || '';
    document.getElementById('cell2Birds').value = event.cell2?.birds || '';
    document.getElementById('cell2Eggs').value = event.cell2?.eggs || '';
    document.getElementById('cell3Birds').value = event.cell3?.birds || '';
    document.getElementById('cell3Eggs').value = event.cell3?.eggs || '';
    
    editingEventDate = dateKey;
    document.getElementById('deleteBtn').style.display = 'block';
    updateTotals();
    showEventForm();
}

// Удаление события из списка
function deleteEventFromList(dateKey) {
    if (confirm('Удалить эту запись?')) {
        delete events[dateKey];
        localStorage.setItem('quailEvents', JSON.stringify(events));
        renderCalendar();
        displayEvents();
    }
}

// Переход к сегодняшней дате
function goToToday() {
    currentDate = new Date();
    updateSelectors();
    renderCalendar();
}

// Форматирование даты для ключа
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Форматирование даты для отображения
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} года`;
}

// Фильтрация событий (заглушка)
function filterEvents() {
    displayEvents();
}

// Закрытие модального окна при клике вне его
document.addEventListener('click', (e) => {
    const modal = document.getElementById('eventModal');
    if (e.target === modal) {
        closeEventModal();
    }
});

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', initCalendar);