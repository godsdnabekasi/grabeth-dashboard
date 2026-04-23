import { IChurch } from "@/types/church";
import { IFile } from "@/types/file";
import { ILocation } from "@/types/location";

export interface IEvent {
  id: number;
  name: string;
  description?: string;
  church_id?: number;
  church?: IChurch;
  publish_time: string;
  unpublish_time: string;
  start_time: string;
  end_time: string;
  capacity?: number | null;
  website?: string;
  created_at?: string;
  event_file?: IEventFile;
  event_location?: {
    event_id: number;
    event: IEvent;
    location_id: number;
    location: ILocation;
  }[];
}

export interface IPayloadEvent extends Omit<IEvent, "id"> {
  id?: number | undefined;
}

export interface IEventFile {
  event_id?: number;
  event?: IEvent;
  file_id?: number;
  file?: IFile;
}

export interface IEventLocation {
  event_id: number;
  event?: IEvent;
  location_id: number;
  location?: ILocation;
}
