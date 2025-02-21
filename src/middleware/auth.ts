import config from "config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { decrypt } from "../helper/encription";
import { User } from "../services/users/login/_validation";

export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string = req.headers["authorization"] as string;
    let splittoken = token.split(" ")[1];
    if (!splittoken)
      return res.status(401).json({ message: "Authentication failed!" });

    token = await decrypt(splittoken);
    const decodedToken: any = jwt.verify(token, config.get("jwtPrivateKey"));
    let _id: string = decodedToken.uid ? decodedToken.uid : null;
    let user: any = await User.findOne({
      $and: [{ _id: _id }, { token: { $ne: null } }],
    });;


    if(user.token==null){
    return res.status(401).json({ message: "Authentication failed!" });
    }
 
    if (!user)
      return res.status(401).json({ message: "Authentication failed!" });
  

    if (!user || user.sessionVersion !== decodedToken.sessionVersion) {
      return res.status(401).json({ message: "Authentication failed!" });
    }
    req.body.uid = _id;
    req.body.loginUserRole = user.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
};
