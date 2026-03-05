"use client";
import PortalTopBar from "./ui/PortalTopBar";
import PortalFooter from "./ui/PortalFooter";
import Wsp from "./ui/Wsp";
import CookieConsent from "./ui/CookieConsent";
import NavBar from "./ui/NavBar";
import { CookieConsentProvider } from "@/providers/CookieConsentContext";

type PortalLayoutProps = {
  children: React.ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {


  return (
    <CookieConsentProvider>
      <div className="min-h-screen flex flex-col relative">
        <CookieConsent />
        
        {/* Header sticky (TopBar + NavBar) */}
        <div className="sticky top-0 z-50">
          <PortalTopBar
          // onMenuClick={() => setSidebarOpen(true)} 

          />
          
          {/* NavBar */}
          <div className="bg-background shadow-[0_4px_8px_-4px_rgba(0,0,0,0.12)]">
            <NavBar />
          </div>
        </div>
      
        
        {/* <VisitorSideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}
        <main className="flex-1">
          {children}
        </main>
        <PortalFooter />
        <Wsp />
      </div>
    </CookieConsentProvider>
  );
}


