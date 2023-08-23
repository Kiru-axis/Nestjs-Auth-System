import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaFilter implements ExceptionFilter {
  catch(exc: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exc.code === 'P2002') {
      return res
        .status(HttpStatus.CONFLICT)
        .json({
          success: false,
          msg: `${exc.meta?.target} is already taken. Please try another one`,
        });
    }
  }
}
