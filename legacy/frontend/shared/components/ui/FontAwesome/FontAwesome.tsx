'use client'
import React from 'react';

interface FontAwesomeProps {
  icon: string;
  style?: 'solid' | 'regular' | 'light' | 'duotone' | 'brands';
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl';
  color?: string;
  className?: string;
  onClick?: () => void;
  spin?: boolean;
  pulse?: boolean;
  fixedWidth?: boolean;
  border?: boolean;
  pull?: 'left' | 'right';
  transform?: string;
  mask?: string;
  symbol?: string | boolean;
  title?: string;
  ["data-test-id"]?: string;
}

export default function FontAwesome({
  icon,
  style = 'solid',
  size,
  color,
  className = '',
  onClick,
  spin = false,
  pulse = false,
  fixedWidth = false,
  border = false,
  pull,
  transform,
  mask,
  symbol,
  title,
  ["data-test-id"]: dataTestId,
}: FontAwesomeProps) {
  // Map style to FontAwesome class prefix
  const stylePrefix = {
    solid: 'fas',
    regular: 'far',
    light: 'fal',
    duotone: 'fad',
    brands: 'fab',
  }[style];

  // Build className array
  const classes = [
    stylePrefix,
    `fa-${icon}`,
    size && `fa-${size}`,
    spin && 'fa-spin',
    pulse && 'fa-pulse',
    fixedWidth && 'fa-fw',
    border && 'fa-border',
    pull && `fa-pull-${pull}`,
    transform && `fa-transform-${transform}`,
    mask && `fa-mask fa-${mask}`,
    symbol && (typeof symbol === 'string' ? `fa-symbol-${symbol}` : 'fa-symbol'),
    className,
  ].filter(Boolean).join(' ');

  const styleObj = color ? { color } : {};

  return (
    <i
      className={classes}
      style={styleObj}
      onClick={onClick}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-test-id={dataTestId}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    />
  );
}
