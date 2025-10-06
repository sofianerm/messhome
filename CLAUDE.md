# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing two main applications:

- **apps/web** - React Router v7 web application with Hono server
- **apps/mobile** - React Native/Expo mobile application

Both apps share common functionality and use modern web technologies with a focus on family dashboard features.

## Common Development Commands

### Web Application (apps/web)
```bash
cd apps/web
npm run dev          # Start development server on port 4000
npm run typecheck    # Run TypeScript type checking
npm test             # Run Vitest tests
```

### Mobile Application (apps/mobile)
```bash
cd apps/mobile
npm run postinstall  # Apply patches via patch-package
expo start           # Start Expo development server
```

## Architecture Overview

### Web Application
- **Framework**: React Router v7 with file-based routing
- **Server**: Hono server with React Router integration
- **Styling**: Tailwind CSS with Chakra UI components
- **State Management**: Zustand for client state, Tanstack Query for server state
- **Authentication**: Auth.js integration via Hono
- **Database**: Neon (PostgreSQL) with Drizzle ORM patterns
- **Testing**: Vitest with jsdom environment
- **Build**: Vite with custom plugins for layouts, aliases, and font loading

Key architectural patterns:
- File-based routing in `src/app/` directory
- Custom Vite plugins for layout wrapping and render IDs
- Styled-jsx for component-level styling alongside Tailwind
- React Router server-side rendering with Hono backend

### Mobile Application
- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation v7 with bottom tabs
- **Styling**: Native styling with color2k for color manipulation
- **State Management**: Zustand and Tanstack Query (matching web)
- **Maps**: React Native Maps with Google Maps integration
- **Graphics**: React Native Skia for advanced graphics and animations
- **Audio/Video**: Expo AV for media handling
- **Patches**: Uses patch-package for dependency modifications

## Key Dependencies

### Shared
- React Query for server state management
- Zustand for client state
- Yup for form validation
- date-fns for date utilities
- Lucide icons (react/react-native variants)

### Web Specific
- @lshay/ui component library
- Recharts for data visualization
- React Hook Form for forms
- Stripe integration
- PDF.js for document handling

### Mobile Specific
- Expo modules for native functionality
- React Native Reanimated for animations
- React Native Calendar components
- Expo Camera, Location, Notifications

## Development Notes

- The web app runs on port 4000 by default
- Both applications use TypeScript with strict type checking
- Tailwind configuration includes extensive Google Fonts integration
- Mobile app uses extensive Expo modules for native device features
- Web app uses custom Vite plugins for enhanced development experience
- Authentication flows are shared between web and mobile via common patterns