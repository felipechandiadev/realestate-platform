/**
 * Datos de demostración con historial de ~3 meses para Dashboard y Reportes.
 *
 * Se ejecuta DESPUÉS del seed base (`npm run seed`) y solo agrega datos: no borra
 * ni recrea el esquema. Las fechas son relativas a hoy y el generador es
 * determinista, así que cada ejecución sobre una base nueva da el mismo resultado.
 *
 *   npm run seed:demo        # solo el historial (requiere el seed base)
 *   npm run seed:full        # seed base + historial
 *
 * Comparte la guardia de seguridad del seed: solo corre contra una base local `_dev`.
 */
import * as bcrypt from 'bcrypt';
import { AppDataSource, initializeDataSource } from './seeder.config';
import { assertSafeToSeed } from './seed-guard';
import { User, UserRole, UserStatus, Permission } from '../../src/modules/users/domain/user.entity';
import { PersonOrmEntity } from '../../src/modules/person/infrastructure/persistence/person.orm-entity';
import { Property, CurrencyPriceEnum } from '../../src/modules/property/domain/property.entity';
import { PropertyType } from '../../src/modules/property-types/domain/property-type.entity';
import { PropertyStatus } from '../../src/shared/enums/property-status.enum';
import { PropertyOperationType } from '../../src/shared/enums/property-operation-type.enum';
import { RegionEnum } from '../../src/shared/regions/regions.enum';
import { ComunaEnum } from '../../src/shared/regions/comunas.enum';
import { ContractOrmEntity } from '../../src/modules/contracts/infrastructure/persistence/contract.orm-entity';
import {
  ContractOperationType,
  ContractStatus,
  ContractCurrency,
  ContractRole,
} from '../../src/modules/contracts/domain/contract.entity';
import { Payment, PaymentStatus, PaymentType } from '../../src/modules/contracts/domain/payment.entity';
import {
  NotificationOrmEntity,
  NotificationType,
  NotificationStatus,
  NotificationSenderType,
} from '../../src/modules/notifications/infrastructure/persistence/notification.orm-entity';
import { generateContractCode } from '../../src/modules/contracts/domain/contract-code';

const DAY = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 92;
const UF_BASE = 39_150;

// --- aleatoriedad determinista -------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261025);
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = <T>(list: readonly T[]): T => list[Math.floor(rnd() * list.length)];
const chance = (p: number) => rnd() < p;
const daysAgo = (d: number, hour = 10) => {
  const date = new Date(Date.now() - d * DAY);
  date.setHours(hour, int(0, 59), int(0, 59), 0);
  return date;
};
const addDays = (date: Date, d: number) => new Date(date.getTime() + d * DAY);
const clampPast = (date: Date) => (date.getTime() > Date.now() ? new Date() : date);
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

function rut(): string {
  const body = int(9_000_000, 24_000_000);
  let sum = 0;
  let mul = 2;
  for (const ch of String(body).split('').reverse()) {
    sum += Number(ch) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const rest = 11 - (sum % 11);
  const dv = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
  return `${String(body).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

// --- catálogos -------------------------------------------------------------------
const FIRST = ['Camila', 'Sebastián', 'Francisca', 'Matías', 'Javiera', 'Nicolás', 'Constanza', 'Felipe', 'Antonia', 'Diego', 'Fernanda', 'Cristóbal', 'Catalina', 'Joaquín', 'Isidora', 'Tomás', 'Paula', 'Ignacio', 'Daniela', 'Rodrigo', 'Valentina', 'Andrés', 'Macarena', 'Gonzalo'];
const LAST = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela', 'Castillo', 'Tapia', 'Reyes', 'Gutiérrez'];

type Place = { state: RegionEnum; city: ComunaEnum; lat: number; lng: number; weight: number };
const PLACES: Place[] = [
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.LAS_CONDES, lat: -33.408, lng: -70.567, weight: 6 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.PROVIDENCIA, lat: -33.426, lng: -70.611, weight: 6 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.NUNOA, lat: -33.457, lng: -70.598, weight: 5 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.VITACURA, lat: -33.386, lng: -70.575, weight: 3 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.LA_REINA, lat: -33.445, lng: -70.54, weight: 2 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.LO_BARNECHEA, lat: -33.35, lng: -70.52, weight: 2 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.MAIPU, lat: -33.51, lng: -70.757, weight: 3 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.LA_FLORIDA, lat: -33.52, lng: -70.598, weight: 3 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.PENALOLEN, lat: -33.486, lng: -70.53, weight: 2 },
  { state: RegionEnum.METROPOLITANA, city: ComunaEnum.COLINA, lat: -33.2, lng: -70.675, weight: 2 },
  { state: RegionEnum.VALPARAISO, city: ComunaEnum.VINA_DEL_MAR, lat: -33.024, lng: -71.552, weight: 3 },
  { state: RegionEnum.VALPARAISO, city: ComunaEnum.CONCON, lat: -32.93, lng: -71.52, weight: 1 },
  { state: RegionEnum.BIOBIO, city: ComunaEnum.CONCEPCION, lat: -36.827, lng: -73.05, weight: 2 },
  { state: RegionEnum.COQUIMBO, city: ComunaEnum.LA_SERENA, lat: -29.904, lng: -71.249, weight: 1 },
  { state: RegionEnum.ARAUCANIA, city: ComunaEnum.TEMUCO, lat: -38.739, lng: -72.59, weight: 1 },
];
const weightedPlace = () => {
  const total = PLACES.reduce((s, p) => s + p.weight, 0);
  let r = rnd() * total;
  for (const p of PLACES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PLACES[0];
};

const STREETS = ['Av. Apoquindo', 'Av. Providencia', 'Av. Irarrázaval', 'Los Leones', 'Av. Vicuña Mackenna', 'Av. Larraín', 'Av. Kennedy', 'Pedro de Valdivia', 'Av. Grecia', 'Av. Américo Vespucio', 'Las Hualtatas', 'El Bosque Norte', 'Av. Los Militares', 'Av. Libertad', 'Av. Alessandri'];

// tipo → [dormitorios, baños, m² construidos, m² terreno, hasTerreno]
const TYPES: Record<string, { beds: [number, number]; baths: [number, number]; built: [number, number]; land: [number, number] | null; titles: string[] }> = {
  Casa: { beds: [3, 5], baths: [2, 4], built: [90, 320], land: [160, 800], titles: ['Casa familiar en barrio residencial', 'Casa con jardín y quincho', 'Casa remodelada cerca del metro', 'Casa en condominio con áreas verdes', 'Casa de dos pisos con terraza'] },
  Departamento: { beds: [1, 3], baths: [1, 2], built: [38, 130], land: null, titles: ['Departamento luminoso con vista despejada', 'Departamento nuevo cerca del metro', 'Departamento amoblado con terraza', 'Departamento con bodega y estacionamiento', 'Departamento en edificio con piscina'] },
  Oficina: { beds: [0, 0], baths: [1, 2], built: [45, 220], land: null, titles: ['Oficina habilitada en zona corporativa', 'Oficina con vista panorámica', 'Oficina lista para ocupar'] },
  Comercial: { beds: [0, 0], baths: [1, 3], built: [80, 400], land: [100, 500], titles: ['Local comercial en avenida principal', 'Local con alto flujo peatonal'] },
  Terreno: { beds: [0, 0], baths: [0, 0], built: [0, 0], land: [500, 5000], titles: ['Terreno plano con factibilidad de agua y luz', 'Parcela de agrado a minutos de la ciudad'] },
};
const FEATURES = ['pool', 'garden', 'terrace', 'storage', 'elevator', 'concierge', 'quincho', 'security'];

type Mix = { weight: number; status: PropertyStatus };

async function seedDemo() {
  assertSafeToSeed(AppDataSource.options as { host?: string; database?: string }, 'seed:demo');
  await initializeDataSource();
  try {
    const users = AppDataSource.getRepository(User);
    const persons = AppDataSource.getRepository(PersonOrmEntity);
    const properties = AppDataSource.getRepository(Property);
    const contracts = AppDataSource.getRepository(ContractOrmEntity);
    const payments = AppDataSource.getRepository(Payment);
    const notifications = AppDataSource.getRepository(NotificationOrmEntity);
    const types = await AppDataSource.getRepository(PropertyType).find();

    const admin = await users.findOne({ where: { email: 'admin@re.cl' } });
    const baseAgents = await users.find({ where: { role: UserRole.AGENT } });
    const baseProps = await properties.find();
    if (!admin || baseAgents.length === 0 || baseProps.length === 0) {
      throw new Error('Falta el seed base. Ejecuta primero `npm run seed` (o `npm run seed:full`).');
    }
    if (await users.findOne({ where: { email: 'valentina.rojas@bravoshottpropiedades.cl' } })) {
      throw new Error('El historial de demostración ya está aplicado. Para repetirlo ejecuta `npm run seed:reset && npm run seed:demo`.');
    }

    // ---- el seed base crea todo "hoy": se reparte en el período para que los reportes
    // mensuales tengan historia (propiedades base publicadas en días distintos).
    console.log('Repartiendo en el tiempo los datos del seed base…');
    for (const u of [admin, ...baseAgents]) await users.update(u.id, { createdAt: daysAgo(WINDOW_DAYS + 30) } as any);
    for (let i = 0; i < baseProps.length; i++) {
      const at = daysAgo(Math.round(WINDOW_DAYS - (i / baseProps.length) * (WINDOW_DAYS - 10)), 9);
      const publishedAt = addDays(at, 2);
      await properties.update(baseProps[i].id, { createdAt: at, updatedAt: publishedAt, publishedAt, publicationDate: publishedAt, assignedAgentId: baseProps[i].assignedAgentId ?? baseAgents[i % baseAgents.length].id } as any);
      baseProps[i].createdAt = at;
    }
    await contracts.createQueryBuilder().update().set({ createdAt: daysAgo(55), updatedAt: daysAgo(40) } as any).execute();
    await payments.createQueryBuilder().update().set({ createdAt: daysAgo(50) } as any).execute();

    // ---- agentes adicionales (antes de la ventana, para que existan todo el período)
    console.log('Creando agentes adicionales…');
    const agentPassword = await bcrypt.hash('1234', 10);
    const extraAgentsData = [
      { first: 'Valentina', last: 'Rojas', phone: '+56 9 6123 4455', email: 'valentina.rojas@bravoshottpropiedades.cl' },
      { first: 'Matías', last: 'Fuentes', phone: '+56 9 5871 2290', email: 'matias.fuentes@bravoshottpropiedades.cl' },
    ];
    const extraAgents: User[] = [];
    for (const a of extraAgentsData) {
      const created: User = await users.save(
        users.create({
          username: a.email.split('@')[0].replace('.', ''),
          email: a.email,
          password: agentPassword,
          role: UserRole.AGENT,
          status: UserStatus.ACTIVE,
          permissions: [Permission.MANAGE_PROPERTIES, Permission.MANAGE_CONTRACTS, Permission.MANAGE_MULTIMEDIA],
          personalInfo: { firstName: a.first, lastName: a.last, phone: a.phone, avatarUrl: undefined },
          emailVerified: true,
          lastLogin: daysAgo(int(0, 3)),
          createdAt: daysAgo(WINDOW_DAYS + 20),
          updatedAt: daysAgo(2),
        } as any) as unknown as User,
      );
      const person = await persons.save(persons.create({ name: `${a.first} ${a.last}`, email: a.email, phone: a.phone, dni: rut(), verified: true, userId: created.id } as any));
      await users.update(created.id, { personId: (person as any).id });
      extraAgents.push(created);
    }
    const agents = [...baseAgents, ...extraAgents];

    // ---- clientes registrados (miembros nuevos repartidos en 3 meses)
    console.log('Creando clientes registrados…');
    const communityPassword = await bcrypt.hash('1234', 10);
    const community: User[] = [];
    const usedNames = new Set<string>();
    for (let i = 0; i < 22; i++) {
      let first = pick(FIRST);
      let last = pick(LAST);
      while (usedNames.has(`${first}.${last}`)) {
        first = pick(FIRST);
        last = pick(LAST);
      }
      usedNames.add(`${first}.${last}`);
      const slug = `${first}.${last}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      // Más registros hacia el presente: crecimiento visible mes a mes.
      const age = Math.floor(WINDOW_DAYS * (1 - Math.sqrt(rnd())));
      const created: User = await users.save(
        users.create({
          username: slug,
          email: `${slug}@example.com`,
          password: communityPassword,
          role: UserRole.COMMUNITY,
          status: UserStatus.ACTIVE,
          permissions: [],
          personalInfo: { firstName: first, lastName: last, phone: `+56 9 ${int(5000, 9999)} ${int(1000, 9999)}`, avatarUrl: undefined },
          emailVerified: true,
          lastLogin: daysAgo(Math.min(age, int(0, 20))),
          createdAt: daysAgo(age),
          updatedAt: daysAgo(Math.min(age, 1)),
        } as any) as unknown as User,
      );
      const person = await persons.save(persons.create({ name: `${first} ${last}`, email: created.email, phone: created.personalInfo?.phone, dni: rut(), verified: chance(0.6), userId: created.id } as any));
      await users.update(created.id, { personId: (person as any).id });
      community.push(created);
    }

    // ---- propiedades
    console.log('Creando propiedades con historial…');
    const imagePool = baseProps.map((p) => p.mainImageUrl).filter(Boolean) as string[];
    const counters: Record<string, number> = {};
    for (const p of baseProps) {
      const [prefix, , seq] = (p.code || '').split('-');
      counters[prefix] = Math.max(counters[prefix] || 0, parseInt(seq, 10) || 0);
    }
    const nextCode = (op: PropertyOperationType, createdAt: Date) => {
      const prefix = op === PropertyOperationType.SALE ? 'PV' : 'PA';
      counters[prefix] = (counters[prefix] || 0) + 1;
      return `${prefix}-${String(createdAt.getFullYear()).slice(-2)}-${String(counters[prefix]).padStart(7, '0')}`;
    };

    // Propiedades más antiguas → más probable que ya estén publicadas o cerradas.
    const statusFor = (age: number): PropertyStatus => {
      const r = rnd();
      if (age > 60) return r < 0.3 ? PropertyStatus.SOLD : r < 0.5 ? PropertyStatus.RENTED : r < 0.92 ? PropertyStatus.PUBLISHED : PropertyStatus.INACTIVE;
      if (age > 25) return r < 0.22 ? PropertyStatus.SOLD : r < 0.38 ? PropertyStatus.RENTED : r < 0.78 ? PropertyStatus.PUBLISHED : r < 0.9 ? PropertyStatus.CONTRACT_IN_PROGRESS : PropertyStatus.PRE_APPROVED;
      if (age > 7) return r < 0.5 ? PropertyStatus.PUBLISHED : r < 0.65 ? PropertyStatus.CONTRACT_IN_PROGRESS : r < 0.85 ? PropertyStatus.PRE_APPROVED : PropertyStatus.REQUEST;
      return r < 0.25 ? PropertyStatus.PUBLISHED : r < 0.5 ? PropertyStatus.PRE_APPROVED : PropertyStatus.REQUEST;
    };

    const created: Property[] = [];
    const typeNames = ['Departamento', 'Departamento', 'Casa', 'Casa', 'Oficina', 'Comercial', 'Terreno'];
    const TOTAL_PROPERTIES = 58;
    for (let i = 0; i < TOTAL_PROPERTIES; i++) {
      // reparto cuasi uniforme con algo de ruido, de más antigua a más reciente
      const age = Math.max(0, Math.round(WINDOW_DAYS - (i / TOTAL_PROPERTIES) * WINDOW_DAYS + int(-2, 2)));
      const createdAt = daysAgo(Math.min(age, WINDOW_DAYS), int(8, 19));
      const typeName = pick(typeNames);
      const spec = TYPES[typeName];
      const type = types.find((t) => t.name.toLowerCase().startsWith(typeName.toLowerCase().slice(0, 5))) ?? types[0];
      const place = weightedPlace();
      const status = statusFor(age);
      const operation = status === PropertyStatus.RENTED ? PropertyOperationType.RENT : status === PropertyStatus.SOLD ? PropertyOperationType.SALE : chance(0.38) ? PropertyOperationType.RENT : PropertyOperationType.SALE;
      const built = spec.built[1] ? roundTo(int(spec.built[0], spec.built[1]), 5) : 0;
      const land = spec.land ? roundTo(int(spec.land[0], spec.land[1]), 10) : 0;
      const premium = ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Providencia', 'La Reina', 'Ñuñoa'].includes(place.city) ? 1.35 : 1;
      let currency = CurrencyPriceEnum.CLP;
      let price: number;
      if (operation === PropertyOperationType.RENT) {
        price = roundTo(((typeName === 'Terreno' ? 300_000 : built * 9_500 + 120_000) * premium) * (0.85 + rnd() * 0.3), 10_000);
      } else if (typeName === 'Terreno') {
        price = roundTo(land * 38_000 * (0.8 + rnd() * 0.5), 1_000_000);
      } else if (chance(0.55)) {
        currency = CurrencyPriceEnum.UF;
        price = roundTo((built * 62 + land * 8) * premium * (0.85 + rnd() * 0.3), 50);
      } else {
        price = roundTo(built * 2_450_000 * premium * (0.85 + rnd() * 0.3), 1_000_000);
      }
      const published = [PropertyStatus.PUBLISHED, PropertyStatus.SOLD, PropertyStatus.RENTED, PropertyStatus.CONTRACT_IN_PROGRESS, PropertyStatus.INACTIVE].includes(status);
      const publishedAt = published ? clampPast(addDays(createdAt, int(1, 5))) : undefined;
      const assigned = status === PropertyStatus.REQUEST ? undefined : pick(agents);
      const creator = status === PropertyStatus.REQUEST || chance(0.35) ? pick(community) : admin;

      const viewCount = published ? int(6, 70) : 0;
      const sinceView = publishedAt ? Math.max(1, Math.round((Date.now() - publishedAt.getTime()) / DAY)) : 1;
      const views = Array.from({ length: viewCount }, () => ({ timestamp: daysAgo(int(0, sinceView), int(7, 23)), userType: chance(0.25) ? 'COMMUNITY' : 'ANONYMOUS' }));
      const leads = published
        ? Array.from({ length: int(0, 4) }, () => {
            const f = pick(FIRST);
            const l = pick(LAST);
            return { timestamp: daysAgo(int(0, sinceView)), contactInfo: { name: `${f} ${l}`, email: `${f}.${l}@example.com`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(), phone: `+56 9 ${int(5000, 9999)} ${int(1000, 9999)}` }, message: 'Me interesa la propiedad, ¿podemos coordinar una visita?', userType: 'ANONYMOUS', status: pick(['NEW', 'CONTACTED']) };
          })
        : [];
      const favorites = published ? community.filter(() => chance(0.12)).map((u) => ({ userId: u.id, addedAt: daysAgo(int(0, sinceView)) })) : [];

      const code = nextCode(operation, createdAt);
      const property = await properties.save(
        properties.create({
          code,
          title: `${pick(spec.titles)} en ${place.city}`,
          description: `${typeName} de ${built || land} m² en ${place.city}, ${place.state}. Excelente conectividad, cercano a comercio, colegios y transporte. Ideal para ${operation === PropertyOperationType.RENT ? 'arrendar con contrato anual' : 'vivir o invertir'}. Agenda tu visita con nuestro equipo de Bravo Schott Propiedades.`,
          status,
          operationType: operation,
          price,
          currencyPrice: currency,
          bedrooms: spec.beds[1] ? int(spec.beds[0], spec.beds[1]) : undefined,
          bathrooms: spec.baths[1] ? int(spec.baths[0], spec.baths[1]) : undefined,
          builtSquareMeters: built || undefined,
          landSquareMeters: land || undefined,
          parkingSpaces: typeName === 'Terreno' ? undefined : int(0, 2),
          otherFeatures: typeName === 'Terreno' ? [] : FEATURES.filter(() => chance(0.3)),
          state: place.state,
          city: place.city,
          address: `${pick(STREETS)} ${int(100, 9800)}`,
          latitude: place.lat + (rnd() - 0.5) * 0.02,
          longitude: place.lng + (rnd() - 0.5) * 0.02,
          isFeatured: status === PropertyStatus.PUBLISHED && chance(0.18),
          propertyType: type,
          creatorUser: creator,
          assignedAgentId: assigned?.id,
          publicationDate: publishedAt,
          publishedAt,
          mainImageUrl: imagePool.length ? imagePool[i % imagePool.length] : undefined,
          views,
          leads,
          favorites,
          internalNotes: status === PropertyStatus.REQUEST ? 'Pendiente de revisión de antecedentes del propietario.' : undefined,
          createdAt,
          updatedAt: publishedAt ?? createdAt,
          lastModifiedAt: publishedAt ?? createdAt,
        } as any),
      );
      created.push(Array.isArray(property) ? property[0] : property);
    }

    // ---- contratos y pagos
    console.log('Creando contratos y pagos…');
    const buyers: PersonOrmEntity[] = [];
    for (let i = 0; i < 24; i++) {
      const f = pick(FIRST);
      const l = pick(LAST);
      buyers.push(
        (await persons.save(persons.create({ name: `${f} ${l}`, email: `${f}.${l}.${i}@example.com`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(), phone: `+56 9 ${int(5000, 9999)} ${int(1000, 9999)}`, dni: rut(), verified: true } as any))) as any,
      );
    }
    const agentPersonOf = async (agent: User) => (agent.personId ? { id: agent.personId } : await persons.findOne({ where: { userId: agent.id } as any }));

    const candidates = created.filter((p) => [PropertyStatus.SOLD, PropertyStatus.RENTED, PropertyStatus.CONTRACT_IN_PROGRESS].includes(p.status));
    let contractCount = 0;
    let paymentCount = 0;
    for (const property of candidates) {
      const isSale = property.operationType === PropertyOperationType.SALE;
      const agent = agents.find((a) => a.id === property.assignedAgentId) ?? pick(agents);
      const agentPerson = await agentPersonOf(agent);
      const publishedAt = property.publishedAt ?? property.createdAt;
      const createdAt = clampPast(addDays(publishedAt, int(4, 18)));
      const inUF = property.currencyPrice === CurrencyPriceEnum.UF;
      const ufValue = inUF || chance(0.5) ? Math.round(UF_BASE + (rnd() - 0.5) * 900) : null;
      const currency = inUF ? ContractCurrency.UF : ContractCurrency.CLP;
      const inProgress = property.status === PropertyStatus.CONTRACT_IN_PROGRESS;
      const failed = !inProgress && chance(0.06);
      const status = failed ? ContractStatus.FAILED : inProgress ? ContractStatus.IN_PROCESS : ContractStatus.CLOSED;
      const duration = int(20, 70);
      const endDate = status === ContractStatus.CLOSED ? clampPast(addDays(createdAt, isSale ? duration : int(3, 12))) : null;
      const buyer = pick(buyers);
      const owner = pick(buyers);

      const base: any = {
        code: generateContractCode(createdAt.getTime()),
        userId: agent.id,
        propertyId: property.id,
        operation: isSale ? ContractOperationType.COMPRAVENTA : ContractOperationType.ARRIENDO,
        status,
        currency,
        ufValue,
        endDate,
        description: isSale ? 'Compraventa con pie inicial y saldo en escritura.' : 'Contrato de arriendo a 12 meses con garantía de un mes.',
        people: isSale
          ? [{ personId: owner.id, role: ContractRole.SELLER }, { personId: buyer.id, role: ContractRole.BUYER }, ...(agentPerson ? [{ personId: agentPerson.id, role: ContractRole.AGENT }] : [])]
          : [{ personId: owner.id, role: ContractRole.LANDLORD }, { personId: buyer.id, role: ContractRole.TENANT }, ...(agentPerson ? [{ personId: agentPerson.id, role: ContractRole.AGENT }] : [])],
        createdAt,
        updatedAt: endDate ?? createdAt,
      };

      const paymentRows: any[] = [];
      const pay = (type: PaymentType, amount: number, date: Date, paid: boolean, revenue: boolean, cur: string, desc: string, status?: PaymentStatus) => {
        paymentRows.push({
          type,
          amount,
          date,
          description: desc,
          status: status ?? (paid ? PaymentStatus.PAID : PaymentStatus.PENDING),
          currency: cur,
          paidAt: paid ? date : null,
          isAgencyRevenue: revenue,
        });
      };

      if (isSale) {
        const amount = property.price;
        const pct = pick([2, 2.5, 3]);
        const commission = inUF ? Math.round(amount * (pct / 100) * 100) / 100 : roundTo(amount * (pct / 100), 1000);
        Object.assign(base, { amount, commissionPercent: pct, commissionAmount: commission });
        const pie = inUF ? Math.round(amount * 0.2 * 100) / 100 : roundTo(amount * 0.2, 1000);
        pay(PaymentType.SALE_DOWN_PAYMENT, pie, clampPast(addDays(createdAt, int(3, 10))), status !== ContractStatus.FAILED, false, currency, 'Pie inicial del 20% contra promesa de compraventa.');
        if (status === ContractStatus.CLOSED && endDate) {
          pay(PaymentType.SALE_FINAL_PAYMENT, amount - pie, endDate, true, false, currency, 'Saldo pagado en la firma de escritura.');
          pay(PaymentType.COMMISSION_INCOME, commission, endDate, true, true, currency, `Comisión ${pct}% por la venta.`);
        } else if (status === ContractStatus.IN_PROCESS) {
          pay(PaymentType.COMMISSION_INCOME, commission, addDays(new Date(), int(10, 30)), false, true, currency, `Comisión ${pct}% por la venta (a cobrar en escritura).`);
        }
      } else {
        const rent = property.price;
        const months = 12;
        const commission = roundTo(rent * 0.5, 1000);
        Object.assign(base, {
          amount: rent * months,
          monthlyRent: rent,
          durationMonths: months,
          startDate: createdAt.toISOString().slice(0, 10),
          tenantCommissionPercent: 50,
          tenantCommissionAmount: commission,
          landlordCommissionPercent: 50,
          landlordCommissionAmount: commission,
          commissionAmount: commission * 2,
        });
        if (status !== ContractStatus.FAILED) {
          pay(PaymentType.COMMISSION_INCOME, commission * 2, status === ContractStatus.CLOSED && endDate ? endDate : addDays(createdAt, 5), status === ContractStatus.CLOSED, true, 'CLP', 'Comisión de corretaje (50% arrendatario y 50% propietario).');
          pay(PaymentType.DEPOSIT, rent, addDays(createdAt, 4), status === ContractStatus.CLOSED, false, 'CLP', 'Garantía de un mes.');
          if (status === ContractStatus.CLOSED && endDate) {
            for (let m = 0; m < months; m++) {
              const due = addDays(endDate, 30 * m + 5);
              if (due.getTime() > Date.now() + 10 * DAY) break;
              const overdue = due.getTime() < Date.now() && m === 1 && chance(0.4);
              const future = due.getTime() > Date.now();
              pay(PaymentType.RENT_PAYMENT, rent, due, !future && !overdue, false, 'CLP', `Arriendo mes ${m + 1}.`, overdue ? PaymentStatus.PENDING_VERIFICATION : undefined);
            }
          }
        }
      }

      const contract: any = await contracts.save(contracts.create({ ...base, payments: [], changeHistory: [{ id: `${base.code}-created`, timestamp: createdAt.toISOString(), userId: agent.id, action: 'CONTRACT_CREATED', changes: [{ field: 'contract', previousValue: null, newValue: { code: base.code, status: ContractStatus.IN_PROCESS } }], metadata: { propertyId: property.id, userId: agent.id } }] } as any));
      const savedPayments: Payment[] = [];
      for (const row of paymentRows) {
        const saved = await payments.save(payments.create({ ...row, contractId: contract.id, createdAt: row.paidAt ?? createdAt, updatedAt: row.paidAt ?? createdAt } as any));
        savedPayments.push(saved as any);
      }
      contract.payments = savedPayments.map((p) => ({ id: p.id, amount: Number(p.amount), date: new Date(p.date).toISOString(), description: p.description, type: p.type, status: p.status, documents: [] }));
      await contracts.update(contract.id, { payments: contract.payments, updatedAt: base.updatedAt } as any);
      contractCount += 1;
      paymentCount += savedPayments.length;
    }

    // ---- notificaciones (actividad del portal) repartidas en el período
    console.log('Creando notificaciones…');
    const admins = await users.find({ where: { role: UserRole.ADMIN } });
    const published = created.filter((p) => p.status === PropertyStatus.PUBLISHED);
    let notificationCount = 0;
    const push = async (n: Partial<NotificationOrmEntity> & { createdAt: Date }) => {
      const old = n.createdAt.getTime() < Date.now() - 4 * DAY;
      await notifications.save(notifications.create({ isSystem: false, targetMails: [], status: old || chance(0.3) ? NotificationStatus.OPEN : NotificationStatus.SEND, updatedAt: n.createdAt, ...n } as any));
      notificationCount += 1;
    };
    for (let i = 0; i < 70; i++) {
      const at = daysAgo(int(0, WINDOW_DAYS - 2), int(8, 22));
      const f = pick(FIRST);
      const l = pick(LAST);
      const name = `${f} ${l}`;
      const email = `${f}.${l}@example.com`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const phone = `+56 9 ${int(5000, 9999)} ${int(1000, 9999)}`;
      const r = rnd();
      if (r < 0.5 && published.length) {
        const prop = pick(published);
        const targets = [...admins.map((a) => a.id), ...(prop.assignedAgentId ? [prop.assignedAgentId] : [])];
        await push({ type: NotificationType.INTEREST, senderType: NotificationSenderType.ANONYMOUS, senderId: null, senderName: name, message: `Interés en propiedad: ${prop.title} (Código: ${prop.code})\n\nDe: ${name} (${email}, ${phone})\n\nMensaje: Quisiera más información y coordinar una visita.\n\n[PROPERTY_ID: ${prop.id}]`, targetUserIds: targets, interestedUserEmail: email, interestedUserName: name, interestedUserPhone: phone, interestedUserMessage: 'Quisiera más información y coordinar una visita.', createdAt: at });
      } else if (r < 0.75) {
        await push({ type: NotificationType.CONTACT, senderType: NotificationSenderType.ANONYMOUS, senderId: null, senderName: name, message: `Contacto desde el portal\n\nDe: ${name} (${email}, ${phone})\n\nMensaje: ${pick(['Quiero tasar mi propiedad.', 'Necesito asesoría para arrendar un departamento.', '¿Trabajan con créditos hipotecarios?', 'Busco una casa en Ñuñoa o La Reina.'])}`, targetUserIds: admins.map((a) => a.id), interestedUserEmail: email, interestedUserName: name, interestedUserPhone: phone, interestedUserMessage: 'Consulta general', createdAt: at });
      } else if (r < 0.9) {
        const prop = pick(created);
        const requester = pick(community);
        await push({ type: NotificationType.PROPERTY_PUBLICATION_REQUEST, senderType: NotificationSenderType.USER, senderId: requester.id, senderName: `${requester.personalInfo?.firstName} ${requester.personalInfo?.lastName}`, message: `Nueva solicitud de publicación: ${requester.personalInfo?.firstName} ${requester.personalInfo?.lastName} (${requester.email}) ha solicitado publicar la propiedad "${prop.title}".`, targetUserIds: admins.map((a) => a.id), createdAt: clampPast(prop.createdAt) });
      } else {
        const agent = pick(agents);
        await push({ type: NotificationType.PAYMENT_RECEIPT, senderType: NotificationSenderType.SYSTEM, senderId: null, senderName: 'Sistema', isSystem: true, message: 'Un cliente subió un comprobante de pago pendiente de verificación.', targetUserIds: [agent.id, ...admins.map((a) => a.id)], createdAt: at });
      }
    }

    console.log('\n✅ Historial de demostración listo');
    console.log(`  • ${extraAgents.length} agentes y ${community.length} clientes nuevos`);
    console.log(`  • ${created.length} propiedades (${created.filter((p) => p.status === PropertyStatus.PUBLISHED).length} publicadas)`);
    console.log(`  • ${contractCount} contratos y ${paymentCount} pagos`);
    console.log(`  • ${notificationCount} notificaciones`);
  } finally {
    await AppDataSource.destroy().catch(() => undefined);
  }
}

seedDemo().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
