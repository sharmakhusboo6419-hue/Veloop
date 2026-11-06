export function copyToClipboard(text: string, onSuccess?: () => void) {
  navigator.clipboard.writeText(text).then(() => {
    if (onSuccess) onSuccess();
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num || 0);
}
