const jwt = require('jsonwebtoken')
const {cookieValidator} = require("../middlewares/cookieValidator")

describe('VOU TESTAR O VALIDADOR DE COOKIE', ()=>{
    
    let req, res, next
    process.env.jwt_secret_key = 'alguma senha secreta'
    beforeEach(()=>{
        req = {cookies: {}},
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        },
        next = jest.fn()
    })


    it('O token não existe', ()=>{
        cookieValidator(req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith("Unauthorized: No token provided.")
        expect(next).not.toBeCalled()
    })
    it('O token existe, porém não é válido', ()=>{
        req.cookies.Token = 'algum_token_invalido'
        cookieValidator(req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.send).toHaveBeenCalledWith("Unauthorized: Invalid token.")
        expect(next).not.toBeCalled()
    })
    it('O token existe, e é válido', ()=>{
        const token = jwt.sign(
            {
                _id: 1,
                email: 'exemplo.@email.com',
                name: 'exemplo',
                admin: false
            },
            process.env.jwt_secret_key,
            {expiresIn: 1000 * 60 * 60 * 24 * 3}
        );
        req.cookies.Token = token
        cookieValidator(req, res, next)
        expect(next).toBeCalled()
    })
})