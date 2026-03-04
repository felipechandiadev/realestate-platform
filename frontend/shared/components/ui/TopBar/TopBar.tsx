'use client'
import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import SideBar, { SideBarMenuItem } from './SideBar';
import { SidebarMenuStateProvider } from './SidebarMenuStateContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getUnreadNotificationsCount } from '@/features/backoffice/notifications/actions/notifications.action';

interface TopBarProps {
  title?: string;
  logoSrc?: string;
  className?: string;
  onMenuClick?: () => void;
  SideBarComponent?: React.ComponentType<{ onClose: () => void }>;
  menuItems?: SideBarMenuItem[]; // if provided, TopBar will render SideBar internally
  userName?: string;
  showNotifications?: boolean;
}

interface SideBarControl {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const SideBarContext = React.createContext<SideBarControl>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function useSideBar() {
  return useContext(SideBarContext);
}

const TopBar: React.FC<TopBarProps> = ({
  title = '',
  logoSrc,
  className,
  SideBarComponent,
  menuItems = [],
  userName,
  showNotifications = false
}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [sidebarOpenState, setSidebarOpenState] = useState<Record<string, boolean>>({});
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const { data: session } = useSession();
  const router = useRouter();

  // Fetch unread notifications count if showNotifications is true
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchCount = async () => {
      if (showNotifications && session?.user?.id) {
        try {
          const count = await getUnreadNotificationsCount(session.user.id);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread notifications count:', error);
        }
      }
    };

    if (showNotifications && session?.user?.id) {
      fetchCount();
      // Polling every 60 seconds
      interval = setInterval(fetchCount, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showNotifications, session?.user?.id]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('backoffice:sidebar-open-state');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, boolean>;
        if (parsed && typeof parsed === 'object') {
          setSidebarOpenState(parsed);
        }
      }
    } catch (error) {
      console.warn('No se pudo restaurar el estado del menú lateral:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('backoffice:sidebar-open-state', JSON.stringify(sidebarOpenState));
    } catch (error) {
      console.warn('No se pudo guardar el estado del menú lateral:', error);
    }
  }, [sidebarOpenState]);

  const open = () => setShowSidebar(true);
  const close = () => setShowSidebar(false);

  const toggleSidebarSection = useCallback((id: string) => {
    setSidebarOpenState((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setSidebarSectionState = useCallback((id: string, isOpen: boolean) => {
    setSidebarOpenState((prev) => {
      if (prev[id] === isOpen) {
        return prev;
      }
      return { ...prev, [id]: isOpen };
    });
  }, []);

  const replaceSidebarState = useCallback((nextState: Record<string, boolean>) => {
    setSidebarOpenState(nextState);
  }, []);

  const sidebarMenuStateValue = useMemo(() => ({
    openItems: sidebarOpenState,
    toggleItem: toggleSidebarSection,
    setItemState: setSidebarSectionState,
    replaceState: replaceSidebarState,
  }), [sidebarOpenState, toggleSidebarSection, setSidebarSectionState, replaceSidebarState]);

  return (
    <SidebarMenuStateProvider value={sidebarMenuStateValue}>
      <SideBarContext.Provider value={{ open, close, isOpen: showSidebar }}>
        <div data-test-id="top-bar-root">
          <header className={`fixed top-0 z-30 w-full flex items-center justify-between px-10 py-2 pb-3 bg-background border-b-[2px] border-primary ${className}`}>
            <div className="flex items-center gap-3">
              {logoSrc && (
                <>
                  {!logoLoaded && !logoError && (
                    <div className="h-10 w-10 bg-neutral-300 rounded-lg animate-pulse" data-test-id="top-bar-logo-skeleton" />
                  )}
                  {!logoError && (
                    <Image
                      src={logoSrc}
                      alt="Logo"
                      width={40}
                      height={40}
                      className={`h-10 w-10 object-contain transition-opacity duration-300 ${!logoLoaded ? 'opacity-0 absolute' : 'opacity-100'}`}
                      data-test-id="top-bar-logo"
                      onLoadingComplete={() => setLogoLoaded(true)}
                      onError={() => setLogoError(true)}
                    />
                  )}
                </>
              )}
              <span className="text-lg font-bold text-foreground" data-test-id="top-bar-title">{title}</span>
            </div>

            {/* Right side elements */}
            <div className="flex items-center gap-2">
              {/* Notification Alert Icon */}
              {showNotifications && (
                <button
                  type="button"
                  onClick={() => router.push('/backOffice/notifications')}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors text-foreground hover:text-primary focus:outline-none"
                  aria-label="Ver notificaciones"
                >
                  <span className="material-symbols-outlined text-2xl">
                    notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-1 ring-background">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* User name */}
              {userName && (
                <span className="text-sm font-weight-300 text-foreground" data-test-id="top-bar-user-name">
                  {userName}
                </span>
              )}

              {/* Menu button */}
              <button
                type="button"
                onClick={open}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-colors text-foreground hover:text-secondary focus:outline-none"
                data-test-id="top-bar-menu-button"
                aria-label="Abrir menú"
              >
                <span className="material-symbols-outlined text-2xl" aria-hidden>
                  menu
                </span>
              </button>
            </div>
          </header>
          {/* Renderizar SideBar como modal, solo si showSidebar está activo */}
          {showSidebar && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/10"
                onClick={close}
                aria-label="Cerrar menú lateral"
                data-test-id="sidebar-overlay"
              />
              <SideBar menuItems={menuItems} onClose={close} logoUrl={logoSrc} />
            </>
          )}
          {/* Children se renderizan fuera de TopBar, en el layout */}
        </div>
      </SideBarContext.Provider>
    </SidebarMenuStateProvider>
  );
};

export default TopBar;
