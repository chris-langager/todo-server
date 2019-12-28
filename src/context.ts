import { Span } from 'opentracing';
import { Claims } from 'tokens-ts';

export interface Context {
  span: Span;
  token?: string;
  claims?: Claims;
  actor?: string;
  authorizedBusinessIds?: string[];
}
