import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @Length(4)
  @IsNotEmpty()
  password: string;
}
