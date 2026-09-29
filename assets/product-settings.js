var observer = new IntersectionObserver(     
    (entries, observer) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0.0) {
                img = entry.target;
                if (!img.hasAttribute('src')) {
                    img.setAttribute('src', img.dataset.src);
                }
            }
        });
    },
    {}
)
for (let img of document.getElementsByTagName('img')) {
    observer.observe(img);
}