import cron from 'node-cron';
import axios, { AxiosError } from 'axios';
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

interface CharacterPageResponse {
  info: { next: string | null };
  results: RickMortyCharacter[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delayBetweenPagesMs(): number {
  const raw = process.env.RICK_MORTY_SYNC_PAGE_DELAY_MS;
  const n = raw ? parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n >= 0) return n;
  return 450;
}

function maxRetriesPerPage(): number {
  const raw = process.env.RICK_MORTY_SYNC_MAX_RETRIES;
  const n = raw ? parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n >= 1) return n;
  return 12;
}

function waitMsAfter429(error: AxiosError, attempt: number): number {
  const header = error.response?.headers?.['retry-after'];
  if (header != null) {
    const sec = parseInt(String(header), 10);
    if (Number.isFinite(sec) && sec > 0) return sec * 1000;
  }
  const body = error.response?.data as { retry_after?: number } | undefined;
  if (body?.retry_after != null && Number.isFinite(body.retry_after) && body.retry_after > 0) {
    return Math.ceil(body.retry_after * 1000);
  }
  return Math.min(60_000, 3000 * attempt);
}

async function fetchCharacterPage(apiUrl: string, page: number): Promise<CharacterPageResponse> {
  const maxAttempts = maxRetriesPerPage();
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data } = await axios.get<CharacterPageResponse>(`${apiUrl}/character?page=${page}`);
      return data;
    } catch (e) {
      lastError = e;
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        const wait = waitMsAfter429(e, attempt);
        console.warn(
          `⏳ [CronJob] Rate limited on page ${page}, waiting ${wait}ms (attempt ${attempt}/${maxAttempts})`
        );
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Sincroniza todos los personajes desde la API pública.
 * Incluye pausa entre páginas y reintentos ante 429.
 * @returns número de personajes procesados
 */
export async function syncCharactersFromApi(): Promise<number> {
  const apiUrl = process.env.RICK_MORTY_API_URL || 'https://rickandmortyapi.com/api';
  const pageDelay = delayBetweenPagesMs();

  let page = 1;
  let hasNext = true;
  let updatedCount = 0;

  while (hasNext) {
    const data = await fetchCharacterPage(apiUrl, page);

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

    if (hasNext && pageDelay > 0) {
      await sleep(pageDelay);
    }
  }

  return updatedCount;
}

/** Igual que `syncCharactersFromApi`, pero no propaga errores (uso desde el cron). */
export async function updateCharactersFromAPI(): Promise<void> {
  console.log('🔄 [CronJob] Starting character update from Rick and Morty API...');

  try {
    const updatedCount = await syncCharactersFromApi();
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
