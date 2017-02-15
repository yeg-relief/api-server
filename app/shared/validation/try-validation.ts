import { IValidateable } from '../interfaces'

export function tryValidation(validatableObject: IValidateable): boolean {
  let valid: boolean;
  try {
    if (validatableObject.validate()) {
      valid = true;
    } else {
      valid = false;
    }
  } catch (error) {
    console.error(error)
    valid = false;
  } finally {
    return valid;
  }
}