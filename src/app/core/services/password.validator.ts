import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Espejo de PASSWORD_REGEX en el backend
// (src/utilidades/compartido/password-policy.ts) — valida en el cliente
// para dar feedback inmediato; la validación real siempre ocurre en el servidor.
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;

export const PASSWORD_REGEX_MESSAGE =
  'Debe tener 8-128 caracteres, con mayúscula, minúscula, número y carácter especial (@$!%*?&)';

export function passwordSeguraValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    control.value && !PASSWORD_REGEX.test(control.value) ? { passwordInsegura: true } : null;
}

export function passwordsCoincidenValidator(
  claveControlName: string,
  confirmacionControlName: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const clave = group.get(claveControlName)?.value;
    const confirmacion = group.get(confirmacionControlName)?.value;
    return clave && confirmacion && clave !== confirmacion ? { passwordsNoCoinciden: true } : null;
  };
}
