/**
 * Stripe test card numbers — see https://docs.stripe.com/testing#cards
 */
export const TEST_CARDS = {
  /** Always succeeds, no auth challenge. Most useful for happy-path E2E. */
  visa: '4242 4242 4242 4242',
  /** Triggers 3DS challenge — useful for negative tests. */
  visa3DS: '4000 0027 6000 3184',
  /** Always declined */
  declined: '4000 0000 0000 0002',
}

export const TEST_CARD_EXTRAS = {
  expiry: '12 / 34',
  cvc: '123',
  postal: '11111',
  cardholderName: 'Booppa QA',
}
