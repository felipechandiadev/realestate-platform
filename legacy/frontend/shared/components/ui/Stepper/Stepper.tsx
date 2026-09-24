import React from 'react';
import { Button } from '../Button/Button';

interface StepData {
  number: number;
  title: string;
  description: string;
}

interface StepperProps {
  steps: StepData[];
  activeStep: number;
  onStepChange: (step: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, activeStep, onStepChange }) => {
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      onStepChange(activeStep + 1);
    }
  };

  const isLastStep = activeStep === steps.length - 1;
  const currentStep = steps[activeStep];

  return (
    <div className="w-full space-y-4">
      {/* Sección Superior: Navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => (
            <button
              key={step.number}
              type="button"
              onClick={() => onStepChange(idx)}
              disabled={idx > activeStep + 1}
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-200 focus:outline-none mr-2
                ${idx === activeStep 
                  ? 'bg-primary text-white shadow-sm' 
                  : idx < activeStep
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-primary border border-primary hover:bg-primary/10'
                }
              `}
            >
              {step.number}
            </button>
          ))}
        </div>
        <Button
          onClick={handleNext}
          disabled={isLastStep}
        >
          Siguiente
        </Button>
      </div>

      {/* Sección Inferior: Contenido del Paso Actual */}
      <div className="border border-secondary rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr,auto] gap-4 p-6 relative">
          {/* Borde izquierdo grueso */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
          
          {/* Columna Izquierda: Título y Descripción */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-gray-800">
              {currentStep.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Columna Derecha: Número Grande */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <span className="text-3xl font-medium text-primary/50">
                {currentStep.number}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stepper;
