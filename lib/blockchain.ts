export const POLYGON_NETWORK_NAME = "Polygon Amoy Testnet"
export const POLYGON_EXPLORER_BASE = "https://amoy.polygonscan.com"
export const POLYGON_EXPLORER_HOST = POLYGON_EXPLORER_BASE.replace(/^https?:\/\//, "")
export const polygonscanTxUrl = (txHash: string) =>
  `${POLYGON_EXPLORER_BASE}/tx/${txHash}`
