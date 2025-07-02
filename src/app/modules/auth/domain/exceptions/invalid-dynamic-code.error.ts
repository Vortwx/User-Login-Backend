export class InvalidDynamicCodeError extends Error {
    constructor(message: string = 'Invalid or expired dynamic code.') {
        super(message);
        this.name = 'InvalidDynamicCodeError';
    }
}
