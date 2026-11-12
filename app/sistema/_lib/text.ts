function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// "Patín artístico" → "patin-artistico".
export function slugify(text: string): string {
  return stripAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Lowercase and without accents, so "perez" finds "Pérez".
export function searchable(text: string): string {
  return stripAccents(text).toLowerCase().trim();
}
