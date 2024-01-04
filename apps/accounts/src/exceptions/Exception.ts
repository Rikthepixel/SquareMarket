export default abstract class Exception extends Error {
  abstract name: string;
  abstract message: string;
}
