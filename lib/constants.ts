const dob = new Date("2007-02-23");
export const age = new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970;
