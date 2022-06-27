import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ErrorResponseInterface } from '@app/types/ErrorResponse.interface';

@Injectable()
export class AppService {
  throwHttpException(
    errorTitle: string,
    errorMessage: string,
    errorStatus: HttpStatus,
  ): void {
    const normalizedErrors: ErrorResponseInterface = {
      errors: {
        [errorTitle]: errorMessage,
      },
    };

    throw new HttpException(normalizedErrors, errorStatus);
  }
}
