// Kalkulator estimasi kebutuhan: pilihan pengguna -> skor -> paket bundling yang cocok.
// Tiap pilihan: [nilai, teks tampil, poin]
const KATEGORI_PAKET = 'Paket Bundling';

const OPSI = {
  platform: { label: 'Platform', pilihan: [
    ['instagram', 'Instagram', 0],
    ['tiktok', 'TikTok', 0],
    ['keduanya', 'Instagram & TikTok', 1],
  ]},
  konten: { label: 'Jumlah Konten/Bulan', pilihan: [
    ['1-9', '1 - 9 Konten', 0],
    ['10-15', '10 - 15 Konten', 1],
    ['16-25', '16 - 25 Konten', 2],
    ['26+', '26+ Konten', 3],
  ]},
  jenis: { label: 'Jenis Konten', pilihan: [
    ['feed', 'Feed saja', 0],
    ['video', 'Reels / Video saja', 1],
    ['reels-feed', 'Reels & Feed', 2],
  ]},
  media: { label: 'Perlu Foto/Video?', pilihan: [
    ['tidak', 'Tidak', 0],
    ['foto', 'Ya, Foto saja', 1],
    ['video', 'Ya, Video saja', 1],
    ['keduanya', 'Ya, Keduanya', 2],
  ]},
};

const DEFAULT = { platform: 'instagram', konten: '10-15', jenis: 'reels-feed', media: 'keduanya' };

// Hanya nilai yang ada di daftar yang diterima; selain itu dipakai nilai bawaan.
function bacaPilihan(query) {
  const pilihan = {};
  let lengkap = true;
  for (const nama of Object.keys(OPSI)) {
    const v = query[nama];
    if (typeof v === 'string' && OPSI[nama].pilihan.some((o) => o[0] === v)) pilihan[nama] = v;
    else { pilihan[nama] = DEFAULT[nama]; lengkap = false; }
  }
  return { pilihan, lengkap };
}

const poin = (nama, nilai) => OPSI[nama].pilihan.find((o) => o[0] === nilai)[2];
const teks = (nama, nilai) => OPSI[nama].pilihan.find((o) => o[0] === nilai)[1];

// skor 0-8: 0-2 = paket terendah, 3-5 = tengah, 6-8 = tertinggi
function pilihPaket(pilihan, paket) {
  if (!paket.length) return null;
  const skor = Object.keys(OPSI).reduce((t, n) => t + poin(n, pilihan[n]), 0);
  const tingkat = skor <= 2 ? 0 : skor <= 5 ? 1 : 2;
  const idx = paket.length === 1 ? 0 : Math.round((tingkat * (paket.length - 1)) / 2);
  return paket[idx];
}

// Deskripsi produk: baris berawalan "✓" = fitur, sisanya = pengantar
function pecahDeskripsi(d) {
  const baris = (d || '').split('\n').map((s) => s.trim()).filter(Boolean);
  return {
    intro: baris.filter((b) => !b.startsWith('✓')).join(' '),
    fitur: baris.filter((b) => b.startsWith('✓')).map((b) => b.replace(/^✓\s*/, '')),
  };
}

function hitung(query, paket) {
  const { pilihan, lengkap } = bacaPilihan(query);
  const hasil = lengkap ? pilihPaket(pilihan, paket) : null;
  return {
    opsi: OPSI,
    pilihan,
    dikirim: lengkap,
    ringkasan: Object.keys(OPSI).map((n) => teks(n, pilihan[n])),
    hasil: hasil ? { produk: hasil, ...pecahDeskripsi(hasil.deskripsi) } : null,
  };
}

module.exports = { hitung, KATEGORI_PAKET };