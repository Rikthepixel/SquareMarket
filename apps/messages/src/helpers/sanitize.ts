import { sanitize as domSanitize } from 'isomorphic-dompurify';

export default function sanitize(text: string) {
  return domSanitize(text);
}
