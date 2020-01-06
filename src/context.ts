import { Claims } from './tokens/userAccessToken';

//CONSIDER - should each domain directory have it's own context? probably...
export interface Context {
  token?: string;
  claims?: Claims;
}
