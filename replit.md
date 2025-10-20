# Family Organizer Web App

## Overview
This is a React Router web application for family organization, built with TypeScript, React, and Supabase.

## Project Structure
- `/apps/web` - Main web application
  - React Router 7 with Hono server
  - Vite for build tooling
  - Supabase for backend
  - Tailwind CSS for styling

## Development
The app runs on port 5000 with Node.js 22.
- Dev server: `npm run dev` (in apps/web)
- Build: `npm run build` (in apps/web)
- Start production: `npm run start` (in apps/web)

## Deployment
The app is configured for Autoscale deployment on Replit:
- Build step: Compiles the app using `npm run build`
- Run step: Serves the built app on port 5000
- Type: Autoscale (best for web applications)

To deploy:
1. Click the "Publish" button in the Replit workspace
2. Replit will build and deploy your app automatically
3. You'll get a live URL for your app

## Recent Changes
- Oct 20, 2025: Configured deployment settings for Replit
- Updated port to 5000 for Replit compatibility
- Set up workflow for development server
