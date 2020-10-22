const router = require('express').Router();
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const {
  createUser, getUsers, getUserById, login, updateUser, updateUserAvatar, getUser,
} = require('../controllers/users');

router.get('/users', getUsers);
router.patch('/users/me', updateUser);
router.get('/users/me', getUser);
router.get('/users/:id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().required().hex(),
  }),
}), getUserById);
module.exports = router;
