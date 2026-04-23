export type FILE_TYPE = "image" | "video";
export type IFileType =
  | "image"
  | "document"
  | "ktp"
  | "kartu keluarga"
  | "akta nikah"
  | "akta lahir"
  | "skck";

export interface IFile {
  id: number;
  name: string;
  type: IFileType;
  link: string;
  created_at?: string;
  deleted_at?: string;
}

export interface IPayloadFile extends Omit<IFile, "id"> {
  id?: number;
}
