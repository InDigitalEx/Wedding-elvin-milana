/* ==================== АДМИН-ПАНЕЛЬ ==================== */

class AdminPanel {
    constructor() {
        this.weddingData = null;
        this.invitations = [];
        this.guests = [];
        this.init();
    }

    /**
     * Инициализация админ-панели
     */
    async init() {
        console.log('🔐 Инициализация админ-панели... (счётчик будет показывать если будет дублирование)');
        
        try {
            // Загрузить данные
            await this.loadData();
            
            // Установить обработчики событий
            this.setupEventListeners();
            
            // Начать с панели управления
            this.showSection('dashboard');
            
            console.log('✅ Админ-панель готова');
        } catch (error) {
            console.error('❌ Ошибка инициализации админ-панели:', error);
        }
    }

    /**
     * Загрузить все данные
     */
    async loadData() {
        try {
            this.weddingData = await api.getWeddingFull();
            this.invitations = await api.getInvitations();
            this.guests = await api.getGuests();
            
            console.log('📊 Данные загружены');
            
            // Обновить демирф-панель
            this.updateDashboard();
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки данных:', error);
        }
    }

    /**
     * Обновить панель управления
     */
    updateDashboard() {
        if (!this.weddingData) {
            return;
        }

        const totalGuests = this.weddingData.total_guests || 0;
        const confirmedGuests = this.weddingData.confirmed_guests || 0;

        document.getElementById('stat-invitations').textContent = this.weddingData.invitations?.length || 0;
        document.getElementById('stat-total-guests').textContent = totalGuests;
        document.getElementById('stat-confirmed').textContent = confirmedGuests;
        document.getElementById('stat-pending').textContent = totalGuests - confirmedGuests;

        this.updateRecentResponses();
    }

    /**
     * Обновить недавние ответы
     */
    updateRecentResponses() {
        const container = document.getElementById('recent-responses');
        
        if (!container) return;
        
        if (this.guests.length === 0) {
            container.innerHTML = '<p>Ответов еще нет</p>';
            return;
        }

        const recentGuests = this.guests.slice(-5).reverse();
        
        container.innerHTML = recentGuests.map(guest => `
            <div class="response-item">
                <div>
                    <div class="response-name">${guest.name}</div>
                    <small>${APIUtils.formatDate(guest.updated_at)}</small>
                </div>
                <span class="response-status ${guest.attending === true ? 'confirmed' : guest.attending === false ? 'pending' : 'no-response'}">
                    ${guest.attending === true ? '✓ Подтвердил' : guest.attending === false ? '✗ Отклонил' : '? Нет ответа'}
                </span>
            </div>
        `).join('');
    }

    /**
     * Установить обработчики событий
     */
    setupEventListeners() {
        // Переключение разделов
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.dataset.section;
                if (section) {
                    e.preventDefault();
                    this.showSection(section);
                }
            });
        });

        // Сайдбар
        this.setupSidebar();

        // Формы
        this.setupForms();

        // Таблицы
        this.setupTables();

        // Модальные окна
        this.setupModals();
    }

    /**
     * Установить сайдбар
     */
    setupSidebar() {
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    }

    /**
     * Установить обработчики форм
     */
    setupForms() {
        // Форма параметров свадьбы
        const weddingForm = document.getElementById('wedding-settings-form');
        if (weddingForm) {
            weddingForm.onsubmit = (e) => this.handleWeddingSubmit(e);
            this.loadWeddingForm();
        }

        // Форма создания приглашения
        const invitationForm = document.getElementById('create-invitation-form');
        if (invitationForm) {
            invitationForm.onsubmit = (e) => this.handleInvitationSubmit(e);
            this.setupGuestForm();
        }

        // Форма дизайна
        const designForm = document.getElementById('design-form');
        if (designForm) {
            designForm.onsubmit = (e) => this.handleDesignSubmit(e);
            this.setupColorPickers();
        }

        // Кнопка добавить пункт расписания
        const addScheduleBtn = document.getElementById('add-schedule-item');
        if (addScheduleBtn) {
            addScheduleBtn.addEventListener('click', () => this.addScheduleItem());
        }

        // Кнопка сохранить расписание
        const saveScheduleBtn = document.getElementById('save-schedule');
        if (saveScheduleBtn) {
            saveScheduleBtn.addEventListener('click', () => this.handleScheduleSave());
        }

        // Экспорт гостей
        const exportBtn = document.getElementById('export-guests');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportGuestList());
        }
    }

    /**
     * Инициализировать форму добавления гостей
     */
    setupGuestForm() {
        console.log('🔧 setupGuestForm вызvan');
        
        // Добавить первого гостя по умолчанию
        const guestsList = document.getElementById('guests-list');
        if (guestsList && guestsList.children.length === 0) {
            console.log('➕ Добавляю первого гостя');
            this.addGuestEntry();
        }

        // Обработчик кнопки "Добавить гостя" - используем делегирование событий
        const addGuestBtn = document.getElementById('add-guest-btn');
        if (addGuestBtn) {
            console.log('✅ Обработчик кнопки "Добавить гостя" присоединен');
            addGuestBtn.onclick = (e) => {
                e.preventDefault();
                console.log('➕👆 Клик на кнопку добавления гостя');
                this.addGuestEntry();
            };
        } else {
            console.warn('❌ Кнопка "Добавить гостя" не найдена');
        }

        // Обработчик кнопки скачивания QR кода
        const downloadQrBtn = document.getElementById('download-qr');
        if (downloadQrBtn) {
            downloadQrBtn.onclick = () => {
                console.log('⬇️ Клик на скачивание QR');
                this.downloadQRCode();
            };
        }
    }

    /**
     * Добавить входную строку для гостя
     */
    addGuestEntry() {
        const guestsList = document.getElementById('guests-list');
        if (!guestsList) {
            console.error('❌ guests-list не найден');
            return;
        }
        
        const entryCount = guestsList.children.length;
        console.log(`✅ Добавляю гостя #${entryCount + 1}`);
        
        const entry = document.createElement('div');
        entry.className = 'guest-entry';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Имя гостя';
        input.setAttribute('data-guest-index', entryCount);
        input.required = true;
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-remove';
        removeBtn.textContent = '✕';
        removeBtn.onclick = (e) => {
            e.preventDefault();
            entry.remove();
        };
        
        entry.appendChild(input);
        entry.appendChild(removeBtn);
        guestsList.appendChild(entry);
        
        // Фокус на новое поле
        input.focus();
        console.log(`✅ Гость #${entryCount + 1} добавлен и в фокусе`);
    }

    /**
     * Загрузить форму параметров свадьбы
     */
    loadWeddingForm() {
        if (!this.weddingData) return;

        const data = this.weddingData;

        document.getElementById('groom-name').value = data.groom_name;
        document.getElementById('bride-name').value = data.bride_name;
        
        // Преобразовать дату в формат для input type="date" (YYYY-MM-DD)
        const date = new Date(data.wedding_date);
        const dateStr = date.toISOString().slice(0, 10);
        document.getElementById('wedding-date').value = dateStr;
        
        document.getElementById('wedding-time').value = data.wedding_time;
        document.getElementById('location').value = data.location;
        document.getElementById('dress-code').value = data.dress_code || '';
        document.getElementById('registry-info').value = data.registry_info || '';
        document.getElementById('additional-info').value = data.additional_info || '';
    }

    /**
     * Обработить отправку формы параметров свадьбы
     */
    async handleWeddingSubmit(e) {
        e.preventDefault();

        // Получить дату из input type="date" (формат: YYYY-MM-DD)
        const dateInput = document.getElementById('wedding-date').value;
        const timeInput = document.getElementById('wedding-time').value || '00:00';
        
        // Комбинировать дату и время в ISO формат
        let weddingDate;
        if (dateInput) {
            const dateTimeString = `${dateInput}T${timeInput}:00`;
            weddingDate = new Date(dateTimeString).toISOString();
        } else {
            weddingDate = new Date().toISOString();
        }

        const data = {
            groom_name: document.getElementById('groom-name').value,
            bride_name: document.getElementById('bride-name').value,
            wedding_date: weddingDate,
            wedding_time: timeInput,
            location: document.getElementById('location').value,
            dress_code: document.getElementById('dress-code').value || '',
            registry_info: document.getElementById('registry-info').value || '',
            additional_info: document.getElementById('additional-info').value || '',
        };

        try {
            const result = await api.createOrUpdateWedding(data);
            showNotification('✓ Параметры свадьбы сохранены', 'success');
            
            // Обновить данные с сервера (включая ID)
            this.weddingData = result;
            this.loadWeddingForm();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            showNotification('✗ Ошибка сохранения параметров: ' + (error.message || 'Неизвестная ошибка'), 'error');
        }
    }

    /**
     * Обработить отправку формы создания приглашения
     */
    async handleInvitationSubmit(e) {
        console.log('🎯 handleInvitationSubmit вызвана');
        e.preventDefault();

        // Убедиться что есть ID свадьбы
        if (!this.weddingData || !this.weddingData.id) {
            showNotification('❌ Сначала сохраните параметры свадьбы', 'error');
            return;
        }

        const personalMessage = document.getElementById('personal-message').value || '';
        
        // Получить имена гостей
        const guestInputs = document.querySelectorAll('#guests-list input[type="text"]');
        const guestNames = Array.from(guestInputs)
            .map(input => input.value.trim())
            .filter(name => name.length > 0);

        if (guestNames.length === 0) {
            showNotification('❌ Добавьте хотя бы одного гостя', 'error');
            return;
        }

        console.log(`📝 Создание приглашения с ${guestNames.length} гостями:`, guestNames);

        // Данные приглашения - всегда личное
        let data = {
            wedding_id: this.weddingData.id,
            type: 'personal',
            personal_message: personalMessage,
            max_guests: guestNames.length,
        };

        try {
            console.log('📤 Отправляю запрос на создание приглашения');
            const invitation = await api.createInvitation(data);
            console.log('✅ Приглашение создано с ID:', invitation.id);
            showNotification('✓ Приглашение создано', 'success');
            
            // Создать гостей для приглашения
            if (guestNames.length > 0) {
                for (const guestName of guestNames) {
                    try {
                        await api.createGuest({
                            invitation_id: invitation.id,
                            name: guestName,
                        });
                    } catch (error) {
                        console.warn(`Ошибка создания гостя "${guestName}":`, error);
                    }
                }
                showNotification(`✓ Приглашение и ${guestNames.length} гостей созданы`, 'success');
            }
            
            // Показать QR код и ссылку
            this.showInvitationQR(invitation);
            
            // Перезагрузить список приглашений
            await this.loadData();
            this.updateInvitationsTable();
            
            // Очистить форму
            e.target.reset();
            
            // Очистить список гостей и добавить первое поле
            const guestsList = document.getElementById('guests-list');
            if (guestsList) {
                guestsList.innerHTML = '';
                this.addGuestEntry();
            }
        } catch (error) {
            console.error('Ошибка создания приглашения:', error);
            showNotification('✗ Ошибка создания приглашения: ' + (error.message || 'Неизвестная ошибка'), 'error');
        }
    }

    /**
     * Показать QR код и ссылку приглашения
     */
    async showInvitationQR(invitation) {
        const modal = document.getElementById('qr-modal');
        const qrContainer = document.getElementById('qr-image-container');
        const linkContainer = document.getElementById('invitation-link-container');

        const invitationURL = APIUtils.getInvitationURL(invitation.code);
        const qrCodeURL = await api.getQRCode(invitation.code);

        qrContainer.innerHTML = `<img src="${qrCodeURL}" alt="QR код приглашения">`;
        document.getElementById('invitation-link').value = invitationURL;

        // Обработить кнопку копирования
        document.getElementById('copy-link').onclick = () => {
            APIUtils.copyToClipboard(invitationURL);
        };

        modal.style.display = 'flex';

        // Закрыть модальное окно
        document.querySelector('.modal-close').onclick = () => {
            modal.style.display = 'none';
        };

        // Сохранить URL QR для скачивания
        this.lastQRCodeURL = qrCodeURL;
    }

    /**
     * Скачать QR код
     */
    downloadQRCode() {
        if (!this.lastQRCodeURL) {
            showNotification('❌ QR код не найден', 'error');
            return;
        }

        // Создать ссылку для скачивания
        const link = document.createElement('a');
        link.href = this.lastQRCodeURL;
        link.download = `qr-code-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Установить обработчики таблиц
     */
    setupTables() {
        this.updateInvitationsTable();
        this.updateGuestsTable();

        // Фильтр гостей
        const guestFilter = document.getElementById('guest-filter');
        if (guestFilter) {
            guestFilter.addEventListener('change', () => this.updateGuestsTable());
        }
    }

    /**
     * Обновить таблицу приглашений
     */
    updateInvitationsTable() {
        const tbody = document.getElementById('invitations-table');
        
        if (this.invitations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">Приглашения не созданы</td></tr>';
            return;
        }

        tbody.innerHTML = this.invitations.map(inv => `
            <tr>
                <td>${inv.code}</td>
                <td>${inv.type === 'personal' ? 'Личное' : 'Общее'}</td>
                <td>${inv.max_guests}</td>
                <td>${APIUtils.formatDate(inv.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-qr" onclick="admin.showInvitationQR({code: '${inv.code}'})">QR</button>
                        <button class="btn-small btn-delete" onclick="admin.deleteInvitation('${inv.code}')">Удалить</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Обновить таблицу гостей
     */
    escapeHtml(value) {
        if (value === null || value === undefined) return '';

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    formatGuestMessage(message) {
        if (!message || !String(message).trim()) {
            return '<span class="guest-message-empty">—</span>';
        }

        return `<span class="guest-message-text">${this.escapeHtml(message)}</span>`;
    }

    updateGuestsTable() {
        const tbody = document.getElementById('guests-table');
        const filter = document.getElementById('guest-filter')?.value || '';
        const invitationCodeById = new Map(
            this.invitations.map((invitation) => [invitation.id, invitation.code])
        );

        let filteredGuests = this.guests;

        if (filter === 'confirmed') {
            filteredGuests = this.guests.filter(g => g.attending === true);
        } else if (filter === 'not_confirmed') {
            filteredGuests = this.guests.filter(g => g.attending === false);
        } else if (filter === 'no_response') {
            filteredGuests = this.guests.filter(g => g.attending === null);
        }

        if (filteredGuests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">Гостей не найдено</td></tr>';
            return;
        }

        const groupedGuests = [...filteredGuests].sort((a, b) => {
            if (a.invitation_id !== b.invitation_id) {
                return a.invitation_id - b.invitation_id;
            }
            return a.id - b.id;
        });

        tbody.innerHTML = groupedGuests.map(guest => `
            <tr>
                <td>${this.escapeHtml(invitationCodeById.get(guest.invitation_id) || `ID ${guest.invitation_id}`)}</td>
                <td>${this.escapeHtml(guest.name)}</td>
                <td>${guest.email ? this.escapeHtml(guest.email) : '-'}</td>
                <td>${guest.phone ? this.escapeHtml(guest.phone) : '-'}</td>
                <td>
                    <span class="response-status ${guest.attending === true ? 'confirmed' : guest.attending === false ? 'pending' : 'no-response'}">
                        ${guest.attending === true ? '✓ Подтвердил' : guest.attending === false ? '✗ Отклонил' : '? Нет ответа'}
                    </span>
                </td>
                <td class="guest-message-cell">${this.formatGuestMessage(guest.message)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-delete" onclick="admin.deleteGuest(${guest.id})">Удалить</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Установить обработчики модальных окон
     */
    setupModals() {
        // Закрыть модальное окно при клике на крест
        const modal = document.getElementById('qr-modal');
        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    /**
     * Показать раздел
     */
    showSection(sectionId) {
        // Скрыть все разделы
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Показать нужный раздел
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }

        // Обновить активный элемент меню
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });

        // Обновить заголовок
        const titles = {
            dashboard: 'Панель управления',
            settings: 'Параметры свадьбы',
            schedule: 'Расписание события',
            invitations: 'Приглашения',
            guests: 'Гости',
            design: 'Дизайн',
        };
        document.getElementById('section-title').textContent = titles[sectionId] || 'Раздел';

        // Специальные действия
        if (sectionId === 'schedule') {
            this.loadScheduleBuilder();
        }
    }

    /**
     * Добавить пункт расписания
     */
    addScheduleItem() {
        const container = document.getElementById('schedule-items');
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <input type="time" class="schedule-time" placeholder="Время">
            <input type="text" class="schedule-event" placeholder="Событие">
            <button type="button" class="remove-item-btn" onclick="this.parentElement.remove()">Удалить</button>
        `;
        container.appendChild(item);
    }

    /**
     * Загрузить конструктор расписания
     */
    loadScheduleBuilder() {
        const container = document.getElementById('schedule-items');
        container.innerHTML = '';

        if (this.weddingData?.schedule && this.weddingData.schedule.length > 0) {
            this.weddingData.schedule.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'schedule-item';
                itemEl.innerHTML = `
                    <input type="time" class="schedule-time" value="${item.time}">
                    <input type="text" class="schedule-event" value="${item.event}">
                    <button type="button" class="remove-item-btn" onclick="this.parentElement.remove()">Удалить</button>
                `;
                container.appendChild(itemEl);
            });
        } else {
            this.addScheduleItem();
        }
    }

    /**
     * Обработить сохранение расписания
     */
    async handleScheduleSave() {
        const items = document.querySelectorAll('.schedule-item');
        const schedule = Array.from(items).map(item => ({
            time: item.querySelector('.schedule-time').value,
            event: item.querySelector('.schedule-event').value,
        })).filter(item => item.time && item.event);

        if (schedule.length === 0) {
            showNotification('Добавьте хотя бы один пункт расписания', 'warning');
            return;
        }

        try {
            await api.createOrUpdateWedding({
                ...this.weddingData,
                schedule,
            });
            showNotification('✓ Расписание сохранено', 'success');
        } catch (error) {
            console.error('Ошибка сохранения расписания:', error);
            showNotification('✗ Ошибка сохранения расписания', 'error');
        }
    }

    /**
     * Установить цветные пикеры
     */
    setupColorPickers() {
        if (!this.weddingData) return;

        const colors = {
            'main-color': this.weddingData.main_color,
            'secondary-color': this.weddingData.secondary_color,
            'accent-color': this.weddingData.accent_color,
        };

        Object.entries(colors).forEach(([id, value]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = value;
                input.addEventListener('input', () => {
                    document.getElementById(`${id}-code`).textContent = input.value;
                    document.getElementById(`preview-${id.replace('-color', '')}`).style.backgroundColor = input.value;
                });
            }
        });

        // Инициализировать превью
        document.getElementById('preview-main').style.backgroundColor = colors['main-color'];
        document.getElementById('preview-secondary').style.backgroundColor = colors['secondary-color'];
        document.getElementById('preview-accent').style.backgroundColor = colors['accent-color'];
    }

    /**
     * Обработить отправку формы дизайна
     */
    async handleDesignSubmit(e) {
        e.preventDefault();

        try {
            await api.createOrUpdateWedding({
                ...this.weddingData,
                main_color: document.getElementById('main-color').value,
                secondary_color: document.getElementById('secondary-color').value,
                accent_color: document.getElementById('accent-color').value,
            });
            showNotification('✓ Дизайн сохранен', 'success');
        } catch (error) {
            console.error('Ошибка сохранения дизайна:', error);
            showNotification('✗ Ошибка сохранения дизайна', 'error');
        }
    }

    /**
     * Удалить приглашение
     */
    async deleteInvitation(code) {
        if (!confirm('Вы уверены?')) return;

        try {
            await api.deleteInvitation(code);
            showNotification('✓ Приглашение удалено', 'success');
            await this.loadData();
            this.updateInvitationsTable();
        } catch (error) {
            showNotification('✗ Ошибка удаления приглашения', 'error');
        }
    }

    /**
     * Удалить гостя
     */
    async deleteGuest(guestId) {
        if (!confirm('Вы уверены?')) return;

        try {
            await api.deleteGuest(guestId);
            showNotification('✓ Гость удален', 'success');
            await this.loadData();
            this.updateGuestsTable();
        } catch (error) {
            showNotification('✗ Ошибка удаления гостя', 'error');
        }
    }

    /**
     * Экспортировать список гостей в CSV
     */
    exportGuestList() {
        if (this.guests.length === 0) {
            showNotification('Нет гостей для экспорта', 'warning');
            return;
        }

        const headers = ['Имя', 'Email', 'Телефон', 'Статус', 'Сообщение'];
        const rows = this.guests.map(guest => [
            guest.name,
            guest.email || '',
            guest.phone || '',
            guest.attending === true ? 'Подтвердил' : guest.attending === false ? 'Отклонил' : 'Нет ответа',
            guest.message || '',
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'guests.csv';
        a.click();
        window.URL.revokeObjectURL(url);

        showNotification('✓ Список гостей экспортирован', 'success');
    }
}

// Глобальная переменная админ-панели (будет инициализирована в HTML)
let admin;
