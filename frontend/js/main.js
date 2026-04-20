/* ==================== ГЛАВНАЯ СТРАНИЦА ==================== */

class WeddingSite {
    constructor() {
        this.weddingData = null;
        this.invitationCode = null;
        this.currentGuest = null;
        this.init();
    }

    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🎉 Инициализация свадебного сайта...');
        
        // Получить код приглашения из URL
        this.invitationCode = APIUtils.getURLParams().code;
        
        try {
            // Загрузить данные свадьбы
            await this.loadWeddingData();
            
            // Отрисовать страницу
            this.renderPage();
            
            // Установить обработчики событий
            this.setupEventListeners();
            
            // Загрузить информацию о приглашении, если есть код
            if (this.invitationCode) {
                await this.loadInvitation();
            } else {
                // Скрыть RSVP раздел если нет кода приглашения
                document.getElementById('rsvp').style.display = 'none';
            }
            
            console.log('✅ Инициализация завершена');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            showNotification('Ошибка загрузки данных', 'error');
        }
    }

    /**
     * Загрузить данные свадьбы
     */
    async loadWeddingData() {
        try {
            this.weddingData = await api.getWeddingFull();
            console.log('📊 Данные свадьбы загружены:', this.weddingData);
            return true;
        } catch (error) {
            console.warn('⚠️ Не удалось загрузить данные свадьбы');
            // Использовать значения по умолчанию
            this.weddingData = {
                groom_name: 'Жених',
                bride_name: 'Невеста',
                wedding_date: new Date(),
                wedding_time: '14:00',
                location: 'Место проведения',
                dress_code: '',
                registry_info: '',
                schedule: [],
                main_color: '#8b7355',
                secondary_color: '#d4a574',
                accent_color: '#e8d5c4',
            };
            return false;
        }
    }

    /**
     * Загрузить информацию о приглашении
     */
    async loadInvitation() {
        try {
            const invitation = await api.getInvitationByCode(this.invitationCode);
            console.log('💌 Приглашение загружено:', invitation);
            
            // Получить гостей приглашения
            const guests = await api.getGuestsByInvitation(this.invitationCode);
            console.log('👥 Гости приглашения:', guests);
            
            this.showPersonalInvitation(invitation, guests);
        } catch (error) {
            console.warn('⚠️ Приглашение не найдено или произошла ошибка');
            this.showNoInvitation();
        }
    }

    /**
     * Показать личное приглашение
     */
    showPersonalInvitation(invitation, guests) {
        const rsvpSection = document.getElementById('rsvp');
        const personalDiv = document.getElementById('personal-invitation');
        const genericDiv = document.getElementById('generic-invitation');
        const noInvDiv = document.getElementById('no-invitation');
        
        if (invitation.is_generic) {
            // Общее приглашение - скрыть весь RSVP раздел
            rsvpSection.style.display = 'none';
            genericDiv.style.display = 'none';
            personalDiv.style.display = 'none';
            noInvDiv.style.display = 'none';
        } else {
            // Личное приглашение - показать RSVP раздел
            rsvpSection.style.display = 'block';
            personalDiv.style.display = 'block';
            genericDiv.style.display = 'none';
            noInvDiv.style.display = 'none';
            
            // Если есть гости в приглашении
            if (guests.length > 0) {
                // Построить приветствие с именами всех гостей
                const guestNames = guests.map(g => g.name);
                const greeting = this.buildRussianGreeting(guestNames);
                
                document.getElementById('personal-guest-name').textContent = greeting;
                document.getElementById('personal-message').textContent = invitation.personal_message || '';
                
                // Сохранить первого гостя для RSVP формы
                this.currentGuest = guests[0];
                this.currentInvitation = invitation;
                
                // Заполнить форму, если уже ответил
                if (guests[0].attending !== null) {
                    this.fillRSVPForm(guests[0]);
                }
            }
        }
    }

    /**
     * Построить русское приветствие с правильной грамматикой
     */
    buildRussianGreeting(names) {
        if (names.length === 0) {
            return 'Уважаемый(ые) гость(и)';
        } else if (names.length === 1) {
            return `Уважаемый ${names[0]}`;
        } else if (names.length === 2) {
            return `Уважаемые ${names[0]} и ${names[1]}`;
        } else {
            // Для более чем 2 гостей: "Уважаемые Иван, Мария и Петр"
            const allButLast = names.slice(0, -1).join(', ');
            return `Уважаемые ${allButLast} и ${names[names.length - 1]}`;
        }
    }

    /**
     * Показать, что приглашение не найдено
     */
    showNoInvitation() {
        const rsvpSection = document.getElementById('rsvp');
        rsvpSection.style.display = 'block';
        document.getElementById('no-invitation').style.display = 'block';
        document.getElementById('personal-invitation').style.display = 'none';
        document.getElementById('generic-invitation').style.display = 'none';
    }

    /**
     * Заполнить форму RSVP
     */
    fillRSVPForm(guest) {
        // Установить статус присутствия
        const attendingRadio = document.querySelector(`input[name="attending"][value="${guest.attending ? 'yes' : 'no'}"]`);
        if (attendingRadio) {
            attendingRadio.checked = true;
        }

        // Установить диетические предпочтения
        if (guest.dietary_preferences && guest.dietary_preferences.length > 0) {
            guest.dietary_preferences.forEach(pref => {
                const checkbox = document.querySelector(`input[name="dietary"][value="${pref}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }

        // Установить сообщение
        if (guest.message) {
            document.getElementById('message').value = guest.message;
        }
    }

    /**
     * Отрисовать страницу с данными свадьбы
     */
    renderPage() {
        if (!this.weddingData) return;

        const data = this.weddingData;

        // Названия жениха и невесты
        document.querySelector('.bride-name').textContent = data.bride_name;
        document.querySelector('.groom-name').textContent = data.groom_name;

        // Дата и время
        const weddingDate = new Date(data.wedding_date);
        const formattedDate = this.formatWeddingDate(weddingDate, data.wedding_time);
        document.getElementById('wedding-date-display').textContent = formattedDate;
        document.getElementById('time-text').textContent = data.wedding_time;

        // Место
        document.getElementById('location-text').textContent = data.location;

        // Информация о мероприятии
        document.getElementById('about-text-content').textContent = data.additional_info || 
            'Мы с радостью делимся этим особенным днем с нашими близкими! Ваше присутствие - это главный подарок для нас.';

        // Дресс-код
        const dressCodeElement = document.getElementById('dress-code-text');
        if (data.dress_code) {
            dressCodeElement.innerHTML = this.markdownToHTML(data.dress_code);
        } else {
            dressCodeElement.innerHTML = '<p>Элегантный вечерний наряд</p>';
        }

        // Реестр подарков
        const registryElement = document.getElementById('registry-text');
        if (data.registry_info) {
            registryElement.innerHTML = this.markdownToHTML(data.registry_info);
        } else {
            registryElement.innerHTML = '<p>Информация о реестре подарков будет добавлена позже</p>';
        }

        // Расписание
        this.renderSchedule(data.schedule);

        // Применить цвета
        this.applyColors(data);

        // Футер
        const footerDate = weddingDate.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('footer-date').textContent = `Дата: ${footerDate}`;
    }

    /**
     * Форматировать дату свадьбы
     */
    formatWeddingDate(date, time) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const dateStr = date.toLocaleDateString('ru-RU', options);
        return `${dateStr} в ${time}`;
    }

    /**
     * Преобразовать markdown в HTML
     */
    markdownToHTML(text) {
        if (!text) return '';
        
        // Простые преобразования markdown
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^- (.*?)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/(?<!<)(\n)/g, '<br>')
            .split('\n').map(line => {
                if (!line.match(/^<[h|u|l]/)) {
                    return `<p>${line}</p>`;
                }
                return line;
            }).join('');
    }

    /**
     * Отрисовать расписание
     */
    renderSchedule(schedule) {
        const timelineElement = document.getElementById('schedule-timeline');
        timelineElement.innerHTML = '';

        if (!schedule || schedule.length === 0) {
            schedule = [
                { time: '14:00', event: 'Встреча гостей' },
                { time: '14:30', event: 'Начало церемонии' },
                { time: '15:30', event: 'Апероль' },
                { time: '16:00', event: 'Ужин' },
                { time: '19:00', event: 'Первый танец' },
                { time: '19:30', event: 'Танцы и развлечения' },
                { time: '23:00', event: 'Завершение' },
            ];
        }

        schedule.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-time">${item.time}</div>
                    <div class="timeline-event">${item.event}</div>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            `;
            timelineElement.appendChild(timelineItem);
        });
    }

    /**
     * Применить цветовую схему
     */
    applyColors(data) {
        const root = document.documentElement;
        root.style.setProperty('--primary', data.main_color);
        root.style.setProperty('--secondary', data.secondary_color);
        root.style.setProperty('--accent', data.accent_color);
    }

    /**
     * Установить обработчики событий
     */
    setupEventListeners() {
        // Навигация
        this.setupNavigation();

        // Форма RSVP
        const rsvpForm = document.getElementById('rsvp-form');
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', (e) => this.handleRSVPSubmit(e));
        }

        // Мобильное меню
        this.setupMobileMenu();
    }

    /**
     * Установить мобильное меню
     */
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            // Закрыть меню при клике на ссылку
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    /**
     * Установить навигацию
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Убрать активный класс со всех ссылок
                navLinks.forEach(l => l.classList.remove('active'));
                // Добавить активный класс на текущую ссылку
                link.classList.add('active');
            });
        });

        // Установить активный класс при скролле
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section');
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    /**
     * Обработать отправку формы RSVP
     */
    async handleRSVPSubmit(e) {
        e.preventDefault();

        if (!this.currentGuest || !this.currentInvitation) {
            showNotification('Ошибка: приглашение не загружено', 'error');
            return;
        }

        try {
            // Получить данные формы
            const attending = document.querySelector('input[name="attending"]:checked').value === 'yes';
            const dietary = Array.from(document.querySelectorAll('input[name="dietary"]:checked')).map(el => el.value);
            const message = document.getElementById('message').value;

            // Обновить гостя
            await api.confirmGuest(this.currentGuest.id, attending);

            // TODO: Обновить диетические предпочтения и сообщение
            // await api.updateGuest(this.currentGuest.id, { dietary_preferences: dietary, message });

            showNotification(`Спасибо за ответ! Вы ${attending ? 'подтвердили' : 'отклонили'} приглашение.`, 'success');

        } catch (error) {
            console.error('Ошибка при отправке RSVP:', error);
            showNotification('Ошибка при отправке ответа', 'error');
        }
    }
}

// Инициализировать сайт при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const site = new WeddingSite();
});
