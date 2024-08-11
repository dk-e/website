export const UKTimeFormatter = new Intl.DateTimeFormat(undefined, {
  timeZone: "Europe/London",
  hour: "numeric",
  minute: "numeric",
  hour12: false,
});

export const RelativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  style: "long",
});

export const discordId = "745631824163766412";

export const dob = new Date("2007-02-23");
export const age = new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970;
export const hasHadBirthdayThisYear =
  new Date().getMonth() >= dob.getMonth() &&
  new Date().getDate() >= dob.getDate();

export const nextBirthdayYear =
  new Date().getFullYear() + (hasHadBirthdayThisYear ? 1 : 0);
export const daysUntilBirthday = RelativeTimeFormatter.formatToParts(
  Math.floor(
    (new Date(nextBirthdayYear, dob.getMonth(), dob.getDay() + 1).getTime() -
      Date.now()) /
      1000 /
      60 /
      60 /
      24
  ),
  "day"
)[1]!.value.toString();

export const dayStartedCoding = new Date("2020-10-01");
export const yearsSinceStartedCoding = new Date().getUTCFullYear() - 2020;
const currentDate = new Date();

// Calculate the difference in time (in milliseconds)
const timeDifference = Number(currentDate) - Number(dayStartedCoding);

// Convert time difference from milliseconds to days
export const daysSinceStartedCoding = Math.floor(
  timeDifference / (1000 * 60 * 60 * 24)
);
