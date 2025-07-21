export const removeDotsFromEmail = (email: string): string => {
  return email.replace(/\./g, "");
};
