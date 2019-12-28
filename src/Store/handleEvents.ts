import { wrapWith } from '../lib/Core';
import { logger } from '../logger';
import { Context } from '../context';
import { Event, byType } from '../events';
import { insertEvents } from './insertEvents';

const mutations = wrapWith({});

export interface Input {
  events: Event[];
}
export async function handleEvents(ctx: Context, input: Input) {
  const { events } = input;
  logger.debug(`store handling ${events.length} events...`);

  const eventsByType = byType(events);

  // await mutations.upsertRevenueCenters(ctx, [
  //   ...eventsByType.RevenueCenterCreated.map(o => o.payload.newRecord),
  //   ...eventsByType.RevenueCenterUpdated.map(o => o.payload.newRecord),
  // ]);

  // await mutations.upsertMajorCategories(ctx, [
  //   ...eventsByType.MajorCategoryCreated.map(o => o.payload.newRecord),
  //   ...eventsByType.MajorCategoryUpdated.map(o => o.payload.newRecord),
  // ]);

  // await mutations.upsertMinorCategories(ctx, [
  //   ...eventsByType.MinorCategoryCreated.map(o => o.payload.newRecord),
  //   ...eventsByType.MinorCategoryUpdated.map(o => o.payload.newRecord),
  // ]);

  await insertEvents(ctx, events);

  return {};
}
