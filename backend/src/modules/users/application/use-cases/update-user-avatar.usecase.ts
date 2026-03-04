import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';

@Injectable()
export class UpdateUserAvatarUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly multimediaService: MultimediaService,
  ) {}

  async execute(id: string, file: Express.Multer.File): Promise<any> {
    const user = await this.userRepo.findOne({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (jpeg, png, webp) are allowed');
    }

    try {
      if (user.personalInfo?.avatarUrl) {
        await this.multimediaService.deleteFileByUrl(user.personalInfo.avatarUrl);
      }
    } catch {
      // ignore
    }

    const publicUrl = await this.multimediaService.uploadFileToPath(file, 'users');
    if (!user.personalInfo) user.personalInfo = {} as any;
      user.personalInfo!.avatarUrl = publicUrl;
    return this.userRepo.save(user as any);
  }
}
