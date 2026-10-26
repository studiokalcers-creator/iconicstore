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

export const parseToIso = (str) => {
  if (!str) return new Date().toISOString();
  if (typeof str !== 'string') {
    try { return new Date(str).toISOString(); } catch { return new Date().toISOString(); }
  }
  // If already standard ISO with T
  const direct = new Date(str);
  if (!isNaN(direct.getTime()) && str.includes('-') && str.includes('T')) {
    return direct.toISOString();
  }
  
  // Indonesian format: DD/MM/YYYY, HH.MM.SS or HH:MM:SS
  const match = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:[,\s]+(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?)?/);
  if (match) {
    const [, d, m, y, h, min, s] = match;
    const dt = new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0), Number(s || 0));
    if (!isNaN(dt.getTime())) return dt.toISOString();
  }
  if (!isNaN(direct.getTime())) {
    return direct.toISOString();
  }
  return new Date().toISOString();
};
