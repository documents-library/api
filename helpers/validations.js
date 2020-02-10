const Joi = require('@hapi/joi')

const Site = require('../models/site')

async function validateSite(req) {
  const data = {
    owner: req.userId,
    name: req.body.name,
    longName: req.body.longName,
    description: req.body.description
  }

  // TODO: validate siteName unique
  // in the future: unique by organization

  // check schema
  const schema = {
    owner: Joi.string().required(),
    name: Joi.string()
      .regex(/(?!.*[.\-_]{2,})^[a-z0-9.\-_]{2,32}$/)
      .required(),
    longName: Joi.string().required(),
    description: Joi.string().required()
  }
  const { error } = Joi.validate(data, schema)

  if (error) {
    if (error.details[0].type === 'string.regex.base') {
      return {
        error: `Sorry, the name only accepts letters (a-z), numbers (0-9),
        and symbols (_-.) are allowed, from 3 to 32 charadcters.`
      }
    } else {
      return { error: error.details[0].message }
    }
  }

  // check name unique by user
  try {
    const name = await Site.findOne(data)

    if (name) return {}
    else return 'Valid site name'
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  validateSite
}
