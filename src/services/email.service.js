const nodemailer = require('nodemailer');

/// getting a transporter that transports gets the email from this server, transports to the google server, and sends an email.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        type:'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});

transporter.verify((error, success)=>{
    if(error){
        console.log('Error connecting to email server: ', error);

    }else{
        console.log('Email server is ready to send messages')
    }
});

const sendEmail = async (to, subject, text, html) => {
    try{
        const info = await transporter.sendMail({
            from:`"MYBANK" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }catch(error){
        console.error('Error sending email: ', error);
    }
};

async function sendRegistrationEmail(userEmail, name){
    const subject = 'Welcome to MeriBank!';
    const text = `Hello ${name}, \n\nThank you for registering at our bank. We are exited to have you on board\n\nBest regards,\n\nThe MYBANK Team`;
    const html='<p>Hello ${name}</p><p>Thank you for registering at our bank. We are exited to have you on board</p><p>Best regards,<br>The MYBANK Team</p>';

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount){
    const subject = 'Transaction successful!';
    const text = `Hello ${name}, \n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards, \nMYBANK Team`;
    const html = `<p>Hello ${name},</p>Your transaction of $${amount} to account ${toAccount} was successful.<p><br><p>Best regards,</p><br><p>\nMYBANK Team</p>`

    await sendEmail(userEmail,subject, text, html)
}

async function sendTransactionFailedEmail(userEmail, name, amount, toAccount){
    const subject = 'Transaction failed!';
    const text = `Hello ${name}, \n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please check your account balance and try again.\n\nBest regards, \nMYBANK Team`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please check your account balance and try again.</p><p><br><p>Best regards,</p><br><p>\nMYBANK Team</p>`
}

module.exports= {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailedEmail
};
