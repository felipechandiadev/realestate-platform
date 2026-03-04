"use client";
import React from "react";
import { Button } from "@/shared/components/ui/Button/Button";
import DotProgress from "@/shared/components/ui/DotProgress/DotProgress";
import Alert from "@/shared/components/ui/Alert/Alert";
import { Trash2 } from "lucide-react";

export interface DeleteBaseFormProps {
    message: string;
    onSubmit: () => void;
    isSubmitting?: boolean;
    title?: string;
    subtitle?: string;
    submitLabel?: string;
    errors?: string[];
    ["data-test-id"]?: string;
    cancelButton?: boolean;
    cancelButtonText?: string;
    onCancel?: () => void;
    /**
     * Modo nested: Oculta títulos, reduce paddings, oculta actions.
     * Usar cuando el form está dentro de un Dialog que ya maneja estos elementos.
     * @default false
     */
    nested?: boolean;
    /**
     * ID del form para permitir submit desde botón externo (ej: en Dialog.actions).
     * Útil cuando nested=true y los botones están en el Dialog.
     * @example <form id="my-form" /> + <button form="my-form" type="submit" />
     */
    formId?: string;
}

const DeleteBaseForm: React.FC<DeleteBaseFormProps> = ({
    message,
    onSubmit,
    isSubmitting = false,
    title = "Confirmar eliminación",
    subtitle,
    submitLabel,
    errors = [],
    cancelButton = false,
    cancelButtonText = "Cerrar",
    onCancel,
    nested = false,
    formId,
    ...props
}) => {
    const dataTestId = props["data-test-id"];

    // Clases dinámicas según modo nested
    const formClass = nested 
        ? "w-full"  // Sin padding ni flex cuando está en Dialog (el contenido interno maneja su spacing)
        : "form-container";              // Con p-4 cuando es standalone
    
    const showTitleSection = !nested && (title || subtitle);
    const showActions = !nested;

    return (
        <form
            id={formId}
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className={formClass}
            data-test-id={dataTestId || "delete-base-form-root"}
        >
			{showTitleSection && (
				<div className="flex flex-col gap-0">
					{title && title !== "" && (
						<div className="title p-1 pb-0 w-full mb-0 leading-tight">{title}</div>
					)}
					{subtitle && subtitle !== "" && (
						<div className="subtitle p-1 pt-0 w-full mb-0 leading-snug">{subtitle}</div>
					)}
				</div>
			)}
            <div className="p-4 space-y-4">
                <div className="mb-4 flex flex-col gap-4">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center border border-red-400 shadow-lg self-center">
                        <Trash2 size={42} color="#dc2626" />
                    </div>
                    <div className="w-full">
                        <p className="text-sm font-normal leading-relaxed text-foreground break-words w-full">
                            {message}
                        </p>
                    </div>
                </div>
            </div>

            {showActions && (
                <div className="form-actions">
                    <div />
                    <div className="flex gap-2">
                        {cancelButton && onCancel && (
                            <Button
                                variant="outlined"
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                <div className="flex items-center justify-center min-h-[20px]">
                                    {cancelButtonText}
                                </div>
                            </Button>
                        )}
                        {isSubmitting ? (
                            <Button
                                variant="primary"
                                type="submit"
                                disabled
                                className="border border-red-500 text-red-600 bg-white"
                            >
                                <div className="flex items-center justify-center min-h-[20px]">
                                    <DotProgress size={12} />
                                </div>
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                type="submit"
                                className="border border-red-500 text-red-600 bg-white hover:bg-red-50 font-semibold"
                            >
                                <div className="flex items-center justify-center min-h-[20px]">
                                    {submitLabel ?? "Eliminar permanentemente"}
                                </div>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {errors.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                    {errors.map((err, i) => (
                        <Alert key={i} variant="error">{err}</Alert>
                    ))}
                </div>
            )}
        </form>
    );
};

export default DeleteBaseForm;
