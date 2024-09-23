const user = require('../models/user');
const jwt = require('jsonwebtoken');

const authenticationMid = async (req, res, next) => {


    const { token } = req.cookies;
    if (!token) return res.status(400).json({ message: 'Tekrar Login olunuz' });

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedData) return res.status(400).json({ message: 'token geçersiz' });

    req.user = await user.findById(decodedData.id);
    next();

}

const roleChecked = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(400).json({ message: 'Bu işlemi yapma yetkiniz yok' })
        }
        next();
    }
}



module.exports = { authenticationMid, roleChecked };