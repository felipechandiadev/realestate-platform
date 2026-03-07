"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TextField } from "../TextField/TextField";
import AutoComplete from "../AutoComplete/AutoComplete";
import { Button } from "../Button/Button";
import DotProgress from "../DotProgress/DotProgress";
import Alert from "../Alert/Alert";
import Switch from "../Switch/Switch";
import Select from "../Select/Select";
import RangeSlider from "../RangeSlider/RangeSlider";
import CreateLocationPicker from "../LocationPicker/LocationPickerWrapper";
import { MultimediaUploader } from "../FileUploader/MultimediaUploader";

type FormValues = Record<string, unknown>;

export interface BaseFormOption {
	id: string | number;
	label: string;
	[key: string]: unknown;
}

type FieldRenderFn = (props: {
	name: string;
	label: string;
	value: unknown;
	onChange: (value: unknown) => void;
	field: BaseFormField;
	values: FormValues;
}) => React.ReactNode;

export interface BaseFormField {
	name: string;
	label: string;
	type:
	| "text"
	| "textarea"
	| "autocomplete"
	| "number"
	| "email"
	| "password"
	| "switch"
	| "select"
	| "range"
	| "location"
	| "dni"
	| "currency"
	| "multimedia"
	| "avatar"
	| "custom";
	required?: boolean;
	autoFocus?: boolean;
	options?: BaseFormOption[];
	multiline?: boolean;
	rows?: number;
	formatFn?: (input: string) => string;
	startIcon?: string;
	endIcon?: string;
	min?: number;
	max?: number;
	col?: number;
	width?: string; // NUEVA PROPIEDAD para controlar el ancho
	labelPosition?: "left" | "right";
	renderComponent?: FieldRenderFn;
	props?: Record<string, unknown>;
}

export interface StepRenderContext {
	index: number;
	step: StepperStep;
	isActive: boolean;
	isCompleted: boolean;
	isLastStep: boolean;
	values: FormValues;
	onChange: (field: string, value: unknown) => void;
	goToStep: (index: number) => void;
}

export interface StepperStep {
	title: string;
	description?: string;
	fields?: BaseFormField[] | BaseFormField[][]; // Acepta ambos formatos
	renderContent?: (context: StepRenderContext) => React.ReactNode;
	status?: "pending" | "active" | "completed";
	disabled?: boolean;
	columns?: number;
}

export interface StepperBaseFormProps {
	steps: StepperStep[];
	values: FormValues;
	onChange: (field: string, value: unknown) => void;
	onSubmit: () => Promise<void> | void;
	currentStep?: number;
	defaultStep?: number;
	isSubmitting?: boolean;
	submitLabel?: string;
	title?: string;
	subtitle?: string;
	errors?: string[];
	columns?: number;
	cancelButton?: boolean;
	cancelButtonText?: string;
	onCancel?: () => void;
	onNext?: (currentStep: number) => Promise<void> | void;
	onPrevious?: (currentStep: number) => Promise<void> | void;
	onFinish?: () => Promise<void> | void;
	onStepChange?: (nextStep: number, previousStep: number) => void;
	renderStepContent?: (step: StepperStep, context: StepRenderContext) => React.ReactNode;
	["data-test-id"]?: string;
	className?: string;
	formClassName?: string;
}

const StepperBaseForm: React.FC<StepperBaseFormProps> = ({
	steps,
	values,
	onChange,
	onSubmit,
	currentStep: controlledStep,
	defaultStep = 0,
	isSubmitting = false,
	submitLabel,
	title = "",
	subtitle = "",
	errors = [],
	columns: defaultColumns = 1,
	cancelButton = false,
	cancelButtonText = "Cerrar",
	onCancel,
	onNext,
	onPrevious,
	onFinish,
	onStepChange,
	renderStepContent,
	className,
	formClassName,
	...rest
}) => {
	// Memoized sub-component to render location pickers without remounting on unrelated value changes
	const LocationField = React.useMemo(() => React.memo(function LocationFieldInner({
		name,
		onChangeCallback,
		initialLat,
		initialLng,
		mode,
	}: {
		name: string;
		onChangeCallback: (coords: { lat: number; lng: number } | null) => void;
		initialLat?: number;
		initialLng?: number;
		mode?: 'viewer' | 'edit' | 'update';
	}) {
		return (
			<div>
				<CreateLocationPicker
					onChange={(coords) => onChangeCallback(coords)}
					initialLat={initialLat}
					initialLng={initialLng}
					mode={mode}
				/>
			</div>
		);
	}), []);

	// Stable handlers per field name to avoid re-creating callbacks on every render
	const coordHandlersRef = React.useRef<Map<string, (coords: { lat: number; lng: number } | null) => void>>(new Map());
	const getCoordHandler = (name: string) => {
		const existing = coordHandlersRef.current.get(name);
		if (existing) return existing;
		const handler = (coords: { lat: number; lng: number } | null) => onChange(name, coords);
		coordHandlersRef.current.set(name, handler);
		return handler;
	};
	const dataTestId = rest["data-test-id"];
	const [internalStep, setInternalStep] = useState(defaultStep);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const isControlled = controlledStep !== undefined;
	const totalSteps = steps.length;
	const rawStep = isControlled ? controlledStep ?? 0 : internalStep;
	const activeStepIndex = totalSteps > 0 ? Math.min(Math.max(rawStep, 0), totalSteps - 1) : 0;

	useEffect(() => {
		if (isControlled) {
			return;
		}

		if (totalSteps === 0) {
			setInternalStep(0);
			return;
		}

		if (internalStep >= totalSteps) {
			setInternalStep(totalSteps - 1);
		}
	}, [internalStep, isControlled, totalSteps]);

	// Limpiar errores de validación cuando cambian los valores
	useEffect(() => {
		if (validationErrors.length > 0) {
			setValidationErrors([]);
		}
	}, [values]);

	const currentStepData = steps[activeStepIndex];
	const effectiveColumns = currentStepData?.columns ?? defaultColumns;
	const safeColumns = Math.max(1, effectiveColumns || 1);

	// Normaliza el formato de los campos a un arreglo de filas (BaseFormField[][])
	const normalizedFields = useMemo(() => {
		const fields = currentStepData?.fields ?? [];
		if (fields.length === 0) {
			return [];
		}
		// Si el primer elemento no es un arreglo, es el formato antiguo (plano)
		if (!Array.isArray(fields[0])) {
			// Para retrocompatibilidad, convierte el formato plano a un campo por fila
			return (fields as BaseFormField[]).map(field => [field]);
		}
		return fields as BaseFormField[][];
	}, [currentStepData]);

	const isLastStep = totalSteps === 0 ? true : activeStepIndex >= totalSteps - 1;
	const isFirstStep = activeStepIndex <= 0;
	const isProcessing = isSubmitting || isTransitioning;

	const navigateToStep = useCallback(
		(targetIndex: number) => {
			if (targetIndex < 0 || targetIndex >= totalSteps) {
				return;
			}

			if (targetIndex === activeStepIndex) {
				return;
			}

			if (steps[targetIndex]?.disabled) {
				return;
			}

			// Limpiar errores de validación al cambiar de step
			setValidationErrors([]);

			onStepChange?.(targetIndex, activeStepIndex);

			if (!isControlled) {
				setInternalStep(targetIndex);
			}
		},
		[activeStepIndex, isControlled, onStepChange, steps, totalSteps]
	);

	const runSubmit = useCallback(async () => {
		setIsTransitioning(true);
		try {
			await onSubmit();
			if (onFinish) {
				await onFinish();
			}
		} finally {
			setIsTransitioning(false);
		}
	}, [onFinish, onSubmit]);

	const handleNext = useCallback(async () => {
		if (isTransitioning) {
			return;
		}

		// Validar campos requeridos del step actual antes de proceder
		const allFields = normalizedFields.flat();
		const requiredFields = allFields.filter(field => field.required);
		const missingFields = requiredFields.filter(field => {
			const fieldValue = values[field.name];
			return fieldValue === undefined || fieldValue === null || fieldValue === '';
		});

		if (missingFields.length > 0) {
			// Mostrar error de validación
			setValidationErrors([`Por favor complete los siguientes campos requeridos: ${missingFields.map(f => f.label).join(', ')}`]);
			return;
		}

		// Limpiar errores de validación previos
		setValidationErrors([]);

		if (isLastStep) {
			await runSubmit();
			return;
		}

		setIsTransitioning(true);
		try {
			if (onNext) {
				await onNext(activeStepIndex);
			}
			navigateToStep(activeStepIndex + 1);
		} finally {
			setIsTransitioning(false);
		}
	}, [activeStepIndex, isLastStep, isTransitioning, navigateToStep, onNext, runSubmit, currentStepData, values]);

	const handlePrevious = useCallback(async () => {
		if (isTransitioning || isFirstStep) {
			return;
		}

		setIsTransitioning(true);
		try {
			if (onPrevious) {
				await onPrevious(activeStepIndex);
			}
			navigateToStep(activeStepIndex - 1);
		} finally {
			setIsTransitioning(false);
		}
	}, [activeStepIndex, isFirstStep, isTransitioning, navigateToStep, onPrevious]);

	const handleSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			await handleNext();
		},
		[handleNext]
	);

	const activeStepContext: StepRenderContext | null = useMemo(() => {
		if (!currentStepData) {
			return null;
		}

		const isCompleted = currentStepData.status === "completed";

		return {
			index: activeStepIndex,
			step: currentStepData,
			isActive: true,
			isCompleted,
			isLastStep,
			values,
			onChange,
			goToStep: navigateToStep,
		};
	}, [activeStepIndex, currentStepData, isLastStep, navigateToStep, onChange, values]);

	const stepCustomContent = useMemo(() => {
		if (!currentStepData || !activeStepContext) {
			return null;
		}

		return (
			renderStepContent?.(currentStepData, activeStepContext) ??
			currentStepData.renderContent?.(activeStepContext) ??
			null
		);
	}, [activeStepContext, currentStepData, renderStepContent]);

	const hasCustomContent = Boolean(stepCustomContent);

	const baseFormLayoutClass = hasCustomContent
		? "w-full flex flex-col gap-2"
		: safeColumns > 1
		? `w-full grid grid-cols-${safeColumns} gap-2`
		: "w-full flex flex-col gap-2";

	const resolvedFormClassName = [baseFormLayoutClass, formClassName].filter(Boolean).join(" ");

	const formStyle = undefined;

	const renderField = useCallback(
		(field: BaseFormField) => {
			const fieldValue = values[field.name];
			const commonProps = (field.props ?? {}) as Record<string, unknown>;

			if (field.type === "custom" && field.renderComponent) {
				return (
					<div key={field.name}>
						{field.renderComponent({
							name: field.name,
							label: field.label,
							value: fieldValue,
							onChange: (value: unknown) => onChange(field.name, value),
							field,
							values,
						})}
					</div>
				);
			}

			if (field.type === "location") {
				const locationProps = commonProps as {
					initialLat?: number;
					initialLng?: number;
					mode?: 'viewer' | 'edit' | 'update';
				};

				const handleCoordsChange = getCoordHandler(field.name);

				return (
					<div key={field.name}>
						<LocationField
						  name={field.name}
						  onChangeCallback={handleCoordsChange}
						  initialLat={locationProps.initialLat}
						  initialLng={locationProps.initialLng}
						  mode={locationProps.mode}
						/>
					</div>
				);
			}

			if (field.type === "multimedia") {
				const multimediaValue = Array.isArray(fieldValue) ? (fieldValue as File[]) : [];
				const rawProps = field.props ?? {};
				const { label: customLabel, ...rest } = rawProps as Record<string, unknown> & { label?: string };
				const typedProps = rest as {
					uploadPath?: string;
					accept?: string;
					maxFiles?: number;
					maxSize?: number;
					aspectRatio?: "square" | "video" | "auto";
					buttonType?: "icon" | "normal";
					variant?: "default" | "avatar";
					previewSize?: "xs" | "sm" | "normal" | "lg" | "xl";
				};

				return (
					<div key={field.name} className="flex flex-col gap-2">
						{(customLabel ?? field.label) && (
							<span className="text-sm font-medium text-gray-700">
								{(customLabel as string | undefined) ?? field.label}
							</span>
						)}
						<MultimediaUploader
							uploadPath={typedProps.uploadPath ?? "/uploads/media"}
							label={(customLabel as string | undefined) ?? field.label}
							accept={typedProps.accept ?? "image/*,video/*"}
							maxFiles={typedProps.maxFiles}
							maxSize={typedProps.maxSize}
							aspectRatio={typedProps.aspectRatio}
							buttonType={typedProps.buttonType}
							variant={typedProps.variant}
							previewSize={typedProps.previewSize}
							onChange={(files: File[]) => onChange(field.name, files)}
						/>
						{multimediaValue.length > 0 && (
							<ul className="text-xs text-gray-500 space-y-1">
								{multimediaValue.map((file, idx) => (
									<li key={`${file.name}-${idx}`}>
										• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
									</li>
								))}
							</ul>
						)}
					</div>
				);
			}

			if (field.type === "avatar") {
				const rawProps = field.props ?? {};
				const { label: customLabel, ...rest } = rawProps as Record<string, unknown> & { label?: string };
				const typedProps = rest as {
					uploadPath?: string;
				};

				return (
					<div key={field.name} className="flex flex-col gap-2">
						{(customLabel ?? field.label) && (
							<span className="text-sm font-medium text-gray-700">
								{(customLabel as string | undefined) ?? field.label}
							</span>
						)}
						<MultimediaUploader
							variant="avatar"
							uploadPath={typedProps.uploadPath ?? "/uploads/avatars"}
							label={(customLabel as string | undefined) ?? field.label}
							onChange={(files: File[]) => onChange(field.name, files[0] ?? null)}
						/>
					</div>
				);
			}

			if (field.type === "range") {
				const rangeValue = Array.isArray(fieldValue)
					? (fieldValue.slice(0, 2) as [number, number])
					: undefined;

				return (
					<div key={field.name}>
						<RangeSlider
							min={field.min ?? 0}
							max={field.max ?? 100}
							value={rangeValue}
							onChange={(val) => onChange(field.name, val)}
							{...commonProps}
						/>
					</div>
				);
			}

			if (field.type === "select") {
				// Handle both primitive values and object values with id/label structure
				let selectValue: string | number | null = null;
				if (typeof fieldValue === "string" || typeof fieldValue === "number") {
					selectValue = fieldValue;
				} else if (fieldValue && typeof fieldValue === "object" && "id" in fieldValue) {
					const id = (fieldValue as { id: unknown }).id;
					if (typeof id === "string" || typeof id === "number") {
						selectValue = id;
					}
				}

				return (
					<div key={field.name}>
						<Select
							options={field.options || []}
							placeholder={field.label}
							value={selectValue ?? undefined}
							onChange={(id: string | number | null) => onChange(field.name, id)}
							required={field.required}
							data-test-id={`select-${field.name}`}
							{...commonProps}
						/>
					</div>
				);
			}

			if (field.type === "autocomplete") {
				const optionId =
					typeof fieldValue === "string" || typeof fieldValue === "number"
						? fieldValue
						: undefined;
				const selectedOption = optionId !== undefined
					? field.options?.find((opt) => opt.id === optionId) ?? null
					: null;

				return (
					<div key={field.name}>
						<AutoComplete
							options={field.options || []}
							label={field.label}
							value={selectedOption}
							onChange={(opt) => onChange(field.name, opt ? opt.id : null)}
							required={field.required}
							name={field.name}
							data-test-id={`autocomplete-${field.name}`}
							{...commonProps}
						/>
					</div>
				);
			}

			if (field.type === "switch") {
				return (
					<div key={field.name}>
						<Switch
							checked={Boolean(fieldValue)}
							onChange={(val) => onChange(field.name, val)}
							label={field.label}
							labelPosition={field.labelPosition}
							data-test-id={`switch-${field.name}`}
							{...commonProps}
						/>
					</div>
				);
			}

			if (field.type === "currency") {
				const rawProps = field.props ?? {};
				const typedProps = rawProps as {
					currencyField?: string;
					currencies?: Array<{ id: string; symbol: string; label: string }>;
				};

				const currencyField = typedProps.currencyField;
				const currencies = typedProps.currencies || [];
				const currentCurrency = currencyField ? values[currencyField] : 'CLP';
				const currencySymbol = currencies.find(c => c.id === currentCurrency)?.symbol || '$';

				return (
					<div key={field.name}>
						<TextField
							label={field.label}
							value={String(fieldValue || '')}
							onChange={(event) => {
								onChange(field.name, event.target.value);
							}}
							type="currency"
							name={field.name}
							required={field.required}
							currencySymbol={currencySymbol}
							currencyField={currencyField}
							currencies={currencies}
							data-test-id={`currency-${field.name}`}
							{...commonProps}
							{...(field.props || {})}
						/>
					</div>
				);
			}

			if (field.type === "number") {
				const stringValue = (() => {
					if (typeof fieldValue === "number" && Number.isFinite(fieldValue)) {
						return String(fieldValue);
					}
					if (typeof fieldValue === "string") {
						return fieldValue;
					}
					return "";
				})();

				return (
					<div key={field.name}>
						<TextField
							label={field.label}
							value={stringValue}
							onChange={(event) => {
								const rawValue = event.target.value;
								if (rawValue === "") {
									onChange(field.name, "");
									return;
								}

								const parsed = Number(rawValue);
								onChange(field.name, Number.isFinite(parsed) ? parsed : "");
							}}
							type="number"
							name={field.name}
							required={field.required}
							startIcon={field.startIcon}
							endIcon={field.endIcon}
							data-test-id={`input-${field.name}`}
							{...commonProps}
						/>
					</div>
				);
			}

			const resolvedValue = (() => {
				if (typeof fieldValue === "string") {
					return fieldValue;
				}
				if (typeof fieldValue === "number") {
					return String(fieldValue);
				}
				if (fieldValue === undefined || fieldValue === null) {
					return "";
				}
				return String(fieldValue);
			})();

			return (
				<div key={field.name}>
					<TextField
						label={field.label}
						value={resolvedValue}
						onChange={(event) =>
							onChange(
								field.name,
								field.formatFn ? field.formatFn(event.target.value) : event.target.value
							)
						}
						type={field.type}
						name={field.name}
						rows={field.multiline ? field.rows : undefined}
						startIcon={field.startIcon}
						endIcon={field.endIcon}
						required={field.required}
						data-test-id={`input-${field.name}`}
						{...commonProps}
					/>
				</div>
			);
		},
		[onChange, values]
	);

	const containerClassName = ["flex flex-col", className].filter(Boolean).join(" ");

	return (
		<div className={containerClassName}>
			{subtitle && (
				<div className="subtitle p-1 pt-0 w-full mb-3 leading-snug">{subtitle}</div>
			)}

			{totalSteps > 0 && (
				<div className="mb-6">
					{/* Dots que representan los steps + Título */}
					<div className="flex justify-between items-center mb-4">
						{/* Dots que representan los steps */}
						<div className="flex items-center gap-4">
							{steps.map((step, index) => {
								const isStepActive = index === activeStepIndex;
								const isStepCompleted = step.status
									? step.status === "completed"
									: index < activeStepIndex;

								const baseDotClasses = "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200";
								const stateClasses = (() => {
									if (isStepActive) {
										return "bg-primary border-2 border-primary text-white";
									}

									if (isStepCompleted) {
										return "bg-gray-300 border-2 border-gray-300 text-white";
									}

									return "bg-transparent border border-gray-300 text-gray-500";
								})();

								return (
									<div
										key={`dot-${index}`}
										className={`${baseDotClasses} ${stateClasses}`}
									>
										{!isStepCompleted && (index + 1)}
									</div>
								);
							})}
						</div>
						
						{/* Título alineado a la derecha */}
						{title && (
							<div className="title p-1 leading-tight text-right">{title}</div>
						)}
					</div>

					{/* Segundo row: Información del step actual + Dot grande */}
					<div className="flex justify-between items-start gap-6">
						{/* Columna izquierda: Información del step */}
						<div className="flex-1 text-left flex items-start gap-4">
							{/* Barra vertical de color secondary */}
							<div className="w-1.5 bg-secondary rounded-full self-stretch"></div>

							{/* Información del step */}
							<div className="flex-1">
								{(() => {
									const currentStep = steps[activeStepIndex];
									if (!currentStep) return null;

									const isStepActive = true;
									const isStepCompleted = currentStep.status
										? currentStep.status === "completed"
										: false;

									const titleClasses = [
										"text-xl font-semibold text-primary",
									].join(" ");

									const descriptionClasses = [
										"text-sm text-primary text-opacity-80 mt-1",
									].join(" ");

									return (
										<div>
											<div className={titleClasses}>{currentStep.title}</div>
											{currentStep.description && (
												<p className={descriptionClasses}>{currentStep.description}</p>
											)}
										</div>
									);
								})()}
							</div>
						</div>

						{/* Columna derecha: Dot grande del step activo */}
						<div className="flex-shrink-0">
							<div className="w-12 h-12 rounded-full bg-transparent border border-gray-300 flex items-center justify-center text-secondary text-xl font-bold">
								{activeStepIndex + 1}
							</div>
						</div>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="w-full flex flex-col gap-2" // Contenedor principal de filas
				style={formStyle}
				{...(dataTestId ? { "data-test-id": dataTestId } : {})}
			>
				{hasCustomContent ? (
					<div className="w-full">{stepCustomContent}</div>
				) : (
					// Nueva lógica de renderizado por filas
					normalizedFields.map((row, rowIndex) => (
						<div key={`row-${rowIndex}`} className="flex items-start gap-2 w-full">
							{row.map((field) => (
								<div
									key={field.name}
									className="flex-grow" // Permite que los campos crezcan
									style={{ width: field.width ?? 'auto', flexBasis: field.width ?? 'auto' }} // Aplica el ancho
								>
									{renderField(field)}
								</div>
							))}
						</div>
					))
				)}

				<div className="col-span-full flex justify-between items-center mt-2">
					<div className="flex gap-2">
						{cancelButton && onCancel && (
							<Button
								variant="outlined"
								type="button"
								onClick={onCancel}
								disabled={isProcessing}
							>
								{cancelButtonText}
							</Button>
						)}
					</div>
					<div className="flex gap-2">
						{!isFirstStep && (
							<Button
								variant="outlined"
								type="button"
								onClick={() => {
									void handlePrevious();
								}}
								disabled={isProcessing}
								size="sm"
								className="text-secondary border-secondary hover:bg-secondary hover:text-white"
							>
								←
							</Button>
						)}
						{isProcessing ? (
							<DotProgress
								size={8}
								totalSteps={steps.length}
								activeStep={activeStepIndex}
							/>
						) : (
							<Button variant="primary" type="submit" size="sm">
								{isLastStep ? submitLabel ?? "Guardar" : "→"}
							</Button>
						)}
					</div>
				</div>

				{errors.length > 0 && (
					<div className="col-span-full flex flex-col gap-2 mt-2">
						{errors.map((err, index) => (
							<Alert key={index} variant="error">
								{err}
							</Alert>
						))}
					</div>
				)}

				{validationErrors.length > 0 && (
					<div className="col-span-full flex flex-col gap-2 mt-2">
						{validationErrors.map((err, index) => (
							<Alert key={`validation-${index}`} variant="error">
								{err}
							</Alert>
						))}
					</div>
				)}
			</form>
		</div>
	);
};

export default StepperBaseForm;