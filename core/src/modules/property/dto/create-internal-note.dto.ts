import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_INTERNAL_NOTE_LENGTH } from '../domain/internal-note';

export class CreateInternalNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_INTERNAL_NOTE_LENGTH)
  text!: string;
}
