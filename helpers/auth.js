module.exports.checkAuth = function(req, res, next) {
    const userId = req.session.userid

    // middleware
    // se o usuario não estiver logado ele não vai acessar nada, só o login
    if(!userId) {
        res.redirect('/login')
    }

    next()
}