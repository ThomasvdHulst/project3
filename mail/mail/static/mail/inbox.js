function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  //Archive a given email
  function archive_email(email) {
    if (email.archived === false) {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
    } else {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
    }

    //Wait for 10 seconds to let the PUT method finish
    sleep(10);

    document.querySelector('#one-email').style.display = 'none';
    load_mailbox('inbox');
    
  }


  //Fill in the data when replying to an email
  function reply_to_email(email) {
    document.querySelector('#compose-recipients').value = email.sender;

    let new_subject = email.subject;
    if (new_subject.charAt(0) === 'R' && new_subject.charAt(1) === 'e' && new_subject.charAt(2) == ':') {
      pass;
    } else {
      new_subject = 'Re: ' + new_subject;
    }

    const new_body = `On ${email.timestamp} ${email.sender} wrote: \n` + email.body;

    document.querySelector('#compose-subject').value = new_subject;
    document.querySelector('#compose-body').value = new_body;

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  }

  //Show all data from a given email when clicked on
  function show_email(email) {
    document.querySelector('#all-emails').style.display = 'none';

    fetch(`emails/${email.id}`)
    .then(response => response.json())
    .then(email => {

        document.querySelector('#one-email').style.display = 'block';

        let archive_btn_text = '';
        let hidden_atr = '';

        if (mailbox === 'archive') {
          archive_btn_text = 'De-Archive';
        } else if (mailbox === 'inbox') {
          archive_btn_text = 'Archive';
        } else {
          hidden_atr = 'hidden';
        }
        

        document.querySelector('#one-email').innerHTML = `
          <b>From: </b>
          ${email.sender}
          <br>
          <b>To: </b>
          ${email.recipients}
          <br>
          <b>Subject: </b>
          ${email.subject}
          <br>
          <b>Timestamp: </b>
          ${email.timestamp}
          <br>
          <button id='reply_btn' class='btn btn-primary'>Reply</button>
          <button id='archive_btn' ${hidden_atr} class='btn btn-primary'>${archive_btn_text}</button>
        <hr>${email.body}`;


        document.querySelector('#reply_btn').onclick = () => {
          reply_to_email(email);
        }

        document.querySelector('#archive_btn').onclick = () => {
          archive_email(email);
        }
    });

  }


  //Append all the mails to the div all-emails, which shows the emails
  function append_mails(emails) {
    emails.forEach(email => {
      const email_div = document.createElement('div');
      email_div.className = 'mail';
      email_div.id = email.id;

      email_div.innerHTML = `
        <b>${email.sender}:</b>
        &nbsp;&nbsp;&nbsp;
        ${email.subject}
        <p style='display:inline;float:right'>${email.timestamp}</p>`;

      const line_break = document.createElement('br');

      document.querySelector('#all-emails').append(email_div, line_break);
    })

    document.querySelector('#all-emails').style.display = 'block';

    //Search for click on email
    document.querySelectorAll('.mail').forEach((email) => {
      email.onclick = () => {
        show_email(email);
      }
    });

  }

  //Get all the mails of the given inbox
  function get_all_mails() {

    // Show the mailbox name
    document.querySelector('#all-emails').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      append_mails(emails);
    });
  }

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  const all_emails = document.createElement('div');
  all_emails.id = 'all-emails';

  const one_email = document.createElement('div');
  one_email.id = 'one-email';

  document.querySelector('#emails-view').append(all_emails, one_email);
  
  document.querySelector('#all-emails').style.display = 'none';
  document.querySelector('#one-email').style.display = 'none';

  get_all_mails();
}