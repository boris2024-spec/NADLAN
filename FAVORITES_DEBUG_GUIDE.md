# Диагностика проблемы со счётчиком избранного

## Проблема
Счётчик показывает 2, хотя должен быть 0.

## Что было сделано

1. **Backend изменения** (`nadlan_back/controllers/propertyController.js`):
   - `addToFavorites` теперь возвращает обновлённый массив `favorites`
   - `removeFromFavorites` теперь возвращает обновлённый массив `favorites`

2. **Frontend изменения**:
   - `LikeButton.jsx` - синхронизация с ответом сервера вместо локального обновления
   - `Header.jsx` - добавлена отладочная информация
   - `AuthContext.jsx` - добавлено логирование при загрузке профиля и логине

3. **Скрипты для диагностики**:
   - `scripts/debug-favorites.mjs` - показывает favorites всех пользователей
   - `scripts/clear-favorites.mjs` - очищает favorites выбранного пользователя

## Шаги для диагностики

### 1. Запустите backend
```powershell
cd "C:\full stack 9.92024\NADLAN\nadlan_back"
node server.js
```

### 2. Запустите frontend
```powershell
cd "C:\full stack 9.92024\NADLAN\nadlan_front"
npm run dev
# или
npm start
```

### 3. Откройте консоль браузера (F12)

### 4. Зайдите в систему и проверьте логи

Вы должны увидеть:
```
AuthContext - Login user: {...}
AuthContext - Login favorites: [...]
Header - user.favorites: [...]
Header - favoritesCount: X
```

### 5. Кликните на сердечко (лайк/анлайк)

Должны появиться логи:
```
Add to favorites response: {...}
Updated favorites after add: [...]
```
или
```
Remove from favorites response: {...}
Updated favorites after remove: [...]
```

### 6. Проверьте базу данных

Запустите скрипт отладки:
```powershell
cd "C:\full stack 9.92024\NADLAN\nadlan_back"
node scripts/debug-favorites.mjs
```

Это покажет:
- Всех пользователей
- Количество избранных у каждого
- ID объектов в favorites

### 7. Очистите favorites (если нужно)

```powershell
node scripts/clear-favorites.mjs
```

Введите email пользователя или "all" для очистки всех.

## Возможные причины проблемы

1. **В БД есть старые ID** - используйте `clear-favorites.mjs`
2. **Сервер возвращает неправильный формат** - проверьте логи в консоли
3. **Состояние не обновляется** - проверьте логи в Header после клика на лайк
4. **Дубликаты ID в массиве** - проверьте логи и БД

## Решение после диагностики

После того, как увидите логи в консоли:
1. Скопируйте и покажите мне логи
2. Запустите `debug-favorites.mjs` и покажите результат
3. Я скажу, в чём проблема и как исправить

## Быстрое решение (если хотите просто очистить)

```powershell
cd "C:\full stack 9.92024\NADLAN\nadlan_back"
node scripts/clear-favorites.mjs
# Введите email вашего пользователя
```

Затем:
1. Перезагрузите страницу (Ctrl+F5)
2. Счётчик должен показывать 0
3. Добавьте объект в избранное
4. Счётчик должен стать 1
5. Удалите объект
6. Счётчик должен вернуться к 0
