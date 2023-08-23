import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

import * as dayjs from 'dayjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PasswordService {
  constructor(private prisma: PrismaService) {}

  async createResetToken(userId: number) {
    // random hex codes
    const resetToken = randomBytes(40).toString('hex');

    //hash the  random hex codes
    const hashedResetToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // reset is only valid for 10 minues
    const passwordChangedAt = dayjs().toDate();
    const passwordResetTokenExiresAt = dayjs().add(10, 'minutes').toDate();

    // // update the user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordChangedAt,
        passwordResetTokenExiresAt,
        passwordResetToken: hashedResetToken,
      },
    });

    return { resetToken };
  }
}
