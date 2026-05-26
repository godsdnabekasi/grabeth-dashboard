import { upsertChurchFile } from "@/service/church";
import { uploadImage } from "@/service/file";

interface IPropsPhoto {
  photo: File;
  churchId?: number;
  fileId?: number;
}

const submitPhoto = async ({ photo, churchId, fileId }: IPropsPhoto) => {
  const { data: uploadData, error: uploadError } = await uploadImage({
    file: photo,
    path: `church/${churchId}/${Date.now()}`,
    file_id: fileId,
  });
  if (uploadError) throw uploadError;

  if (!fileId) {
    const { error: fileError } = await upsertChurchFile({
      file_id: uploadData!.id!,
      church_id: churchId!,
    });
    if (fileError) throw fileError;
  }
};

const deletePhoto = async () => {};

export { submitPhoto, deletePhoto };
