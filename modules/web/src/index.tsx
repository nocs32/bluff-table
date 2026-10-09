import '@fontsource-variable/roboto-slab';
import '@fontsource-variable/rubik';
import './index.css';
import './stores/configure-mobx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { syncDocumentLanguage } from './services/document-language';
import { watchLayout } from './services/layout';
import { createRootStore } from './stores';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element in index.html');
}

const store = createRootStore();

// Development only: the root store as `window.bluffTable`, for poking at it from the console.
if (import.meta.env.DEV) {
  Object.assign(window, { bluffTable: store });
}

syncDocumentLanguage(store.locale);
watchLayout(store.ui.layout);
// Lettering drawn into the scene waits for the typefaces, then is drawn again.
void Promise.all([document.fonts.load('800 32px "Roboto Slab Variable"'), document.fonts.load('600 16px "Rubik Variable"')]).then(store.table.markFontsReady);
store.room.open();

createRoot(rootElement).render(
  <StrictMode>
    <App store={store} />
  </StrictMode>,
);
