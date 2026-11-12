export function readStored(key, fallback) {
  const saved = localStorage.getItem(key);
  if (saved === null) return fallback;

  try {
    const value = JSON.parse(saved);
    return value;
  } catch (error) {
    console.error(`Não foi possível ler os dados locais "${key}".`, error);
    return fallback;
  }
}

export function writeStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function localToday() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export function downloadCsv(filename, rows) {
  if (!rows.length) {
    window.alert("Não há dados para exportar.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.map(quote).join(";"),
    ...rows.map((row) => headers.map((header) => quote(row[header])).join(";")),
  ].join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
