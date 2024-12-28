import process from "process";

export const createRegExp = (value: string | RegExp, flags?: string): RegExp => {
  try {
    return new RegExp(value, flags);
  } catch (error) {
    console.error(`Invalid regular expression pattern: ${value}`);
    process.exit(1);
  }
}
