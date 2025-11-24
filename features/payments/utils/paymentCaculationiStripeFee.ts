export const paymentCaculationStripeFee = (
  value: number,
  isUserDisplay?: boolean
) => {
  let amountInPounds = 0;
  let transactionFee = 0;
  let total = 0;
  if (isUserDisplay) {
    amountInPounds = value;
    transactionFee = value > 0 ? amountInPounds * 0.019 + 20 : 0;
    // total = Math.round(amountInPounds + transactionFee);
    total = amountInPounds + transactionFee;
  } else {
    amountInPounds = value / 100;
    transactionFee = value > 0 ? amountInPounds * 0.019 + 0.2 : 0;
    // total = Math.round(amountInPounds + transactionFee);
    total = amountInPounds + transactionFee;
  }

  return { amountInPounds, transactionFee, total };
};
