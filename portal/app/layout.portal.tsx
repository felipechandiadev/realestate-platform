"use client";
import PortalTopBar from "./ui/PortalTopBar";
import PortalFooter from "./ui/PortalFooter";
import Wsp from "./ui/Wsp";
import CookieConsent from "./ui/CookieConsent";
import NavBar from "./ui/NavBar";
import { CookieConsentProvider } from "@/providers/CookieConsentContext";
import { FALLBACK_PORTAL_HEADER, type PortalHeaderConfig } from "./ui/portal-header";

type PortalLayoutProps = {
  children: React.ReactNode;
  initialIdentity?: Record<string, unknown> | null;
  initialHeader?: PortalHeaderConfig | null;
};

export default function PortalLayout({ children, initialIdentity = null, initialHeader = null }: PortalLayoutProps) {
  const header = initialHeader ?? FALLBACK_PORTAL_HEADER;
  return (
    <CookieConsentProvider>
      <div className="min-h-screen flex flex-col relative">
        <CookieConsent />
        
        {/* Header sticky (TopBar + NavBar) */}
        <div className="sticky top-0 z-50">
          <PortalTopBar initialIdentity={initialIdentity} initialHeader={header} />
          
          {/* NavBar */}
          <div className="bg-background shadow-[0_4px_8px_-4px_rgba(0,0,0,0.12)]">
            <NavBar navItems={header.navItems} />
          </div>
        </div>
      
        
        {/* <VisitorSideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}
        <main className="flex-1">
          {children}
        </main>
        <PortalFooter initialIdentity={initialIdentity} />
        <Wsp />
      </div>
    </CookieConsentProvider>
  );
}


