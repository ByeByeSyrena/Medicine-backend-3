const ctrlWrapper = (ctrl) => {
  async function fn(req, res, next) {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      next(error);
    }
  }
  return fn;
};

module.exports = ctrlWrapper;
