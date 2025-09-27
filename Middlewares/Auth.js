const jwt = require('jsonwebtoken')
const secret = process.env.SECRET

const setUser = (user) => {
    const payload = {
        name: user.password
    }

    const token = jwt.sign(payload, secret)

    return token
}

const VerifyUserAuth = (req, res, next) => {
    const token = req.cookies?.uid
    
    try {
        if(!token) {
        return res.json({success: false, message: "Login First"})
    }

    const isVerifyed = jwt.verify(token, secret)

    if(isVerifyed) {
        next()
    }
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: "Internal Server Error"})
    }


}

module.exports = {
    setUser,
    VerifyUserAuth
}