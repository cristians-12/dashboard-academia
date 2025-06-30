# Dashboard de Registro de Horas

Este proyecto es una aplicación web construida con Next.js, Supabase y Zustand para el registro y visualización de horas trabajadas por usuario.

## Funcionalidades principales

- **Autenticación de usuarios** (registro, login, recuperación de contraseña) usando Supabase Auth.
- **Registro de horas de entrada y salida** con cálculo automático de horas trabajadas.
- **Visualización de todas las horas registradas** en una tabla responsiva.
- **Gestión de estado global** con Zustand para usuario y horas trabajadas.

## Estructura del proyecto

- `/app` — Páginas y layouts principales (Next.js App Router)
- `/components` — Componentes reutilizables (formularios, botones, tablas, etc.)
- `/store` — Stores de Zustand para usuario y horas trabajadas
- `/lib/supabase` — Configuración y utilidades de Supabase

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <URL-del-repo>
   cd dashboard
   ```
2. Instala las dependencias:
   ```bash
   npm install
   # o
   pnpm install
   ```
3. Crea un archivo `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
4. Inicia el proyecto en desarrollo:
   ```bash
   npm run dev
   # o
   pnpm dev
   ```

## Uso

- Regístrate o inicia sesión.
- Marca tu hora de ingreso y salida usando el botón principal.
- Consulta tus registros en la tabla de horas trabajadas.

## Notas técnicas

- El estado del usuario y de las horas trabajadas se maneja con Zustand.
- La tabla `horas_trabajo` en Supabase debe tener los campos: `id`, `created_at`, `user_id`, `hora_ingreso`, `hora_salida`, `horas_trabajadas`.
- El acceso a datos está protegido por autenticación y políticas RLS en Supabase.

---

¡Contribuciones y sugerencias son bienvenidas!
