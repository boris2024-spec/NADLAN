# Руководство по системе логирования

## Обзор

Система логирования использует **morgan** для HTTP запросов и **winston** для общего логирования приложения.

## Структура логов

Логи разделены на три потока:

### 1. HTTP запросы (`logs/http.log`)
- Все HTTP запросы логируются через morgan
- Формат: combined (Apache combined log format)
- Автоматическая ротация при достижении 5MB
- Хранится до 5 файлов

### 2. Ошибки приложения (`logs/errors.log`)
- Все ошибки уровня error и выше
- Включает stack trace
- Автоматическая ротация при достижении 5MB
- Хранится до 5 файлов

### 3. Безопасность (`logs/security.log`)
- CORS события (разрешенные/заблокированные запросы)
- События запуска/остановки сервера
- Автоматическая ротация при достижении 5MB
- Хранится до 5 файлов

## Использование в коде

### Импорт логгеров

```javascript
import { httpLogger, errorLogger, securityLogger } from './utils/logger.js';
```

### Примеры использования

#### HTTP логирование
```javascript
httpLogger.info('User logged in successfully');
httpLogger.warn('Rate limit approaching');
```

#### Ошибки
```javascript
errorLogger.error('Database connection failed', {
    error: err.message,
    stack: err.stack
});
```

#### Безопасность
```javascript
securityLogger.info('Authentication attempt from IP: ' + ip);
securityLogger.warn('Suspicious activity detected');
```

## Формат логов

```
2025-11-15 14:30:45 [INFO]: Server started on port 3000
2025-11-15 14:30:50 [ERROR]: Database connection failed
```

## Настройка

Все настройки находятся в `utils/logger.js`:

- **Размер файла**: `maxsize: 5242880` (5MB)
- **Количество файлов**: `maxFiles: 5`
- **Формат временных меток**: `YYYY-MM-DD HH:mm:ss`

## Ротация логов

Winston автоматически создает новые файлы когда:
- Текущий файл достигает 5MB
- Поддерживается не более 5 файлов для каждого типа
- Старые файлы автоматически удаляются

## Консольный вывод

Все логи также выводятся в консоль с цветовой подсветкой для удобства разработки.
