const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ['admin', 'user'];
const MIN_PASSWORD_LENGTH = 8;

module.exports = { EMAIL_REGEX, ALLOWED_ROLES, MIN_PASSWORD_LENGTH };
