export class ErrorMessage {
    message: string;
    source: any;
    constructor(errorMessage?: string, errorSource?: any) {
        (this.message = errorMessage), (this.source = errorSource);
    }
}
