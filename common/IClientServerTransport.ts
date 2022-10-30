export interface IClientServerTransport {
    on(event: string, callback: (...args: any[]) => void);
    emit(event: string, ...args: any[]);
}