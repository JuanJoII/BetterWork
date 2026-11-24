import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
	"purge completed tasks older than 15 days",
	{ hourUTC: 4, minuteUTC: 0 },
	internal.completedTasks.purgeExpired,
	{},
);

export default crons;
