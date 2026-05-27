# Aionios — Frontend

Frontend de la plataforma Aionios construido con Next.js 16 y React 19.

> La documentación completa de arquitectura, API y flujos está en el repositorio del backend:
> **https://github.com/Aionios-team/Aionios-backend**

---

## USUARIOS
Cliente: 
Correo electrónico: cliente@example.com
Contraseña: cliente123

Dueño de negocio:
Correo electrónico: "dueno@example.com"
Contraseña: "dueno123"



## Repositorios

| Repositorio | URL |
|---|---|
| **Frontend** (este repo) | https://github.com/Aionios-team/Aionios-frontend |
| **Backend** (NestJS + API) | https://github.com/Aionios-team/Aionios-backend |
| **Frontend Desplegado** (Next.js) | https://aionios-frontend.vercel.app/login |


---

## Instalación

```bash
npm install
```

## Variables de entorno

Crear archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Desarrollo local

```bash
npm run dev
# http://localhost:3000
```

El backend debe estar corriendo en `http://localhost:3001` (ver instrucciones en su README).

---

## Rutas de la aplicación

### Portal del cliente (`/portal`)
| Ruta | Descripción |
|---|---|
| `/portal` | Home con buscador y negocios destacados |
| `/portal/explorar` | Listado de negocios con búsqueda y filtros por categoría |
| `/portal/negocio/:id` | Detalle del negocio + formulario de reserva |
| `/portal/citas` | Mis citas: próximas, pasadas, pagar y reseñar |
| `/portal/perfil` | Perfil editable del usuario |

### Dashboard del negocio (`/dashboard`)
| Ruta | Descripción |
|---|---|
| `/dashboard` | Panel principal: KPIs, agenda del día, actividad reciente |
| `/dashboard/business` | Datos del negocio |
| `/dashboard/services` | Catálogo de servicios (crear, editar, eliminar) |
| `/dashboard/requests` | Solicitudes: confirmar o cancelar citas |
| `/dashboard/horarios` | Agenda semanal + bloqueos de horario |
| `/dashboard/payments` | Ingresos, pagos recibidos y estadísticas |
| `/dashboard/reviews` | Reseñas de clientes + respuestas del negocio |
| `/dashboard/support` | Tickets de soporte |

### Auth
| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión |
| `/register` | Registro (seleccionar rol: cliente o negocio) |

---

## Stack

- **Next.js 16** — App Router, `"use client"` para páginas interactivas
- **React 19** — Componentes funcionales con hooks
- **TypeScript 5** — Tipado estricto en servicios, tipos y componentes
- **Tailwind CSS 4** — Estilos utilitarios
- **Axios** — Cliente HTTP con interceptor JWT (`src/lib/axios.ts`)
- **Lucide React** — Íconos
