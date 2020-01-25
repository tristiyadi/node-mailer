var CronJob = require('cron').CronJob;
var mysql      = require('mysql');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var fs = require('fs');
var util = require('util');

var logFile = fs.createWriteStream('data.log', { flags: 'a' });

var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'secret',
  database : 'whoami'
});

var auth = {
  auth: {
    api_key: 'key-3874b0ef92b95ba4a07267a38dde677d',
    domain: 'google.co.id'
  }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

var job = new CronJob('0 0 8 * * *', function() {
//   /*
//    * Runs every day 
//    * at 08:00:00 AM. 
//    */
//     connection.connect();

    connection.query('select count(1) jml from users where activated != 1', function (error, results, fields) {
      if (error) {
        console.log(new Date() + ' Error: ' + error);
      }

      if (results[0].jml != 0) {
        nodemailerMailgun.sendMail({
          from: 'administrator@google.co.id',
          to: ['eko@google.co.id','eko.tristiyadi@google.co.id'], // An array if you have multiple recipients.
          subject: 'Notifikasi User Pending Aktivasi!',
          text: 'Ada ' + results[0].jml + ' user menunggu aktivasi.\n\n\nCheers\n\nDSI SIAT Team.'
        }, function (err, info) {
          if (err) {
            console.log(new Date() + ' Error: ' + err);
          }
          console.log(new Date() +' Pending : ' + results[0].jml);          
        });  
      }
      else {
        console.log(new Date() + ' Pending : ' + results[0].jml);
      }
    });
//     connection.end();
  }, function () {
    /* This function is executed when the job stops */
    
  },
  true, /* Start the job right now */
  'Asia/Jakarta' /* Time zone of this job. */
);
