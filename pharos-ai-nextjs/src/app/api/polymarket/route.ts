import { NextResponse } from 'next/server';

const GAMMA = 'https://gamma-api.polymarket.com';

const QUERIES = [
  'iran', 'israel iran', 'hormuz', 'khamenei', 'nuclear iran',
  'iran strike', 'israel strike iran', 'iran ceasefire',
  'iran oil', 'irgc', 'iran us war', 'persian gulf',
];

interface PolyEvent {
  id: string;
  title: string;
  description: string;
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  endDate: string;
  image: string;
  volume24hr: number;
  volume1wk: number;
  markets: Array<{
    id: string;
    slug?: string;
    question: string;
    outcomes: string;
    outcomePrices: string;
    volume: string;
    liquidity: string;
    active: boolean;
    closed: boolean;
    endDate: string;
    conditionId: string;
    clobTokenIds?: string;   // JSON-encoded string array — [YES_token, NO_token]
  }>;
}

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: string;        // empty — assigned manually by LLM pipeline
  outcomes: string[];
  prices: number[];        // implied probabilities 0–1
  volume: number;
  volume24hr: number;
  volume1wk: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  endDate: string;
  image: string;
  polyUrl: string;
  conditionId: string;
  yesTokenId: string;      // CLOB token ID for YES outcome — used for price history chart
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      QUERIES.map(q =>
        fetch(`${GAMMA}/public-search?q=${encodeURIComponent(q)}&limit=20`, {
          next: { revalidate: 120 },
        }).then(r => r.json())
      )
    );

    const seen = new Set<string>();
    const events: PolyEvent[] = [];

    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const data = result.value as { events?: PolyEvent[] };
      for (const event of (data.events ?? [])) {
        if (!seen.has(event.id) && event.markets?.length > 0) {
          seen.add(event.id);
          events.push(event);
        }
      }
    }

    events.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));

    const markets: PredictionMarket[] = events
      .filter(event => !event.closed)   // drop fully settled markets
      .slice(0, 60)
      .map(event => {
        const market = event.markets[0];
        let outcomes: string[] = [];
        let prices: number[] = [];
        let tokenIds: string[] = [];
        try { outcomes = JSON.parse(market.outcomes        ?? '[]'); } catch { /* ignore */ }
        try { prices   = (JSON.parse(market.outcomePrices  ?? '[]') as string[]).map(Number); } catch { /* ignore */ }
        try { tokenIds = JSON.parse(market.clobTokenIds    ?? '[]'); } catch { /* ignore */ }

        return {
          id: event.id,
          title: event.title,
          description: event.description?.slice(0, 300) ?? '',
          category: '',
          outcomes,
          prices,
          volume: event.volume ?? 0,
          volume24hr: event.volume24hr ?? 0,
          volume1wk: event.volume1wk ?? 0,
          liquidity: event.liquidity ?? 0,
          active: event.active ?? false,
          closed: event.closed ?? false,
          endDate: event.endDate ?? '',
          image: event.image ?? '',
          polyUrl: `https://polymarket.com/event/${market.slug ?? event.id}`,
          conditionId: market.conditionId ?? '',
          yesTokenId: tokenIds[0] ?? '',
        };
      });

    return NextResponse.json({ markets, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: String(err), markets: [] }, { status: 500 });
  }
}
