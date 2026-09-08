function escapeCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv(
  filename: string,
  columns: { key: string; label: string }[],
  rows: Record<string, unknown>[],
): void {
  const header = columns.map((c) => escapeCsvValue(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvValue(row[c.key])).join(','),
  );
  const csv = '﻿' + [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface PrintSection {
  heading?: string;
  columns: { key: string; label: string }[];
  rows: Record<string, unknown>[];
}

/**
 * Abre una ventana con una tabla lista para imprimir/guardar como PDF
 * (el usuario elige "Guardar como PDF" en el diálogo nativo de impresión).
 */
export function exportToPrintView(
  title: string,
  sections: PrintSection[],
  subtitle?: string,
): void {
  const win = window.open('', '_blank');
  if (!win) return;

  const sectionsHtml = sections
    .map((s) => {
      const thead = s.columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
      const tbody = s.rows
        .map(
          (row) =>
            `<tr>${s.columns.map((c) => `<td>${escapeHtml(row[c.key])}</td>`).join('')}</tr>`,
        )
        .join('');
      return `
        ${s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : ''}
        <table>
          <thead><tr>${thead}</tr></thead>
          <tbody>${tbody || '<tr><td colspan="' + s.columns.length + '">Sin datos</td></tr>'}</tbody>
        </table>
      `;
    })
    .join('');

  win.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { color: #555; font-size: 13px; margin-bottom: 24px; }
          h2 { font-size: 15px; margin-top: 28px; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; text-align: left; }
          th { background: #f2f2f2; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ''}
        ${sectionsHtml}
        <script>window.onload = () => window.print();</script>
      </body>
    </html>
  `);
  win.document.close();
}
