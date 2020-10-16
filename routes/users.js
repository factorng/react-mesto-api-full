const router = require('express').Router();
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const {
  createUser, getUsers, getUserById, login,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/:id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().required().hex(),
  }),
}), getUserById);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required(),
  }).unknown(true),
}), createUser);
router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

module.exports = router;
