import { Injectable } from '@nestjs/common';
import { ErrorResponseInterface } from '@app/types/ErrorResponse.interface';

@Injectable()
export class AppService {
  normalizeErrors(errors: any): ErrorResponseInterface {
    const normalizedErrors = {};

    errors.forEach((err) => {
      normalizedErrors[err.title] = err.message;
    });

    return errors;
  }
}
