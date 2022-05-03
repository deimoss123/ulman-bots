import findUser from './findUser'
import User from '../schemas/User'

export default async function(
  guildId: string,
  userId: string,
  itemsToAdd: Record<string, number>,
): Promise<void> {
  try {
    const user = await findUser(guildId, userId)
    if (!user) return

    let { items } = user

    console.log('items to add:')
    console.log(itemsToAdd)
    for (const [itemToAdd, amountToAdd] of Object.entries(itemsToAdd)) {
      if (amountToAdd === 0) continue

      // meklē lietotāja inventārā itemToAdd
      const itemIndex = items.findIndex(item => item.name === itemToAdd)

      // ja nav lietotājam datubāzē, tad ievieto jaunu item objektu
      if (itemIndex === -1) {
        if (amountToAdd <= 0) continue // ja nav datubāzē, tad nav ko atņemt

        items.push({ name: itemToAdd, amount: amountToAdd })
        continue
      }

      // ir datubāzē bet tiek atņemts visas (vai vairāk) mantas
      if (items[itemIndex].amount + amountToAdd <= 0) {
        items.splice(itemIndex, 1)
        continue
      }

      items[itemIndex].amount += amountToAdd
    }

    console.log('users items:')
    console.log(items)

    await User.updateOne({ guildId, userId }, { $set: { items } })
  } catch (e) {
    // @ts-ignore
    console.log(e.message, new Date().toString())
  }
}