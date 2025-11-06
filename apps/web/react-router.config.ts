import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	routes: './src/app/routes.ts',
} satisfies Config;
