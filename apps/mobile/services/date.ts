import dayjs from "dayjs";

export function formatFriendlyDate(date: string | Date | number): string {
  const timestamp = dayjs(date);

  if (timestamp.isSame(dayjs(), "day")) {
    return timestamp.format("h:mm A");
  } else if (timestamp.isSame(dayjs(), "year")) {
    return timestamp.format("MMM D");
  } else {
    return timestamp.format("MMM D, YYYY");
  }
}
