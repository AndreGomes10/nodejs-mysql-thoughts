const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')

// Models
const Tought = require('./models/Tought')
const User = require('./models/User')

// Import Routes
const toughtsRoutes = require('./routes/toughtsRoutes')
const authRoutes = require('./routes/authRoutes')

// Import Controller
const ToughtsController = require('./controllers/ToughtsController')

// template engine
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

// receber resposta do body
app.use(  // configurar o express pra poder pegar o body
  express.urlencoded({
    extended: true,
  }),
)

app.use(express.json())  // pra poder pegar o body em json

// session middleware
/* ele diz onde o express vai salvar as sessões, 
vai usar tambem o fire-store pra poder salvar as sessões em um local determinado */
app.use(
    session({
        name: 'session',
        secret: 'nosso_secret',  // pra fica inquebravel
        resave: false,  // false, pra quando cair a sessão ele vai desconectar
        saveUninitialized: false,
        store: new FileStore({  // onde vai salvar
            logFn: function(){},
            path: require('path').join(require('os').tmpdir(), 'sessions')  // caminho para salvar arquivos de sessão
        }),
        cookie: {  // configurar um cookie na maquina do usuario
            secure: false,
            maxAge: 360000,  // tempo de duração de 1 dia
            expires: new Date(Date.now() + 360000),  // vai expirar automaticamente em 1 dia
            httpOnly: true
        }
    }),
)

// flash messages
// mensagens de status do sistema, quando faz alguma alteração com o banco de dados pra saber se deu certo ou errado
app.use(flash())

// public path
app.use(express.static('public'))

// set session to res
app.use((req, res, next) => {
    // caso o usuario não esteja logado o if passa em branco, ai da um next e segue
    // se estiver logado, vai mandar a sessão que esta na requisição que é os dados do usuario para a resposta
    if(req.session.userid){
        res.locals.session = req.session
    }
    next()
})

// Routes
app.use('/toughts', toughtsRoutes)
app.use('/', authRoutes)

app.get('/', ToughtsController.showToughts)


conn
//.sync({force: true})  // pra resetar o banco, pra quando for criar os relacionamentos e etc...
.sync()
.then(() => {
    app.listen(3000)
})
.catch((err) => console.log(err))