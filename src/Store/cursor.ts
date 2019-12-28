export interface Cursor {
  id: string;
}
export function encode(cursor: Cursor) {
  return new Buffer(JSON.stringify(cursor)).toString('base64');
}
export function decode(s: string): Cursor {
  try {
    return JSON.parse(new Buffer(s, 'base64').toString());
  } catch (e) {
    throw new Error('unable to decode cursor token');
  }
}
