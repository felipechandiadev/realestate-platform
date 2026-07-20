'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'
import { RegionEnum, ComunaEnum } from '@/lib/enums'

// Mapeo local de comunas por región (copia de REGION_COMMUNES del backend)
const REGION_COMMUNES_LOCAL: Record<string, string[]> = {
  [RegionEnum.ARICA_Y_PARINACOTA]: [
    'Arica', 'Camarones', 'Putre', 'General Lagos'
  ],
  [RegionEnum.TARAPACA]: [
    'Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'
  ],
  [RegionEnum.ANTOFAGASTA]: [
    'Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'
  ],
  [RegionEnum.ATACAMA]: [
    'Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Huasco', 'Freirina', 'Alto del Carmen'
  ],
  [RegionEnum.COQUIMBO]: [
    'La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'
  ],
  [RegionEnum.VALPARAISO]: [
    'Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'La Calera', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'Santa María'
  ],
  [RegionEnum.METROPOLITANA]: [
    'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor'
  ],
  [RegionEnum.OHIGGINS]: [
    'Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz'
  ],
  [RegionEnum.MAULE]: [
    'Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'
  ],
  [RegionEnum.ÑUBLE]: [
    'Chillán', 'Bulnes', 'Cobquecura', 'Coelemu', 'Coihueco', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Quirihue', 'Ránquil', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Yungay'
  ],
  [RegionEnum.BIOBIO]: [
    'Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'
  ],
  [RegionEnum.ARAUCANIA]: [
    'Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre Las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'
  ],
  [RegionEnum.LOS_RIOS]: [
    'Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'
  ],
  [RegionEnum.LOS_LAGOS]: [
    'Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo'
  ],
  [RegionEnum.AYSEN]: [
    'Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Río Ibáñez', 'Chile Chico', 'Cochrane', "O'Higgins", 'Tortel'
  ],
  [RegionEnum.MAGALLANES]: [
    'Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine'
  ],
};

// Función para filtrar comunas localmente por región
function getComunasByRegionLocal(region: string): Array<{ id: string; label: string; stateId?: string }> {
  const comunas = REGION_COMMUNES_LOCAL[region] || [];
  return comunas.map(comuna => ({
    id: comuna,
    label: comuna,
    stateId: region
  }));
}

// Funciones helper para convertir enums a formato de opciones para componentes

export async function getRegiones(): Promise<Array<{ id: string; label: string }>> {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.accessToken) {
      // Intentar obtener regiones desde el backend
      const response = await fetch(`${env.backendApiUrl}/config/regiones`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        return data.map((region: any) => ({
          id: region.id || region.name || region.value,
          label: region.name || region.label || region.value
        }))
      }
    }
  } catch (error) {
    console.warn('Error fetching regiones from backend, using fallback data:', error)
  }

  // Fallback: usar datos locales de Chile
  return Object.entries(RegionEnum).map(([key, value]) => ({
    id: value, // Usar el valor como id (nombre de la región)
    label: value
  }))
}

export async function getComunas(): Promise<Array<{ id: string; label: string }>> {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.accessToken) {
      // Intentar obtener comunas desde el backend
      const response = await fetch(`${env.backendApiUrl}/config/comunas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        return data.map((comuna: any) => ({
          id: comuna.id || comuna.name || comuna.value,
          label: comuna.name || comuna.label || comuna.value
        }))
      }
    }
  } catch (error) {
    console.warn('Error fetching comunas from backend, using fallback data:', error)
  }

  // Fallback: usar datos locales de Chile
  return Object.entries(ComunaEnum).map(([key, value]) => ({
    id: value, // Usar el valor como id (nombre de la comuna)
    label: value
  }))
}

// Función para obtener comunas filtradas por región
export async function getComunasByRegion(region: string): Promise<Array<{ id: string; label: string; stateId?: string }>> {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.accessToken && region) {
      // Intentar obtener comunas filtradas desde el backend
      const response = await fetch(`${env.backendApiUrl}/config/comunas?region=${encodeURIComponent(region)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        return data.map((comuna: any) => ({
          id: comuna.id || comuna.name || comuna.value,
          label: comuna.name || comuna.label || comuna.value,
          stateId: comuna.stateId // Incluir el stateId retornado por el backend
        }))
      }
    }
  } catch (error) {
    console.warn('Error fetching comunas by region from backend, using local filtering:', error)
  }

  // Fallback: filtrar comunas localmente por región
  return getComunasByRegionLocal(region)
}

// Removed constant exports to comply with "use server" restrictions. These constants have been moved to a client-safe file.