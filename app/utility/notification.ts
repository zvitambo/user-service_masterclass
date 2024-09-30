import twilio from "twilio";

const accountSid = "";
const authToken = "";

const client = twilio(accountSid, authToken)

export const generateAccessCode = async() => {
    const code = Math.floor(10000 + Math.random() * 900000)
    let expiry = new Date();
    expiry.setTime(new Date().getTime()+ 30 * 60 * 1000)
    return {code, expiry}
}

export const sendVerificationCode = async(
    code: number, toPhoneNumber:string
) => {
    console.log("toPhoneNumber", toPhoneNumber);
    client.messages
      .create({
        from: "+18159498791",
        body: `Your verification code is ${code}`,
        to: "+263773723049",
      })
      .then((message) => console.log(message.body));
};







