import React from 'react';
import { useTheme } from '../../context/ThemeContext.js';

export interface HbdLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'horizontal' | 'mark' | 'app-icon' | 'banner';
  mode?: 'dark' | 'light' | 'auto';
  format?: 'svg' | 'png';
  className?: string;
  alt?: string;
}

export const HbdLogo: React.FC<HbdLogoProps> = ({
  variant = 'horizontal',
  mode = 'auto',
  format = 'svg',
  className = '',
  alt = 'HBD — Home Board Designer',
  ...rest
}) => {
  const { themeMode } = useTheme();

  const isDark =
    mode === 'dark'
      ? true
      : mode === 'light'
      ? false
      : themeMode === 'dark' ||
        (themeMode === 'system' &&
          typeof window !== 'undefined' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);

  let src = '';

  if (variant === 'banner') {
    src = '/branding/banners/hbd-banner.png';
  } else if (variant === 'app-icon') {
    src = isDark
      ? '/branding/icons/hbd-app-icon-dark.png'
      : '/branding/icons/hbd-app-icon-light.png';
  } else if (variant === 'mark') {
    if (format === 'png') {
      src = isDark
        ? '/branding/logos/hbd-mark-dark.png'
        : '/branding/logos/hbd-mark-light.png';
    } else {
      src = isDark
        ? '/branding/logos/hbd-mark-dark.svg'
        : '/branding/logos/hbd-mark-light.svg';
    }
  } else {
    // horizontal logo
    if (format === 'png') {
      src = isDark
        ? '/branding/logos/hbd-logo-dark.png'
        : '/branding/logos/hbd-logo-light.png';
    } else {
      src = isDark
        ? '/branding/logos/hbd-logo-dark.svg'
        : '/branding/logos/hbd-logo-light.svg';
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`select-none object-contain ${className}`}
      draggable={false}
      {...rest}
    />
  );
};
