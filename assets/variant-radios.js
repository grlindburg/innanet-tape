if (!customElements.get('variant-radios')) {
  customElements.define('variant-radios', class VariantRadios extends HTMLElement {
    constructor() {
      super();
      this.isInitialLoad = true;
      this.addEventListener('change', this.onVariantChange);
    }

    onVariantChange() {
      this.updateOptions();
      this.updateMasterId();
      this.toggleAddButton(true, '', false);
      this.updatePickupAvailability();
      this.removeErrorMessage();
      this.updateVariantStatuses();

      if (!this.currentVariant) {
        this.toggleAddButton(true, '', true);
        this.setUnavailable();
      } else {
        this.updateMedia();
        this.updateURL();
        this.updateVariantInput();
        this.renderProductInfo();
      }

      this.isInitialLoad = false;
    }

    updateOptions() {
      const fieldsets = Array.from(this.querySelectorAll('fieldset'));
      this.options = fieldsets.map((fieldset) => {
        return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
      });
    }

    updateMasterId() {
      this.currentVariant = this.getVariantData().find((variant) => {
        return !variant.options.map((option, index) => {
          return this.options[index] === option;
        }).includes(false);
      });
    }

    updateMedia() {
      if (!this.currentVariant || !this.currentVariant.featured_media) return;
      const newMedia = document.querySelector(
        `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
      );
      if (!newMedia) return;
      const parent = newMedia.parentElement;
      parent.prepend(newMedia);
      if (!this.isInitialLoad) {
        window.setTimeout(() => { parent.scroll(0, 0) });
      }
    }

    updateURL() {
      if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
      window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
      const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
      productForms.forEach((productForm) => {
        const input = productForm.querySelector('input[name="id"]');
        input.value = this.currentVariant.id;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    updateVariantStatuses() {
      const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1);
      const inputWrappers = [...this.querySelectorAll('.product-form__input')];
      inputWrappers.forEach((option, index) => {
        if (index === 0) return;
        const optionInputs = [...option.querySelectorAll('input[type="radio"]')]
        const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
        const availableOptionInputs = selectedOptionOneVariants.filter(variant => variant[`option${index}`] === previousOptionSelected && variant[`option${index + 1}`]);
        const optionAvailable = availableOptionInputs.find(variantOption => variantOption[`option${index + 1}`] === optionInputs[0].value);
        optionInputs.forEach(input => {
          if (!optionAvailable) {
            input.setAttribute('disabled', 'disabled');
          } else {
            input.removeAttribute('disabled');
          }
        });
      });
    }

    updatePickupAvailability() {
      const pickUpAvailability = document.querySelector('pickup-availability');
      if (!pickUpAvailability) return;

      if (this.currentVariant && this.currentVariant.available) {
        pickUpAvailability.fetchAvailability(this.currentVariant.id);
      } else {
        pickUpAvailability.removeAttribute('available');
        pickUpAvailability.innerHTML = '';
      }
    }

    removeErrorMessage() {
      const section = this.closest('section');
      if (!section) return;

      const productForm = section.querySelector('product-form');
      if (productForm) productForm.handleErrorMessage();
    }

    renderProductInfo() {
      const requestedVariantId = this.currentVariant.id;
      const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;

      fetch(`${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.section}`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const destination = document.getElementById(`price-${this.dataset.section}`);
          const source = html.getElementById(`price-${this.dataset.section}`);
          const skuSource = html.getElementById(`Sku-${this.dataset.section}`);
          const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
          const inventorySource = html.getElementById(`Inventory-${this.dataset.section}`);
          const inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);

          if (source && destination) destination.innerHTML = source.innerHTML;
          if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;
          if (skuSource && skuDestination) {
            skuDestination.innerHTML = skuSource.innerHTML;
            skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
          }

          const price = document.getElementById(`price-${this.dataset.section}`);

          if (price) price.classList.remove('visibility-hidden');
          this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
        });
    }

    toggleAddButton(disable = true, text, modifyClass = true) {
      const productForm = document.getElementById(`product-form-${this.dataset.section}`);
      if (!productForm) return;
      const addButton = productForm.querySelector('[name="add"]');
      const addButtonText = productForm.querySelector('[name="add"] > span');
      if (!addButton) return;

      if (disable) {
        addButton.setAttribute('disabled', 'disabled');
        if (text) addButtonText.textContent = text;
      } else {
        addButton.removeAttribute('disabled');
        addButtonText.textContent = window.variantStrings.addToCart;
      }

      if (!modifyClass) return;
    }

    setUnavailable() {
      const button = document.getElementById(`product-form-${this.dataset.section}`);
      const addButton = button.querySelector('[name="add"]');
      const addButtonText = button.querySelector('[name="add"] > span');
      const price = document.getElementById(`price-${this.dataset.section}`);
      if (!addButton) return;
      addButtonText.textContent = window.variantStrings.unavailable;
      if (price) price.classList.add('visibility-hidden');
    }

    getVariantData() {
      this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
      return this.variantData;
    }
  });
} 