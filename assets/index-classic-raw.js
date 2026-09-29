function indexSideFunc() {


    const announcementBar = document.querySelector('.text-block');
    const navIcon = document.querySelector('.menu-btn');


    if(announcementBar) {
        console.log("announcement bar present")
        function handleDOMContentLoaded() {
            // Get the announcement bar and filter button elements


            if (document.querySelector('.announcement-floater-enabled')) {
                navIcon.style.right = '3.7%';
            }
            else{
                navIcon.style.left = '1%';
            }

            // Function to get computed margin values
            function getComputedMargins(element) {
                var styles = window.getComputedStyle(element);
                return {
                    top: parseFloat(styles.marginTop),
                    bottom: parseFloat(styles.marginBottom),
                };
            }

            // Function to set the top position of the filter button
            function updateFilterBtnPosition() {
                var announcementBarHeight = announcementBar.offsetHeight;
                var announcementBarMargins = getComputedMargins(announcementBar);

                var totalAnnouncementBarHeight = announcementBarHeight + announcementBarMargins.top + announcementBarMargins.bottom;

                navIcon.style.top = (totalAnnouncementBarHeight + 4) + 'px';
            }

            updateFilterBtnPosition();

            window.removeEventListener('resize', updateFilterBtnPosition);

            window.addEventListener('resize', updateFilterBtnPosition);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', handleDOMContentLoaded, {once: true});
        } else {
            handleDOMContentLoaded();
        }


    }
} 


if (Shopify.designMode) {
    indexSideFunc();
    document.addEventListener('shopify:section:load', function(event){
        indexSideFunc();
    });
} else {
    indexSideFunc();
}