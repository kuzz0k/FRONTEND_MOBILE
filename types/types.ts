import { authSchema } from "@/constants/consts";
import { z } from "zod";

export type AuthType = z.infer<typeof authSchema>

export type TopicCallback = (data: any) => void;

export type LoginResponse = {
  access_token: string,
  refresh_token: string,
  expires_in: number
}

export type LoginRequest = {
  username: string;
  password: string;
}

export type Zone = ZonePolygon | ZoneSector

export interface GlobalStateResponse {
  zones: Zone[];
  refpoint: {
    coordinates: Coordinates
  },
  mogs: Mog[],
  aircrafts: AircraftType[],
  equipment: EquipmentType[]
}

export enum EquipmentVariaties {
  RADAR = "RADAR"
}


export type EquipmentType = {
  id: string,
  model: string,
  name: string,
  type: EquipmentVariaties,
  connected: boolean,
  coordinates: Coordinates,
}

export type AircraftType = {
  id: string,
  detectedBy: string,
  type: TYPE,
  coordinates: Coordinates,
  cource: number,
  heightInMeters: number,
  speedInMeters: number,
  position: {
    azimuth: number,
    distanceInMeters: number,
    refpointId: string
  }
}

export type Coordinates = {
  lat: number,
  lng: number,
}

export type Mog = {
  username: string,
  callSign: string,
  ready: boolean,
  connected: boolean,
  coordinates: Coordinates
}

export enum ZONE_TYPE {
  POLYGON = "POLYGON",
  SECTOR = "SECTOR"
}

export enum TYPE {
  ENEMY = "ENEMY",
  FRIENDLY = "FRIENDLY",
  MISLEADING = "MISLEADING",
  EXTRAPOLATED = "EXTRAPOLATED",
  NEW = "NEW"
}

export enum TYPE_TO {
  TO_POINT = "TO_POINT",
  TO_AIRCRAFT = "TO_AIRCRAFT"
}

export enum STATUS {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED"
}

export enum TOPICS_ZONES {
  CREATED = 'zone-created',
  UPDATED = 'zone-updated',
  DELETED = 'zone-deleted',
}

export enum TOPICS_MOGS {
  ENTERED = 'mog-entered',
  CONNECTED = 'mog-connected',
  DISCONNECTED = 'mog-disconnected',
  QUIT = 'mog-quit',
  UPDATED = 'mog-updated',
}

export enum TOPICS_AIRCRAFTS {
  UPDATED = 'aircraft-updated',
  DELETED = 'aircraft-deleted',
  LOST = 'aircraft-lost',
}

export enum TOPICS_DEVICES {
  ENABLED = 'device-enabled',
  DISABLED = 'device-disabled',
}

export enum TOPICS_REFPOINTS {
  CREATED = 'refpoint-created',
  UPDATED = 'refpoint-updated',
  DELETED = 'refpoint-deleted',
}

export enum TOPICS_TASKS {
  CREATED = 'task-created',
  EDITED = 'task-edited',
  IMPACTED = 'task-impacted',
  ACCEPTED = 'task-accepted',
  REJECTED = 'task-rejected',
  COMPLETED = 'task-completed',
  REMOVED = 'task-removed',
  DELETED = 'task-deleted',
}

export enum ALL_TOPICS {
  // ZONES
  ZONE_CREATED = 'zone-created',
  ZONE_UPDATED = 'zone-updated',
  ZONE_DELETED = 'zone-deleted',

  // MOGS
  MOG_ENTERED = 'mog-entered',
  MOG_CONNECTED = 'mog-connected',
  MOG_DISCONNECTED = 'mog-disconnected',
  MOG_QUIT = 'mog-quit',
  MOG_UPDATED = 'mog-updated',

  // AIRCRAFTS
  AIRCRAFT_UPDATED = 'aircraft-updated',
  AIRCRAFT_DELETED = 'aircraft-deleted',
  AIRCRAFT_LOST = 'aircraft-lost',

  // DEVICES
  DEVICE_ENABLED = 'device-enabled',
  DEVICE_DISABLED = 'device-disabled',

  // REFPOINTS
  REFPOINT_CREATED = 'refpoint-created',
  REFPOINT_UPDATED = 'refpoint-updated',
  REFPOINT_DELETED = 'refpoint-deleted',

  // TASKS
  TASK_CREATED = 'task-created',
  TASK_EDITED = 'task-edited',
  TASK_IMPACTED = 'task-impacted',
  TASK_ACCEPTED = 'task-accepted',
  TASK_REJECTED = 'task-rejected',
  TASK_COMPLETED = 'task-completed',
  TASK_REMOVED = 'task-removed',
  TASK_DELETED = 'task-deleted',
}



// ZONES-INTERFACES

export interface ZonePolygon {
  equipmentId: string,
  type: ZONE_TYPE.POLYGON,
  params: {
    pointsCoordinates: Coordinates[],
  }
}

export interface ZoneSector {
  equipmentId: string,
  type: ZONE_TYPE.SECTOR,
  params: {
    centerCoordinates: Coordinates,
    radiusInMeters: number,
    startAngle: number,
    endAngle: number,
  },
}

export interface ZoneCreatedPolygon {
  equipmentId: string,
  params: {
    pointsCoordinates: Coordinates[]
  }
}

// прямоугольник типо
export interface ZoneCreatedSector {
  equipmentId: string,
  params: {
    centerCoordinates: Coordinates,
    radiusInMeters: number,
    startAngle: number,
    endAngle: number,
  },
}

export interface ZoneUpdatedPolygon {
  equipmentId: string,
  type: ZONE_TYPE,
  params: {
    pointsCoordinates: Coordinates[]
  },
}

export interface ZoneUpdatedSector {
  equipmentId: string,
  type: ZONE_TYPE,
  params: {
    centerCoordinates: Coordinates
    radiusInMeters: number,
    startAngle: number,
    endAngle: number,
  }
}

export interface ZoneDeleted {
  equipmentId: string,
}

// MOG INTERFACES

export interface MogEntered {
  username: string,
  connected: boolean,
  callSign: string,
}

export interface MogConnected {
  username: string,
}

export interface MogDisconnected {
  username: string
}

export interface MogQuit {
  username: string
}

export interface MogUpdated {
  username: string,
  callSign: string,
  ready: boolean,
  coordinates: Coordinates
}

// AIRCRAFTS INTERFACES

export interface AircraftUpdated {
  aircraftId: string,
  detectedBy: string,
  type: TYPE,
  coordinates: Coordinates,
  course: number,
  heightInMeters: number,
  speedInMeters: number,
  position: {
    azimuth: number,
    distanceInMeters: number,
    referencePointId: string,
  }
}

export interface AircraftDeleted {
  aircraftId: string,
}

export interface AircraftLost {
  aircraftId: string,
}

// DEVICES INTERFACES

export interface DeviceEnabled {
  id: string,
  model: string,
  name: string,
  type: string,
  coordinates: Coordinates,
  settings: {
    azimuth: number,
  }
}

export interface DeviceDisabled {
  id: string,
}

// REFPOINT INTERFACES

export interface RefPointCreated {
  name: string,
  coordinates: Coordinates,
}

export interface RefPointUpdated {
  name: string,
  coordinates: Coordinates,
}

// export interface RefPointDeleted

// TASK INTERFACES

//HTTP
export type TASK = TASK_DOT | TASK_AIRCRAFT

export type TASK_AIRCRAFT = {
  id: string,
  createdBy: string,
  assignedTo: string,
  message: string,
  type: TYPE_TO.TO_AIRCRAFT
  status: STATUS,
  aircraftId: string,
  impacted: boolean,
}

export type TASK_DOT = {
  id: string,
  createdBy: string,
  assignedTo: string,
  message: string,
  type: TYPE_TO.TO_POINT
  status: STATUS,
  coordinates: Coordinates,
  mogUsername?: string
}

export interface TaskDotCreatedHttp {
  assignedTo: string,
  message: string,
  coordinates: Coordinates;
}

export interface TaskAirCraftCreatedHttp {
  assignedTo: string,
  message: string,
  aircraftId: string,
}

export interface TaskUpdation {
  message: string,
  assignedTo: string,
}

//WEBSOCKET

export interface TaskDotCreated {
  id: string,
  createdBy: string,
  assignedTo: string,
  message: string,
  type: TYPE_TO,
  status: STATUS,
  coordinates: Coordinates,
  mogUsername?: string
}

export interface TaskAirCraftCreated {
  id: string,
  createdBy: string,
  assignedTo: string,
  message: string,
  type: TYPE_TO,
  status: STATUS,
  aircraftId: string,
  impacted: boolean
}


export interface TaskEdited {
  id: string,
  assignedTo: string,
  message: string
}

export interface TaskImpacted {
  id: string,
  assignedTo: string,
  aircraftId: string,
}

export interface TaskAccepted {
  id: string
  assignedTo: string
}

export interface TaskRejected {
  id: string,
  assignedTo: string
}

export interface TaskCompleted {
  id: string,
  assignedTo: string
}

export interface TaskRemoved {
  id: string,
  assignedTo: string
}

export interface TaskDeleted {
  id: string,
  assignedTo: string
}

