import React from 'react';
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
      <span
        className="material-symbols-outlined cursor-pointer"
        style={{ fontSize: 32, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        aria-hidden
      >
        {loading.count ? 'hourglass_empty' : 'notifications'}
      </span>
      {displayCount > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[18px]">
          {displayCount > 99 ? '99+' : displayCount}
        </span>
      )}
    </button>
  );
};

export default NotificationButton;