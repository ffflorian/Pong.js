export const parseOctal = (color: string): string => {
  return '0x' + color.substr(1);
};
