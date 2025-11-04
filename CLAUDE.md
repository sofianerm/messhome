# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a React Router v7 web application with Hono server focused on family dashboard features.

- **apps/web** - React Router v7 web application with Hono server

## Common Development Commands

### Web Application (apps/web)
```bash
cd apps/web
npm run dev          # Start development server on port 5000
npm run typecheck    # Run TypeScript type checking
npm test             # Run Vitest tests
```

## Architecture Overview

### Web Application
- **Framework**: React Router v7 with file-based routing
- **Server**: Hono server with React Router integration
- **Styling**: Tailwind CSS with Chakra UI components
- **State Management**: Zustand for client state, Tanstack Query for server state
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest with jsdom environment
- **Build**: Vite with custom plugins for layouts, aliases, and font loading

Key architectural patterns:
- File-based routing in `src/app/` directory
- Custom Vite plugins for layout wrapping and render IDs
- Styled-jsx for component-level styling alongside Tailwind
- React Router server-side rendering with Hono backend

## Key Dependencies

- React Query for server state management
- Zustand for client state
- Yup for form validation
- date-fns for date utilities
- Lucide icons
- @lshay/ui component library
- Recharts for data visualization
- React Hook Form for forms
- Stripe integration
- PDF.js for document handling

## Development Notes

- The web app runs on port 5000 by default
- TypeScript with strict type checking
- Tailwind configuration includes extensive Google Fonts integration
- Web app uses custom Vite plugins for enhanced development experience