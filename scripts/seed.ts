import { database } from '../src/lib/db';
import { defaultServices, defaultStylist } from '../src/lib/defaults';
async function main() {



  const d = await database();



  for (const s of defaultServices) await d.services.updateOne({ id: s.id }, { $setOnInsert: s }, { upsert: true });



  await d.stylists.updateOne({ id: defaultStylist.id }, { $setOnInsert: defaultStylist }, { upsert: true });



  console.log('Services and one stylist are ready. Existing records were preserved.');



  await d.client.close();
}
main().catch(() => {



  console.error('Seed failed. Check NEXT_MONGODB_URL and database access.');



  process.exitCode = 1;
});
