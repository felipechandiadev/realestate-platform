// Domain model for Person (subset of ORM entity)
export class Person {
  id: string;
  name: string;
  dni?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  userId?: string;
  // additional personal info
  maritalStatus?: string;
  gender?: string;
  nationality?: string;
  profession?: string;
  company?: string;
  // fields for DNI cards (optional)
  dniCardFrontId?: string;
  dniCardRearId?: string;
  dniCardFront?: any; // resolved Multimedia object
  dniCardRear?: any;
  // optional nested user reference used in some operations
  user?: { id: string; email?: string };
  verified?: boolean;
  verificationRequest?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
} 
