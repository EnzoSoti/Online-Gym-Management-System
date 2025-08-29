/**
 * Application constants
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const MESSAGES = {
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  UNAUTHORIZED: 'Unauthorized access',
  INTERNAL_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
};

const MEMBER_TYPES = {
  REGULAR: 'regular',
  STUDENT: 'student',
};

const MEMBER_STATUS = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  INACTIVE: 'Inactive',
};

const PRICING = {
  REGULAR_CHECKIN: 70,
  STUDENT_CHECKIN: 60,
  REGULAR_MONTHLY: 950,
  STUDENT_MONTHLY: 850,
};

module.exports = {
  HTTP_STATUS,
  MESSAGES,
  MEMBER_TYPES,
  MEMBER_STATUS,
  PRICING,
};