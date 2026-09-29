window.onload = function() {
  handleVariantImageChange();
};

//PRODUCT GALLERY ITEM SWITCHER
var gridItems = document.querySelectorAll('div.product-img-grid-item');

if(gridItems){
  gridItems.forEach(function(smallPicture) {
    if(smallPicture.getAttribute("mediaType") == "image"){
      smallPicture.addEventListener('click', function() {
        //console.log("clicked me")
        changeMainWithIncomingMedia(smallPicture.querySelector("img"), "image");
      });
    }
    else if(smallPicture.getAttribute("mediaType") == "video"){
      smallPicture.addEventListener('click', function() {
        changeMainWithIncomingMedia(smallPicture.querySelector("video"), "video");
      });
    }
    else if(smallPicture.getAttribute("mediaType") == "model"){
      smallPicture.addEventListener('click', function() {
        changeMainWithIncomingMedia(smallPicture.querySelector("model-viewer"), "model");
      });
    }
    else if(smallPicture.getAttribute("mediaType") == "external_video"){
      smallPicture.addEventListener('click', function() {
        changeMainWithIncomingMedia(smallPicture.querySelector("iframe"), "iframwe");
      });
    }
  });
}

function changeMainWithIncomingMedia(smallPicture, mediaType) {
  //console.log('changeMainWithIncomingMedia called with:', smallPicture, mediaType);
  var main = document.querySelectorAll('div.featured-product-image')[0];
  
  //console.log('Main container:', main);

  // Remove existing content
  while (main.firstChild) {
    main.removeChild(main.firstChild);
  }
  //console.log('Existing content removed');

  var mediaToBeMain = smallPicture.cloneNode(true);
  mediaToBeMain.setAttribute("id", "main-product-image");
  main.appendChild(mediaToBeMain);
  mediaToBeMain.style.display = 'block';
  //console.log('New main image appended:', mediaToBeMain);

  //console.log('Main image updated:', mediaToBeMain.src);
}

function handleVariantImageChange() {
  //console.log('handleVariantImageChange function called');
  const variantInput = document.getElementById('ultimate-selected-variant');
  const productData = JSON.parse(document.getElementById('product-data').dataset.product);

  //console.log('Variant input:', variantInput);
 // console.log('Product data:', productData);

  if (!variantInput) {
    //console.error('Variant input not found');
    return;
  }

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      //console.log('Mutation detected:', mutation);
      if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
        const selectedVariantId = parseInt(variantInput.value);
        //console.log('Selected variant ID:', selectedVariantId);
        const selectedVariant = productData.variants.find(variant => variant.id === selectedVariantId);

       // console.log('Selected variant:', selectedVariant);

        if (selectedVariant && selectedVariant.featured_image) {
         // console.log('Updating main image to:', selectedVariant.featured_image.src);
          
          // Find the thumbnail with the matching image
          const matchingThumbnail = document.querySelector(`div.product-img-grid-item img[src="${selectedVariant.featured_image.src}"]`);
          //console.log('Matching thumbnail:', matchingThumbnail);
          
          if (matchingThumbnail) {
            // Use the existing changeMainWithIncomingMedia function
            changeMainWithIncomingMedia(matchingThumbnail, "image");
            
            // Update the selected state of thumbnails
            const thumbnails = document.querySelectorAll('div.product-img-grid-item');
            thumbnails.forEach(thumbnail => {
              if (thumbnail.querySelector('img').src === selectedVariant.featured_image.src) {
                thumbnail.classList.add('selected');
              } else {
                thumbnail.classList.remove('selected');
              }
            });

            //console.log('Main image updated and thumbnails refreshed');
          } else {
            //console.error('Matching thumbnail not found');
          }
        } else {
          //console.log('Selected variant has no featured image');
        }
      }
    });
  });

  observer.observe(variantInput, { attributes: true });
  //console.log('Observer set up for variant input');
}

// Call this function when the page loads
window.addEventListener('DOMContentLoaded', (event) => {
  handleVariantImageChange();
});