const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');

const createUser = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name: 'default Name',
      about: 'default about',
      avatar: 'https://www.centrinvest.ru/upload/iblock/879/nologosmi.jpg',
      email,
      password: hash,
    }))
    .then(() => res.status(201).send({ message: 'Пользователь зарегистрирован' }))
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(new NotFoundError('Нет пользователя с таким id'))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
    // аутентификация успешна! пользователь в переменной user
      const token = jwt.sign({ _id: user._id },
        process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'something',
        { expiresIn: '7d' });
      // вернём токен
      res.send({ token });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    })
    .orFail(() => new NotFoundError('Пользователь с таким id не найден'))
    .then((user) => res.send(user))
    .catch(next);
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    })
    .orFail(() => new NotFoundError('Пользователь с таким id не найден'))
    .then((newAvatar) => res.send(newAvatar))
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError('Пользователь с таким id не найден'))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

module.exports = {
  createUser, getUsers, getUserById, login, updateUser, updateUserAvatar, getUser,
};
