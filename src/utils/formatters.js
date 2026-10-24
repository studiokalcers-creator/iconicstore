// Shared lightweight formatters (zero external dependencies)

export const formatRupiah = (number) => {
  if (isNaN(number) || number === null || number === undefined) return 'Rp 0';
  return 'Rp ' + Number(number).toLocaleString('id-ID');
};

export const formatDateIndo = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};
