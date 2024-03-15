const User = require('../models/User')

const bcrypt = require('bcryptjs')

module.exports = class AuthController {

    static login(req, res) {
        res.render('auth/login')
    }

    static async loginPost(req, res){
        const {email, password} = req.body

        // find user
        const user = await User.findOne({where: {email: email}})

        if(!user) {
            req.flash('message', 'Usuário não encontrado!')
            res.render('auth/login')

            return
        }

        // check if password match
        // ele vai ver o algoritmo que usamos e comparar com a senha que o usuario mandou,
        //ele consegue ver se uma senha é igual a outra
        const passwordMatch = bcrypt.compareSync(password, user.password)
        if (!passwordMatch) {
            req.flash('message', 'Senha inválida!')
            res.render('auth/login')

            return
        }

        // inicialize session, se logou vamos iniciar a sessão
        req.session.userid = user.id  // guarda id dele na sessão

        req.flash('message', 'Autenticação realizada com sucesso!')

        req.session.save(() => {  // o redirect, precisamos garantir o save, e garantir que a sessão foi salva
            res.redirect('/')
        })
    }

    static register(req, res) {
        res.render('auth/register')
    }

    static async registerPost(req, res) {
        const {name, email, password, confirmpassword} = req.body

        // password match validation
        if(password != confirmpassword) {
            // estamos mandando esse objeto p front/view main.handlebars
            req.flash('message', 'As senhas não conferem, tente novamente!')
            res.render('auth/register')

            return
        }

        // check if user exists
        const checkIfUserExists = await User.findOne({where: {email: email}})

        if(checkIfUserExists){
            req.flash('message', 'O e-mail já está em uso!')
            res.render('auth/register')

            return
        }

        // create a passaword
        const salt = bcrypt.genSaltSync(10)  // pra dificultar o hacker, vai colocar 10 caracteres randomicos pra dificultar/complicar a senha
        const hashedPassword = bcrypt.hashSync(password, salt)  // ele gera a senha dificil

        const user = {
            name,
            email,
            password: hashedPassword,
        }  // aqui criou o objeto usuario

        try{
            const createdUser = await User.create(user)  // vai gerar a criação do usuario no banco

            // inicialize session, depois do registro ele já fica logado automaticamente no sistema
            req.session.userid = createdUser.id  // guarda id dele na sessão

            req.flash('message', 'Cadastro realizado com sucesso!')

            req.session.save(() => {
                res.redirect('/')
            })


        } catch(err) {
            console.log(err)
        }
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }
}