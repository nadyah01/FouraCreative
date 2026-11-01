function perbaruiBadge(n) {
  const link = document.querySelector('.nav-cart');
  if (!link) return;
  let b = link.querySelector('.nav-cart-n');
  if (n > 0) {
    if (!b) {
      b = document.createElement('span');
      b.className = 'nav-cart-n';
      link.append(' ', b);
    }
    b.textContent = n;
  } else if (b) {
    b.remove();
  }
}

document.addEventListener('submit', async (e) => {
  const form = e.target.closest('.kp-aksi form');
  if (!form) return;
  e.preventDefault();

  const aksi = form.closest('.kp-aksi');
  const tombol = form.querySelector('button');
  if (tombol) tombol.disabled = true;

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)),
    });
    if (res.status === 401) { location.href = '/masuk'; return; }
    const data = await res.json();
    if (!data.ok) throw new Error('gagal');

    const masuk = form.classList.contains('kp-f-tambah');
    aksi.querySelector('.kp-f-tambah').hidden = masuk;
    aksi.querySelector('.kp-f-batal').hidden = !masuk;
    perbaruiBadge(data.jumlah);
  } catch (err) {
    form.submit(); // cadangan: kirim form biasa kalau cara diam-diam gagal
  } finally {
    if (tombol) tombol.disabled = false;
  }
});