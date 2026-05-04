import dotenv from 'dotenv';

dotenv.config();

import sequelize from '../config/database';
import { syncCharactersFromApi } from '../jobs/updateCharacters';

async function main(): Promise<void> {
  await sequelize.authenticate();
  console.log('✅ DB connected — running one-shot character sync...');
  const n = await syncCharactersFromApi();
  console.log(`✅ Sync finished: ${n} characters processed`);
  await sequelize.close();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
