if(!Shopify.designMode){
  const productRecommendationsSection = document.querySelector('.product-recommendations');
  
  if (productRecommendationsSection && productRecommendationsSection.dataset && productRecommendationsSection.dataset.url) {
    const url = productRecommendationsSection.dataset.url;

    fetch(url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('.product-recommendations');

        if (recommendations && recommendations.innerHTML.trim().length) {
          productRecommendationsSection.innerHTML = recommendations.innerHTML;
          
          // Check if there are any products in the recommendations
          const hasProducts = recommendations.querySelector('.related-product-row__item');
          if (!hasProducts) {
            // Hide the section if no products are found
            productRecommendationsSection.style.display = 'none';
          }
        } else {
          // No recommendations found, hide the section
          productRecommendationsSection.style.display = 'none';
        }
      })
      .catch(e => {
        console.error(e);
        // Hide section on error
        productRecommendationsSection.style.display = 'none';
      });

    const observer = new IntersectionObserver(handleIntersection, {rootMargin: '0px 0px 200px 0px'});
    observer.observe(productRecommendationsSection);
  }
}
else{
  // Design mode handling
  document.addEventListener('DOMContentLoaded', function() {
    const productRecommendationsSection = document.querySelector('.product-recommendations');
    
    if (productRecommendationsSection && productRecommendationsSection.dataset && productRecommendationsSection.dataset.url) {
      const url = productRecommendationsSection.dataset.url;
      
      fetch(url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('.product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            productRecommendationsSection.innerHTML = recommendations.innerHTML;
          }
        })
        .catch(e => {
          console.warn('Could not load product recommendations in design mode');
        });
    }
  });

  document.addEventListener('shopify:section:load', function(event){
    const prs = document.querySelector('.product-recommendations');
    
    if (prs && prs.dataset && prs.dataset.url) {
      const url = prs.dataset.url;

      fetch(url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('.product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            prs.innerHTML = recommendations.innerHTML;
          }
        })
        .catch(e => {
          console.warn('Could not load product recommendations on section load');
        });
    }
  });
}

// Define handleIntersection function if it's used
function handleIntersection(entries) {
  if (!entries[0].isIntersecting) return;
  // Handle intersection logic if needed
}
