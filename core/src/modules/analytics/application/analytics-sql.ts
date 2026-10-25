/**
 * Fragmentos SQL compartidos por los indicadores. Los montos se expresan en CLP:
 * lo que está en UF se convierte con el valor UF guardado en el contrato.
 */

/** Monto de un pago en CLP (`p` = payments, `c` = contracts). */
export const PAYMENT_AMOUNT_CLP =
  "CASE WHEN p.currency = 'UF' THEN p.amount * COALESCE(c.ufValue, 0) ELSE p.amount END";

/** Monto contractual en CLP (`contract` = contracts). */
export const CONTRACT_AMOUNT_CLP =
  "CASE WHEN contract.currency = 'UF' THEN contract.amount * COALESCE(contract.ufValue, 0) ELSE contract.amount END";

/** Días entre la creación y el cierre del contrato (no la última edición). */
export const CONTRACT_CLOSURE_DAYS =
  'DATEDIFF(contract.endDate, contract.createdAt)';
