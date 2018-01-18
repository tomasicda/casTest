function restrict(req, res, next) {
    if (req.session.success) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = restrict;