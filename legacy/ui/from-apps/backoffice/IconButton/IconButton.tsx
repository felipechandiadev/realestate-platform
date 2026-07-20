import React from "react";
import * as LucideIcons from "lucide-react";
import { ICON_MAP } from "./ICON_MAP";

type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

interface IconButtonProps {
	icon: string; // nombre del icono material-symbols (se convierte a Lucide)
	variant?: "containedPrimary" | "containedSecondary" | "text" | "basic" | "basicPrimary" | "basicSecondary" | "outlined";
	size?: IconButtonSize;
	disabled?: boolean;
	isLoading?: boolean;
	className?: string;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	ariaLabel?: string;
	[key: string]: any;
}

const variantClasses: Record<string, string> = {
	containedPrimary: "icon-button-contained-primary",
	containedSecondary: "icon-button-contained-secondary",
	text: "icon-button-text",
	basic: "icon-button-basic",
	basicPrimary: "icon-button-basic-primary",
	basicSecondary: "icon-button-basic-secondary",
	outlined: "icon-button-outlined",
};

const sizeMap: Record<Exclude<IconButtonSize, number>, string> = {
  xs: 'icon-size-xs w-5 h-5',
  sm: 'icon-size-sm w-7 h-7',
  md: 'icon-size-md w-10 h-10',
  lg: 'icon-size-lg w-12 h-12',
  xl: 'icon-size-xl w-14 h-14',
};

/**
 * Get Lucide icon component by name
 * Returns the component or null if not found
 */
function getLucideIcon(iconName: string): React.ComponentType<any> | null {
	const mappedName = ICON_MAP[iconName] || 'HelpCircle';
	const IconComponent = (LucideIcons as any)[mappedName];
	return IconComponent || (LucideIcons as any).HelpCircle;
}

const IconButton: React.FC<IconButtonProps> = ({ 
	icon, 
	variant = "containedPrimary", 
	size = 'md', 
	disabled = false, 
	isLoading = false, 
	className = "", 
	onClick, 
	ariaLabel, 
	...props 
}) => {
	const sizeClass = typeof size === 'number' ? `w-[${size + 16}px] h-[${size + 16}px]` : sizeMap[size] || sizeMap['md'];
	const effectiveDisabled = disabled || isLoading;
	const disabledClass = effectiveDisabled ? 'icon-button-disabled' : '';
	
	// Get icon size for Lucide (base size without padding)
	const iconSizeMap: Record<Exclude<IconButtonSize, number>, number> = {
		xs: 16,
		sm: 20,
		md: 24,
		lg: 28,
		xl: 32,
	};
	const iconSize = typeof size === 'number' ? size : iconSizeMap[size] || 24;
	
	// Get Lucide icon component
	const IconComponent = getLucideIcon(isLoading ? 'progress_activity' : icon);
	
	return (
		<button
			type="button"
			className={`${variantClasses[variant] || variantClasses["containedPrimary"]} ${disabledClass} ${className} ${sizeClass}`}
			data-test-id="icon-button-root"
			onClick={onClick}
			aria-label={ariaLabel}
			disabled={effectiveDisabled}
			{...props}
		>
			{IconComponent && (
				<IconComponent
					size={iconSize}
					className={`select-none ${isLoading ? 'animate-spin' : ''}`}
					aria-hidden
				/>
			)}
		</button>
	);
};

export default IconButton;