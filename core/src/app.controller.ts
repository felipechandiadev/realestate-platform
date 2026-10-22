import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JweAuthGuard } from './modules/auth/jwe/jwe-auth.guard';
import { Public } from './modules/auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  @UseGuards(JweAuthGuard)
  getProtected(@Req() req): any {
    return {
      message: 'Acceso autorizado',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }
}
