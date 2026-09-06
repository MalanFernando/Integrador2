import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as dns from 'dns';

@ValidatorConstraint({ name: 'emailReal', async: true })
export class EmailRealValidator implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    if (!value || typeof value !== 'string') return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) return false;

    const domain = value.split('@')[1];
    if (!domain) return false;

    const disposableDomains = [
      'tempmail.com',
      'throwaway.email',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com',
      'trashmail.com',
      'fakeinbox.com',
      'sharklasers.com',
      'guerrillamailblock.com',
    ];
    if (disposableDomains.includes(domain.toLowerCase())) return false;

    try {
      const addresses = await dns.promises.resolveMx(domain);
      return addresses && addresses.length > 0;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'El correo electrónico no es válido o el dominio no existe';
  }
}
