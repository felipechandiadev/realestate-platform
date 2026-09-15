import type {
  MultimediaAvatarActionPlacement,
  MultimediaAvatarSize,
} from '../Multimedia/MultimediaSingleSlot';

export type { MultimediaAvatarActionPlacement, MultimediaAvatarSize };

export interface MultimediaUpdaterProps {
  currentUrl?: string | null;
  currentType?: 'image' | 'video' | string;
  onFileChange?: (file: File | null) => void;
  buttonText?: string;
  labelText?: string;
  acceptedTypes?: string[];
  maxSize?: number;
  aspectRatio?: '1:1' | '16:9' | '9:16';
  variant?: 'default' | 'avatar' | 'banner';
  /** Solo `variant="avatar"`: sm | md | lg. Default md. */
  avatarSize?: MultimediaAvatarSize;
  /** Solo `variant="avatar"`: below (default) | edge (badge en borde). */
  actionPlacement?: MultimediaAvatarActionPlacement;
  allowDragDrop?: boolean;
  className?: string;
  previewSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}
