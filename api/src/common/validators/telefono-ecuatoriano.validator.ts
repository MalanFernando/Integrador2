import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'telefonoEcuatoriano', async: false })
export class TelefonoEcuatorianoValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value || typeof value !== 'string') return false;

    const telefono = value.replace(/[\s\-()]/g, '');

    if (/^\+593\d{9}$/.test(telefono)) return true;
    if (/^0\d{9}$/.test(telefono)) return true;
    if (/^593\d{9}$/.test(telefono)) return true;

    return false;
  }

  defaultMessage(): string {
    return 'El número de teléfono no es válido. Use formato: +593XXXXXXXXX o 0XXXXXXXXX';
  }
}
