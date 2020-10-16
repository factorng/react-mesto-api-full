const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .catch((err) => {
      throw new BadRequestError(`Некорректные данные: ${err.message}`);
    })
    // вернём записанные в базу данные
    .then((card) => res.status(201).send({ data: card }))
    // данные не записались, вернём ошибку
    .catch(next);
};

const getCards = (req, res, next) => {
  Card.find({})
    .then((users) => res.status(200).send(users))
    .catch(next);
};

const deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail()
    .catch(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => {
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Удалять можно только свои карточки');
      }
      Card.findByIdAndDelete(req.params.cardId)
        .then(() => res.status(200).send({ message: 'Карточка удалена' }))
        .catch(next);
    })
    .catch(next);
};
module.exports = { createCard, getCards, deleteCardById };
