export const formatAadhaar = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

export const formatIndianNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  const lastThree = digits.slice(-3);
  const otherDigits = digits.slice(0, -3);

  if (!otherDigits) return lastThree;

  return otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
};

