/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-constant-condition */
export const convertNumberToCurrency = (inputNumber: number) => {
  const re = "\\d(?=(\\d{" + (0 || 3) + "})+" + (2 > 0 ? "\\." : "$") + ")";
  return inputNumber
    .toFixed(Math.max(0, ~~2))
    .replace(new RegExp(re, "g"), "$&,");
};
