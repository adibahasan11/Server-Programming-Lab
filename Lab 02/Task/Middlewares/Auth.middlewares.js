var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./LocalStorage');

const isLoggedIn = (req, res, next) => {
    const user = localStorage.getItem("username")

    if (user){
        next();
    }
    else {
        res.redirect('/login')
    }
}

const is_authenticated = (req, res, next) => {
    if ( req.method == 'GET' ) {
        const user = localStorage.getItem("username")
        if (user){
            res.redirect('/dashboard');
        }
        else {
            next();
        }   
    } 
    else {
        next();
    }
}

module.exports = { isLoggedIn, is_authenticated };