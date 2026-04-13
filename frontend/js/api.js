/* ==================== API ФУНКЦИИ ==================== */

class WeddingAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    /**
     * Универсальный метод для GET запросов
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }

    /**
     * Универсальный метод для POST запросов
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }

    /**
     * Универсальный метод для PUT запросов
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }

    /**
     * Универсальный метод для DELETE запросов
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }

    // ==================== СВАДЬБА ====================

    /**
     * Получить параметры свадьбы
     */
    async getWedding() {
        return this.get(CONFIG.ENDPOINTS.WEDDING);
    }

    /**
     * Создать или обновить параметры свадьбы
     */
    async createOrUpdateWedding(data) {
        return this.post(CONFIG.ENDPOINTS.WEDDING, data);
    }

    /**
     * Получить полную информацию о свадьбе
     */
    async getWeddingFull() {
        return this.get(CONFIG.ENDPOINTS.WEDDING_FULL);
    }

    /**
     * Получить статистику
     */
    async getStatistics() {
        return this.get(CONFIG.ENDPOINTS.WEDDING_STATS);
    }

    // ==================== ПРИГЛАШЕНИЯ ====================

    /**
     * Получить все приглашения
     */
    async getInvitations() {
        return this.get(CONFIG.ENDPOINTS.INVITATIONS);
    }

    /**
     * Создать приглашение
     */
    async createInvitation(data) {
        return this.post(CONFIG.ENDPOINTS.INVITATIONS, data);
    }

    /**
     * Получить приглашение по коду
     */
    async getInvitationByCode(code) {
        return this.get(CONFIG.ENDPOINTS.INVITATION_BY_CODE(code));
    }

    /**
     * Удалить приглашение
     */
    async deleteInvitation(code) {
        return this.delete(CONFIG.ENDPOINTS.INVITATION_BY_CODE(code));
    }

    /**
     * Получить QR код приглашения
     */
    async getQRCode(code) {
        return `${this.baseURL}${CONFIG.ENDPOINTS.INVITATION_QR(code)}`;
    }

    // ==================== ГОСТИ ====================

    /**
     * Получить всех гостей
     */
    async getGuests() {
        return this.get(CONFIG.ENDPOINTS.GUESTS);
    }

    /**
     * Получить гостей по коду приглашения
     */
    async getGuestsByInvitation(code) {
        return this.get(CONFIG.ENDPOINTS.GUEST_BY_CODE(code));
    }

    /**
     * Добавить гостя
     */
    async createGuest(data) {
        return this.post(CONFIG.ENDPOINTS.GUESTS, data);
    }

    /**
     * Подтвердить присутствие гостя
     */
    async confirmGuest(guestId, attending = true) {
        return this.put(CONFIG.ENDPOINTS.GUEST_CONFIRM(guestId), { attending });
    }

    /**
     * Удалить гостя
     */
    async deleteGuest(guestId) {
        return this.delete(CONFIG.ENDPOINTS.GUEST_DELETE(guestId));
    }
}

// Инициализация API
const api = new WeddingAPI(CONFIG.API_BASE_URL);

// Утилиты для работы с API
const APIUtils = {
    /**
     * Форматирование даты
     */
    formatDate(date) {
        let d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [day, month, year].join('.');
    },

    /**
     * Форматирование времени
     */
    formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    },

    /**
     * Преобразование диетических предпочтений в текст
     */
    getDietaryText(preferences) {
        if (!preferences || preferences.length === 0) return 'Нет ограничений';
        return preferences.map(p => {
            const option = CONFIG.DEFAULTS.DIETARY_OPTIONS.find(o => o.value === p);
            return option ? option.label : p;
        }).join(', ');
    },

    /**
     * Генерация URL приглашения
     */
    getInvitationURL(code) {
        const baseURL = window.location.origin;
        return `${baseURL}/?code=${code}`;
    },

    /**
     * Получение параметров URL
     */
    getURLParams() {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params);
    },

    /**
     * Копирование текста в буфер обмена
     */
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Скопировано в буфер обмена!', 'success');
        }).catch(() => {
            showNotification('Не удалось скопировать', 'error');
        });
    },
};

// Утилиты для уведомлений
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Можно добавить выхода уведомления на экран
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
