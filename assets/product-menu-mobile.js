
    window.addEventListener('DOMContentLoaded', function () {


        // Get the announcement bar and filter button elements
        var announcementBar = document.querySelector('.text-block');
        var mobileMenuIcon = document.querySelector('.filter-btn');
        var collectionMenu = document.querySelector('.category-container');
        var closeCollectionMenu = document.querySelector('.close-filter-btn');

        var newCloseCollectionMenu = closeCollectionMenu.cloneNode(true); // `true` for a deep clone, copying all child nodes as well

        closeCollectionMenu.parentNode.replaceChild(newCloseCollectionMenu, collectionMenu);


        //Handle opening and closing of menu:
        mobileMenuIcon.addEventListener("click", function() {
            collectionMenu.classList.add("show-cart");
        });

    closeCollectionMenu.addEventListener("click", function() {
        newCloseCollectionMenu.classList.remove("show-cart");
        });




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

    // Calculate the total height (height + top margin + bottom margin) of the announcement bar
    var totalAnnouncementBarHeight = announcementBarHeight + announcementBarMargins.top + announcementBarMargins.bottom;

    // Set the top position of the filter button
    mobileMenuIcon.style.top = (totalAnnouncementBarHeight + 4) + 'px';
}

    // Initial call to set the filter button position
    updateFilterBtnPosition();

    // Call the updateFilterBtnPosition function whenever the window is resized
    window.addEventListener('resize', function () {
    updateFilterBtnPosition();
});
});

