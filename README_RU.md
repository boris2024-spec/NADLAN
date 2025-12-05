# Nadlan — платформа недвижимости

Полноценное приложение для поиска, публикации и управления объявлениями о недвижимости, с личным кабинетом, избранным, админ-панелью и интеграцией с облачным хранилищем изображений.

## Архитектура проекта

- `nadlan_back/` — backend (Node.js, Express, MongoDB)
- `nadlan_front/` — frontend (React, Vite, React Router, React Query, MUI, Tailwind)

---

## Backend (`nadlan_back`)

### Основные технологии

- Node.js, Express
- MongoDB + Mongoose
- JWT-аутентификация + сессии + Passport Google OAuth 2.0
- Multer + Cloudinary для загрузки изображений
- Nodemailer для email (верификация, восстановление пароля, контактные формы)
- Helmet, rate limiting, CORS с белым списком доменов
- Winston + morgan для логирования

### Главный сервер (`server.js`)

- Настройка Express, Helmet, CORS, rate limiting, парсинг JSON.
- Подключение MongoDB (переменные: `MONGODB_URI` / `MONGODB_URI_PROD`).
- Сессии (`express-session`) с учетом окружения (`secure`, `sameSite`).
- Passport (Google OAuth) и сессии пользователя.
- Отдача статики: `/assets` → `nadlan_back/public`.
- Базовые роуты:
  - `GET /` — информация о сервере, список основных эндпоинтов.
  - `GET /api/health` — health-check (состояние MongoDB, latency, uptime).
- Подключённые роутеры:
  - `/api/auth` — аутентификация и профиль пользователя.
  - `/api/properties` — объекты недвижимости, избранное, отзывы, контакты.
  - `/api/upload` — загрузка файлов/изображений.
  - `/api/admin` — административные действия.
  - `/api/cloudinary` — вспомогательные операции с Cloudinary.
  - `/api/contact` — формы обратной связи/контакта.
  - `/api` (consulting) — консультационная форма/служба.
- Обработка 404 и глобальный обработчик ошибок с логированием.

### Основные модули

- `config/passport.js` — настройка Passport, Google OAuth, сериализация пользователя.
- `models/Property.js` — схема объекта недвижимости: адрес, цена, площадь, тип, изображения, владелец, избранное, отзывы, черновики и т.д.
- `models/User.js` — пользователи: email/пароль, роли (user/admin), профиль, состояния верификации, избранное, статистика и др.
- `controllers/authController.js`:
  - Регистрация (`/api/auth/register`) с валидацией и верификацией email.
  - Логин (`/api/auth/login`) и выдача access/refresh токенов.
  - Обновление токена (`/api/auth/refresh-token`).
  - Выход (`/api/auth/logout`).
  - Верификация email (`/api/auth/verify-email/:token`).
  - Повторная отправка письма верификации (`/api/auth/resend-verification`).
  - Восстановление пароля (`/api/auth/forgot-password`, `/api/auth/reset-password/:token`).
  - Получение и обновление профиля (`/api/auth/profile`, `PUT /profile`).
  - Статистика пользователя (`/api/auth/profile/stats`).
  - Удаление профиля (`DELETE /api/auth/profile`).
  - Google OAuth (`/api/auth/google`, `/api/auth/google/callback`).
- `routes/auth.js` — привязка всех маршрутов аутентификации, защита маршрутов через `authenticateToken`/`requireRole`.

- `controllers/propertyController.js` (через `routes/properties.js`):
  - `GET /api/properties` — поиск/фильтрация объектов (город, цена, тип, площадь и др.).
  - `GET /api/properties/stats` — статистика объектов.
  - `GET /api/properties/mine` — объявления текущего пользователя.
  - `GET /api/properties/:id` — детали объекта (с отзывами, контактами и т.д.).
  - `GET /api/properties/:id/similar` — похожие объекты.
  - `POST /api/properties` — создание объявления.
  - `POST /api/properties/draft` — сохранение черновика объявления.
  - `PUT /api/properties/:id` — обновление.
  - `DELETE /api/properties/:id` — удаление.
  - Избранное:
    - `GET /api/properties/user/favorites` — список избранных.
    - `POST /api/properties/:id/favorites` — добавить в избранное.
    - `DELETE /api/properties/:id/favorites` — убрать из избранного.
  - Отзывы и контакты:
    - `POST /api/properties/:id/reviews` — добавить отзыв.
    - `POST /api/properties/:id/contacts` — связаться по объекту.
  - Загрузка изображений:
    - `POST /api/properties/upload-images` — загрузка фото через Multer + Cloudinary.

- `middleware/validation.js` — валидация через Joi: регистрация/логин, профиль, объекты, фильтры поиска, ObjectId.
- `middleware/auth.js` — JWT-проверка (`authenticateToken`), опциональная аутентификация, проверка ролей.
- `middleware/upload.js` — загрузка и обработка изображений объектов.
- `middleware/error.js` — генерация requestId, логирование ошибок, CORS-ошибки.
- `utils/emailService.js` — отправка писем (верификация, восстановление пароля, контактные формы, консультации).
- `utils/logger.js` — конфигурация Winston-логеров и интеграция с morgan.
- `scripts/*.mjs` — сервисные скрипты: сидинг свойств, тест отправки писем, очистка избранного и др.

### Переменные окружения backend

Пример файла `nadlan_back/.env` (ориентировочно, адаптируйте под свой проект):

```bash
NODE_ENV=development
PORT=3000

MONGODB_URI=mongodb://localhost:27017/nadlan
MONGODB_URI_PROD=...

SESSION_SECRET=super-secret-session-key

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CLIENT_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-pass
SMTP_FROM="Nadlan <no-reply@example.com>"

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Frontend (`nadlan_front`)

### Основные технологии

- React 18 + Vite
- React Router v6
- React Query (TanStack Query) — работа с API и кеширование
- React Hook Form + Joi/Zod — формы и валидация
- Material UI (MUI) + Tailwind CSS + кастомные UI-компоненты
- React Hot Toast — уведомления
- React Select, React Dropzone, Lucide icons и др.

### Структура и ключевые функции

- `src/App.jsx` — корневой компонент приложения:
  - Router с маршрутами для всех страниц: главная, каталог объектов, детали объекта, вход/регистрация, профиль, избранное, мои объявления, админ-панель, страницы политики/условий, помощь/FAQ, консультации, чат поддержки и др.
  - Обёртки контекстов: `ThemeProvider`, `AuthProvider`.
  - Подключение `QueryClientProvider` (React Query).
  - Тосты (`Toaster`) и глобальный `CookieBanner`, `ScrollToTop`, `ScrollToTopButton`.

- `context/AuthContext.jsx` — управление аутентификацией на фронте:
  - Хранение токена/пользователя, состояние загрузки и ошибок.
  - Логин/логаут/регистрация/обновление профиля через API.
  - Работа с Google OAuth результатами (`/auth/success` и `/auth/error`).

- `context/ThemeContext.jsx` — переключение светлой/тёмной темы, сохранение в `localStorage`.

- `components/PrivateRoute.jsx` — защита маршрутов, которые требуют авторизации (например, профиль).

- `components/layout/Layout.jsx`, `Header.jsx`, `Footer.jsx` — общий каркас страницы: шапка, навигация, подвал.

- `components/ui/*` (Button, Card, Badge, CityAutocomplete, CloudinaryUploadWidget и др.):
  - Унифицированные компоненты интерфейса, формы, селекты городов, виджет загрузки изображений (интеграция с Cloudinary).

- `pages/*`:
  - `HomePage` — главная, промо, быстрый поиск, избранные и популярные объекты.
  - `PropertiesPage` — каталог всех объектов с фильтрами/поиском.
  - `PropertyDetailsPage` — детальная карточка объекта: фото, параметры, контакты, отзывы, похожие объекты.
  - `LoginPage` / `RegisterPage` — аутентификация/регистрация, включая Google OAuth.
  - `ProfilePage` — личный кабинет: данные пользователя, статистика, управление аккаунтом.
  - `MyListingsPage` — мои объявления (объекты, созданные пользователем).
  - `CreatePropertyPage` — создание/редактирование объявления, загрузка фото, черновики.
  - `FavoritesPage` — избранные объекты.
  - `AdminPage` — административный интерфейс (управление пользователями/объявлениями).
  - Юридические и информационные страницы: `PrivacyPolicyPage`, `TermsOfServicePage`, `CookiePolicyPage`, `AboutPage`, `ContactPage`, `HelpCenterPage`, `FAQPage`, `ReportProblemPage`.
  - `SupportChatPage` — чат с поддержкой / консультантом.
  - `ConsultingPage` — страница запроса консультации (интеграция с `/api/consulting`).
  - Страницы аутентификации по email: `EmailVerificationPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `AuthSuccessPage`, `AuthErrorPage`.

- `services/api.js` — обёртка над axios для запросов к backend API:
  - Методы для аутентификации, профиля, объектов, избранного, отзывов, контактов, консультаций и др.

- `hooks/usePropertyValidation.js`, `validation/*` — схемы и хелперы валидации форм (auth, property и т.д.).

### Переменные окружения frontend

Проект использует Vite, поэтому переменные должны начинаться с `VITE_`.

Пример `nadlan_front/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=...
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

---

## Установка и запуск проекта

### Требования

- Node.js (LTS, 18+)
- npm
- Локальная/облачная MongoDB

### 1. Клонирование репозитория

```bash
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
cd NADLAN
```

### 2. Настройка backend

```bash
cd nadlan_back
cp .env.example .env   # при наличии примера
# отредактируйте .env и заполните все ключи (Mongo, JWT, SMTP, Cloudinary и т.д.)

npm install
npm run dev             # запуск с nodemon
# или
npm start               # запуск обычного сервера
```

Сервер по умолчанию поднимается на порту `3000` (или свободном порту рядом), health-check: `http://localhost:3000/api/health`.

### 3. Настройка frontend

В новом терминале:

```bash
cd nadlan_front
cp .env.example .env   # при наличии
# настройте VITE_API_BASE_URL на адрес backend

npm install
npm run dev
```

По умолчанию Vite поднимает фронт на `http://localhost:5173`.

### 4. Типичный dev-стек

- Открыть два терминала: один для `nadlan_back`, второй для `nadlan_front`.
- Убедиться, что `CLIENT_ORIGIN` (backend) и `VITE_API_BASE_URL` (frontend) указывают друг на друга.

---

## Основные пользовательские возможности

- Регистрация, вход, выход, восстановление пароля, верификация email.
- Вход через Google (OAuth 2.0).
- Личный кабинет пользователя с профилем и статистикой.
- Создание, редактирование и удаление объявлений о недвижимости; черновики.
- Загрузка фотографий объектов (Cloudinary).
- Список избранных объектов.
- Отзывы и контактные заявки по объектам.
- Поиск и фильтрация по множеству полей (город, цена, тип и др.).
- Страницы помощи, FAQ, отчет об ошибке, консультации и чат поддержки.
- Админ-панель для расширенного управления системой.

## Важное дополнение
Сайт NADLAN находится в активной стадии разработки и постоянно развивается. На данный момент многие функции ещё недоступны или работают в ограниченном режиме. Мы создаём платформу, которая будет адаптирована для разных поставщиков недвижимости, включая агентства, частных риелторов и крупных компании.

Для каждого поставщика будут предусмотрены индивидуальные инструменты, настройки, кабинеты и расширенные возможности управления объявлениями — всё это будет появляться поэтапно в ходе разработки.

Мы обновляем функционал регулярно, добавляя новые модули, улучшая интерфейс и оптимизируя процесс публикации и продвижения недвижимости.

Если какой-либо инструмент временно недоступен — это часть текущего этапа разработки, и он будет добавлен в ближайших обновлениях.
