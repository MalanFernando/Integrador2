export interface CurrentUserInfo {
    id: string;
    email: string;
    rol: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
