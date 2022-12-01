import User from '../schemas/User';
import mongo from './mongo';
import dotenv from 'dotenv';

dotenv.config();

// sūdīga funkcija lai atjaunotu datubāzi ar jaunajiem mantu atribūtiem
export default async function updateDb() {
  await mongo().then(() => console.log('Connected to MongoDB'));
  console.log('started updating');

  // visiem kaķiem un pētniekiem pievieno tukšu cepures atribūtu
  await User.updateMany(
    {},
    { $set: { 'specialItems.$[elem].attributes.hat': '' } },
    {
      arrayFilters: [{ $or: [{ 'elem.name': 'kakis' }, { 'elem.name': 'petnieks' }] }],
    }
  );
  console.log('finished updating 1/3 (hat)');

  // visiem kaķiem pievieno isCooked atribūtu kā false (nākotnei)
  await User.updateMany(
    {},
    { $set: { 'specialItems.$[elem].attributes.isCooked': false } },
    {
      arrayFilters: [{ 'elem.name': 'kakis' }],
    }
  );
  console.log('finished updating 2/3 (isCooked)');

  // pievieno adventeClaimedDate lauku kā null visiem
  await User.updateMany({}, { $set: { adventeClaimedDate: null } });
  console.log('finished updating 3/3 (adventeClaimedDate)');
}

updateDb();
