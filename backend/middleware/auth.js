import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  console.log(req.headers.authorization)
  const token = req.headers.authorization.split(" ")[1];
  console.log('token',token)
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(req.user)
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid/Expired token" });
  }
};
