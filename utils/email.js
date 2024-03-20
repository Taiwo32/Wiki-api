const nodemailer = require ('nodemailer'); // we are using this to connect to mailtrap

const sendEmail = async (options) =>{
    //1 create transporter 
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    //2 define mail options
    const mailOption = {
        from: "Taiwo <Alli_Dev@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    };
    //3 send mail
    await transporter.sendMail(mailOption);
};
module.exports = sendEmail