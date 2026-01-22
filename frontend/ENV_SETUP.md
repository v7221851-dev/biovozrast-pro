# Настройка переменных окружения

## Создание файла .env

Создайте файл `.env` в корне папки `frontend/` со следующим содержимым:

```env
# Домен Tilda для возврата при закрытии опроса
VITE_TILDA_DOMAIN=https://zapisvmdsa.tilda.ws
```

## Важно

1. **Префикс VITE_**: В Vite переменные окружения должны начинаться с `VITE_` чтобы быть доступными в клиентском коде.

2. **Перезапуск сервера**: После создания или изменения `.env` файла необходимо перезапустить dev-сервер:
   ```bash
   npm run dev
   ```

3. **Production**: При деплое на Vercel/Netlify добавьте переменную окружения в настройках проекта:
   - **Vercel**: Settings → Environment Variables
   - **Netlify**: Site settings → Build & deploy → Environment

## Использование

Переменная используется в `App.tsx` для редиректа при закрытии опроса:

```typescript
const tildaDomain = import.meta.env.VITE_TILDA_DOMAIN || 'https://zapisvmdsa.tilda.ws';
```

Если переменная не задана, используется значение по умолчанию.
