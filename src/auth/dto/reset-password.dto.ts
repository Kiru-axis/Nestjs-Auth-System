import { IsNotEmpty, Length } from 'class-validator';

export class ResetPasswordDto {
  @Length(4)
  @IsNotEmpty()
  password: string;
}
