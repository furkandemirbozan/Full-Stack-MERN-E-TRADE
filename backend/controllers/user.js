const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const nodemailer = require('nodemailer');



const register = async (req, res) => {

    const avatar = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: "scale"
    });

    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'bu kullanıcı zaten var ' });

    const passwordHash = await bcrypt.hash(password, 10);
    if (password.length < 6) return res.status(400).json({ message: 'şifre en az 6 karakter olmalıdır' });

    const newUser = await new User.create({
        name,
        email,
        password: passwordHash,
        avatar: {
            public_id: avatar.public_id,
            url: avatar.secure_url
        }
    });


    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }

    res.status(201).cookie('token', token, cookieOptions).json({ newUser, token });

}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'bu kullanıcı bulunamadı ' });

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) return res.status(400).json({ message: 'şifre yanlış' });


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }

    res.status(201).cookie('token', token, cookieOptions).json({ user, token });



}
const logout = async (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now())
    }
    res.status(201).cookie('token', null, cookieOptions).json({ message: 'çıkış yapıldı' });
}

const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ message: 'bu email adresine ait kullanıcı bulunamadı' });

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const passwordUrl = `${req.protocol}://${req.get('host')}/reset/${resetToken}`;


    const message = `Şifrenizi sıfırlamak için lütfen aşağıdaki linke tıklayınız \n\n ${passwordUrl}`;

    try {
        const transporter = nodemailer.createTransport({
            port: 465,
            service: "gmail",
            host: "smtp.gmail.com",
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            },
            secure: true
        });

        const mailData = {
            from: process.env.SMTP_EMAIL,
            to: req.body.email,
            subject: 'Şifre Sıfırlama',
            text: message
        };
        await transporter.sendMail(mailData);

        res.status(200).json({ message: 'emailinizi kontrol ediniz ' });


    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ message: 'email gönderilemedi' });
    }



}

const resetPassword = async (req, res) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Geçersiz token' });

    if (req.body.password !== req.body.confirmPassword) return res.status(400).json({ message: 'şifreler uyuşmuyor' });

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
    res.status(201).cookie('token', token, cookieOptions).json({ user, token });



}

const userDetail = async (req, res, next) => {
    const user = await User.findById(req.params.id);
    res.status(200).json({ user });


}


module.exports = { register, login, forgotPassword, resetPassword, logout, userDetail };

