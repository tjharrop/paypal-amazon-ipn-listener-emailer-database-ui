/* global test expect */
import { parseReqBody } from './shared.js';

test('it will parse a flattened json object for e-mailing', () => {
  let obj = {
    key: 'first key',
    key2: 'second key',
    'key3.flattened': 'flattened key'
  };
  expect(parseReqBody(obj)).toBe(
    'key: first key\nkey2: second key\nkey3.flattened: flattened key\n'
  );
  expect(parseReqBody(obj, true)).toBe(
    'key: first key<br>key2: second key<br>key3.flattened: flattened key<br>'
  );
});
