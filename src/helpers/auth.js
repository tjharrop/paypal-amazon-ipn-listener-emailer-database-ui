import { Firebase } from '../shared/constants';

export function logout () {
  return Firebase.auth().signOut();
}
