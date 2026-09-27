import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SharePropertyDto {
  @IsEmail({}, { message: 'Ingresa un correo válido' })
  to: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La nota no puede superar 500 caracteres' })
  note?: string;
}
