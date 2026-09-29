document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const link = item.querySelector('.nav-link-collection');
        const dropdown = item.querySelector('.dropdown, .sub-dropdown'); 
        const arrow = item.querySelector('.pushy-arrow');

        if (link && dropdown) {
            // Expose the disclosure relationship to assistive tech (WCAG 4.1.2).
            link.setAttribute('aria-haspopup', 'true');

            function setExpanded(expanded) {
                dropdown.style.display = expanded ? 'block' : 'none';
                link.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                link.classList.toggle('active', expanded);
                if (arrow) {
                    arrow.classList.toggle('rotate', expanded);
                }
            }

            setExpanded(link.classList.contains('active'));

            function toggle() {
                setExpanded(dropdown.style.display !== 'block');
            }

            link.addEventListener('click', function(e) {
                e.preventDefault();
                toggle();
            });

            // Keyboard support: Space toggles (Enter already fires click on
            // links/buttons); Escape closes and returns focus to the trigger.
            link.addEventListener('keydown', function(e) {
                if (e.key === ' ' || e.key === 'Spacebar' || e.keyCode === 32) {
                    e.preventDefault();
                    toggle();
                } else if (e.key === 'Escape' || e.keyCode === 27) {
                    if (dropdown.style.display === 'block') {
                        setExpanded(false);
                        link.focus();
                    }
                }
            });
        }
    });
});