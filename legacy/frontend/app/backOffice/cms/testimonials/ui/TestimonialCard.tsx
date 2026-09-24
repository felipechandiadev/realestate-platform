import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { normalizeMediaUrl } from './utils';

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  position?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* Imagen */}
      {testimonial.imageUrl && (
        <div className="mb-4">
          <img
            src={normalizeMediaUrl(testimonial.imageUrl)}
            alt={testimonial.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{testimonial.name}</h3>
        {testimonial.position && (
          <p className="text-sm text-muted-foreground">{testimonial.position}</p>
        )}
        <p className="text-sm text-foreground line-clamp-3">{testimonial.content}</p>

        {/* Estado */}
        <div className="flex items-center gap-2 mt-3">
          <div className={`w-2 h-2 rounded-full ${testimonial.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-muted-foreground">
            {testimonial.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
        <IconButton
          icon="edit"
          variant="text"
          onClick={() => onEdit(testimonial)}
          aria-label="Editar testimonio"
        />
        <IconButton
          icon="delete"
          variant="text"
          onClick={() => onDelete(testimonial)}
          className="text-red-500"
          aria-label="Eliminar testimonio"
        />
      </div>
    </div>
  );
};

export default TestimonialCard;