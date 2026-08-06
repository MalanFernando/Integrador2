export declare function withoutPassword<T extends {
    passwordHash: string;
}>(usuario: T): Omit<T, 'passwordHash'>;
