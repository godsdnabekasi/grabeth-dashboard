import { supabaseClient } from "@/lib/supabase/client";
import { IFile, IPayloadFile } from "@/types/file";

export type STORAGE_BUCKET = "images" | "videos";

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

export const uploadFiles = async (payload: IPayloadFile[]) => {
  const { data, error } = await supabaseClient
    .from("file")
    .insert(payload)
    .select("*")
    .returns<IFile[]>();

  return { data, error };
};
