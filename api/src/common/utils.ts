export function withoutPassword<T extends { passwordHash: string }>(
  usuario: T,
): Omit<T, 'passwordHash'> {
  const profile = { ...usuario } as Partial<T>;
  delete profile.passwordHash;
  return profile as Omit<T, 'passwordHash'>;
}
