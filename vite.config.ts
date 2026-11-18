import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
	const repositoryOwner = process.env.GITHUB_REPOSITORY?.split('/')[0];
	const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
	const configuredBase = process.env.VITE_BASE_PATH;
	const configuredSiteUrl = process.env.VITE_SITE_URL;
	const base =
		configuredBase !== undefined
			? configuredBase
			: repositoryName && !repositoryName.endsWith('.github.io')
				? `/${repositoryName}/`
				: '/';
	const siteUrl =
		configuredSiteUrl?.replace(/\/?$/, '/') ||
		(repositoryOwner && repositoryName
			? `https://${repositoryOwner.toLowerCase()}.github.io${repositoryName.toLowerCase().endsWith('.github.io') ? '/' : `/${repositoryName}/`}`
			: undefined);
	const seoPlugin = {
		name: 'deployment-seo',
		transformIndexHtml(html: string) {
			if (!siteUrl) return html;
			const escapedSiteUrl = siteUrl.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
			const tags = [
				`<link rel="canonical" href="${escapedSiteUrl}" />`,
				`<meta property="og:url" content="${escapedSiteUrl}" />`,
				`<meta property="og:image" content="${escapedSiteUrl}og-image.png" />`,
				`<meta property="og:image:type" content="image/png" />`,
				`<meta property="og:image:width" content="1200" />`,
				`<meta property="og:image:height" content="630" />`,
				`<meta name="twitter:image" content="${escapedSiteUrl}og-image.png" />`,
			].join('\n    ');
			return html.replace('</head>', `    ${tags}\n  </head>`);
		},
		generateBundle(this: { emitFile: (asset: { type: 'asset'; fileName: string; source: string }) => void }) {
			if (!siteUrl) return;
			this.emitFile({
				type: 'asset',
				fileName: 'sitemap.xml',
				source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>`,
			});
			this.emitFile({
				type: 'asset',
				fileName: 'robots.txt',
				source: `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`,
			});
		},
	};

	return { base, plugins: [react(), seoPlugin] };
});
