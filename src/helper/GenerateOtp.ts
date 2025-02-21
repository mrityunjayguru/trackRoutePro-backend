export const generateOTP = (): string => {
    const digits: string = '9876543210'; // Allowed digits
    let otp: string = '';
  
    // Generate a 6-digit OTP
    for (let i = 0; i < 6; i++) {
      const randomIndex: number = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }
  
    return otp;
  };
  
 
  