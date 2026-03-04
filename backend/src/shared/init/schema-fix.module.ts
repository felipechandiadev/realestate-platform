import { Module, Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
class SchemaFixService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      console.log('[SchemaFixService] schema-fix runner disabled: runtime ALTERs removed. Use DB migrations instead.');
      if (!this.dataSource.isInitialized) {
        try {
          await this.dataSource.initialize();
        } catch (e) {
          // ignore initialize errors
        }
      }
      // Do not apply schema changes at runtime here. If there are pending migrations,
      // inform the operator so they can run them via the standard migration tooling.
      if (typeof (this.dataSource as any).showMigrations === 'function') {
        try {
          const pending = await (this.dataSource as any).showMigrations();
          console.log('[SchemaFixService] pending migrations:', pending ? 'yes' : 'no');
        } catch (e) {
          console.log('[SchemaFixService] could not check migrations:', e.message || e);
        }
      }
    } catch (e) {
      try { console.warn('[SchemaFixService] schema fix check failed:', e.message || e); } catch {}
    }
  }
}

@Module({ providers: [SchemaFixService], exports: [] })
export class SchemaFixModule {}
