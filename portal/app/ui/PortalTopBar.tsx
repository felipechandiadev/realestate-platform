import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Bell, Building2, Heart, FileText, Home, ChevronDown, ChevronUp, LogOut, LogIn, UserPlus, Mail, Phone } from "lucide-react";
import { IconButton } from "@realestate/ui";
import { Button } from "@realestate/ui";
import { Dialog } from "@realestate/ui";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { getIdentity } from "@/features/cms/actions/identity.action";
import { getLatestUfValue } from "@/features/shared/common/actions/uf.action";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotification } from "@/providers/NotificationContext";
import ContactDialog from "@/shared/components/ui/ContactDialog/ContactDialog";
import {
  FALLBACK_PORTAL_HEADER,
  visibleNavItems,
  type PortalAccountItem,
  type PortalHeaderConfig,
  type PortalNavItem,
} from "./portal-header";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface Identity {
  id?: string;
  name: string;
  address: string;
  phone: string;
  mail: string;
  businessHours: string;
  urlLogo?: string;
}

function formatCLP(value: number) {
  return value.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

interface TopBarProps {
  onMenuClick?: () => void;
  initialIdentity?: Identity | Record<string, unknown> | null;
  initialHeader?: PortalHeaderConfig | null;
  uf?: number;
}

function asIdentity(value: TopBarProps['initialIdentity']): Identity | null {
  if (!value || typeof value !== 'object') return null;
  const name = 'name' in value && typeof value.name === 'string' ? value.name.trim() : '';
  if (!name && !('urlLogo' in value)) return null;
  return value as Identity;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  identity: Identity | null;
  logoSrc: string;
  showCompanyName: boolean;
  navItems: PortalNavItem[];
  accountItems: PortalAccountItem[];
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onContact: () => void;
  showLogin: boolean;
  showRegister: boolean;
  loginLabel: string;
  registerLabel: string;
  isUserLoggedIn?: boolean;
  userName?: string;
}

const ACCOUNT_ICONS: Record<string, typeof User> = {
  'mis-datos': User,
  notificaciones: Bell,
  'mis-propiedades': Building2,
  favoritos: Heart,
  'mis-contratos': FileText,
};

// Sidebar Component
function Sidebar({ open, onClose, identity, logoSrc, showCompanyName, navItems, accountItems, onLoginClick, onRegisterClick, onContact, showLogin, showRegister, loginLabel, registerLabel, isUserLoggedIn = false, userName = "" }: SidebarProps) {
  const router = useRouter();
  const { unreadCount } = useNotification();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    router.push(path);
    setOpenMenu(null);
    onClose();
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleBlur = (e: React.FocusEvent<HTMLLIElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setOpenMenu(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-transparent z-35 transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className="fixed left-0 top-0 h-full w-64 bg-white/60 backdrop-blur backdrop-saturate-150 z-50 shadow-xl transform transition-transform duration-300 ease-in-out border border-white/20 flex flex-col"
        id="portal-sidebar"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col items-center justify-center p-4 text-center gap-2 flex-shrink-0">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={identity?.name ? `Logo de ${identity.name}` : 'Logo'}
              className="w-12 h-12 object-contain"
            />
          ) : null}
          {showCompanyName && identity?.name?.trim() ? (
            <span className="font-medium text-foreground text-sm">
              {identity.name.trim()}
            </span>
          ) : null}
        </div>

          {isUserLoggedIn && (
          <div className="mx-4 p-3 bg-primary/5 border border-primary/10 rounded-xl mb-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={20} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Bienvenido(a)</span>
                <span className="text-sm font-bold text-foreground truncate max-w-[140px]">
                  {userName || 'Usuario'}
                </span>
              </div>
            </div>
          </div>
          )}

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <nav className="w-full">
            <ul className="flex flex-col gap-2 pb-4">
          {isUserLoggedIn && accountItems.some((item) => item.enabled) && (
            <>
              {accountItems.filter((item) => item.enabled).map((item) => {
                const Icon = ACCOUNT_ICONS[item.id] ?? User;
                return (
                  <li key={item.id}>
                    <button onClick={() => handleNavigation(item.href)} className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon size={20} className="text-primary" />
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'notificaciones' && unreadCount > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
              <li className="my-2 px-3">
                <div className="h-[1px] bg-border w-full opacity-60" />
              </li>
            </>
          )}

          <li>
            <button onClick={() => handleNavigation('/')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
              <Home size={20} className="text-primary" />
              <span>Inicio</span>
            </button>
          </li>

          {visibleNavItems(navItems).map((item) => {
            if (item.children?.length) {
              return (
                <li key={item.id} className="relative" onBlur={handleBlur}>
                  <button onClick={() => toggleMenu(item.id)} className="flex items-center justify-between w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                    <span>{item.label}</span>
                    {openMenu === item.id ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
                  </button>
                  {openMenu === item.id && (
                    <ul className="mt-2 ml-6 space-y-1 border-l-2 border-primary/10 pl-2">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button onClick={() => child.href && handleNavigation(child.href)} className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-tight text-[11px]">
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (item.action === 'contact') {
                      onContact();
                      onClose();
                      return;
                    }
                    if (item.href) handleNavigation(item.href);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide"
                >
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
            </ul>
          </nav>
        </div>

        {(isUserLoggedIn || showLogin || showRegister) && (
        <div className="p-4 border-t border-border">
          {isUserLoggedIn ? (
            <Button
              variant="outlined"
              className="w-full justify-start"
              onClick={() => { signOut({ redirect: true, callbackUrl: '/' }); onClose(); }}
            >
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          ) : (
            <div className="space-y-3">
              {showLogin ? (
              <Button
                variant="outlined"
                className="w-full justify-start"
                onClick={() => { onLoginClick(); onClose(); }}
              >
                <LogIn size={16} className="mr-2" />
                {loginLabel}
              </Button>
              ) : null}
              {showRegister ? (
              <Button
                variant="primary"
                className="w-full justify-start"
                onClick={() => { onClose(); onRegisterClick(); }}
              >
                <UserPlus size={16} className="mr-2" />
                {registerLabel}
              </Button>
              ) : null}
            </div>
          )}
        </div>
        )}
      </div>
    </>
  );
}

export default function PortalTopBar({ onMenuClick, initialIdentity = null, initialHeader = null, uf = 34879 }: TopBarProps) {
  const { data: session } = useSession();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    const openLogin = () => setLoginDialogOpen(true);
    window.addEventListener('portal:open-login', openLogin);
    return () => window.removeEventListener('portal:open-login', openLogin);
  }, []);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(() => asIdentity(initialIdentity));
  const [logoFailed, setLogoFailed] = useState(false);
  const [ufValue, setUfValue] = useState<number | null>(null);
  const [isUfLoading, setIsUfLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadTopBarData() {
      const tasks: Promise<unknown>[] = [getLatestUfValue()];
      if (!asIdentity(initialIdentity)) {
        tasks.push(getIdentity());
      }

      const [ufResult, identityResult] = await Promise.allSettled(tasks);

      if (ignore) {
        return;
      }

      if (identityResult && identityResult.status === 'fulfilled' && identityResult.value) {
        setIdentity(identityResult.value as Identity);
      } else if (identityResult && identityResult.status === 'rejected') {
        console.error('Error loading identity:', identityResult.reason);
      }

      if (ufResult.status === 'fulfilled' && typeof ufResult.value === 'number' && Number.isFinite(ufResult.value)) {
        setUfValue(ufResult.value);
      } else {
        const errorReason = ufResult.status === 'rejected' ? ufResult.reason : 'UF value unavailable';
        console.error('Error loading UF value:', errorReason);
        setUfValue(uf);
      }

      setIsUfLoading(false);
    }

    loadTopBarData();

    return () => {
      ignore = true;
    };
  }, [initialIdentity, uf]);

  const header = initialHeader ?? FALLBACK_PORTAL_HEADER;
  const identityLogoSrc = identity?.urlLogo?.trim() || '';
  const headerLogoSrc = !logoFailed ? header.logoUrl?.trim() || '' : '';
  const companyName = identity?.name?.trim() || '';
  const companyMail = header.showMail ? identity?.mail?.trim() || '' : '';
  const companyPhone = header.showPhone ? identity?.phone?.trim() || '' : '';

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
    onMenuClick?.();
  }, [onMenuClick]);

  return (
    <React.Fragment>
      {/* Sidebar for mobile */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        identity={identity}
        logoSrc={headerLogoSrc}
        showCompanyName={header.showCompanyName}
        navItems={header.navItems}
        accountItems={header.accountItems}
        onLoginClick={() => setLoginDialogOpen(true)}
        onRegisterClick={() => setRegisterDialogOpen(true)}
        onContact={() => setContactOpen(true)}
        showLogin={header.showLogin}
        showRegister={header.showRegister}
        loginLabel={header.loginLabel}
        registerLabel={header.registerLabel}
        isUserLoggedIn={!!session?.user}
        userName={session?.user?.name || ""}
      />

      {/* Main TopBar */}
      <div
        className="flex items-center h-12 md:h-16 w-full bg-background sm:px-8 box-border"
        data-test-id="topBar"
      >
        {/* Izquierda: logo y nombre empresa, ambos al inicio */}
        <Link href="/" className="flex items-center gap-3 ml-4 hover:opacity-80 transition-opacity" data-test-id="topBarLogo">
          {headerLogoSrc ? (
            <img
              src={headerLogoSrc}
              alt={companyName ? `Logo de ${companyName}` : 'Logo'}
              className="w-10 h-10 object-contain"
              data-test-id="topBarLogo"
              onError={() => setLogoFailed(true)}
            />
          ) : null}
          {header.showCompanyName && companyName ? (
            <span className="text-base md:text-lg lg:text-2xl font-medium text-foreground whitespace-nowrap">
              {companyName}
            </span>
          ) : null}
        </Link>

        {/* Centro: contacto y teléfono */}
        {(companyMail || companyPhone) && (
        <div className="hidden lg:flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-6 justify-center">
            {companyMail ? (
            <a 
              href={`mailto:${companyMail}`}
              className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap hover:text-primary transition-colors"
            >
              <Mail size={16} />
              {companyMail}
            </a>
            ) : null}
            {companyPhone ? (
            <a 
              href={`tel:${companyPhone}`}
              className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap hover:text-primary transition-colors"
            >
              <Phone size={16} />
              {companyPhone}
            </a>
            ) : null}
          </div>
        </div>
        )}

        <div className="ml-auto flex items-center gap-2 pr-4" data-test-id="topBarActions">
          {/* Hide UF on small screens (xs/sm) - will be shown in sidebar */}
          {header.showUf ? (
          <span className="hidden md:inline text-main text-xs font-normal whitespace-nowrap">
            {isUfLoading ? `${header.ufLabel}: ...` : `${header.ufLabel}: ${formatCLP(ufValue ?? uf)}`}
          </span>
          ) : null}

          {/* Show user info when logged in, otherwise show login/register buttons */}
          {session?.user ? (
            // Usuario logueado: mostrar nombre + ícono
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="h-6 w-px bg-foreground mx-2" />
              <User size={16} className="text-primary" />
              <span className="text-xs text-foreground">
                {session.user.name?.split(' ')[0] || 'Usuario'}
              </span>
            </div>
          ) : (
            // Usuario no logueado: mostrar botones de login/register
            <div className="hidden sm:flex items-center gap-1 text-right">
              {header.showLogin ? (
                <>
                  <div className="h-6 w-px bg-foreground mx-2" />
                  <Button variant="text" className="text-xs text-foreground px-2" onClick={() => setLoginDialogOpen(true)}>
                    {header.loginLabel}
                  </Button>
                </>
              ) : null}
              {header.showRegister ? (
                <>
                  <div className="h-6 w-px bg-foreground mx-2" />
                  <Button variant="text" className="text-xs text-foreground px-2" onClick={() => setRegisterDialogOpen(true)}>
                    {header.registerLabel}
                  </Button>
                </>
              ) : null}
            </div>
          )}

          {/* Menu button for xs/sm screens - opens sidebar, or for md+ when logged in */}
          <IconButton
            variant="basic"
            className={`ml-2 ${session?.user ? 'md:flex' : 'sm:hidden'}`}
            onClick={toggleSidebar}
            icon="menu"
            aria-expanded={sidebarOpen}
            aria-controls="portal-sidebar"
          />
        </div>

        {/* Login Dialog */}
        <Dialog
          open={loginDialogOpen}
          onClose={() => setLoginDialogOpen(false)}
          title="Iniciar Sesión"
          size="xs"
        >
          <LoginForm
            logoSrc={identityLogoSrc}
            companyName={companyName}
            onClose={() => setLoginDialogOpen(false)}
            onRegisterClick={() => {
              setLoginDialogOpen(false);
              setRegisterDialogOpen(true);
            }}
          />
        </Dialog>

        {/* Register Dialog */}
        <Dialog
          open={registerDialogOpen}
          onClose={() => setRegisterDialogOpen(false)}
          title="Crear Cuenta"
          size="xs"
        >
          <RegisterForm 
            onClose={() => setRegisterDialogOpen(false)}
            onRegisterClick={() => {
              setRegisterDialogOpen(false);
              setLoginDialogOpen(true);
            }}
          />
        </Dialog>
        <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    </React.Fragment>
  );
}
