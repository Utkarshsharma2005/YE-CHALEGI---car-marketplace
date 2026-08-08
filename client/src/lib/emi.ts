export const DEFAULT_APR = 8.5;
export const DEFAULT_DEPOSIT_PERCENT = 20;
export const DEFAULT_TENURE_MONTHS = 60;

export type EmiBreakdown = {
  emi: number;
  principal: number;
  downPayment: number;
  totalPayment: number;
  totalInterest: number;
};

/**
 * Standard EMI formula:  P * r * (1+r)^n / ((1+r)^n - 1)
 * where P = principal loan amount, r = monthly interest rate, n = tenure in months.
 */
export const computeEmi = (
  price: number,
  depositPercent = DEFAULT_DEPOSIT_PERCENT,
  tenureMonths = DEFAULT_TENURE_MONTHS,
  apr = DEFAULT_APR,
): EmiBreakdown => {
  const downPayment = Math.round((price * depositPercent) / 100);
  const principal = price - downPayment;
  const zero = { emi: 0, principal: 0, downPayment, totalPayment: 0, totalInterest: 0 };
  if (principal <= 0 || tenureMonths <= 0 || apr <= 0) return zero;
  const monthlyRate = apr / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;
  return { emi, principal, downPayment, totalPayment, totalInterest };
};

export const computeMonthlyEmi = (
  price: number,
  depositPercent = DEFAULT_DEPOSIT_PERCENT,
  tenureMonths = DEFAULT_TENURE_MONTHS,
  apr = DEFAULT_APR,
): number => computeEmi(price, depositPercent, tenureMonths, apr).emi;
