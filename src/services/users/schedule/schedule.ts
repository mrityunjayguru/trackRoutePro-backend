import { Request, Response } from "express";
import { Holidays, Schedule } from "./_validation";

const getStartAndEndOfWeek = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const startOfWeek = new Date(now);
  const endOfWeek = new Date(now);

  // Adjust to get the start of the week (Monday)
  startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // Adjust to get the end of the week (Sunday)
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

export const list = async (req: Request, res: Response) => {
  const { startOfWeek, endOfWeek } = getStartAndEndOfWeek();

  let result: any = {};
  result.holidays = await Holidays.find({
    doctorId: req.body.doctorId,
    date: { $gte: startOfWeek, $lte: endOfWeek },
  });

  result.schedule = await Schedule.find({
    hospitalId: req.body.hospitalId,
    doctorId: req.body.doctorId,
  })
    .select({
      status: 0,
    })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ data: result });
};
