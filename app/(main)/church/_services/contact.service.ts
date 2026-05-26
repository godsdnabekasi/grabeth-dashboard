import { upsertContact, upsertUserContact } from "@/service/contact";

interface IPropsContact {
  phoneNumber: number;
  email?: string | undefined;
  phoneId?: number | undefined;
  emailId?: number | undefined;
}

//* UPDATE EMAIL
const submitEmail = async (contact: IPropsContact, userId: string) => {
  const { data: contactData, error: updateError } = await upsertContact({
    id: contact?.emailId,
    type: "email",
    value: contact?.email || "",
  });
  if (updateError) throw updateError;
  if (!contact?.emailId) {
    const { error: userContactError } = await upsertUserContact({
      contact_id: contactData?.id,
      user_id: userId!,
    });
    if (userContactError) throw userContactError;
  }
};

//* UPDATE PHONE
const submitPhone = async (contact: IPropsContact, userId: string) => {
  const { data: contactPhoneData, error: updatePhoneError } =
    await upsertContact({
      id: contact?.phoneId,
      type: "phone",
      value: String(contact?.phoneNumber),
    });
  if (updatePhoneError) throw updatePhoneError;
  if (!contact?.phoneId) {
    const { error: userContactError } = await upsertUserContact({
      contact_id: contactPhoneData?.id,
      user_id: userId!,
    });
    if (userContactError) throw userContactError;
  }
};

export { submitEmail, submitPhone };
