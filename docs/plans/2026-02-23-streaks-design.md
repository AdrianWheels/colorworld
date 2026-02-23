# Diseño: Sistema de Streaks (Rachas Diarias)

**Fecha:** 2026-02-23
**Estado:** Aprobado

---

## Contexto

ColorEveryday necesita un sistema de retención basado en rachas diarias (modelo Duolingo). El objetivo es motivar al usuario a colorear cada día.

## Decisiones clave

| Decisión | Elección | Motivo |
|---|---|---|
| ¿Quién tiene racha? | Solo usuarios con cuenta | Simplifica la arquitectura |
| ¿Cuándo se activa? | Al guardar en la nube (☁️) | Intencional y verificable |
| ¿Dónde se almacena? | Tabla `streaks` (ya existe en Supabase) | No requiere migración |
| ¿Dónde se muestra? | Header, junto al avatar | Visible en todas las páginas |

## Arquitectura

### Archivos nuevos
- `src/services/streakService.js` — lógica pura, acceso a Supabase
- `src/hooks/useStreak.js` — estado reactivo para React
- `src/components/StreakDisplay.jsx` — chip 🔥 N en el header

### Archivos modificados
- `src/App.jsx` — llama `recordToday` al final de `handleSaveToCloud`
- `src/components/Header.jsx` — renderiza `<StreakDisplay />`

## Lógica de negocio

### `streakService.recordActivity(userId, dateKey)`

```
1. SELECT streak WHERE user_id = userId
2. Comparar last_colored_date con dateKey:
   - Mismo día     → no-op (idempotente), devuelve estado actual
   - Ayer          → current_streak + 1
   - Anterior/null → current_streak = 1  (racha rota)
3. longest_streak = MAX(current_streak, longest_streak)
4. UPSERT streaks (user_id es UNIQUE)
5. Return { currentStreak, longestStreak, isNewDay }
```

### `streakService.getStreak(userId)`
SELECT simple, devuelve `{ currentStreak, longestStreak, lastColoredDate }`.

## Hook `useStreak(userId)`

```js
const { currentStreak, longestStreak, recordToday } = useStreak(userId)
```

- Llama `getStreak` al montar si `userId` existe
- `recordToday(dateKey)` llama `recordActivity` y actualiza estado local
- No lanza errores hacia arriba (streak failure no debe romper el flujo de guardado)

## Componente `StreakDisplay`

- Recibe `currentStreak` y `longestStreak` como props
- Oculto si `currentStreak === 0` o usuario no logueado
- Chip: `🔥 {currentStreak}`
- Click → tooltip "Racha más larga: N días"
- Animación framer-motion al incrementar

## Celebración (toast)

Al `isNewDay === true`:
- General: "🔥 ¡Día N! Llevas N días pintando seguidos"
- Hitos: día 7 → "🎉 ¡Una semana entera!", día 30 → "🏆 ¡Un mes de racha!", día 100 → "🌟 ¡100 días!"

## BD — Sin migraciones necesarias

La tabla `streaks` ya existe:
```
streaks (
  id uuid PK,
  user_id uuid UNIQUE FK → auth.users,
  current_streak int default 0,
  longest_streak int default 0,
  last_colored_date date,
  created_at timestamptz,
  updated_at timestamptz
)
```

Solo verificar que RLS permite `SELECT` y `INSERT/UPDATE` al propio usuario.
