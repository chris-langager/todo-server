import { Context } from './context';
import { Event } from './todo/events';
import * as Store from './todo/store';

export interface Input {
  events: Event[];
}
export async function handleEvents(ctx: Context, input: Input) {
  await Store.handleEvents(ctx, input);
}
