import moment from "moment";

export const convertTime = (time: string) => {
  return moment(time).add(-7, "hours").format("YYYY-MM-DD HH:mm:ss");
};
