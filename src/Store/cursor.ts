export interface Cursor {
  id: string;
}
export function encode(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString('base64');
}
export function decode(s: string): Cursor {
  try {
    return JSON.parse(Buffer.from(s, 'base64').toString());
  } catch (e) {
    throw new Error('unable to decode cursor token');
  }
}
