export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "1.5rem",
        background: "#E8F5E9",
        color: "#1B5E20",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="Bravo" width={96} height={96} />
      <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>Sin conexión</h1>
      <p style={{ margin: 0, maxWidth: "22rem", opacity: 0.85 }}>
        No hay red disponible. Revisa tu conexión e intenta de nuevo.
      </p>
    </main>
  );
}
