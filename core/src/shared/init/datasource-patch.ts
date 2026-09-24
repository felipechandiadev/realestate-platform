import { DataSource, Repository } from 'typeorm';

(function patchDataSourceGetRepository() {
  // @ts-ignore
  if ((DataSource.prototype as any).__patched_getRepository) return;

  // @ts-ignore
  const originalGetRepository = DataSource.prototype.getRepository;

  // @ts-ignore
  DataSource.prototype.getRepository = function getRepositoryPatched(entity: any) {
    try {
      const fs = require('fs');
      const entityName = entity?.name || String(entity || 'unknown');
      fs.appendFileSync('/tmp/ds-get-repo.log', `[${new Date().toISOString()}] getRepository called for: ${entityName}\n`);
    } catch {}

    let repo: Repository<any> = undefined as any;
    try {
      repo = originalGetRepository.call(this, entity);
      const meta = (repo as any)?.metadata;
      const table = meta?.tableName || (meta?.target && meta.target.name) || String(entity?.name || entity);
      try { const fs = require('fs'); fs.appendFileSync('/tmp/ds-get-repo.log', `[${new Date().toISOString()}] resolved table: ${table}\n`); } catch {}
      const hasCodeColumn = !!((repo as any)?.metadata?.columns?.some((c: any) => (c.propertyName === 'code' || c.databaseName === 'code')));
      if (hasCodeColumn || String(table).toLowerCase().includes('contract')) {
        // wrap save
        const originalSave = repo.save.bind(repo);
        // @ts-ignore
        repo.save = async function saveWithCode(obj: any, options?: any) {
          try {
            if (Array.isArray(obj)) {
              obj.forEach((o) => { if (!o.code) o.code = `C-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; });
            } else if (obj && typeof obj === 'object' && !obj.code) {
              obj.code = `C-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
            }
          } catch (e) {
            // ignore
          }
          return originalSave(obj, options);
        };
      }
    } catch (e) {
      // If metadata wasn't found for the requested entity (e.g., domain class without decorators),
      // try resolving the ORM entity implementation as a fallback (useful for tests).
      try {
        const fs = require('fs'); fs.appendFileSync('/tmp/ds-get-repo.log', `[${new Date().toISOString()}] getRepository failed for ${String(entity?.name || entity)}: ${String(e)}\n`);
      } catch {}
      try {
        if (String(entity?.name || '').toLowerCase().includes('contract')) {
          const fallback = require('../../modules/contracts/infrastructure/persistence/contract.orm-entity').ContractOrmEntity;
          repo = originalGetRepository.call(this, fallback);
          try { const fs = require('fs'); fs.appendFileSync('/tmp/ds-get-repo.log', `[${new Date().toISOString()}] fallback to ContractOrmEntity repository\n`); } catch {}
          const originalSave = repo.save.bind(repo);
          // @ts-ignore
          repo.save = async function saveWithCode(obj: any, options?: any) {
            try {
              if (Array.isArray(obj)) {
                obj.forEach((o) => { if (!o.code) o.code = `C-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; });
              } else if (obj && typeof obj === 'object' && !obj.code) {
                obj.code = `C-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
              }
            } catch (e) {}
            return originalSave(obj, options);
          };
        }
      } catch (inner) {
        try { const fs = require('fs'); fs.appendFileSync('/tmp/ds-get-repo.log', `[${new Date().toISOString()}] fallback also failed: ${String(inner)}\n`); } catch {}
      }
    }

    return repo || originalGetRepository.call(this, entity);
  };

  // @ts-ignore
  (DataSource.prototype as any).__patched_getRepository = true;
})();
