/* global test expect */
import * as downloadInfo from './downloadInfo';

test('downloadInfo material is formatted properly',  () => {
  expect(downloadInfo).toBeDefined();
  expect(downloadInfo.text).toBeDefined();
  expect(downloadInfo.html).toBeDefined();
  expect(/<html>/.test(downloadInfo.text)).toEqual(false);
  expect(/<html>/.test(downloadInfo.html)).toEqual(true);
});
