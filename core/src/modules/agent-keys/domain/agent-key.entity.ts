import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Permisos que se le pueden dar a la key de un agente. */
export enum AgentScope {
  /** Leer propiedades, catálogos y multimedia. */
  PROPERTIES_READ = 'properties:read',
  /** Crear y editar propiedades y subir multimedia (sin publicar). */
  PROPERTIES_WRITE = 'properties:write',
  /** Dejar una propiedad en estado PUBLISHED. */
  PROPERTIES_PUBLISH = 'properties:publish',
}

/**
 * Credencial de un agente de IA. Pertenece a un admin (`ownerId`) y actúa con su
 * cuenta: si el admin se desactiva o deja de ser ADMIN, la key deja de funcionar.
 * Solo se guarda el hash; el valor en claro se muestra una única vez al crearla.
 */
@Entity('agent_keys')
export class AgentKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nombre del agente (aparece en el historial de las propiedades). */
  @Column({ type: 'varchar', length: 80 })
  name: string;

  @Column({ type: 'uuid' })
  @Index()
  ownerId: string;

  /** Primeros caracteres de la key: sirven para ubicarla y para que el admin la reconozca. */
  @Column({ type: 'varchar', length: 16 })
  @Index({ unique: true })
  keyPrefix: string;

  /** SHA-256 (hex) de la key completa. */
  @Column({ type: 'char', length: 64 })
  keyHash: string;

  @Column({ type: 'json' })
  scopes: AgentScope[];

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
