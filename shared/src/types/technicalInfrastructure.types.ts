/**
 * HBD — HOME BOARD DESIGNER
 * Smart Home & Technical Infrastructure Types & DTOs (Phase V21 / 1.21.0)
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma. Todos los derechos reservados.
 */

export type TechnicalCategory =
  | 'ELECTRICAL'      // Tomas de corriente, interruptores, pulsadores, cuadros secundarios
  | 'LIGHTING'        // Puntos de luz, focos downlight, tiras LED, apliques, dimmers
  | 'NETWORK'         // Tomas RJ45 Cat6/6A/7, rosetas de fibra, switches, routers
  | 'WIFI'            // Puntos de acceso Wi-Fi (AP), repetidores mesh
  | 'SMART_HOME'      // Micromódulos, actuadores, sensores ambientales, pasarelas Zigbee/Matter/KNX
  | 'SECURITY'        // Cámaras IP, sensores PIR de movimiento, sensores magnéticos, sirenas
  | 'HVAC'            // Unidades de climatización/splits, termostatos, rejillas, suelo radiante
  | 'PLUMBING'        // Tomas AFS/ACS, llaves de paso, desagües, botes sifónicos
  | 'MULTIMEDIA'      // Tomas TV/FM/SAT, HDMI, altavoces empotrados multiroom
  | 'TECHNICAL_ROOM'; // Cuadros eléctricos, racks de comunicaciones, colectores

export type TechnicalMountingType =
  | 'WALL_RECESSED'        // Empotrado en pared
  | 'WALL_SURFACE'         // Superficie en pared
  | 'CEILING_RECESSED'     // Empotrado en techo / falso techo
  | 'CEILING_SURFACE'      // Superficie en techo
  | 'FLOOR_RECESSED'       // Caja de suelo / empotrado en pavimento
  | 'FURNITURE_INTEGRATED' // Integrado en mueble / encimera
  | 'OUTDOOR';             // Intemperie / exterior con protección IP

export type TechnicalStatus =
  | 'PLANNED'
  | 'VALIDATED'
  | 'CONFLICT'
  | 'PROCURED'
  | 'INSTALLED'
  | 'VERIFIED';

export type TechnicalConnectionType =
  | 'ELECTRICAL_CIRCUIT'   // Línea eléctrica de fuerza o alumbrado
  | 'LIGHTING_SWITCH_LEG'  // Retorno / conmutada de alumbrado
  | 'ETHERNET_CABLE'       // Cable de datos UTP/FTP
  | 'FIBER_OPTIC'          // Fibra óptica
  | 'BUS_CABLE'            // Bus domótico (KNX, DALI, RS485)
  | 'WIRELESS_LINK'        // Enlace inalámbrico (Zigbee, Matter, Thread, Wi-Fi, Z-Wave)
  | 'WATER_SUPPLY_COLD'    // Tubería de agua fría sanitaria (AFS)
  | 'WATER_SUPPLY_HOT'     // Tubería de agua caliente sanitaria (ACS)
  | 'SANITARY_DRAIN'       // Evacuación / desagüe
  | 'HVAC_REFRIGERANT'     // Línea frigorífica
  | 'HVAC_DUCT'            // Conducto de aire
  | 'AUDIO_VIDEO';         // Cable multimedia / coaxial / HDMI

export type TechnicalZoneType =
  | 'ELECTRICAL_PANEL'     // Cuadro de mando y protección (CGMP / Secundario)
  | 'NETWORK_RACK'         // Rack de telecomunicaciones (RITI / 10" / 19")
  | 'PLUMBING_MANIFOLD'    // Colector / armario de distribución hidráulica
  | 'DOMOTIC_HUB'          // Cuadro / pasarela de control domótico
  | 'HVAC_PLANT';          // Sala de máquinas / aerotermia / caldera / ventilación

export type TechnicalProtocol =
  | 'HARDWIRED'
  | 'ZIGBEE'
  | 'MATTER'
  | 'THREAD'
  | 'KNX'
  | 'WIFI'
  | 'ZWAVE'
  | 'BLUETOOTH'
  | 'DALI'
  | 'MODBUS'
  | 'ANALOG';

export interface TechnicalCoordinates {
  x: number; // Coordenada X en metros en el plano de planta
  y: number; // Coordenada Y en metros en el plano de planta
  z: number; // Altura / Cota de instalación en metros desde el suelo terminado
}

export interface TechnicalDimensions {
  width: number;  // Ancho en metros (ej. 0.08m)
  height: number; // Alto en metros (ej. 0.08m)
  depth: number;  // Fondo / Profundidad en metros (ej. 0.05m)
}

export interface TechnicalElementDto {
  id: string;
  projectId: string;
  floorId?: string | null;
  roomId?: string | null;
  wallId?: string | null;
  furnitureId?: string | null;
  retailProductId?: string | null;
  code: string; // Código de identificación técnica (ej. ELE-001, NET-AP02, DOM-SW01)
  name: string; // Nombre descriptivo
  category: TechnicalCategory;
  mountingType: TechnicalMountingType;
  status: TechnicalStatus;
  protocol?: TechnicalProtocol;
  position: TechnicalCoordinates;
  rotation: number; // Rotación en grados (0-360)
  dimensions: TechnicalDimensions;
  circuitId?: string | null; // Identificador de circuito eléctrico (ej. C1, C2, C4-1)
  channelId?: string | null; // Identificador de canalización o roza asociada
  powerWatts?: number | null; // Potencia eléctrica en vatios (W)
  voltage?: number | null; // Tensión en voltios (V), ej. 230V, 24V, 12V, 48V PoE
  currentAmps?: number | null; // Intensidad nominal en amperios (A)
  ipRating?: string | null; // Grado de protección IP (ej. IP20, IP44, IP65, IP68)
  poePowered?: boolean; // Si es alimentado por PoE (Power over Ethernet)
  poeClass?: string | null; // Clase PoE (ej. 802.3af, 802.3at PoE+, 802.3bt PoE++)
  wifiBand?: '2.4GHz' | '5GHz' | '6GHz' | 'TRI_BAND' | null;
  rfPowerDbm?: number | null; // Potencia de transmisión RF en dBm
  cameraFovDegrees?: number | null; // Campo de visión horizontal de la cámara en grados (ej. 110°)
  cameraRangeMeters?: number | null; // Alcance efectivo de detección en metros
  pipeDiameterMm?: number | null; // Diámetro nominal de tubería en mm (ej. 16, 20, 25, 32, 40, 50, 110)
  airflowM3h?: number | null; // Caudal de aire en m³/h
  hvacCoolingKw?: number | null; // Potencia térmica de refrigeración en kW
  hvacHeatingKw?: number | null; // Potencia térmica de calefacción en kW
  costItemId?: string | null; // Vinculación con Partida de Coste Financiero V17
  procurementItemId?: string | null; // Vinculación con Partida de Compra V18
  executionTaskId?: string | null; // Vinculación con Tarea de Obra V15
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalConnectionDto {
  id: string;
  projectId: string;
  floorId?: string | null;
  code: string; // ej. CON-ELE-001, CON-NET-012
  name: string;
  connectionType: TechnicalConnectionType;
  fromElementId?: string | null;
  toElementId?: string | null;
  fromZoneId?: string | null;
  toZoneId?: string | null;
  pathPoints: TechnicalCoordinates[]; // Polilínea de trazado 3D
  lengthMeters: number; // Longitud total calculada en metros
  wireGaugeMm2?: number | null; // Sección de cable en mm² (ej. 1.5, 2.5, 4, 6, 10, 16)
  cableCategory?: string | null; // Cat6, Cat6A, Cat7, OM3, OM4, OS2
  pipeDiameterMm?: number | null;
  conduitDiameterMm?: number | null; // Diámetro de tubo corrugado/canaleta en mm (ej. 20, 25, 32)
  channelingType?: 'RECESSED_WALL' | 'RECESSED_FLOOR' | 'FALSE_CEILING' | 'SURFACE_TRUNKING' | 'OUTDOOR_CONDUIT';
  status: TechnicalStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalZoneDto {
  id: string;
  projectId: string;
  floorId?: string | null;
  roomId?: string | null;
  code: string; // ej. CGMP-01, RACK-01, COL-AFS-01
  name: string;
  zoneType: TechnicalZoneType;
  position: TechnicalCoordinates;
  dimensions: TechnicalDimensions;
  capacityUnits?: number | null; // Módulos DIN (cuadros) o U (racks)
  usedUnits?: number | null;
  mainSupplySpecs?: Record<string, any>; // ej. { tension: '230V', Icp: '25A', potenciaContratadaKw: 5.75 }
  status: TechnicalStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalDependencyDto {
  id: string;
  projectId: string;
  sourceElementId: string;
  targetElementId: string;
  dependencyType: 'POWER' | 'DATA_LINK' | 'CONTROL_SIGNAL' | 'WATER_SUPPLY' | 'DRAIN_OUTLET';
  isMandatory: boolean;
  isSatisfied: boolean;
  description?: string | null;
}

export type TechnicalRuleSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface TechnicalRuleDto {
  id: string;
  code: string;
  name: string;
  category: TechnicalCategory;
  severity: TechnicalRuleSeverity;
  description: string;
  standardReference: string; // ej. "REBT ITC-BT-27", "CTE DB-HS", "ICT-2"
  parameters: Record<string, any>;
}

export interface TechnicalIssueDto {
  ruleCode: string;
  ruleName: string;
  severity: TechnicalRuleSeverity;
  elementId?: string;
  elementCode?: string;
  relatedElementId?: string;
  message: string;
  recommendation: string;
  standardReference?: string;
}

export interface TechnicalValidationResultDto {
  isValid: boolean;
  score: number; // 0 a 100
  totalElements: number;
  totalConnections: number;
  totalZones: number;
  errorsCount: number;
  warningsCount: number;
  infosCount: number;
  issues: TechnicalIssueDto[];
  validatedAt: string;
}

export interface WiFiHeatmapPointDto {
  x: number;
  y: number;
  rssiDbm: number; // ej. -45 dBm (excelente), -65 dBm (bueno), -75 dBm (justo), -85 dBm (pobre)
  signalQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NO_SIGNAL';
  connectedApId?: string;
}

export interface WiFiCoverageAnalysisDto {
  projectId: string;
  floorId?: string;
  gridResolutionMeters: number;
  totalAreaM2: number;
  coveredAreaM2: number;
  coveragePercentage: number;
  heatmapPoints: WiFiHeatmapPointDto[];
  deadZonesCount: number;
  accessPointsCount: number;
  recommendations: string[];
}

export interface ElectricalCircuitSummaryDto {
  circuitId: string;
  circuitName: string;
  breakerAmps: number; // Magnetotérmico ej. 10A, 16A, 20A, 25A
  wireSectionMm2: number;
  elementsCount: number;
  totalInstalledWatts: number;
  simultaneousDemandWatts: number;
  loadFactorPercentage: number;
  isOverloaded: boolean;
}

export interface ElectricalLoadSummaryDto {
  projectId: string;
  totalInstalledPowerWatts: number;
  diversityFactor: number;
  totalDemandPowerWatts: number;
  recommendedContractPowerKw: number;
  circuits: ElectricalCircuitSummaryDto[];
  isBalanced: boolean;
  phaseDistribution?: {
    phaseL1Watts: number;
    phaseL2Watts?: number;
    phaseL3Watts?: number;
  };
}

export interface NetworkPortSummaryDto {
  projectId: string;
  totalDataOutlets: number;
  totalPoeDevices: number;
  totalPoePowerWatts: number;
  recommendedSwitchPorts: number;
  recommendedPoeBudgetWatts: number;
  fiberEndpointsCount: number;
}

export interface TechnicalSummaryDto {
  projectId: string;
  totalElements: number;
  byCategory: Record<TechnicalCategory, number>;
  totalConnections: number;
  totalCableLengthMeters: number;
  totalConduitLengthMeters: number;
  totalZones: number;
  validation: TechnicalValidationResultDto;
  electricalSummary: ElectricalLoadSummaryDto;
  networkSummary: NetworkPortSummaryDto;
  wifiSummary: {
    totalAps: number;
    coveragePercentage: number;
    deadZones: number;
  };
}

export interface CreateTechnicalElementInput {
  projectId: string;
  floorId?: string;
  roomId?: string;
  wallId?: string;
  furnitureId?: string;
  retailProductId?: string;
  code?: string;
  name: string;
  category: TechnicalCategory;
  mountingType: TechnicalMountingType;
  protocol?: TechnicalProtocol;
  position: TechnicalCoordinates;
  rotation?: number;
  dimensions?: Partial<TechnicalDimensions>;
  circuitId?: string;
  powerWatts?: number;
  voltage?: number;
  currentAmps?: number;
  ipRating?: string;
  poePowered?: boolean;
  poeClass?: string;
  wifiBand?: '2.4GHz' | '5GHz' | '6GHz' | 'TRI_BAND';
  rfPowerDbm?: number;
  cameraFovDegrees?: number;
  cameraRangeMeters?: number;
  pipeDiameterMm?: number;
  airflowM3h?: number;
  hvacCoolingKw?: number;
  hvacHeatingKw?: number;
  costItemId?: string;
  procurementItemId?: string;
  executionTaskId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateTechnicalElementInput extends Partial<CreateTechnicalElementInput> {
  id: string;
  status?: TechnicalStatus;
}

export interface CreateTechnicalConnectionInput {
  projectId: string;
  floorId?: string;
  code?: string;
  name: string;
  connectionType: TechnicalConnectionType;
  fromElementId?: string;
  toElementId?: string;
  fromZoneId?: string;
  toZoneId?: string;
  pathPoints?: TechnicalCoordinates[];
  lengthMeters?: number;
  wireGaugeMm2?: number;
  cableCategory?: string;
  pipeDiameterMm?: number;
  conduitDiameterMm?: number;
  channelingType?: 'RECESSED_WALL' | 'RECESSED_FLOOR' | 'FALSE_CEILING' | 'SURFACE_TRUNKING' | 'OUTDOOR_CONDUIT';
  metadata?: Record<string, any>;
}

export interface CreateTechnicalZoneInput {
  projectId: string;
  floorId?: string;
  roomId?: string;
  code?: string;
  name: string;
  zoneType: TechnicalZoneType;
  position: TechnicalCoordinates;
  dimensions: TechnicalDimensions;
  capacityUnits?: number;
  usedUnits?: number;
  mainSupplySpecs?: Record<string, any>;
  metadata?: Record<string, any>;
}
