const ajaxHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(req, res, next).catch((err) => next(err));
  };
};

export { ajaxHandler };
