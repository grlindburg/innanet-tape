window.addEventListener('load', function() {
    console.log('Password store owner script loaded');

    var storeOwnerBtn = document.querySelector(".password-store-owner");
    var storeOwnerBtnMobile = document.querySelector(".password-store-owner-mobile");
    var passwordModal = document.querySelector(".password-modal-background");
    var passwordContainer = document.querySelector(".password-container");
    var passwordCloseBtn = document.querySelector(".password-close-btn");
  
    console.log('Elements found:', {
        storeOwnerBtn,
        storeOwnerBtnMobile,
        passwordModal,
        passwordContainer,
        passwordCloseBtn
    });
  
    storeOwnerBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Store owner button clicked');
        console.log('Modal before:', passwordModal.classList.contains('visible'));
        
        // Add debug check for computed styles
        console.log('Modal styles before:', window.getComputedStyle(passwordModal).opacity);
        
        requestAnimationFrame(() => {
            passwordModal?.classList.add('visible');
            console.log('Modal after:', passwordModal.classList.contains('visible'));
            
            // Check styles after class is added
            console.log('Modal styles after:', window.getComputedStyle(passwordModal).opacity);
        });
    });
  
    storeOwnerBtnMobile?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Mobile store owner button clicked');
        requestAnimationFrame(() => {
            passwordModal?.classList.add('visible');
        });
    });
  
    passwordCloseBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Close button clicked');
        passwordModal?.classList.remove('visible');
    });

    passwordModal?.addEventListener('click', (event) => {
        if (event.target === passwordModal) {
            console.log('Modal background clicked');
            passwordModal.classList.remove('visible');
        }
    });

    passwordContainer?.addEventListener('click', (event) => {
        event.stopPropagation();
    });
});