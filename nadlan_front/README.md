## Клиентская валидация (Joi)

Фронтенд теперь использует те же Joi-схемы, что и бекенд (функционально эквивалентные), для единообразной валидации форм.

### Где находятся схемы
- `src/validation/authSchemas.js` — регистрация, логин, обновление профиля, восстановление пароля
- `src/validation/propertySchemas.js` — создание / обновление недвижимости
- `src/validation/validate.js` — утилиты `validate(schema, data)` и `validateField(schema, fullData, path, value)`

### Хук для форм недвижимости
`usePropertyValidation.js` теперь основан на Joi:
```js
const { errors, validateField, validateForm, isValid } = usePropertyValidation(formState);
```

Возвращаемый объект `errors` имеет ключи полей (например: `details.area`, `price.amount`). Если нет ошибок — объект пустой.

### Формат ошибок
Joi ошибки преобразуются в объект: `{ [path]: message }`. Это соответствует формату сообщений сервера, что упрощает отображение и повторное использование.

### Добавление новой схемы
1. Создайте файл в `src/validation/` (например `searchSchemas.js`).
2. Экспортируйте нужный Joi schema.
3. Используйте `validate(schema, data)` в компоненте или хук.

### Почему не Zod
Для согласованности между фронтом и бекендом: бекенд уже перешёл на Joi. Это снижает расхождения в сообщениях об ошибках и логике (например условная валидация пароля при Google OAuth).

### Советы по производительности
Схемы мемоизируются (useMemo). Не вызывайте validate на каждом рендере без необходимости — используйте дебаунс при вводе текста.

### Глобальные сообщения
Если логическая ошибка верхнего уровня (например конфликт этажей), она может появиться под ключом `_global`.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
