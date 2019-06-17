const Joi = require('@hapi/joi')

const Site = require('../models/site')

async function validateSite (req) {
  const data = {
    owner: req.userId,
    name: req.body.name,
    description: req.body.description
  }

  // check schema
  const schema = {
    owner: Joi.string().required(),
    name: Joi.string()
      .regex(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{6,140}$/)
      .required(),
    description: Joi.string()
  }
  const { error } = Joi.validate(data, schema)

  if (error) {
    return {
      error: `The name must have less than 140 characters,
      can contain only numbers, letters and dot,
       cannot include spaces, cannot start or end with a period
       or have more than one period sequentially.
       Max length is 30 chars.`
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
