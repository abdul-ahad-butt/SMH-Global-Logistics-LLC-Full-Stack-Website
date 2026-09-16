/**
 * Public ID generators for quote requests and shipments.
 * These are human-readable, not sequential DB IDs.
 */

export function generateQuoteId(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(5, '0');
  return `SMH-QT-${year}-${padded}`;
}

export function generateTrackingNumber(sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(6, '0');
  return `SMH-${padded}`;
}

export function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Extracts the next sequence number from the DB max id.
 * Falls back to 1 if the table is empty.
 */
export function nextSequence(maxId: number | null): number {
  return (maxId ?? 0) + 1;
}
