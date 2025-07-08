import { authSchema } from "@/constants/consts";
import { z } from "zod";

export type AuthType = z.infer<typeof authSchema>

export type LoginRequest = {
  username: string;
  password: string;
}

export type LoginResponse = {
  access_token: string,
  refresh_token: string,
  expires_in: number
}

export type Coordinates = {
  lat: number,
  lng: number,
}

export enum ZONE_TYPE {
  POLYGON = "polygon",
  SECTOR = "sector"
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
}

// ZONES-INTERFACES

export interface ZoneCreatedPolygon {
  equipmentId: string,
  params: {
    pointsCoordinates: Coordinates[]
  }
}

export interface ZoneCreatedSector {
  equipmentId: string,
  params: {
    centerCoordinates: Coordinates[]
  },
  radiusInMeters: number,
  startAngle: number,
  endAngle: number,
}

export interface ZoneUpdatedPolygon {
  equipmentId: string,
  type: ZONE_TYPE,
  params: {
    pointsCoordinates: Coordinates
  },
}

export interface ZoneUpdatedSector {
  equipmentId: string,
  type: ZONE_TYPE,
  params: {
    centerCoordinates: Coordinates
  },
  radiusInMeters: number,
  startAngle: number,
  endAngle: number,
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

export interface TaskDotCreated {
  id: string,
  createdBy: string,
  assignedTo: string,
  message: string,
  type: TYPE_TO,
  status: STATUS,
  coordinates: Coordinates,
}

export interface TaskPointCreated {
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
