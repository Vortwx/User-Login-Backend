import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

function containsUpperCase(str: string) {
    return Array.from(str).some((char) => char >= 'A' && char <= 'Z');
}

function containsLowerCase(str: string) {
    return Array.from(str).some((char) => char >= 'a' && char <= 'z');
}

function containsDigit(str: string) {
    return Array.from(str).some((char) => char >= '0' && char <= '9');
}

// Allow any printable special character
function containsSpecialCharacter(str: string) {
    const specialChars = `!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;
    return Array.from(str).some((char) => specialChars.includes(char));
}

function isDigitOnly(str: string) {
    return Array.from(str).every((char) => char >= '0' && char <= '9');
}

export function ContainsUppercase(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'containsUppercase',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return containsUpperCase(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must contain at least one uppercase letter.`;
                },
            },
        });
    };
}

export function ContainsLowercase(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'containsLowercase',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return containsLowerCase(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must contain at least one lowercase letter.`;
                },
            },
        });
    };
}

export function ContainsDigit(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'containsDigit',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return containsDigit(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must contain at least one number.`;
                },
            },
        });
    };
}

export function ContainsSpecialCharacter(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'containsSpecialCharacter',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return containsSpecialCharacter(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must contain at least one special character (@$!%*?&).`;
                },
            },
        });
    };
}

export function IsDigitOnly(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isDigitOnly',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') {
                        return false;
                    }

                    return isDigitOnly(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must contain only digits.`;
                },
            },
        });
    };
}
