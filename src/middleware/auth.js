function requireLogin(req, res, next) {
  if (req.user) return next();
  req.flash('error', 'Silakan masuk terlebih dahulu.');
  res.redirect('/masuk?next=' + encodeURIComponent(req.originalUrl));
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return requireLogin(req, res, next);
  if (roles.includes(req.role)) return next();
  res.status(403).render('error', { title: 'Akses ditolak', pesan: 'Kamu tidak punya izin untuk membuka halaman ini.' });
};

module.exports = { requireLogin, requireRole };
