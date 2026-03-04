import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export const metadata: Metadata = {
  title: "RealState Platform",

};

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
