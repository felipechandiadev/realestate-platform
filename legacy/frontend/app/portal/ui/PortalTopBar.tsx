import React, { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, Bell, Building2, Heart, FileText, Home, ChevronDown, ChevronUp, LogOut, LogIn, UserPlus, Mail, Phone } from "lucide-react";
import IconButton from "@/shared/components/ui/IconButton/IconButton";
import { Button } from "@/shared/components/ui/Button/Button";
import Dialog from "@/shared/components/ui/Dialog/Dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { getIdentity } from "@/features/backoffice/cms/actions/identity.action";
import { getLatestUfValue } from "@/features/shared/common/actions/uf.action";
import { useRouter } from 'next/navigation';
import NavBar from "./NavBar";
import { useNotification } from "@/providers/NotificationContext";

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
  nombreEmpresa?: string;
  uf?: number;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  identity: Identity | null;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isUserLoggedIn?: boolean;
  userName?: string;
}

// Sidebar Component
function Sidebar({ open, onClose, identity, onLoginClick, onRegisterClick, isUserLoggedIn = false, userName = "" }: SidebarProps) {
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
          {identity?.urlLogo ? (
            <img
              src={identity.urlLogo}
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
          ) : null}
          <span className="font-medium text-foreground text-sm">
            {identity?.name || ""}
          </span>
        </div>

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

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          <nav className="w-full">
            <ul className="flex flex-col gap-2 pb-4">
              {isUserLoggedIn && (
                <>
                  <li>
                    <button onClick={() => handleNavigation('/portal/personalInfo')} className="flex items-center justify-between w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <User size={20} className="text-primary" />
                        <span>Mis Datos</span>
                      </div>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/portal/notifications')} className="flex items-center justify-between w-full px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors group">
                      <div className="flex items-center gap-3">
                        <Bell size={20} className="text-primary" />
                        <span>Notificaciones</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/portal/myProperties')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <Building2 size={20} className="text-primary" />
                      <span>Mis Propiedades</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/portal/favorites')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <Heart size={20} className="text-primary" />
                      <span>Favoritos</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigation('/portal/myContracts')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <FileText size={20} className="text-primary" />
                      <span>Mis Contratos</span>
                    </button>
                  </li>
                  <li className="my-2 px-3">
                    <div className="h-[1px] bg-border w-full opacity-60" />
                  </li>
                </>
              )}

              <li>
                <button onClick={() => handleNavigation('/portal')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                  <Home size={20} className="text-primary" />
                  <span>Inicio</span>
                </button>
              </li>

              <li className="relative" onBlur={handleBlur}>
                <button onClick={() => toggleMenu('propiedades')} className="flex items-center justify-between w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                  <span>Propiedades</span>
                  {openMenu === 'propiedades' ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
                </button>
                {openMenu === 'propiedades' && (
                  <ul className="mt-2 ml-6 space-y-1 border-l-2 border-primary/10 pl-2">
                    <li><button onClick={() => handleNavigation('/portal/properties/sale')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-tight text-[11px]">Ventas</button></li>
                    <li><button onClick={() => handleNavigation('/portal/properties/rent')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-tight text-[11px]">Arriendos</button></li>
                    <li><button onClick={() => handleNavigation('/portal/services/management')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-tight text-[11px]">Administraciones</button></li>
                  </ul>
                )}
              </li>

              <li className="relative" onBlur={handleBlur}>
                <button onClick={() => toggleMenu('nosotros')} className="flex items-center justify-between w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                  <span>Nosotros</span>
                  {openMenu === 'nosotros' ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-primary" />}
                </button>
                {openMenu === 'nosotros' && (
                  <ul className="mt-2 ml-6 space-y-1 border-l-2 border-primary/10 pl-2">
                    <li><button onClick={() => handleNavigation('/portal/aboutUs')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-tight text-[11px]">Quiénes somos</button></li>
                    <li><button onClick={() => handleNavigation('/portal/ourTeam')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-tight text-[11px]">Nuestro Equipo</button></li>
                    <li><button onClick={() => handleNavigation('/portal/testimonials')} className="w-full text-left px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-tight text-[11px]">Testimonios</button></li>
                  </ul>
                )}
              </li>

              <li>
                <button onClick={() => handleNavigation('/portal/sell-property')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                  <span>Vende tu Propiedad</span>
                </button>
              </li>

              <li>
                <button onClick={() => handleNavigation('/portal/rent-property')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                  <span>Arrienda tu Propiedad</span>
                </button>
              </li>

              <li>
                <button onClick={() => handleNavigation('/portal/valuation')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                  <span>Valoriza tu Propiedad</span>
                </button>
              </li>
              
              <li>
                <button onClick={() => handleNavigation('/portal/blog')} className="flex items-center gap-3 w-full text-left px-3 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors uppercase tracking-wide">
                  <span>Blog</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          {isUserLoggedIn ? (
            <Button
              variant="outlined"
              className="w-full justify-start"
              onClick={() => { signOut({ redirect: true, callbackUrl: '/portal' }); onClose(); }}
            >
              <LogOut size={16} className="mr-2" />
              Cerrar Sesión
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                variant="outlined"
                className="w-full justify-start"
                onClick={() => { onLoginClick(); onClose(); }}
              >
                <LogIn size={16} className="mr-2" />
                Ingresar
              </Button>
              <Button
                variant="primary"
                className="w-full justify-start"
                onClick={() => { onClose(); onRegisterClick(); }}
              >
                <UserPlus size={16} className="mr-2" />
                Registrarse
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PortalTopBar({ onMenuClick, nombreEmpresa = "Plataforma Inmobiliaria", uf = 34879 }: TopBarProps) {
  const { data: session } = useSession();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [logoLoading, setLogoLoading] = useState(true);
  const [ufValue, setUfValue] = useState<number | null>(null);
  const [isUfLoading, setIsUfLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadTopBarData() {
      const [identityResult, ufResult] = await Promise.allSettled([
        getIdentity(),
        getLatestUfValue(),
      ]);

      if (ignore) {
        return;
      }

      if (identityResult.status === 'fulfilled' && identityResult.value) {
        setIdentity(identityResult.value);
      } else if (identityResult.status === 'rejected') {
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
  }, []);

  useEffect(() => {
    setLogoError(false);
    setLogoLoading(true);
  }, [identity?.urlLogo]);

  const handleLogoLoad = () => {
    setLogoLoading(false);
  };

  const handleLogoError = () => {
    setLogoLoading(false);
    setLogoError(true);
  };

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
        onLoginClick={() => setLoginDialogOpen(true)}
        onRegisterClick={() => setRegisterDialogOpen(true)}
        isUserLoggedIn={!!session?.user}
        userName={session?.user?.name || ""}
      />

      {/* Main TopBar */}
      <div
        className="flex items-center h-12 md:h-16 w-full bg-background sm:px-8 box-border"
        data-test-id="topBar"
      >
        {/* Izquierda: icono imagen y nombre empresa */}
        <div className="flex items-center gap-3 ml-4" data-test-id="topBarLogo">
          {logoLoading && (
            <div
              className="h-10 w-10 rounded-lg bg-neutral-200 animate-pulse"
              data-test-id="top-bar-logo-skeleton"
            />
          )}
          {!logoError && (
            <img
              src={identity?.urlLogo || "/PropLogo2.png"}
              alt="Logo"
              className={`w-10 h-10 object-contain ${logoLoading ? "hidden" : ""}`}
              data-test-id="topBarLogo"
              onLoad={handleLogoLoad}
              onError={handleLogoError}
            />
          )}
          <span className="text-base md:text-lg lg:text-2xl font-medium text-foreground whitespace-nowrap">
            {identity?.name || ""}
          </span>
        </div>

        {/* Centro: contacto y teléfono */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-1">
          <div className="flex items-center gap-6 justify-center">
            <a 
              href={`mailto:${identity?.mail || "contacto@empresa.cl"}`}
              className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap hover:text-primary transition-colors"
            >
              <Mail size={16} />
              {identity?.mail || "contacto@empresa.cl"}
            </a>
            <a 
              href={`tel:${identity?.phone || "+56912345678"}`}
              className="flex items-center gap-1 text-xs text-foreground whitespace-nowrap hover:text-primary transition-colors"
            >
              <Phone size={16} />
              {identity?.phone || "+56 9 1234 5678"}
            </a>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 pr-4" data-test-id="topBarActions">
          {/* Hide UF on small screens (xs/sm) - will be shown in sidebar */}
          <span className="hidden md:inline text-main text-xs font-normal whitespace-nowrap">
            {isUfLoading ? 'UF hoy: ...' : `UF hoy: ${formatCLP(ufValue ?? uf)}`}
          </span>

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
              <div className="h-6 w-px bg-foreground mx-2" />
              <Button variant="text" className="text-xs text-foreground px-2" onClick={() => setLoginDialogOpen(true)}>
                Ingresar
              </Button>
              <div className="h-6 w-px bg-foreground mx-2" />
              <Button variant="text" className="text-xs text-foreground px-2" onClick={() => setRegisterDialogOpen(true)}>
                Registrarse
              </Button>
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
            logoSrc={identity?.urlLogo || "/PropLogo2.png"}
            companyName={identity?.name}
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
      </div>
    </React.Fragment>
  );
}
