import { createClient } from '@sanity/client';

export const sanityClient = import.meta.env.SANITY_PROJECT_ID
  ? createClient({
      projectId:  import.meta.env.SANITY_PROJECT_ID,
      dataset:    import.meta.env.SANITY_DATASET    || 'production',
      apiVersion: import.meta.env.SANITY_API_VERSION || '2024-01-01',
      useCdn: true,
      perspective: 'published',
    })
  : null;

export type Insight = {
  _id: string;
  slug: { current: string };
  format: 'Pulse' | 'Probe' | 'Snap';
  title: string;
  date: string;
  body?: unknown[];
  pdfUrl?: string;
  imageUrl?: string;
};

const CARD_FIELDS = `_id, slug, format, title, date`;
const FULL_FIELDS = `_id, slug, format, title, date, "body": body[]{..., "url": asset->url}, "pdfUrl": pdfAsset.asset->url, "imageUrl": image.asset->url`;

export async function getInsights(limit = 6): Promise<Insight[]> {
  if (!import.meta.env.SANITY_PROJECT_ID) return [];
  return sanityClient!.fetch(
    `*[_type == "insight"] | order(date desc) [0...$limit] { ${CARD_FIELDS} }`,
    { limit }
  );
}

export async function getAllInsights(): Promise<Insight[]> {
  if (!import.meta.env.SANITY_PROJECT_ID) return [];
  return sanityClient!.fetch(
    `*[_type == "insight"] | order(date desc) { ${FULL_FIELDS} }`
  );
}

export async function getInsightBySlug(slug: string): Promise<Insight | null> {
  if (!import.meta.env.SANITY_PROJECT_ID) return null;
  return sanityClient!.fetch(
    `*[_type == "insight" && slug.current == $slug][0] { ${FULL_FIELDS} }`,
    { slug }
  );
}
