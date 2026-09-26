// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://el37628.github.io',
	base: '/FluxFast-Docs',
	vite: {
		build: {
			rolldownOptions: {
				output: {
					// GitHub Pages caches HTML longer than it retains assets from the
					// previous deployment. Stable names keep cached pages usable while
					// the new deployment propagates through the CDN.
					assetFileNames: '_astro/[name][extname]',
					chunkFileNames: '_astro/[name].js',
					entryFileNames: '_astro/[name].js',
				},
			},
		},
		environments: {
			client: {
				build: {
					rolldownOptions: {
						output: {
							assetFileNames: '_astro/[name][extname]',
							chunkFileNames: '_astro/[name].js',
							entryFileNames: '_astro/[name].js',
						},
					},
				},
			},
		},
	},
	integrations: [
		starlight({
			title: 'FluxFast',
			titleDelimiter: '—',
			description:
				'Stable server-driven applications with FastAPI ownership and a reactive Next.js interface.',
			logo: {
				light: './src/assets/fluxfast-logo-light.png',
				dark: './src/assets/fluxfast-logo-dark.png',
				alt: 'FluxFast',
				replacesTitle: true,
			},
			favicon: '/fluxfast-icon.png',
			customCss: ['./src/styles/custom.css'],
			social: [
				{ icon: 'github', label: 'FluxFast on GitHub', href: 'https://github.com/El37628/FluxFast' },
			],
			editLink: {
				baseUrl: 'https://github.com/El37628/FluxFast-Docs/edit/main/',
			},
			lastUpdated: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			sidebar: [
				{ label: 'Introduction', slug: 'introduction' },
				{
					label: 'Start here',
					items: [
						{ label: 'Quickstart', slug: 'getting-started' },
						{ label: 'Architecture', slug: 'architecture' },
					],
				},
				{
					label: 'Build your application',
					items: [
						{ label: 'Resources and caching', slug: 'caching' },
						{ label: 'Deferred resources', slug: 'deferred-resources' },
						{ label: 'Live resources', slug: 'live-resources' },
						{ label: 'Mutations and forms', slug: 'mutations' },
						{ label: 'Application contracts', slug: 'contracts' },
						{ label: 'Type generation', slug: 'type-safety' },
						{ label: 'Client validation', slug: 'validation' },
					],
				},
				{
					label: 'Next.js integration',
					items: [
						{ label: 'Adapter and CLI', slug: 'nextjs-adapter' },
						{ label: 'Manual setup', slug: 'nextjs-manual-setup' },
						{ label: 'Generated artifacts', slug: 'generated-artifacts' },
					],
				},
				{
					label: 'Operate in production',
					items: [
						{ label: 'Production deployment', slug: 'production' },
						{ label: 'Distributed cache', slug: 'distributed-cache' },
						{ label: 'Live deployment', slug: 'live-deployment' },
						{ label: 'Containers', slug: 'containers' },
						{ label: 'Performance and benchmarks', slug: 'benchmarking' },
					],
				},
				{
					label: 'API reference',
					items: [
						{ label: 'Python API', slug: 'python-api' },
						{ label: '@fluxfast/core', slug: 'core-api' },
						{ label: '@fluxfast/next', slug: 'next-api' },
						{ label: 'Wire protocol', slug: 'protocol' },
						{ label: 'Developer schema', slug: 'developer-schema' },
					],
				},
				{
					label: 'Compatibility',
					items: [
						{ label: 'Stability guarantees', slug: 'stability' },
						{ label: 'Versioning', slug: 'versioning' },
						{ label: 'Migration guide', slug: 'migration' },
						{ label: 'Upgrade to v1.0', slug: 'upgrade-v1' },
					],
				},
			],
		}),
	],
});
