const isAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    res.redirect('/login');
  }
};

const adminAuth = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

module.exports = { isAuth, adminAuth };
