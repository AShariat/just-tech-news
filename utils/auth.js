// This function will act as a normal request callback function, checking for the existence of a session property and using res.redirect() if it's not there. If res.session.user_id does exist, it will call next(), which could potentially be another middleware function or the final function that will render the template. When withAuth() calls next(), it will call the next (anonymous) function. However, if withAuth() calls res.redirect(), there is no need for the next function to be called, because the response has already been sent.
const withAuth = (req, res, next) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    // next() is a reference to the next callback function.
    next();
  }
};

module.exports = withAuth;
