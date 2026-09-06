export function withoutPassword<T extends { passwordHash: string }>(
  usuario: T,
): Omit<T, 'passwordHash'> {
  const profile = { ...usuario } as Partial<T>;
  delete profile.passwordHash;
  return profile as Omit<T, 'passwordHash'>;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}
