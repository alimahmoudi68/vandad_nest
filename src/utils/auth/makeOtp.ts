import { hashSync , genSaltSync} from 'bcrypt';
import * as crypto from 'crypto';


/**
 * Generates a cryptographically secure OTP and its hash.
 * @param digits - Number of digits for the OTP.
 * @returns An object containing the OTP and its hashed version.
 */
function makeOtp(digits: number): { otp: string; hashOtp: string } {
    if (digits <= 0) {
        throw new Error("Number of digits must be greater than 0.");
    }

    // تولید یک عدد تصادفی امن به طول مورد نظر
    const otp = crypto.randomInt(10 ** (digits - 1), 10 ** digits).toString();

    // هش کردن OTP با bcrypt
    const salt = genSaltSync(10);
    const hashOtp = hashSync(otp, salt);

    return { otp, hashOtp };
}

export default makeOtp;
