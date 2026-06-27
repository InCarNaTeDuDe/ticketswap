export const API_ENDPOINTS = {
  listings: '/listings',
  transactions: '/transactions',
  wallets: (userId: string) => `/wallets/${userId}`,
  refillWallet: (userId: string) => `/wallets/${userId}/refill`,
  withdrawWallet: (userId: string) => `/wallets/${userId}/withdraw`,
  adminStats: '/admin/stats',
};
