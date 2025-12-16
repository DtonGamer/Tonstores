/**
 * Calculate percentage change between two numbers
 * @param current The current value
 * @param previous The previous value
 * @returns The percentage change
 */
export const calculatePercentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
};