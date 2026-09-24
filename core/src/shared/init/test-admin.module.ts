import { Module, Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
class TestAdminService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      if (process.env.NODE_ENV !== 'test') return;
      const repo = this.dataSource.getRepository('users');
      const existing = await repo.findOne({ where: { email: 'admin@realestate.com' } });
      if (!existing) {
        const password = '7890';
        const hash = await bcrypt.hash(password, 12);
        const toSave = {
          username: 'admin',
          email: 'admin@realestate.com',
          password: hash,
          role: 'ADMIN',
          status: 'ACTIVE',
        };
        await repo.save(toSave as any);
        try { const fs = require('fs'); fs.appendFileSync('/tmp/test-admin.log', `[${new Date().toISOString()}] Created test admin\n`); } catch {}
      }
    } catch (e) {
      try { const fs = require('fs'); fs.appendFileSync('/tmp/test-admin.log', `[${new Date().toISOString()}] test-admin error: ${String(e)}\n`); } catch {}
    }
  }
}

@Module({ providers: [TestAdminService], exports: [] })
export class TestAdminModule {}
