function validate(schema, input = "body") {
  return (req, res, next) => {
    try {
      req[input] = schema.parse(req[input]);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = validate;
