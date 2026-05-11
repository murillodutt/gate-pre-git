import { value } from "../src";

if (value !== 1) {
  throw new Error(`expected value to be 1, got ${value}`);
}
