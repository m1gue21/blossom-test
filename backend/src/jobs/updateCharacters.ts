import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import CharacterService from '../services/CharacterService';

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

async function updateCharactersFromAPI(): Promise<void> {
  const apiUrl = process.env.RICK_MORTY_API_URL || 'https://rickandmortyapi.com/api';
  console.log('🔄 [CronJob] Starting character update from Rick and Morty API...');

  try {
    let page = 1;
    let hasNext = true;
    let updatedCount = 0;

    while (hasNext) {
      const { data } = await axios.get<{
        info: { next: string | null };
        results: RickMortyCharacter[];
      }>(`${apiUrl}/character?page=${page}`);

      for (const char of data.results) {
        await CharacterService.upsertCharacter({
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
        });
        updatedCount++;
      }

      hasNext = !!data.info.next;
      page++;
    }

    console.log(`✅ [CronJob] Updated ${updatedCount} characters at ${new Date().toISOString()}`);
  } catch (err) {
    console.error('❌ [CronJob] Error updating characters:', err);
  }
}

export function startUpdateCronJob(): void {
  // Run every 12 hours
  cron.schedule('0 */12 * * *', updateCharactersFromAPI, {
    timezone: 'UTC',
  });
  console.log('⏰ Character update cron job scheduled (every 12 hours)');
}
