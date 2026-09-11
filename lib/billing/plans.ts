export type BillingInterval = "monthly" | "yearly";

export const BILLING_PLANS = {
  monthly: {
    interval: "monthly",
    label: "Monthly",
    price: "$9.99",
    cadence: "/ month",
    productIdEnv: "CREEM_MONTHLY_PRODUCT_ID",
  },
  yearly: {
    interval: "yearly",
    label: "Yearly",
    price: "$99.99",
    cadence: "/ year",
    productIdEnv: "CREEM_YEARLY_PRODUCT_ID",
  },
} as const satisfies Record<BillingInterval, {
  interval: BillingInterval;
  label: string;
  price: string;
  cadence: string;
  productIdEnv: string;
}>;

export const PLAN_FEATURES = [
  { title: "One connected X account", description: "Track your posts and replies from one focused creator account." },
  { title: "Personal daily goals", description: "Choose the posting and reply targets that match your own routine." },
  { title: "Streaks that keep you moving", description: "See your current streak and personal best every time you check in." },
  { title: "A complete activity heat map", description: "Turn your posting history into a clear visual record of consistency." },
  { title: "Automatic progress syncing", description: "Refresh activity around midday and just before your local day ends." },
  { title: "Three manual refreshes a day", description: "Pull in your latest activity when you want an immediate update." },
  { title: "Your day, in your time zone", description: "Goals and streaks follow your actual local calendar day." },
];

export function getCreemProductId(interval: BillingInterval) {
  return interval === "monthly"
    ? process.env.CREEM_MONTHLY_PRODUCT_ID
    : process.env.CREEM_YEARLY_PRODUCT_ID;
}

export function billingIntervalForProduct(productId: string): BillingInterval | null {
  if (productId === process.env.CREEM_MONTHLY_PRODUCT_ID) return "monthly";
  if (productId === process.env.CREEM_YEARLY_PRODUCT_ID) return "yearly";
  return null;
}

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}
