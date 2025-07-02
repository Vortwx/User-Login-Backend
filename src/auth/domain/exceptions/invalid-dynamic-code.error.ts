export class InvalidDynamicCodeError extends Error {
    constructor(message: string = 'Invalid or expired Dynamic Code.') {
        super(message);
        this.name = 'InvalidDynamicCodeError';
    }
}
