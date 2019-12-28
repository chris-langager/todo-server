import { Context } from './context';
import { Event } from './events';
import * as Store from './Store';

export interface Input {
  events: Event[];
}
export async function handleEvents(ctx: Context, input: Input) {
  await Store.handleEvents(ctx, input);
}
