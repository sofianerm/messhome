import { AsyncLocalStorage } from 'node:async_hooks';
import nodeConsole from 'node:console';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { requestId } from 'hono/request-id';
import { createHonoServer } from 'react-router-hono-server/node';
import { serializeError } from 'serialize-error';
import { getHTMLForErrorPage } from './get-html-for-error-page';
import { API_BASENAME, api } from './route-builder';

const als = new AsyncLocalStorage<{ requestId: string }>();

for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
  const original = nodeConsole[method].bind(console);

  console[method] = (...args: unknown[]) => {
    const requestId = als.getStore()?.requestId;
    if (requestId) {
      original(`[traceId:${requestId}]`, ...args);
    } else {
      original(...args);
    }
  };
}

const app = new Hono();

// FIX: Middleware pour forcer le Content-Type correct des fichiers CSS
// DOIT être le premier middleware pour intercepter avant React Router
app.use('*', async (c, next) => {
  const path = c.req.path;
  if (path.endsWith('.css')) {
    await next();
    c.header('Content-Type', 'text/css; charset=utf-8');
    return;
  }
  return next();
});

app.use('*', requestId());

app.use('*', (c, next) => {
  const requestId = c.get('requestId');
  return als.run({ requestId }, () => next());
});

app.use(contextStorage());

app.onError((err, c) => {
  if (c.req.method !== 'GET') {
    return c.json(
      {
        error: 'An error occurred in your app',
        details: serializeError(err),
      },
      500
    );
  }
  return c.html(getHTMLForErrorPage(err), 200);
});

if (process.env.CORS_ORIGINS) {
  app.use(
    '/*',
    cors({
      origin: process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    })
  );
}

// Intégrations proxy (si nécessaire)
app.all('/integrations/:path{.+}', async (c, next) => {
  const queryParams = c.req.query();
  const url = `${process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'https://www.create.xyz'}/integrations/${c.req.param('path')}${Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : ''}`;

  return proxy(url, {
    method: c.req.method,
    body: c.req.raw.body ?? null,
    // @ts-ignore - this key is accepted even if types not aware and is
    // required for streaming integrations
    duplex: 'half',
    redirect: 'manual',
    headers: {
      ...c.req.header(),
      'X-Forwarded-For': process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-host': process.env.NEXT_PUBLIC_CREATE_HOST,
      Host: process.env.NEXT_PUBLIC_CREATE_HOST,
      'x-createxyz-project-group-id': process.env.NEXT_PUBLIC_PROJECT_GROUP_ID,
    },
  });
});

// Google Maps Distance Matrix API proxy
app.get('/api/distance-matrix', async (c) => {
  const origins = c.req.query('origins');
  const destinations = c.req.query('destinations');
  const departure_time = c.req.query('departure_time');
  const traffic_model = c.req.query('traffic_model');
  const units = c.req.query('units');

  // Récupérer la clé API depuis les variables d'environnement (SÉCURISÉ)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Validation
  if (!apiKey) {
    console.error('❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in environment variables');
    return c.json({
      error: 'Server configuration error: Missing API key'
    }, 500);
  }

  if (!origins || !destinations) {
    return c.json({
      error: 'Missing required parameters: origins, destinations'
    }, 400);
  }

  try {
    // Construire l'URL de l'API Google Maps
    const googleMapsUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    googleMapsUrl.searchParams.set('origins', origins);
    googleMapsUrl.searchParams.set('destinations', destinations);
    googleMapsUrl.searchParams.set('key', apiKey);
    
    // Ajouter les paramètres optionnels s'ils existent
    if (departure_time) googleMapsUrl.searchParams.set('departure_time', departure_time);
    if (traffic_model) googleMapsUrl.searchParams.set('traffic_model', traffic_model);
    if (units) googleMapsUrl.searchParams.set('units', units);

    console.log(`🌐 Proxying request to Google Maps API: ${googleMapsUrl.toString()}`);

    // Faire l'appel à l'API Google Maps depuis le serveur
    const response = await fetch(googleMapsUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Maps API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`📊 Google Maps API response status:`, data.status);

    return c.json(data);

  } catch (error) {
    console.error('❌ Google Maps API Proxy Error:', error);
    
    return c.json({
      error: 'Failed to fetch from Google Maps API',
      details: error.message
    }, 500);
  }
});

// Handle CORS preflight for the distance matrix endpoint
app.options('/api/distance-matrix', (c) => {
  return c.text('', 200, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
});

app.route(API_BASENAME, api);

export default await createHonoServer({
  app,
  defaultLogger: false,
});
