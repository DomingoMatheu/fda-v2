// "1 cuota", "3 cuotas": a count with its noun in singular or plural.
export function countLabel(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
