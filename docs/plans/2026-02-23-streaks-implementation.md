# Streaks (Rachas Diarias) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Añadir sistema de rachas diarias para usuarios registrados, activado al guardar en la nube, visible en el header.

**Architecture:** `streakService.js` encapsula la lógica de Supabase. `useStreak(userId)` hook provee estado reactivo. `StreakDisplay` renderiza el chip 🔥 en el header. `App.jsx` llama `recordToday` al final del guardado en nube exitoso.

**Tech Stack:** React, Supabase JS v2, framer-motion (ya instalado), i18next (ya instalado)

---

## Estado inicial

- Tabla `streaks` ya existe en Supabase con RLS correctas (SELECT, INSERT, UPDATE por `auth.uid()`)
- Schema: `id, user_id (UNIQUE), current_streak, longest_streak, last_colored_date, created_at, updated_at`
- No hay test runner instalado — verificación manual en browser

---

### Task 1: `streakService.js`

**Files:**
- Create: `src/services/streakService.js`

**Step 1: Crear el archivo**

```js
// src/services/streakService.js
import supabase from './supabaseClient';
import Logger from '../utils/logger.js';

/**
 * Calcula si dateKey es el día siguiente a lastColoredDate.
 * Ambos son strings 'YYYY-MM-DD'.
 */
function isYesterday(lastColoredDate, dateKey) {
  const last = new Date(lastColoredDate + 'T00:00:00');
  const current = new Date(dateKey + 'T00:00:00');
  const diffMs = current - last;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Devuelve el registro de streak del usuario, o null si no existe.
 */
export async function getStreak(userId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_colored_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    Logger.error('❌ streakService.getStreak:', error);
    return null;
  }
  return data;
}

/**
 * Registra actividad de coloreo para hoy.
 * Idempotente: si ya se registró hoy, no hace nada.
 *
 * @param {string} userId
 * @param {string} dateKey  'YYYY-MM-DD'
 * @returns {{ currentStreak: number, longestStreak: number, isNewDay: boolean } | null}
 */
export async function recordActivity(userId, dateKey) {
  try {
    const existing = await getStreak(userId);

    // Ya contó hoy — no-op
    if (existing?.last_colored_date === dateKey) {
      return {
        currentStreak: existing.current_streak,
        longestStreak: existing.longest_streak,
        isNewDay: false,
      };
    }

    // Calcular nueva racha
    let newCurrent = 1;
    if (existing?.last_colored_date && isYesterday(existing.last_colored_date, dateKey)) {
      newCurrent = (existing.current_streak ?? 0) + 1;
    }
    const newLongest = Math.max(newCurrent, existing?.longest_streak ?? 0);

    const { error } = await supabase.from('streaks').upsert(
      {
        user_id: userId,
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_colored_date: dateKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      Logger.error('❌ streakService.recordActivity:', error);
      return null;
    }

    Logger.log(`🔥 Streak actualizado: ${newCurrent} días`);
    return { currentStreak: newCurrent, longestStreak: newLongest, isNewDay: true };
  } catch (err) {
    Logger.error('❌ streakService.recordActivity (catch):', err);
    return null;
  }
}
```

**Step 2: Verificar manualmente en consola del browser**

Abre la app en localhost, inicia sesión y en DevTools ejecuta:
```js
import('/src/services/streakService.js').then(async m => {
  const { data: { user } } = await supabase.auth.getUser();
  const result = await m.recordActivity(user.id, '2026-02-23');
  console.log(result);
});
```
Esperado: `{ currentStreak: 1, longestStreak: 1, isNewDay: true }`.
Segunda vez: `{ currentStreak: 1, longestStreak: 1, isNewDay: false }` (idempotente).

**Step 3: Commit**

```bash
git add src/services/streakService.js
git commit -m "feat: streakService con lógica de rachas diarias"
```

---

### Task 2: `useStreak.js` hook

**Files:**
- Create: `src/hooks/useStreak.js`

**Step 1: Crear el hook**

```js
// src/hooks/useStreak.js
import { useState, useEffect, useCallback } from 'react';
import { getStreak, recordActivity } from '../services/streakService';

export function useStreak(userId) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Cargar streak al montar o cuando cambia el usuario
  useEffect(() => {
    if (!userId) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }
    getStreak(userId).then((data) => {
      if (data) {
        setCurrentStreak(data.current_streak ?? 0);
        setLongestStreak(data.longest_streak ?? 0);
      }
    });
  }, [userId]);

  /**
   * Llama esto tras guardar en la nube con éxito.
   * @param {string} dateKey  'YYYY-MM-DD'
   * @returns {{ isNewDay: boolean } | null}
   */
  const recordToday = useCallback(
    async (dateKey) => {
      if (!userId) return null;
      const result = await recordActivity(userId, dateKey);
      if (result) {
        setCurrentStreak(result.currentStreak);
        setLongestStreak(result.longestStreak);
      }
      return result;
    },
    [userId]
  );

  return { currentStreak, longestStreak, recordToday };
}
```

**Step 2: Verificar tipos**

El hook devuelve `currentStreak` (number), `longestStreak` (number), `recordToday` (async function). No tiene side effects si `userId` es null.

**Step 3: Commit**

```bash
git add src/hooks/useStreak.js
git commit -m "feat: useStreak hook para estado reactivo de rachas"
```

---

### Task 3: `StreakDisplay.jsx` componente

**Files:**
- Create: `src/components/StreakDisplay.jsx`

**Step 1: Crear el componente**

```jsx
// src/components/StreakDisplay.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function StreakDisplay({ currentStreak, longestStreak }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!currentStreak || currentStreak === 0) return null;

  return (
    <div
      className="streak-display"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative', cursor: 'default' }}
    >
      <motion.div
        className="streak-chip"
        key={currentStreak}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        🔥 {currentStreak}
      </motion.div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="streak-tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            Racha más larga: {longestStreak} días
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 2: Añadir estilos en `src/styles/Header.css`**

Busca el final del archivo y añade:

```css
/* Streak display */
.streak-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 100, 0, 0.12);
  color: #ff6400;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
}

.streak-tooltip {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
}
```

**Step 3: Verificar visualmente**

Para probar sin tocar Auth, render temporal en `App.jsx`:
```jsx
<StreakDisplay currentStreak={7} longestStreak={12} />
```
Verifica que aparece el chip y el tooltip al hover. Quita el render temporal.

**Step 4: Commit**

```bash
git add src/components/StreakDisplay.jsx src/styles/Header.css
git commit -m "feat: componente StreakDisplay con chip y tooltip animado"
```

---

### Task 4: Integrar `StreakDisplay` en `Header.jsx`

**Files:**
- Modify: `src/components/Header.jsx`

**Step 1: El header necesita recibir streak como props**

`Header.jsx` ya usa `useAuth()` internamente. Para evitar prop drilling desde `App.jsx`, lo más limpio es usar el hook `useStreak` directamente en `Header`, ya que `Header` ya accede a `user`.

**Step 2: Modificar `Header.jsx`**

Añadir imports al inicio del archivo (después de los imports existentes):
```jsx
import { useStreak } from '../hooks/useStreak';
import { StreakDisplay } from './StreakDisplay';
```

Dentro del componente `Header`, después de la línea:
```jsx
const { user, isLoggedIn, isLoading: authLoading } = useAuth();
```
Añadir:
```jsx
const { currentStreak, longestStreak } = useStreak(user?.id ?? null);
```

En el JSX del `<nav>`, añadir `<StreakDisplay>` justo antes del botón de auth (busca la línea `{!authLoading && (`):
```jsx
{isLoggedIn && (
  <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />
)}

{!authLoading && (
  // ... botón auth existente sin cambios
```

**Step 3: Verificar en browser**

- Usuario no logueado → el chip no aparece
- Usuario logueado con streak 0 → el chip no aparece
- Después del Task 5 (integración en App.jsx), guarda en nube → chip aparece con 🔥 1

**Step 4: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: mostrar StreakDisplay en header para usuarios logueados"
```

---

### Task 5: Integrar `recordToday` en `App.jsx`

**Files:**
- Modify: `src/App.jsx`

**Step 1: Importar `useStreak`**

En los imports de `App.jsx`, añadir (junto a los otros hooks):
```jsx
import { useStreak } from './hooks/useStreak';
```

**Step 2: Instanciar el hook**

Después de la línea `const { user, isLoggedIn } = useAuth();`, añadir:
```jsx
const { recordToday } = useStreak(user?.id ?? null);
```

**Step 3: Llamar `recordToday` en `handleSaveToCloud`**

En `handleSaveToCloud`, localiza el bloque del `if (error)`:
```jsx
if (error) {
  showError(t('app.cloud.errorSave'));
} else {
  showSuccess(t('app.cloud.saved'));
}
```

Reemplazarlo por:
```jsx
if (error) {
  showError(t('app.cloud.errorSave'));
} else {
  showSuccess(t('app.cloud.saved'));
  // Registrar actividad de streak (no bloquea si falla)
  const dateKey = selectedDate.toISOString().split('T')[0];
  const streakResult = await recordToday(dateKey);
  if (streakResult?.isNewDay) {
    const n = streakResult.currentStreak;
    const milestones = { 7: '🎉 ¡Una semana entera!', 30: '🏆 ¡Un mes de racha!', 100: '🌟 ¡100 días!' };
    const msg = milestones[n] ?? `🔥 ¡Día ${n}! Llevas ${n} días pintando seguidos`;
    showSuccess(msg);
  }
}
```

**Step 4: Verificar flujo completo**

1. Inicia sesión en la app
2. Haz un trazo en el canvas
3. Pulsa el botón ☁️ (guardar en nube)
4. Esperado: toast "🔥 ¡Día 1! Llevas 1 días pintando seguidos" + chip 🔥 1 en header
5. Pulsa ☁️ de nuevo el mismo día → no aparece toast de streak (isNewDay: false)
6. Revisa en Supabase → tabla `streaks` tiene tu fila actualizada

**Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrar streak en flujo de guardado en nube"
```

---

### Task 6: Mover tarea en kanban de Obsidian

**Step 1:** En `D:/Proyectos/CONTROL/Tableros/ColorEveryday.md`, mover el bloque de "Sistema de Streaks" de `## ✅ In Progress` a `## 🔄 Completada - Pendiente Revisión`, cambiar `- [ ]` a `- [x]` y añadir:
```
  - Completada: 2026-02-23
```

---

## Resumen de archivos

| Acción | Archivo |
|--------|---------|
| Crear | `src/services/streakService.js` |
| Crear | `src/hooks/useStreak.js` |
| Crear | `src/components/StreakDisplay.jsx` |
| Modificar | `src/styles/Header.css` |
| Modificar | `src/components/Header.jsx` |
| Modificar | `src/App.jsx` |

## Commits esperados (6)

1. `feat: streakService con lógica de rachas diarias`
2. `feat: useStreak hook para estado reactivo de rachas`
3. `feat: componente StreakDisplay con chip y tooltip animado`
4. `feat: mostrar StreakDisplay en header para usuarios logueados`
5. `feat: integrar streak en flujo de guardado en nube`
6. kanban update (sin commit de código)
