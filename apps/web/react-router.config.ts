import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: false, // Désactiver SSR pour Vercel (SPA mode)
} satisfies Config;
