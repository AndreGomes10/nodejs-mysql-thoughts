const Tought = require('../models/Tought')
const User = require('../models/User')
const { Op } = require('sequelize')
module.exports = class ToughtsController {
    static async showToughts(req, res) {
        let search = ''

        // verificar se veio alguma coisa na pesquisa
        if (req.query.search) {
            search = req.query.search
        }

        // ordenação
        let order = 'DESC'

        if (req.query.order === 'old') {
            order = 'ASC'
        } else {
            order = 'DESC'
        }

        const toughtsData = await Tought.findAll({
            include: User,  // User vem separado
            where: {
                title: { [Op.like]: `%${search}%` },  // uma busca com like, % o que estiver antes, depois ou dentro, ele vai buscar
            },
            order: [['createdAt', order]],  // createAt, o sequelize cria automaticamente e vai manter os dados
        })

        const toughts = toughtsData.map((result) => result.get({ plain: true }))  // plain, o usuario e o pensamento vão ser jogados no mesmo array

        let toughtsQty = toughts.length  // quantidade de toughts que tem
        if (toughtsQty === 0) {
            toughtsQty = false
        }

        res.render('toughts/home', { toughts, search, toughtsQty })
    }

    static async dashboard(req, res) {
        const userId = req.session.userid

        const user = await User.findOne({
            where: {
                id: userId,
            },

            include: Tought,  // todos os models que estão relacionados a esse ussuario eu posso dar um include,
            // e quando trazer esse usuario tambem vai trazer todos os pensamentos dele, ja vem tudo que eu quero
            plain: true,  // só pra vim os dados interessantes pra fazer o foreach no array
        })

        // check if user exists
        if (!user) {
            res.redirect('/login')
        }
        //console.log(user.Toughts);

        // extrair só as tarefas
        const toughts = user.Toughts.map((result) => result.dataValues) // o resultado é apenas o que esta em dataValues

        let emptyToughts = false;  // pra enviar se a tought esta vazia

        if (toughts.length === 0) {
            emptyToughts = true
        }
        //console.log(toughts);
        res.render('toughts/dashboard', { toughts, emptyToughts })
    }

    static createTought(req, res) {
        res.render('toughts/create')
    }

    static async createToughtSave(req, res) {

        const tought = {
            title: req.body.title,
            UserId: req.session.userid  // pegar o id da propria sessão
        }

        try {
            await Tought.create(tought)

            req.flash('message', 'Pensamento criado com sucesso!')

            req.session.save(() => {  // o redirect, precisamos garantir o save, e garantir que a sessão foi salva
                res.redirect('/toughts/dashboard')
            })
        } catch (error) {
            console.log('Aconteceu um erro: ' + error)
        }

    }

    static async removeTought(req, res) {
        const id = req.body.id
        const UserId = req.session.userid

        try {
            await Tought.destroy({ where: { id: id, UserId: UserId } })
            req.flash('message', 'Pensamento removido com sucesso!')

            req.session.save(() => {
                res.redirect('/toughts/dashboard')
            })
        } catch (error) {
            console.log('Aconteceu um erro: ' + error)
        }
    }

    static async updateTought(req, res) {
        const id = req.params.id
        const tought = await Tought.findOne({ where: { id: id }, raw: true })

        res.render('toughts/edit', { tought })
    }

    static async updateToughtSave(req, res) {
        const id = req.body.id
        const tought = {
            title: req.body.title,
        }

        try {
            await Tought.update(tought, { where: { id: id } })
            req.flash('message', 'Pensamento atualizado com sucesso!')

            req.session.save(() => {
                res.redirect('/toughts/dashboard')
            })
        } catch (error) {
            console.log('Aconteceu um erro: ' + error)
        }
    }
}