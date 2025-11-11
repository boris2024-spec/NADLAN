# Исправление проблемы с сохранением houseNumber в MongoDB

## Проблема
Поле `houseNumber` не сохранялось в MongoDB при создании/обновлении недвижимости.

## Причина
1. **Frontend**: В функциях `handleSubmit` и `saveDraft` не передавались поля `street` и `houseNumber` в объект `location`
2. **Model middleware**: Middleware `pre('save')` перезаписывал поля, даже если они уже были заполнены

## Внесенные изменения

### 1. Frontend (CreatePropertyPage.jsx)

#### Добавлены поля в начальное состояние formData:
```javascript
location: {
    address: '',
    street: '',        // ДОБАВЛЕНО
    houseNumber: '',   // ДОБАВЛЕНО
    city: '',
    district: '',
    coordinates: {
        latitude: '',
        longitude: ''
    }
}
```

#### Обновлен handleSubmit для отправки street и houseNumber:
```javascript
location: {
    address: formData.location?.address?.trim(),
    street: formData.location?.street?.trim() || undefined,      // ДОБАВЛЕНО
    houseNumber: formData.location?.houseNumber?.trim() || undefined, // ДОБАВЛЕНО
    city: formData.location?.city?.trim(),
    district: formData.location?.district?.trim() || undefined,
    coordinates: { ... }
}
```

#### Обновлена функция saveDraft (buildDraftPayload):
```javascript
location: {
    address: data.location?.address?.trim() || undefined,
    street: data.location?.street?.trim() || undefined,          // ДОБАВЛЕНО
    houseNumber: data.location?.houseNumber?.trim() || undefined, // ДОБАВЛЕНО
    city: data.location?.city?.trim() || undefined,
    district: data.location?.district?.trim() || undefined,
    coordinates: { ... }
}
```

#### Обновлен обработчик StreetAutocomplete:
```javascript
onChange={(street) => {
    // Обновляем и street, и address одновременно
    setFormData(prev => ({
        ...prev,
        location: {
            ...prev.location,
            street: street,    // Сохраняем в оба поля
            address: street
        }
    }));
}}
```

#### Обновлена загрузка данных при редактировании:
```javascript
location: {
    address: p.location?.address || '',
    street: p.location?.street || '',           // ДОБАВЛЕНО
    houseNumber: p.location?.houseNumber || '', // ДОБАВЛЕНО
    city: p.location?.city || '',
    district: p.location?.district || '',
    coordinates: { ... }
}
```

### 2. Backend (Property.js model)

#### Исправлен middleware pre('save'):
```javascript
// Middleware для синхронизации полей адреса
propertySchema.pre('save', function (next) {
    // Если есть street и/или houseNumber, синхронизируем с address
    if (this.isModified('location.street') || this.isModified('location.houseNumber')) {
        const parts = [];
        if (this.location.street) parts.push(this.location.street);
        if (this.location.houseNumber) parts.push(this.location.houseNumber);
        if (parts.length > 0) {
            this.location.address = parts.join(' ');
        }
    }
    // Если изменился только address и при этом street пустой, пытаемся разделить его
    else if (this.isModified('location.address') && this.location.address && !this.location.street) {
        // ^^ ДОБАВЛЕНО: && !this.location.street
        // Теперь не перезаписываем street, если он уже заполнен
        const parts = this.location.address.trim().split(/\s+/);
        if (parts.length > 1) {
            const lastPart = parts[parts.length - 1];
            if (/^\d+[א-ת]?$/.test(lastPart)) {
                this.location.houseNumber = lastPart;
                this.location.street = parts.slice(0, -1).join(' ');
            } else {
                this.location.street = this.location.address;
            }
        } else {
            this.location.street = this.location.address;
        }
    }
    next();
});
```

## Как проверить исправление

1. Запустите backend и frontend серверы
2. Создайте новую недвижимость через форму
3. Заполните поле "רחוב" (улица) и "מספר בית" (номер дома)
4. Сохраните недвижимость
5. Проверьте в MongoDB, что поля `location.street` и `location.houseNumber` сохранены

### Проверка через MongoDB Compass:
```javascript
db.properties.find({}, { 
    "location.street": 1, 
    "location.houseNumber": 1, 
    "location.address": 1 
})
```

### Проверка через API:
```bash
curl http://localhost:5000/api/properties/:id
```

## Результат
Теперь поля `street` и `houseNumber` корректно сохраняются в MongoDB и не перезаписываются middleware.
