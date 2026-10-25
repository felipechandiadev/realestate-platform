"use client";
import { useCallback, useEffect, useState } from "react";
import PortalTopBar from "./ui/PortalTopBar";
import PortalFooter from "./ui/PortalFooter";
import Wsp from "./ui/Wsp";
import NavBar from "./ui/NavBar";
import { FALLBACK_PORTAL_HEADER, type PortalHeaderConfig } from "./ui/portal-header";
import { FALLBACK_PORTAL_FOOTER, type PortalFooterConfig } from "./ui/portal-footer";
import { getPortalHeader } from "@/features/cms/actions/portal-header.action";
import { getPortalFooter } from "@/features/cms/actions/portal-footer.action";

type PortalLayoutProps = {
  children: React.ReactNode;
  initialIdentity?: Record<string, unknown> | null;
  initialHeader?: PortalHeaderConfig | null;
  initialFooter?: PortalFooterConfig | null;
};

export default function PortalLayout({
  children,
  initialIdentity = null,
  initialHeader = null,
  initialFooter = null,
}: PortalLayoutProps) {
  const [header, setHeader] = useState<PortalHeaderConfig>(initialHeader ?? FALLBACK_PORTAL_HEADER);
  const [footer, setFooter] = useState<PortalFooterConfig>(initialFooter ?? FALLBACK_PORTAL_FOOTER);

  const refreshCms = useCallback(async () => {
    try {
      const [nextHeader, nextFooter] = await Promise.all([getPortalHeader(), getPortalFooter()]);
      setHeader(nextHeader);
      setFooter(nextFooter);
    } catch {
      // keep current config
    }
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshCms();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshCms]);

  return (
      <div className="min-h-screen flex flex-col relative">
        {/* Header sticky (TopBar + NavBar) */}
        <div id="portal-sticky-header" className="sticky top-0 z-50">
          <PortalTopBar initialIdentity={initialIdentity} initialHeader={header} />
          
          {/* NavBar (solo desde md: en móvil los mismos enlaces están en el menú lateral) */}
          <div
            className="hidden md:block shadow-[0_4px_8px_-4px_rgba(0,0,0,0.12)]"
            style={{ backgroundColor: 'var(--color-navbar-background)', color: 'var(--color-navbar-foreground)' }}
          >
            <NavBar navItems={header.navItems} />
          </div>
        </div>
      
        
        {/* <VisitorSideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}
        <main className="flex-1">
          {children}
        </main>
        <PortalFooter initialIdentity={initialIdentity} config={footer} />
        <Wsp />
      </div>
  );
}
