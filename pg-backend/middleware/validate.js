const { ZodError } = require('zod')

//  validate middleware factory 
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()

    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map(e => e.message)

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: messages
        })
      }

      next(err)
    }
  }
}

module.exports = validate