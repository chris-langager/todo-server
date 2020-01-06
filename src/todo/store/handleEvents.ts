import { wrapWith } from '../../lib/Core';
import { logger } from '../../logger';
import { Context } from '../../context';
import { Event } from '../events';
import { insertEvents } from './insertEvents';

const mutations = wrapWith({});

export interface Input {
  events: Event[];
}
export async function handleEvents(ctx: Context, input: Input) {
  const { events } = input;
  logger.debug(`store handling ${events.length} events...`);

  await insertEvents(ctx, events);

  return {};
}
