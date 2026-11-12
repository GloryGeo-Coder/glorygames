// This parser stays independent of scene/model imports so old world saves load safely.
export const SERVICE_SECONDS = 3;
export function restoreShopkeeper(value) {
  if (typeof value?.name !== 'string' || !value.name.trim() || value.name.trim().length > 24)
    return null;
  const customer = typeof value.customer === 'string' ? value.customer : '';
  const wait =
    customer && Number.isFinite(value.wait) && value.wait >= 0 && value.wait < SERVICE_SECONDS
      ? value.wait
      : 0;
  return { name: value.name.trim(), paused: value.paused === true, customer, wait };
}
