import projectSymbols from '../design/meridian/project-symbols.json';
export const paths={
 ...projectSymbols,
 meridian:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M12 1v3m0 16v3"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 moon:'<path d="M20 14a9 9 0 0 1-10-11A9 9 0 1 0 20 14Z"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 warning:'<path d="m12 3 10 18H2Zm0 6v5m0 3h.01"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 book:'<path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 1-3-1-5-2-9-1Z"/>',
 layers:'<path d="m12 3 10 6-10 6L2 9Zm-10 10 10 6 10-6M2 17l10 6 10-6"/>',
 leaf:'<path d="M20 3c-9 0-16 4-16 10a7 7 0 0 0 7 7c6 0 9-8 9-17ZM4 20l11-11"/>'
};
export const icon=(name,size=24)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
