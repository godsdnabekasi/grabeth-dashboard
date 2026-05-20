import { uploadImage } from "@/service/file";
import { insertUserFile } from "@/service/user";

interface IPropsPhoto {
  photo: File;
  userId?: string;
  fileId?: number;
}

const submitPhoto = async ({ photo, userId, fileId }: IPropsPhoto) => {
  const { data: uploadData, error: uploadError } = await uploadImage({
    file: photo,
    path: `avatar/${userId}/${Date.now()}`,
    file_id: fileId,
  });
  if (uploadError) throw uploadError;
  if (!fileId) {
    const { error: fileError } = await insertUserFile({
      file_id: uploadData!.id!,
      user_id: userId!,
    });
    if (fileError) throw fileError;
  }
};

const deletePhoto = async () => {};

export { submitPhoto, deletePhoto };
