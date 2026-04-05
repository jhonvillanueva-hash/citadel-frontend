# Citadel - GEMINI.md

## Project Overview
**Citadel** is a modern web application built with **Angular 21**, focusing on high performance and a rich user experience. It leverages **Angular SSR (Server-Side Rendering)** for optimized SEO and initial load times, and employs **Zoneless change detection** for improved efficiency. The project is styled using **Tailwind CSS** with a deeply customized theme and uses **Vitest** for its testing suite.

### Core Technologies
- **Framework:** Angular 21 (Zoneless)
- **Styling:** Tailwind CSS (Custom theme with Poppins font and extensive color palette)
- **State & Data:** RxJS for reactive programming; domain-specific services in `src/app/data/services`.
- **Icons:** FontAwesome (@fortawesome/angular-fontawesome), use this style: icons = {faPlus}, <fa-icon [icon]="icons.faPlus" />
- **Charts:** ApexCharts (ng-apexcharts) for data visualization.
- **Backend Integration:** HttpClient with custom interceptors for Auth and Error handling.
- **Server:** Express.js for SSR.

---

## Architecture & Structure
The project follows a modular, feature-based architecture:

- **`src/app/core/`**: Singleton services, guards, and interceptors that are used globally.
  - `guards/`: `auth.guard`, `admin.guard`, `public.guard`.
  - `interceptors/`: `auth.interceptor`, `error.interceptor`.
  - `services/`: `AuthService`, `BaseHttpService`.
- **`src/app/data/`**: Domain models and data-access services (e.g., `VinoService`, `CartService`).
- **`src/app/features/`**: Feature-specific components and logic.
  - `admin/`: Lazy-loaded admin dashboard and management tools.
  - `auth/`: Login and registration flows.
  - `public/`: Public-facing pages like Landing, Home, and Store.
- **`src/app/shared/`**: Reusable components and layouts across different features.

---

## Development Workflow

### Key Commands
| Action | Command |
| :--- | :--- |
| **Start Dev Server** | `npm start` (or `ng serve`) |
| **Build Project** | `npm run build` (or `ng build`) |
| **Run Unit Tests** | `npm test` (uses Vitest) |
| **Run SSR** | `npm run serve:ssr:citadel` |
| **Generate Component** | `ng generate component path/to/component` |

### Coding Standards
- **Formatting:** Prettier is configured (100 print width, single quotes).
- **Style:** Use Tailwind CSS utility classes. Custom animations and colors should be defined in `tailwind.config.js`.
- **Change Detection:** Explicitly use Zoneless change detection patterns as configured in `appConfig`.
- **Routing:** Use lazy loading for feature modules (especially `admin`) to keep the initial bundle small.

---

## Key Files & Configurations
- `src/app/app.config.ts`: Application-wide providers (Router, HttpClient, SSR).
- `src/app/app.routes.ts`: Main routing definitions with guards.
- `tailwind.config.js`: Extensive theme customization including colors, animations, and typography.
- `package.json`: Project dependencies and scripts.
- `angular.json`: Angular CLI workspace configuration.
- `proxy.config.json`: A "/api" proxy is used that can point to https://citadel-back.vercel.app or http://localhost:3000
