/**
 * Scrapes all artists from the UNTOLD API and writes scheduleData.ts
 * Run: npx tsx scripts/scrape-artists.ts
 */

const API_URL = 'https://untold.com/api/artists/get-filtered-artists';
const PAGE_SIZE = 50;

interface ApiArtist {
  id: string;
  artist: {
    id: string;
    name: string;
    description: string;
    imageLink: string;
    thumbnailLink: string;
  };
  stage: {
    id: string;
    name: string;
    ordinal: number;
    subheading: string;
  };
  date: number;
  dateLabel: string;
  startTimestamp: number;
  endTimestamp: number;
}

interface ApiResponse {
  content: ApiArtist[];
  totalElements: number;
  totalPages: number;
}

async function fetchPage(page: number): Promise<ApiResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'content-type': 'text/plain;charset=UTF-8',
      'origin': 'https://untold.com',
      'referer': 'https://untold.com/stages',
      'user-agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
    },
    body: JSON.stringify({ params: { size: PAGE_SIZE, page, text: '' } }),
  });

  if (!res.ok) throw new Error(`API returned ${res.status}`);
  return res.json();
}

function timestampToTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getUTCHours() + 3; // Romania is UTC+3 in summer
  const m = d.getUTCMinutes();
  const adjustedH = h >= 24 ? h - 24 : h;
  return `${adjustedH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function dayLabelToNumber(label: string): number {
  const match = label.match(/Day (\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

async function main() {
  console.log('Fetching page 0 to get total count...');
  const first = await fetchPage(0);
  const total = first.totalElements;
  const pages = Math.ceil(total / PAGE_SIZE);
  console.log(`Total: ${total} artists, ${pages} pages`);

  let allSets: ApiArtist[] = [...first.content];

  for (let p = 1; p < pages; p++) {
    console.log(`Fetching page ${p}/${pages - 1}...`);
    const res = await fetchPage(p);
    allSets.push(...res.content);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Fetched ${allSets.length} artist sets total`);

  // Extract unique stages
  const stageMap = new Map<string, { id: string; name: string; subheading: string }>();
  for (const set of allSets) {
    if (!stageMap.has(set.stage.id)) {
      stageMap.set(set.stage.id, {
        id: set.stage.id,
        name: set.stage.name,
        subheading: set.stage.subheading,
      });
    }
  }

  // Create stable short stage IDs
  const stageIdMap = new Map<string, string>();
  const stages = Array.from(stageMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  for (const s of stages) {
    const shortId = s.name.toLowerCase().replace(/\s+/g, '_');
    stageIdMap.set(s.id, shortId);
  }

  // Stage colors
  const stageColors: Record<string, string> = {
    'main': '#38bdf8',
    'galaxy': '#a855f7',
    'alchemy': '#f43f5e',
    'daydreaming': '#10b981',
    'time': '#fbbf24',
    'tram': '#f97316',
    'retro': '#ec4899',
    'form': '#6366f1',
    'soul_circle': '#14b8a6',
    'sour_circle': '#14b8a6',
  };

  // Build TypeScript output
  const stagesTs = stages.map(s => {
    const shortId = stageIdMap.get(s.id)!;
    const color = stageColors[shortId] || '#8b5cf6';
    return `  {\n    id: "${shortId}",\n    name: "${s.name}",\n    color: "${color}",\n    description: "${s.subheading}",\n  }`;
  });

  const artistSetsTs = allSets.map(set => {
    const stageShortId = stageIdMap.get(set.stage.id) || 'main';
    const day = dayLabelToNumber(set.dateLabel);
    const startTime = timestampToTime(set.startTimestamp);
    const endTime = timestampToTime(set.endTimestamp);
    const name = set.artist.name.replace(/"/g, '\\"');
    const id = `${stageShortId}_d${day}_${startTime.replace(':', '')}`;
    const imageUrl = set.artist.thumbnailLink || '';

    return `  {\n    id: "${id}",\n    artistName: "${name}",\n    stageId: "${stageShortId}",\n    day: ${day},\n    startTime: "${startTime}",\n    endTime: "${endTime}",\n    imageUrl: "${imageUrl}",\n  }`;
  });

  // Generate StageId type
  const stageIds = stages.map(s => `"${stageIdMap.get(s.id)}"`).join(' | ');

  const output = `import type { Stage, ArtistSet } from '../types';

export const STAGES: Stage[] = [
${stagesTs.join(',\n')}
];

export const ARTIST_SETS: ArtistSet[] = [
${artistSetsTs.join(',\n')}
];
`;

  // Write the file
  const fs = await import('fs');
  const path = await import('path');
  const outPath = path.join(process.cwd(), 'src/data/scheduleData.ts');
  fs.writeFileSync(outPath, output, 'utf-8');
  console.log(`\nWrote ${outPath}`);
  console.log(`  ${stages.length} stages`);
  console.log(`  ${allSets.length} artist sets`);

  // Also print the StageId type for types.ts
  console.log(`\nUpdate src/types.ts StageId to:\n  export type StageId = ${stageIds};`);
}

main().catch(e => { console.error(e); process.exit(1); });
