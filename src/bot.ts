import { getUpcomingVCTMatches } from "./api/vct/fetchScheduleData.js";
import { CustomClient } from "./classes/client.js";
const client = new CustomClient();

client.start();

const matches = await getUpcomingVCTMatches(1);
console.log(matches);
// @ts-ignore
matches.result.forEach((match) => {
  console.log("Match:");
  // @ts-ignore
  match.match2opponents.forEach((team: any, index: number) => {
    console.log(`Team ${index + 1}: ${team.name}`);
  });
});
