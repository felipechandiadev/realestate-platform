import React from 'react';

interface LogoProps {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  aspect?: { w: number; h: number };
  style?: React.CSSProperties;
}

const DEFAULT_LOGO_SRC = '/logo.svg';

const Logo: React.FC<LogoProps> = ({ src, alt = 'Logo', className, aspect = { w: 1, h: 1 }, style }) => {
  const logoSrc = src || DEFAULT_LOGO_SRC;
  const [imgError, setImgError] = React.useState(false);

  if (imgError) {
    return (
      <div
        className={`relative overflow-hidden ${className} aspect-[${aspect.w}/${aspect.h}]`}
        data-test-id="logo-root"
      >
        <div className="absolute inset-0 w-full h-full object-contain bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-lg font-bold">Logo</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className} aspect-[${aspect.w}/${aspect.h}]`}
      data-test-id="logo-root"
      style={style}
    >
      <img
        src={logoSrc}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
        data-test-id="logo-image"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export default Logo;
