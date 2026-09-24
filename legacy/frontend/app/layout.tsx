import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIdentity } from "@/features/backoffice/cms/actions/identity.action";


export async function generateMetadata(): Promise<Metadata> {
  try {
    const identity = await getIdentity();
    const title = identity?.name || "RealState Platform";
    return {
      title,
    };
  } catch (error) {
    console.error("Error fetching identity for metadata:", error);
    return {
      title: "RealState Platform",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="es">
      <head>
        {/* Preload Material Symbols fonts locally for faster icon rendering */}
        <link
          rel="preload"
          href="/fonts/Material_Symbols_Outlined/MaterialSymbolsOutlined-VariableFont_FILL,GRAD,opsz,wght.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Material_Symbols_Rounded/MaterialSymbolsRounded-VariableFont_FILL,GRAD,opsz,wght.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Material_Symbols_Sharp/MaterialSymbolsSharp-VariableFont_FILL,GRAD,opsz,wght.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ClientProviders session={session}>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
