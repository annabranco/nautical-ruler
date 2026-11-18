import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register(`${import.meta.env.BASE_URL}sw.js`, {
				scope: import.meta.env.BASE_URL,
			})
			.catch((error: unknown) => console.error('Service worker registration failed:', error));
	});
} else if ('serviceWorker' in navigator) {
	void navigator.serviceWorker
		.getRegistrations()
		.then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())));
	void caches
		.keys()
		.then((keys) => Promise.all(keys.filter((key) => key.startsWith('nautical-slide-ruler-')).map((key) => caches.delete(key))));
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
