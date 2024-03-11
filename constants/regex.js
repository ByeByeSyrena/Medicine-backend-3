// This regular expression enforces the following password requirements:

// At least one digit
// At least one lowercase letter
// At least one uppercase letter
// At least 8 characters in length

const PSWRD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHARM_REGEX = /^[a-zA-Z0-9\s]*$/;

module.exports = { PSWRD_REGEX, EMAIL_REGEX, PHARM_REGEX };
