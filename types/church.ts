import { IFile } from "@/types/file";

export interface IChurch {
  id: number;
  name: string;
  description?: string;
  establish_date?: string;
  created_at?: string;
  church_file?: {
    id: number;
    file_id: number;
    file: IFile;
  };
  youtube_channel_url?: string;
  // church_location?: IChurchLocation[];
  // church_user?: IChurchUser[];
}
