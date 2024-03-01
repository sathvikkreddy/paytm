const zod = require("zod");

const signupUserSchema = zod.object({
  username: zod.string().email(),
  password: zod.string().min(6),
  firstName: zod.string().min(5).max(50),
  lastName: zod.string().min(5).max(50),
});

const signinUserSchema = zod.object({
  username: zod.string().min(3).max(30),
  password: zod.string().min(6),
});

const updateUserSchema = zod.object({
  password: zod.string().min(6).optional(),
  firstName: zod.string().min(3).max(50).optional(),
  lastName: zod.string().min(3).max(50).optional(),
});

const signupValidation = (req, res, next) => {
  const reqBody = req.body;

  const { success, error } = signupUserSchema.safeParse(reqBody);
  if (!success) {
    res.status(400).json({
      message: "invalid creds",
      error,
    });
    return;
  }
  next();
};

const signinValidation = (req, res, next) => {
  const reqBody = req.body;

  const { success, error } = signinUserSchema.safeParse(reqBody);
  if (!success) {
    res.status(400).json({
      message: "invalid creds",
      error,
    });
    return;
  }
  next();
};

const updateUserValidation = (req, res, next) => {
  const reqBody = req.body;

  const { success, error } = updateUserSchema.safeParse(reqBody);
  if (!success) {
    res.status(400).json({
      message: "invalid creds",
      error,
    });
    return;
  }
  next();
};

module.exports = { signupValidation, signinValidation, updateUserValidation };
