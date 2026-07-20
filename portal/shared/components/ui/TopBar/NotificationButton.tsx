import React from 'react';
import { Bell, Hourglass } from 'lucide-react';
import { useNotification } from '@/providers/NotificationContext';

interface NotificationButtonProps {
  onClick?: () => void;
  className?: string;
  'data-test-id'?: string;
}

// test

const NotificationButton: React.FC<NotificationButtonProps> = ({
  onClick,
  className = '',
  'data-test-id': dataTestId
}) => {
  const { unreadCount, loading } = useNotification();
  
  // Usar el conteo real del contexto, 0 mientras carga
  const displayCount = loading.count ? 0 : unreadCount;
  return (
    <button
      type="button"
      onClick={onClick}
  className={`relative  rounded-full transition-colors text-foreground hover:text-secondary focus:outline-none ${className}`}
      data-test-id={dataTestId}
      aria-label="Notificaciones"
    >
      {loading.count ? (
        <Hourglass size={32} className="cursor-pointer" aria-hidden />
      ) : (
        <Bell size={32} className="cursor-pointer" aria-hidden />
      )}
      {displayCount > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[18px]">
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;