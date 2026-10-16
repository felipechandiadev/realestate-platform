import { APP_AUTHOR, APP_FEATURES, APP_NAME, APP_RELEASE, APP_VERSION } from '@/shared/config/app-info';

export default function AboutPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Acerca de</h1>
        <p className="mt-1 text-sm text-foreground/70">
          {APP_NAME} v{APP_VERSION}
        </p>
        <p className="text-sm text-foreground/60">{APP_RELEASE}</p>
      </header>

      <section className="rounded-xl border border-border bg-background p-5">
        <h2 className="text-base font-semibold text-foreground">Qué incluye</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/80">
          {APP_FEATURES.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-background p-5">
        <h2 className="text-base font-semibold text-foreground">Desarrollado por</h2>
        <p className="mt-2 text-sm font-medium text-foreground">{APP_AUTHOR.name}</p>
        <p className="mt-2 text-sm">
          <a className="text-primary underline-offset-2 hover:underline" href={`mailto:${APP_AUTHOR.email}`}>
            {APP_AUTHOR.email}
          </a>
        </p>
        <p className="mt-1 text-sm">
          <a className="text-primary underline-offset-2 hover:underline" href={`tel:${APP_AUTHOR.phone}`}>
            {APP_AUTHOR.phoneLabel}
          </a>
        </p>
      </section>
    </div>
  );
}
