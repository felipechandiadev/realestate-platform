'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Dialog, DeleteDialog, TextField } from '@realestate/ui';
import { useAlert } from '@/providers/AlertContext';
import { createAgentKey, revokeAgentKey } from '../actions/agent-keys.action';
import type { AgentKeyDto, AgentScope } from '../infrastructure/agent-keys.request';

const SCOPE_OPTIONS: Array<{ value: AgentScope; label: string; help: string; locked?: boolean }> = [
  { value: 'properties:read', label: 'Leer', help: 'Ver propiedades, catálogos y fichas.', locked: true },
  { value: 'properties:write', label: 'Crear y editar', help: 'Crear propiedades, editarlas y subir imágenes. No elimina.' },
  { value: 'properties:publish', label: 'Publicar', help: 'Dejar propiedades en estado PUBLICADA (visibles en el portal).' },
];

const SCOPE_LABEL: Record<AgentScope, string> = {
  'properties:read': 'Leer',
  'properties:write': 'Crear y editar',
  'properties:publish': 'Publicar',
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function keyState(k: AgentKeyDto): { label: string; variant: 'success' | 'error' | 'warning' } {
  if (k.revokedAt) return { label: 'Revocada', variant: 'error' };
  if (k.expiresAt && new Date(k.expiresAt).getTime() <= Date.now()) return { label: 'Vencida', variant: 'warning' };
  return { label: 'Activa', variant: 'success' };
}

interface Props {
  initialKeys: AgentKeyDto[];
  mcpUrl: string;
}

export function AgentKeysContent({ initialKeys, mcpUrl }: Props) {
  const router = useRouter();
  const alert = useAlert();
  const [pending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<AgentScope[]>(['properties:read', 'properties:write']);
  const [expiresAt, setExpiresAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [created, setCreated] = useState<{ name: string; token: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toRevoke, setToRevoke] = useState<AgentKeyDto | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setScopes(['properties:read', 'properties:write']);
    setExpiresAt('');
    setFormError(null);
  };

  const toggleScope = (scope: AgentScope) =>
    setScopes((prev) => {
      const next = prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope];
      // Publicar implica poder editar: se marca solo, y al quitar "editar" se quita "publicar".
      if (scope === 'properties:publish' && next.includes(scope) && !next.includes('properties:write')) next.push('properties:write');
      if (scope === 'properties:write' && !next.includes(scope)) return next.filter((s) => s !== 'properties:publish');
      return next;
    });

  const submit = () => {
    setFormError(null);
    startTransition(async () => {
      const res = await createAgentKey({
        name,
        scopes,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : undefined,
      });
      if (!res.success) {
        setFormError(res.error);
        return;
      }
      setCreateOpen(false);
      setCreated({ name: res.data.name, token: res.data.token });
      resetForm();
      router.refresh();
    });
  };

  const confirmRevoke = () => {
    if (!toRevoke) return;
    setRevokeError(null);
    startTransition(async () => {
      const res = await revokeAgentKey(toRevoke.id);
      if (!res.success) {
        setRevokeError(res.error);
        return;
      }
      alert.success(`Key de "${toRevoke.name}" revocada`);
      setToRevoke(null);
      router.refresh();
    });
  };

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      alert.error('No se pudo copiar; selecciona el texto y cópialo a mano');
    }
  };

  const mcpConfig = created
    ? JSON.stringify({ mcpServers: { inmobiliaria: { url: mcpUrl, headers: { Authorization: `Bearer ${created.token}` } } } }, null, 2)
    : '';

  return (
    <div className="space-y-6 w-full" data-test-id="ai-agents-page">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-2xl font-semibold text-foreground">Agentes de IA</h1>
          <p className="text-sm text-muted-foreground">
            Cada agente (Grok, Claude u otro) se conecta con su propia key y actúa con tu cuenta de administrador.
            Todo lo que haga queda en el historial de la propiedad como «Agente IA». Si desactivas tu cuenta, sus keys dejan de funcionar.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setCreateOpen(true); }} data-test-id="ai-agents-new">Nuevo agente</Button>
      </div>

      <div className="rounded-lg border border-border bg-background p-4 text-sm space-y-1">
        <div className="font-medium text-foreground">Dirección del servidor MCP</div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded bg-neutral px-2 py-1 break-all">{mcpUrl}</code>
          <Button size="sm" variant="outlined" onClick={() => copy('url', mcpUrl)}>{copied === 'url' ? 'Copiada' : 'Copiar'}</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-background">
        <table className="w-full text-sm" data-test-id="ai-agents-table">
          <thead className="text-left text-muted-foreground border-b border-border">
            <tr>
              <th className="p-3">Agente</th>
              <th className="p-3">Key</th>
              <th className="p-3">Permisos</th>
              <th className="p-3">Último uso</th>
              <th className="p-3">Vence</th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {initialKeys.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Aún no hay agentes. Crea el primero con «Nuevo agente».</td></tr>
            )}
            {initialKeys.map((k) => {
              const st = keyState(k);
              const active = st.label === 'Activa';
              return (
                <tr key={k.id} className="border-b border-border last:border-0">
                  <td className="p-3 font-medium text-foreground">{k.name}</td>
                  <td className="p-3"><code>{k.keyPrefix}…</code></td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => <Badge key={s} variant={s === 'properties:publish' ? 'warning-outlined' : 'primary-outlined'}>{SCOPE_LABEL[s] ?? s}</Badge>)}
                    </div>
                  </td>
                  <td className="p-3">{fmt(k.lastUsedAt)}</td>
                  <td className="p-3">{k.expiresAt ? fmt(k.expiresAt) : 'Sin vencimiento'}</td>
                  <td className="p-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                  <td className="p-3 text-right">
                    {active && (
                      <button type="button" className="text-sm text-red-600" onClick={() => { setRevokeError(null); setToRevoke(k); }}>
                        Revocar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={createOpen}
        onClose={() => !pending && setCreateOpen(false)}
        title="Nuevo agente de IA"
        description="Elige qué puede hacer. Podrás revocarlo cuando quieras."
        size="md"
        alertArea={formError ? <div className="text-sm text-red-600">{formError}</div> : undefined}
        actionsJustify="end"
        actions={
          <>
            <Button variant="outlined" onClick={() => setCreateOpen(false)} disabled={pending}>Cancelar</Button>
            <Button onClick={submit} disabled={pending || !name.trim()}>{pending ? 'Creando…' : 'Crear agente'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Nombre del agente" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Grok corredor" />
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground mb-1">Permisos</legend>
            {SCOPE_OPTIONS.map((o) => (
              <label key={o.value} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={scopes.includes(o.value)}
                  disabled={o.locked}
                  onChange={() => toggleScope(o.value)}
                />
                <span>
                  <span className="font-medium text-foreground">{o.label}</span>
                  <span className="block text-muted-foreground">{o.help}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Vence (opcional)</span>
            <input
              type="date"
              className="mt-1 block rounded border border-border bg-background px-3 py-2"
              min={new Date().toISOString().slice(0, 10)}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </label>
        </div>
      </Dialog>

      <Dialog
        open={!!created}
        onClose={() => setCreated(null)}
        title={`Key de «${created?.name ?? ''}»`}
        description="Cópiala ahora: por seguridad no se vuelve a mostrar."
        size="lg"
        persistent
        actionsJustify="end"
        actions={<Button onClick={() => setCreated(null)}>Ya la copié</Button>}
      >
        {created && (
          <div className="space-y-4 text-sm">
            <div>
              <div className="font-medium text-foreground mb-1">Key</div>
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-neutral px-2 py-1 break-all" data-test-id="ai-agents-token">{created.token}</code>
                <Button size="sm" variant="outlined" onClick={() => copy('token', created.token)}>{copied === 'token' ? 'Copiada' : 'Copiar key'}</Button>
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">Configuración para el cliente MCP</div>
              <pre className="rounded bg-neutral p-3 overflow-x-auto text-xs">{mcpConfig}</pre>
              <Button size="sm" variant="outlined" onClick={() => copy('cfg', mcpConfig)}>{copied === 'cfg' ? 'Copiada' : 'Copiar configuración'}</Button>
            </div>
            <p className="text-muted-foreground">
              Las imágenes no viajan por MCP: el agente las sube por HTTP con esta misma key. Las instrucciones exactas se las entrega la herramienta
              <code> get_image_upload_instructions</code>.
            </p>
          </div>
        )}
      </Dialog>

      <DeleteDialog
        open={!!toRevoke}
        onClose={() => !pending && setToRevoke(null)}
        onConfirm={confirmRevoke}
        isSubmitting={pending}
        title="Revocar key"
        confirmLabel="Revocar"
        message={<>El agente «{toRevoke?.name}» dejará de poder conectarse de inmediato. Lo que ya hizo no se deshace. Esta acción no se puede revertir.</>}
        errors={revokeError ? [revokeError] : []}
      />
    </div>
  );
}
