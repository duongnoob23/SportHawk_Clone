export interface StripeAccountDBResult {
  id: string;
  teamId: string;
  stripeAccountId: string;
  accountStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  country: string;
  currency: string;
  accountEmail: string;
  businessType: string;
  createdAt: string;
  updatedAt: string;
}
