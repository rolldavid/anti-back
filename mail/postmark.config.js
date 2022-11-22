var postmark = require("postmark");

const user = "David@antitrivia.org";
const pass = "8SNfn%DRrv$W8h8w^4bF9Ks";
const keys = require("../config/keys");

// Send an email:
var client = new postmark.ServerClient("ad627211-a195-448d-93ff-a4ddfc7f6721");

module.exports.sendConfirmation = (name, email, confirmationCode) => {
  console.log("sending postmark email");
  client.sendEmail({
    From: user,
    To: email,
    Subject: `Hi ${name} - please confirm your email to join Antitrivia!`,
    HtmlBody: `
        Hi ${name}! 
        <br><br>
        Click the link below to confirm your account with Antitriva.
        <br><br>
        <a href=${keys.frontendURL}/welcome/${confirmationCode}>Click here</a>
        <br><br>
        Cheers,
        <br><br>
        The Antitrivia Team
    `,
    TextBody: `Welcome to Antitrivia - confirm your account.`,
    MessageStream: "signup-confirmation",
  });
};

module.exports.sendReset = (name, email, confirmationCode) => {
  console.log("sending password reset email...");
  client.sendEmail({
    From: user,
    To: email,
    Subject: `Reset your password for Antitrivia`,
    HtmlBody: `
        Hi ${name}! 
        <br><br>
        Click the link below to reset your password
        <br><br>
        <a href=${keys.frontendURL}/reset/${confirmationCode}>Click here</a>
        <br><br>
        Cheers,
        <br><br>
        The Antitrivia Team
    `,
    TextBody: `Please reset your password.`,
    MessageStream: "password-reset",
  });
};

module.exports.sendAllowConfirmation = (email) => {
  console.log("sending postmark email");
  client.sendEmail({
    From: user,
    To: email,
    Subject: `Thanks for joining the Antitrivia waitlist!`,
    HtmlBody: `
        Hi!
        <br><br>
        We're launching a global non-trivial knowledge movement, and we're excited you're here! 
        <br><br>
        We're ironing out the final details, and giving some select people early access to start playing the beta version. You'll be notified here as soon as you have access.
        <br><br>
        Cheers,
        <br><br>
        The Antitrivia Team
    `,
    TextBody: `Thanks for joining the Antitrivia waitlist!`,
    MessageStream: "allow-confirmation",
  });
};
