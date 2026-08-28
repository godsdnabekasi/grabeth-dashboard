import { upsertChurchContact } from "@/service/church";
import { deleteContacts, upsertContacts } from "@/service/contact";
import { IPayloadContact } from "@/types/contact";

//* UPDATE PHONE
const submitPhone = async (
  contacts: IPayloadContact[],
  existingContacts: IPayloadContact[],
  churchId: number
) => {
  console.log(contacts);

  const newContact = contacts.filter((c) => !c.id);
  const updatedContact = contacts.filter((c) => c.id);
  const deletedContacts = existingContacts.filter(
    (c) => !contacts.some((contact) => contact.id === c.id)
  );

  let contactPhoneData;

  if (updatedContact.length > 0) {
    const { data, error } = await upsertContacts(updatedContact);
    if (error) throw error;
    contactPhoneData = data;
  }
  if (newContact.length > 0) {
    const { data, error } = await upsertContacts(newContact);
    if (error) throw error;
    contactPhoneData = [...(contactPhoneData || []), ...data];
  }

  if (newContact.length > 0) {
    const { error: userContactError } = await upsertChurchContact(
      contactPhoneData?.map((contact) => ({
        contact_id: contact.id,
        church_id: churchId,
      })) || []
    );
    if (userContactError) throw userContactError;
  }

  if (deletedContacts.length > 0) {
    const { error: deletePhoneError } = await deleteContacts(
      deletedContacts.map((contact) => contact.id!)
    );
    if (deletePhoneError) throw deletePhoneError;
  }
};

export { submitPhone };
