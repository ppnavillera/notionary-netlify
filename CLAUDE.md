# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with HMR at http://localhost:3000
- `npm run build` - Build for production (runs React Router build + Netlify preparation)
- `npm run typecheck` - Run TypeScript type checking with React Router type generation
- `npm start` - Start Netlify local server for testing production build

## Core Stack

- **React Router v7**: Full-stack React framework with type-safe routing and SSR
- **Netlify Functions**: Serverless deployment platform with edge functions
- **TypeScript**: Strict mode enabled with path aliases (`~/*` maps to `app/*`)
- **Tailwind CSS v4**: Utility-first CSS framework integrated via Vite
- **Vite**: Build tool and development server with HMR support

## Route Structure

- File-based routing configuration in `app/routes.ts` using React Router v7 config format
- Routes use type-safe definitions with generated types (e.g., `Route.LoaderArgs`, `Route.ComponentProps`)
- Example structure:
  - `routes/home.tsx` - Main route with loader data from Netlify context
  - Type definitions automatically generated in `.react-router/types/`
- Loaders can access Netlify context (e.g., `context.VALUE_FROM_NETLIFY`)

## Server Functions

- Netlify Functions integration via `server/app.ts` using `createRequestHandler`
- Server context available in loaders through extended `AppLoadContext` interface
- Example pattern: Netlify context values passed to React Router request handler
- SSR rendering handled by React Router with Netlify-specific adaptations

## Architecture Overview

This is a React Router v7 application configured for Netlify deployment with SSR enabled by default.

### Key Architecture Components

**Build System:**
- Uses Vite as the build tool with React Router v7 integration
- Dual build targets: client bundle and server bundle for SSR
- Server bundle input is `./server/app.ts` for SSR builds
- TailwindCSS v4 integrated via Vite plugin

**Routing:**
- Routes defined in `app/routes.ts` using React Router v7 config format
- File-based routing with type-safe route definitions
- SSR enabled by default (configurable in `react-router.config.ts`)

**Deployment:**
- Netlify Functions integration via `server/app.ts`
- Build process copies server bundle to `.netlify/functions-internal/handler`
- Static assets served from `build/client` with immutable caching headers
- Production build uses `netlify/prepare.js` to setup function structure

**Development Server:**
- Custom Express server (`dev-server.js`) with Vite middleware
- SSR module loading during development
- Server-side rendering through `@mjackson/node-fetch-server`

**Type System:**
- React Router v7 type generation (`react-router typegen`)
- Extended AppLoadContext interface for Netlify context values
- TypeScript paths configured via `vite-tsconfig-paths`

The application follows React Router v7 patterns with Netlify-specific adaptations for serverless deployment.

## Styling & UI

- **Tailwind CSS v4**: Configured with custom theme in `app/app.css`
- **Inter Font**: Loaded from Google Fonts via `root.tsx` links function
- **Dark Mode**: Automatic dark/light mode support with `prefers-color-scheme`
- **Custom Theme**: Extended with Inter as default sans-serif font family
- **Responsive Design**: Mobile-first approach with responsive utilities

## Component Patterns

- **Welcome Component**: Example component in `app/welcome/welcome.tsx` demonstrating:
  - SVG icon imports and usage (Google login button with inline SVG)
  - Dark/light mode image switching with conditional classes
  - External link navigation with proper `target="_blank"` and `rel="noreferrer"`
  - Resource links array pattern for navigation items

## Development Notes

- No testing framework configured - would need to be added if tests are required
- TypeScript strict mode enabled with ES2022 target
- Vite handles asset imports (SVG files imported as URLs)
- React Router handles SSR automatically when `ssr: true` in config
- Custom Express development server provides better debugging than default Vite dev server