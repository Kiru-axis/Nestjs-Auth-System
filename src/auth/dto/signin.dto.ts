import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @Length(4)
  @IsNotEmpty()
  password: string;
}
