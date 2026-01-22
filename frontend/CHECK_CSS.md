# Проверка CSS в продакшене

## Что означает сообщение в логах

Сообщение вида:
```
dist/assets/index-BQOeSgi_.css   18.68 kB │ gzip:  3.80 kB
```

**Это НЕ ошибка**, а информация о размере файла:
- `18.68 kB` - размер исходного CSS файла
- `3.80 kB` - размер после gzip сжатия

## Проверка CSS на Vercel

### 1. Проверка в браузере

1. Откройте задеплоенную версию на Vercel
2. Откройте DevTools (F12)
3. Перейдите на вкладку **Network**
4. Обновите страницу (Ctrl+R)
5. Найдите файл с расширением `.css`
6. Проверьте:
   - ✅ Статус должен быть `200` (OK)
   - ✅ Тип должен быть `text/css`
   - ✅ Размер должен быть около 18-19 KB

### 2. Проверка в консоли

Выполните в консоли браузера:

```javascript
// Проверка загрузки CSS
const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
console.log('CSS файлы:', links);
links.forEach(link => {
  console.log('CSS:', link.href, 'загружен:', link.sheet ? '✅' : '❌');
});
```

### 3. Проверка применения стилей

```javascript
// Проверка, что Tailwind работает
const root = document.getElementById('root');
const computedStyle = window.getComputedStyle(root);
console.log('Background color:', computedStyle.backgroundColor);
console.log('Grid columns:', computedStyle.gridTemplateColumns);
```

## Если CSS не загружается

### Проблема: 404 ошибка для CSS файла

**Решение:**
1. Проверьте, что файл существует в `dist/assets/`
2. Проверьте путь в `index.html` - должен быть `/assets/index-*.css`
3. Убедитесь, что `base: '/'` в `vite.config.ts`

### Проблема: CSS загружается, но стили не применяются

**Решение:**
1. Очистите кеш браузера (Ctrl+Shift+R)
2. Проверьте, что Tailwind правильно настроен в `tailwind.config.js`
3. Убедитесь, что `content` в `tailwind.config.js` включает все файлы:
   ```js
   content: [
     "./index.html",
     "./src/**/*.{js,ts,jsx,tsx}",
   ]
   ```

### Проблема: Стили отличаются от локальной версии

**Возможные причины:**
1. **Кеш браузера** - очистите кеш
2. **Старая версия на Vercel** - перезапустите деплой
3. **Проблемы с Tailwind** - пересоберите проект:
   ```bash
   cd frontend
   rm -rf dist node_modules/.vite
   npm run build
   ```

## Проверка конфигурации

### vite.config.ts
```typescript
export default defineConfig({
  base: '/', // ✅ Должно быть '/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets', // ✅ CSS будет в dist/assets/
  },
})
```

### tailwind.config.js
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ✅ Все файлы включены
  ],
}
```

## Быстрая проверка

1. **Локально:**
   ```bash
   cd frontend
   npm run build
   npm run preview
   # Откройте http://localhost:4173
   # Проверьте, что стили применяются
   ```

2. **На Vercel:**
   - Откройте задеплоенную версию
   - Проверьте Network tab в DevTools
   - Убедитесь, что CSS загружается

## Если проблема сохраняется

1. Проверьте логи Vercel:
   - Dashboard → Ваш проект → Deployments
   - Откройте последний деплой
   - Проверьте Build Logs

2. Проверьте консоль браузера:
   - Откройте DevTools → Console
   - Ищите ошибки (красные сообщения)

3. Сравните локальную и продакшен версии:
   - Запустите `npm run preview` локально
   - Сравните с версией на Vercel
   - Проверьте различия в стилях
