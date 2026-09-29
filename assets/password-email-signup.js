function isSignupSuccess() {
    var urlParams = new URLSearchParams(window.location.search);
    var customerPostedParam = urlParams.get('customer_posted');
    var signupHash = window.location.hash;
    var formTypeParam = urlParams.get('form_type');


    return customerPostedParam === 'true' ||  formTypeParam === 'customer' || signupHash === '#contact_form';
  }

  // Function to display the success message
  function showSuccessMessage() {
    var passwordFormCountdown = document.querySelector(".password-page-countdown-form")


    if(passwordFormCountdown){

      var emailInput = document.querySelector(".password-email");
      var emailSubmitBtn = document.querySelector(".password-email-btn");
      var waitlistText =document.querySelector(".password-waitlist-text");

      emailInput.style.display = "none"; 
      emailSubmitBtn.style.display = "none"; 
      waitlistText.textContent = "Thanks For Joining!"
      
    }
    else{
    
    var emailHeader = document.querySelector(".footer-email-header");

    if(emailHeader != null){
    emailHeader.textContent = "Thanks For Joining!";
    }

    var form = document.querySelector(".password-page-form");

    if(form != null){
    var successMessage = document.querySelector(".password-success-message");
    var email_form = document.querySelector(".email");
    var header = document.querySelector(".password-email-header");
    var txt = document.querySelector(".password-email-txt");
    var btn = document.querySelector(".password-email-btn");
    successMessage.style.display = "block";
    email_form.style.display= "none"; 
    header.style.display= "none"; 
    txt.style.display= "none";
    btn.style.display= "none";
    }

    var modalForm = document.querySelector(".email-modal-form");
    
    if(modalForm != null){
    var successMessage = document.querySelector(".email-modal-success-message");
    var header = document.querySelector(".email-modal-header");
    var description = document.querySelector(".email-modal-description");
    var input = document.querySelector(".email-modal-email-input");
    var btn = document.querySelector(".email-modal-submit-btn");
    successMessage.style.display = "block";
    header.style.display= "none"; 
    description.style.display= "none"; 
    input.style.display= "none";
    btn.style.display= "none";
    sessionStorage.setItem('submittedEmailModal', 'true');
    }
  }
  }


  window.addEventListener('load', function() {
    if (isSignupSuccess()) {
      showSuccessMessage();
    }
    else{
      console.log("sign up failed")
    }
  });