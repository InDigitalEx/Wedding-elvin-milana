/* ==================== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ ==================== */

const CONFIG = {
    // API
    API_BASE_URL: window.location.origin.endsWith(':8000') ? '/' : '/api',
    API_VERSION: 'v1',

    // Пути API
    ENDPOINTS: {
        // Свадьба
        WEDDING: '/api/wedding',
        WEDDING_FULL: '/api/wedding/full',
        WEDDING_STATS: '/api/statistics',

        // Приглашения
        INVITATIONS: '/api/invitations',
        INVITATION_BY_CODE: (code) => `/api/invitations/${code}`,
        INVITATION_QR: (code) => `/api/invitations/${code}/qr`,

        // Гости
        GUESTS: '/api/guests',
        GUEST_BY_CODE: (code) => `/api/guests?invitation_code=${code}`,
        GUEST_CONFIRM: (id) => `/api/guests/${id}/confirm`,
        GUEST_UPDATE: (id) => `/api/guests/${id}`,
        GUEST_DELETE: (id) => `/api/guests/${id}`,
    },

    // Настройки UI
    UI: {
        ANIMATION_DURATION: 300,
        SIDEBAR_TOGGLE_DELAY: 250,
    },

    // Стандартные значения
    DEFAULTS: {
        MAX_GUESTS_PER_INVITATION: 5,
        DIETARY_OPTIONS: [
            { value: 'vegetarian', label: 'Вегетарианское меню' },
            { value: 'vegan', label: 'Веганское меню' },
            { value: 'gluten-free', label: 'Без глютена' },
            { value: 'kosher', label: 'Кошерное' },
            { value: 'halal', label: 'Халяль' },
        ],
    },

    // Цветовая схема по умолчанию
    COLORS: {
        primary: '#8b7355',
        secondary: '#d4a574',
        accent: '#e8d5c4',
    },

    // Сообщения
    MESSAGES: {
        SUCCESS: 'Успешно!',
        ERROR: 'Произошла ошибка',
        LOADING: 'Загрузка...',
        CONFIRM: 'Вы уверены?',
    },

    // Валидация
    VALIDATION: {
        MIN_NAME_LENGTH: 2,
        MAX_NAME_LENGTH: 100,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[\d\s\-\+()]+$/,
    },
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
