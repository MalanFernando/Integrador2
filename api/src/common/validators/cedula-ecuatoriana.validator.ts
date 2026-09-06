import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'cedulaEcuatoriana', async: false })
export class CedulaEcuatorianaValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (!value || typeof value !== 'string') return false;

    const cedula = value.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cedula)) return false;

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(cedula[2], 10);
    if (tercerDigito > 6) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula[i], 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    const digitoVerificador = decenaSuperior - suma;

    return digitoVerificador === parseInt(cedula[9], 10);
  }

  defaultMessage(): string {
    return 'La cédula ecuatoriana no es válida';
  }
}
