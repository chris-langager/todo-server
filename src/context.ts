import { Claims } from './tokens/userAccessToken';

export interface Context {
  token?: string;
  claims?: Claims;
}
