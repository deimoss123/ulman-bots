import editItemAttribute from '../../economy/editItemAttribute';
import UsableItemReturn from '../../interfaces/UsableItemReturn';
import { SpecialItemInProfile } from '../../interfaces/UserProfile';

export default async function divainais_burkans(
  userId: string,
  specialItem?: SpecialItemInProfile
): Promise<UsableItemReturn> {
  const res = await editItemAttribute(userId, specialItem!._id!, {
    customName: specialItem?.attributes.customName,
    timesUsed: specialItem!.attributes.timesUsed! + 1,
  });
  if (!res) return { text: 'Ulmaņbota Kļūda' };

  return {
    text:
      'Tu nokodies dīvaino burkānu, **mmmm** tas bija ļoti garšīgs\n' +
      `Šis burkāns ir nokosts **${res.newItem.attributes.timesUsed!}** reizes`,
  };
}
