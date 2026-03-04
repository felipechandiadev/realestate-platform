import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon: string;
	variant?: "primary" | "secondary" | "outlined" | "text";
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	className?: string;
}

const variantClasses: Record<string, string> = {
	primary: "btn-contained-primary cursor-pointer",
	secondary: "btn-contained-secondary cursor-pointer",
	outlined: "btn-outlined cursor-pointer",
	text: "btn-text cursor-pointer",
};

const sizePixels: Record<string, number> = {
	xs: 16,
	sm: 22,
	md: 28,
	lg: 32,
	xl: 36,
};

const sizePadding: Record<string, string> = {
	xs: "p-1",
	sm: "p-1", 
	md: "p-1.5",
	lg: "p-2",
	xl: "p-2.5",
};

const IconButton: React.FC<IconButtonProps> = ({
	icon,
	variant = "primary",
	size = "sm",
	className = "",
	...props
}) => {
	const iconSize = sizePixels[size];
	const padding = sizePadding[size];
	
	return (
		<button
			className={`inline-flex items-center justify-center ${padding} rounded-full ${variantClasses[variant] || variantClasses.primary} ${className}`}
			{...props}
		>
			<span 
				className="material-symbols-outlined" 
				aria-hidden="true"
				style={{ fontSize: `${iconSize}px` }}
			>
				{icon}
			</span>
		</button>
	);
};

export default IconButton;
