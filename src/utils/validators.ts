const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com', 
  'yopmail.com', 'throwawaymail.com'
];

export const validateIndianMobile = (phone: string): boolean => {
  const indianPhoneRegex = /^[6-9]\d{9}$/;
  return indianPhoneRegex.test(phone);
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { isValid: false, error: "Invalid email format" };

  const domain = email.split('@')[1];
  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return { isValid: false, error: "Temporary emails are not allowed. Please use a valid personal email." };
  }

  return { isValid: true };
};