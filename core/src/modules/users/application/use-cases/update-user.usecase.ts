import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UpdateUserDto } from '../../dto/user.dto';
import { User } from '../../domain/user.entity';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado.');

    if (dto.username && dto.username !== user.username) {
      const exists = await this.userRepo.findOne({ where: { username: dto.username } });
      if (exists) throw new ConflictException('El nombre de usuario ya está registrado.');
    }
    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException('El correo ya está registrado.');
    }

    // personalInfo es un JSON: se combina con lo guardado para que un update
    // parcial (p. ej. sin avatarUrl) no borre los campos que no vienen.
    const { personalInfo, ...rest } = dto;
    Object.assign(user, rest);
    if (personalInfo) {
      // El ValidationPipe puede dejar en `undefined` las claves no enviadas: no deben pisar lo guardado.
      const provided = Object.fromEntries(
        Object.entries(personalInfo).filter(([, value]) => value !== undefined),
      );
      user.personalInfo = { ...(user.personalInfo ?? {}), ...provided } as User['personalInfo'];
    }
    return this.userRepo.save(user);
  }
}
