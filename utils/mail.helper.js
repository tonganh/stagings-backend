const mailgun = require('mailgun-js');

const send = (from, to, token, isAdmin = false) => {
  const DOMAIN = process.env.DOMAIN_MAILGUN;
  const mg = mailgun({
    apiKey: process.env.API_KEY_MAILGUN,
    domain: DOMAIN,
  });
  const data = {
    from: `${from}@${DOMAIN}`,
    to,
    subject: 'Email forgot password',
    text: 'Testing some Mailgun awesomness!',
    html: `
            <head>
                <meta http-equiv="content-type" content="text/html; charset=UTF-8">
            </head>
            <BODY BGCOLOR="White">
            <body>

            </br>
            <div style=" height="40" align="left">

            <font size="3" color="#000000" style="text-decoration:none;font-family:Lato light">
            <div class="info" Style="align:left;">

            <a href="${
              isAdmin ? process.env.DOMAIN_ADMIN : process.env.DOMAIN_CLIENT
            }/forgot-password/${token}">${
      process.env.DOMAIN_ADMIN
    }/forgot-password/${token}</a>

            </div>

            </br>
            <p>-----------------------------------------------------------------------------------------------------------------</p>
            </br>
            <p>( This is an automated message, please do not reply to this message, if you have any queries please contact ${from}@${DOMAIN} )</p>
            </font>
            </div>
            </body>
            `,
  };
  mg.messages().send(data, function (error, body) {
    console.log('body', body);
  });
};

const MailHelpers = {
  send,
};

module.exports = MailHelpers;
