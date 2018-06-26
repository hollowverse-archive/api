import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/** Custom validator to check if a string starts with a particular sequence of characters */
@ValidatorConstraint()
export class StartsWith implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return text.startsWith(args.constraints[0]);
  }

  defaultMessage(args: ValidationArguments) {
    return `Must start with ${args.constraints[0]}`;
  }
}
