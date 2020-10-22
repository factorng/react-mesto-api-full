const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictError = require('../errors/conflict-err');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  console.log(req.body);
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictError('Пользователь с таким email уже зарегистрирован');
      } else next(err);
    })
    .then((user) => res.status(201).send(user))
    .catch(next);
};

const getUsers = (req, res, next) => {
  console.log('get users');
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .orFail()
    .catch(() => {
      console.log('req params', req);
      throw new NotFoundError('Нет пользователя с таким id');
    })
    .then((user) => res.status(200).send(user))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  return User.findUserByCredentials(email, password)
    .then((user) => {
    // аутентификация успешна! пользователь в переменной user
      console.log('login');
      const token = jwt.sign(
        { _id: user._id },
        'processenvJWT_SECRET',
        { expiresIn: '7d' },
      );
      // вернём токен
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ token });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;
  console.log(name, about);
  User.findByIdAndUpdate(req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    })
    .orFail(() => new NotFoundError('Пользователь с таким id не найден'))
    .catch((err) => {
      if (err instanceof NotFoundError) {
        throw err;
      }
      throw new BadRequestError(`Некорректные данные при обновлении пользователя: ${err.message}`);
    })
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
    .catch((err) => {
      if (err instanceof NotFoundError) {
        throw err;
      }
      throw new BadRequestError(`Некорректные данные при обновлении аватара: ${err.message}`);
    })
    .then((newAvatar) => res.send({ data: newAvatar }))
    .catch(next);
};

const getUser = (req, res) => {
  User.findById(req.user._id)
    .orFail(new Error('NotFoundId'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.message === 'NotFoundId') {
        return res.status(404).send({ message: 'Нет пользователя с таким id' });
      }
      return res.status(500).send({ message: 'На сервере произошла ошибка' });
    });
};

module.exports = {
  createUser, getUsers, getUserById, login, updateUser, updateUserAvatar, getUser,
};
