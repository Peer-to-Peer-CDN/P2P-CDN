export interface IClientServerTransport {
    on(event: string, callback: (...args: any[]) => void): any;
    emit(event: string, ...args: any[]): any;
}