import { Request, Response, NextFunction } from "express";
import "express-async-errors";

export const errorHandler: any = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error && error?.details) { // Error of Joi
        let err: any = {};
        error.details.forEach((el: any) => {
            let key: string = el.path.join('_');
            err[key] = el.message;
        });
        // let err: string = error.details[0]?.message;
        res.status(400).json({ error: err });
    } else if (error.errors) { // Error of mongoose validator
        let err: any = {};
        Object.keys(error.errors).forEach(e => {
            err[e] = error.errors[e].message;
        });
        res.status(400).json({ error: err });
    } else {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message });
    }
}