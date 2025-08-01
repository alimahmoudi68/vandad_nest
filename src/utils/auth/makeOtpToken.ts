import * as crypto from 'crypto';

/**
 * Generates a random 20-character hash string based on the current timestamp.
 * @returns A 20-character hash string.
 */
function makeOtpToken(): string {
    const timestamp = Date.now().toString(); // Current timestamp in milliseconds
    const randomString = crypto.randomBytes(10).toString("hex"); // Random bytes converted to hex

    // Combine timestamp and random string, then hash them
    const hash = crypto
        .createHash("sha256")
        .update(timestamp + randomString)
        .digest("hex");

    return hash.slice(0, 20); // Return the first 20 characters of the hash
}


export default makeOtpToken;