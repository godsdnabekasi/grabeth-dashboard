import { supabaseClient } from "@/lib/supabase/client";
import { IFile, IPayloadFile } from "@/types/file";

export type STORAGE_BUCKET = "images" | "videos";
export const QUERY_FILE = `file(*)`;

export const uploadFileToStorage = async (payload: {
  bucket: STORAGE_BUCKET;
  file: File;
  filePath: string;
}) => {
  const { bucket, file, filePath } = payload;
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
    });

  return { data, error };
};

export const uploadFile = async (payload: IPayloadFile) => {
  const { data, error } = await supabaseClient
    .from("file")
    .insert(payload)
    .select("*")
    .single<IFile>();

  return { data, error };
};

export const upsertFile = async (payload: IPayloadFile) => {
  const { data, error } = await supabaseClient
    .from("file")
    .upsert(payload)
    .select("*")
    .single<IFile>();

  return { data, error };
};

export const uploadFiles = async (payload: IPayloadFile[]) => {
  const { data, error } = await supabaseClient
    .from("file")
    .insert(payload)
    .select("*")
    .returns<IFile[]>();

  return { data, error };
};

export async function uploadImage(payload: {
  file: File;
  path: string;
  file_id?: number;
}) {
  const { path, file, file_id } = payload;
  if (!(file instanceof File))
    throw new Error("Invalid image: expected a File object");

  const { data: storageData, error: storageError } = await uploadFileToStorage({
    bucket: "images",
    file: file,
    filePath: `${path}.${file.name.split(".").pop()}`,
  });

  if (storageError) throw storageError;

  const { data: fileData, error: fileError } = await upsertFile({
    id: file_id || undefined,
    name: storageData?.path || "-",
    type: "image",
    link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${storageData?.fullPath || "-"}`,
  });

  return { data: fileData, error: fileError };
}
