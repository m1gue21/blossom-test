import axios from 'axios';
import dotenv from 'dotenv';
import sequelize from '../../config/database';
import { Character } from '../../models';

dotenv.config();

interface RickMortyCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string };
  location: { name: string };
  image: string;
  episode: string[];
  url: string;
}

const SEED_CHARACTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export async function fetchAndSeedCharacters(): Promise<void> {
  const apiUrl = process.env.RICK_MORTY_API_URL || 'https://rickandmortyapi.com/api';
  const ids = SEED_CHARACTER_IDS.join(',');
  const { data } = await axios.get<RickMortyCharacter[]>(`${apiUrl}/character/${ids}`);

  const characters = Array.isArray(data) ? data : [data];

  for (const char of characters) {
    await Character.upsert({
      externalId: char.id,
      name: char.name,
      status: char.status,
      species: char.species,
      type: char.type || '',
      gender: char.gender,
      originName: char.origin.name,
      locationName: char.location.name,
      image: char.image,
      episode: char.episode,
      url: char.url,
      isDeleted: false,
    });
  }

  console.log(`✅ Seeded ${characters.length} characters successfully`);
}

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await fetchAndSeedCharacters();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

// Solo al ejecutar `npm run db:seed` / `node dist/database/seeds/seedCharacters.js`, no al importar desde index
if (require.main === module) {
  main();
}
