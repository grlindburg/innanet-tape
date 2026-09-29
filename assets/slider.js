var BlazeSlider = (function () {
    'use strict';
  
    /**
     * calculate pages and return
     */
    function calculatePages(slider) {
        console.log('calculatePages - Input:', { 
            slidesToShow: slider.config.slidesToShow, 
            slidesToScroll: slider.config.slidesToScroll, 
            loop: slider.config.loop,
            isStatic: slider.isStatic, 
            totalSlides: slider.totalSlides 
        });
        
        const { slidesToShow, slidesToScroll, loop } = slider.config;
        const { isStatic, totalSlides } = slider;
        const pages = [];
        const lastIndex = totalSlides - 1;
        for (let startIndex = 0; startIndex < totalSlides; startIndex += slidesToScroll) {
            const _endIndex = startIndex + slidesToShow - 1;
            const overflow = _endIndex > lastIndex;
            if (overflow) {
                if (!loop) {
                    const startIndex = lastIndex - slidesToShow + 1;
                    const lastPageIndex = pages.length - 1;
                    if (pages.length === 0 ||
                        (pages.length > 0 && pages[lastPageIndex][0] !== startIndex)) {
                        pages.push([startIndex, lastIndex]);
                    }
                    break;
                }
                else {
                    const endIndex = _endIndex - totalSlides;
                    pages.push([startIndex, endIndex]);
                }
            }
            else {
                pages.push([startIndex, _endIndex]);
            }
            if (isStatic) {
                break;
            }
        }
        
        console.log('calculatePages - Output:', pages);
        return pages;
    }
  
    /**
     */
    function calculateStates(slider) {
        console.log('calculateStates - Input:', { 
            totalSlides: slider.totalSlides, 
            loop: slider.config.loop 
        });
        
        const { totalSlides } = slider;
        const { loop } = slider.config;
        // get all possible pages
        const pages = calculatePages(slider);
        const states = [];
        const lastPageIndex = pages.length - 1;
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            // calculate prev and next page index based on config
            let nextPageIndex, prevPageIndex;
            if (loop) {
                nextPageIndex = pageIndex === lastPageIndex ? 0 : pageIndex + 1;
                prevPageIndex = pageIndex === 0 ? lastPageIndex : pageIndex - 1;
            }
            else {
                nextPageIndex =
                    pageIndex === lastPageIndex ? lastPageIndex : pageIndex + 1;
                prevPageIndex = pageIndex === 0 ? 0 : pageIndex - 1;
            }
            const currentPageStartIndex = pages[pageIndex][0];
            const nextPageStartIndex = pages[nextPageIndex][0];
            const prevPageStartIndex = pages[prevPageIndex][0];
            // calculate slides that need to be moved for transitioning to next and prev state from current state
            let nextDiff = nextPageStartIndex - currentPageStartIndex;
            if (nextPageStartIndex < currentPageStartIndex) {
                nextDiff += totalSlides;
            }
            let prevDiff = currentPageStartIndex - prevPageStartIndex;
            if (prevPageStartIndex > currentPageStartIndex) {
                prevDiff += totalSlides;
            }
            states.push({
                page: pages[pageIndex],
                next: {
                    stateIndex: nextPageIndex,
                    moveSlides: nextDiff,
                },
                prev: {
                    stateIndex: prevPageIndex,
                    moveSlides: prevDiff,
                },
            });
        }
        
        console.log('calculateStates - Output:', states);
        return states;
    }
  
    const START = 'start';
    const END = 'end';
  
    function fixSliderConfig(slider) {
        console.log('fixSliderConfig - Before:', { 
            slidesToScroll: slider.config.slidesToScroll, 
            slidesToShow: slider.config.slidesToShow,
            totalSlides: slider.totalSlides
        });
        
        const { slidesToShow, slidesToScroll } = slider.config;
        const { totalSlides } = slider;
        
        if (slidesToScroll > slidesToShow) {
            {
                console.warn('slidesToScroll can not be greater than slidesToShow. Setting slidesToScroll = slidesToShow instead');
            }
            slider.config.slidesToScroll = slidesToShow;
        }
        if (totalSlides < slidesToScroll + slidesToShow) {
            const properSlidesToScroll = totalSlides - slidesToShow;
            {
                console.warn(`slidesToScroll = ${slidesToScroll} is too large for a slider with ${totalSlides} slides with slidesToShow=${slidesToShow}, setting max possible slidesToScroll = ${properSlidesToScroll} instead.`);
            }
            slider.config.slidesToScroll = properSlidesToScroll;
        }
        
        console.log('fixSliderConfig - After:', { 
            slidesToScroll: slider.config.slidesToScroll, 
            slidesToShow: slider.config.slidesToShow
        });
    }
  
    class Automata {
        constructor(totalSlides, config) {
            this.config = config;
            this.totalSlides = totalSlides;
            this.isTransitioning = false;
            constructAutomata(this, totalSlides, config);
        }
        next(pages = 1) {
            if (this.isTransitioning || this.isStatic)
                return;
            const { stateIndex } = this;
            let slidesMoved = 0;
            let newStateIndex = stateIndex;
            for (let i = 0; i < pages; i++) {
                const state = this.states[newStateIndex];
                slidesMoved += state.next.moveSlides;
                newStateIndex = state.next.stateIndex;
            }
            if (newStateIndex === stateIndex)
                return;
            this.stateIndex = newStateIndex;
            return [stateIndex, slidesMoved];
        }
        prev(pages = 1) {
            if (this.isTransitioning || this.isStatic)
                return;
            const { stateIndex } = this;
            let slidesMoved = 0;
            let newStateIndex = stateIndex;
            for (let i = 0; i < pages; i++) {
                const state = this.states[newStateIndex];
                slidesMoved += state.prev.moveSlides;
                newStateIndex = state.prev.stateIndex;
            }
            if (newStateIndex === stateIndex)
                return;
            this.stateIndex = newStateIndex;
            return [stateIndex, slidesMoved];
        }
    }
    // this will be called when slider is refreshed
    function constructAutomata(automata, totalSlides, config) {
        automata.stateIndex = 0;
        fixSliderConfig(automata);
        automata.isStatic = totalSlides <= config.slidesToShow;
        automata.states = calculateStates(automata);
    }
  
    function scrollPrev(slider, slideCount) {
        console.log('scrollPrev - Input:', { 
            slideCount, 
            loop: slider.config.loop, 
            isDragging: slider.isDragging 
        });
        
        const rAf = requestAnimationFrame;
        if (!slider.config.loop) {
            noLoopScroll(slider);
        }
        else {

            disableTransition(slider);
            // apply negative transform
            slider.offset = -1 * slideCount;
            updateTransform(slider);
            wrapPrev(slider, slideCount);
            const reset = () => {
                rAf(() => {
                    enableTransition(slider);
                    rAf(() => {
                        slider.offset = 0;
                        updateTransform(slider);
                        onSlideEnd(slider);
                    });
                });
            };

            if (slider.isDragging) {
                if (isTouch()) {
                    slider.track.addEventListener('touchend', reset, { once: true });
                }
                else {
                    slider.track.addEventListener('pointerup', reset, { once: true });
                }
            }
            else {
                rAf(reset);
            }
        }
    }
    function scrollNext(slider, slideCount) {
        console.log('scrollNext - Input:', { 
            slideCount, 
            loop: slider.config.loop 
        });
        
        const rAf = requestAnimationFrame;
        if (!slider.config.loop) {
            noLoopScroll(slider);
        }
        else {
            // apply offset and let the slider scroll from  <- (right to left)
            slider.offset = -1 * slideCount;
            updateTransform(slider);
            // once the transition is done
            setTimeout(() => {
                // remove the elements from start that are no longer visible and put them at the end
                wrapNext(slider, slideCount);
                disableTransition(slider);
                // apply transform where the slider should go
                slider.offset = 0;
                updateTransform(slider);
                rAf(() => {
                    rAf(() => {
                        enableTransition(slider);
                        onSlideEnd(slider);
                    });
                });
            }, slider.config.transitionDuration);
        }
    }
    function onSlideEnd(slider) {
        console.log('onSlideEnd called');
        
        if (slider.onSlideCbs) {
            const state = slider.states[slider.stateIndex];
            const [firstSlideIndex, lastSlideIndex] = state.page;
            console.log('onSlideEnd - Callback data:', { 
                stateIndex: slider.stateIndex, 
                firstSlideIndex, 
                lastSlideIndex 
            });
            
            slider.onSlideCbs.forEach((cb) => cb(slider.stateIndex, firstSlideIndex, lastSlideIndex));
        }
    }
  
    // when loop is disabled, we must update the offset
    function noLoopScroll(slider) {
        slider.offset = -1 * slider.states[slider.stateIndex].page[0];
        updateTransform(slider);
        onSlideEnd(slider);
    }
    function wrapPrev(slider, count) {
        const len = slider.slides.length;
        for (let i = 0; i < count; i++) {
            // pick the last and move to first
            const slide = slider.slides[len - 1];
            // @ts-ignore
            // Use insertBefore instead of prepend for better browser compatibility
            if (slider.track && slide) {
                slider.track.insertBefore(slide, slider.track.firstChild);
            }
        }
    }
    function wrapNext(slider, count) {
        for (let i = 0; i < count; i++) {
            // Use appendChild instead of append for better browser compatibility
            if (slider.track && slider.slides[0]) {
                slider.track.appendChild(slider.slides[0]);
            }
        }
    }
    function updateTransform(slider) {
        console.log('updateTransform:', { 
            offset: slider.offset, 
            dragged: slider.dragged 
        });
        
        const { track, offset, dragged } = slider;
        if (offset === 0) {
            track.style.transform = `translate3d(${dragged}px,0px,0px)`;
        }
        else {
            track.style.transform = `translate3d(  calc( ${dragged}px + ${offset} * (var(--slide-width) + ${slider.config.slideGap})),0px,0px)`;
        }
    }
    function enableTransition(slider) {
        slider.track.style.transitionDuration = `${slider.config.transitionDuration}ms`;
    }
    function disableTransition(slider) {
        slider.track.style.transitionDuration = `0ms`;
    }
  
    const slideThreshold = 10;
    const isTouch = () => 'ontouchstart' in window;
    function handlePointerDown(downEvent) {
        console.log('handlePointerDown');
        
        const track = this;
        const slider = track.slider;
        if (slider.isTransitioning)
            return;
        slider.dragged = 0;
        track.isScrolled = false;
        track.startMouseClientX =
            'touches' in downEvent ? downEvent.touches[0].clientX : downEvent.clientX;
        if (!('touches' in downEvent)) {
            // do not directly setPointerCapture on track - it blocks the click events
            // https://github.com/GoogleChromeLabs/pointer-tracker/issues/4
            const el = (downEvent.target || track);
            el.setPointerCapture(downEvent.pointerId);
        }
        disableTransition(slider);
        updateEventListener(track, 'addEventListener');
    }
    function handlePointerMove(moveEvent) {
        const track = this;
        const x = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const dragged = (track.slider.dragged = x - track.startMouseClientX);
        const draggedAbs = Math.abs(dragged);
        // consider dragging only if the user has dragged more than 5px
        if (draggedAbs > 5) {
            // track.setAttribute('data-dragging', 'true')
            track.slider.isDragging = true;
        }
        // prevent vertical scrolling if horizontal scrolling is happening
        if (draggedAbs > 15) {
            moveEvent.preventDefault();
        }
        track.slider.dragged = dragged;
        updateTransform(track.slider);
        if (!track.isScrolled && track.slider.config.loop) {
            if (dragged > slideThreshold) {
                track.isScrolled = true;
                track.slider.prev();
            }
        }
        
        // Only log occasionally to avoid flooding the console
        if (Math.abs(dragged) % 50 < 1) {
            console.log('handlePointerMove:', { dragged });
        }
    }
    function handlePointerUp() {
        console.log('handlePointerUp');
        
        const track = this;
        const dragged = track.slider.dragged;
        track.slider.isDragging = false;
        updateEventListener(track, 'removeEventListener');
        // reset drag
        track.slider.dragged = 0;
        updateTransform(track.slider);
        enableTransition(track.slider);
        if (!track.isScrolled) {
            if (dragged < -1 * slideThreshold) {
                track.slider.next();
            }
            else if (dragged > slideThreshold) {
                track.slider.prev();
            }
        }
    }
    const preventDefault = (event) => event.preventDefault();
    /**
     * drag based navigation for slider
     */
    function dragSupport(slider) {
        // @ts-expect-error
        const track = slider.track;
        track.slider = slider;
        const event = isTouch() ? 'touchstart' : 'pointerdown';
        track.addEventListener(event, handlePointerDown);
        track.addEventListener('click', (event) => {
            if (slider.isTransitioning || slider.isDragging) {
                event.preventDefault();
                event.stopImmediatePropagation();
                event.stopPropagation();
            }
        }, {
            capture: true,
        });
        track.addEventListener('dragstart', preventDefault);
    }
    function updateEventListener(track, method) {
        track[method]('contextmenu', handlePointerUp);
        if (isTouch()) {
            track[method]('touchend', handlePointerUp);
            // @ts-expect-error
            track[method]('touchmove', handlePointerMove);
        }
        else {
            track[method]('pointerup', handlePointerUp);
            // @ts-expect-error
            track[method]('pointermove', handlePointerMove);
        }
    }
  
    function handleAutoplay(slider) {
        const config = slider.config;
        if (!config.enableAutoplay)
            return;
        // Respect reduced-motion: don't auto-advance (WCAG 2.2.2).
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        const dir = config.autoplayDirection === 'to left' ? 'next' : 'prev';
        slider.autoplayTimer = setInterval(() => {
            slider[dir]();
        }, config.autoplayInterval);
        if (config.stopAutoplayOnInteraction) {
            const stop = () => clearInterval(slider.autoplayTimer);
            slider.el.addEventListener(isTouch() ? 'touchstart' : 'mousedown', stop, { once: true });
            // Also stop when a keyboard user focuses into the slider (WCAG 2.2.2).
            slider.el.addEventListener('focusin', stop, { once: true });
        }
    }
  
    const defaultConfig = {
        // layout
        slideGap: '20px',
        slidesToScroll: 1,
        slidesToShow: 1,
        // behavior
        loop: true,
        // autoplay
        enableAutoplay: false,
        stopAutoplayOnInteraction: true,
        autoplayInterval: 3000,
        autoplayDirection: 'to left',
        // pagination
        enablePagination: true,
        // transition
        transitionDuration: 300,
        transitionTimingFunction: 'ease',
        draggable: true,
    };
    function createConfig(blazeConfig) {
        const config = { ...defaultConfig };
        for (const media in blazeConfig) {
            if (window.matchMedia(media).matches) {
                const mediaConfig = blazeConfig[media];
                for (const key in mediaConfig) {
                    // @ts-expect-error
                    config[key] = mediaConfig[key];
                }
            }
        }
        return config;
    }
  
    function handleNavigation(slider) {
        const prev = slider.el.querySelector('.blaze-prev');
        const next = slider.el.querySelector('.blaze-next');

        // Make a control keyboard-operable even when it isn't a native
        // button/link: expose button semantics and handle Enter/Space (WCAG 2.1.1).
        const makeAccessible = (el, label) => {
            const isNativeButton = el.tagName === 'BUTTON'
                || (el.tagName === 'A' && el.hasAttribute('href'));
            if (!isNativeButton) {
                if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
                if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.keyCode === 13 || e.keyCode === 32) {
                        e.preventDefault();
                        el.click();
                    }
                });
            }
            if (!el.hasAttribute('aria-label') && !el.textContent.trim()) {
                el.setAttribute('aria-label', label);
            }
        };

        if (prev) {
            makeAccessible(prev, 'Previous');
            prev.onclick = () => {
                slider.prev();
            };
        }
        if (next) {
            makeAccessible(next, 'Next');
            next.onclick = () => {
                slider.next();
            };
        }
    }
  
    function handlePagination(slider) {
        if (!slider.config.enablePagination || slider.isStatic)
            return;
        const paginationContainer = slider.el.querySelector('.blaze-pagination');
        if (!paginationContainer)
            return;
        slider.paginationButtons = [];
        const total = slider.states.length;
        for (let index = 0; index < total; index++) {
            const button = document.createElement('button');
            slider.paginationButtons.push(button);
            button.textContent = 1 + index + '';
            button.ariaLabel = `${index + 1} of ${total}`;
            paginationContainer.append(button);
            // @ts-expect-error
            button.slider = slider;
            // @ts-expect-error
            button.index = index;
            // @ts-expect-error
            button.onclick = handlePaginationButtonClick;
        }
        // initially the first button is active
        slider.paginationButtons[0].classList.add('active');
    }
    function handlePaginationButtonClick() {
        const index = this.index;
        const slider = this.slider;
        const stateIndex = slider.stateIndex;
        const loop = slider.config.loop;
        const diff = Math.abs(index - stateIndex);
        const inverseDiff = slider.states.length - diff;
        const isDiffLargerThanHalf = diff > slider.states.length / 2;
        const scrollOpposite = isDiffLargerThanHalf && loop;
        // if target state is ahead of current state
        if (index > stateIndex) {
            // but the diff is too large
            if (scrollOpposite) {
                // scroll in opposite direction to reduce scrolling
                slider.prev(inverseDiff);
            }
            else {
                // scroll normally
                slider.next(diff);
            }
        }
        // if target state is before current state
        else {
            // but the diff is too large
            if (scrollOpposite) {
                // scroll in opposite direction
                slider.next(inverseDiff);
            }
            else {
                // scroll normally
                slider.prev(diff);
            }
        }
    }
  
    function isTransitioning(slider, time = slider.config.transitionDuration) {
        slider.isTransitioning = true;
        setTimeout(() => {
            slider.isTransitioning = false;
        }, time);
    }
    class BlazeSlider extends Automata {
        constructor(blazeSliderEl, blazeConfig) {
            console.log('BlazeSlider constructor - Config:', blazeConfig);

            // Defensive check: ensure the slider element exists
            if (!blazeSliderEl) {
                throw new Error('BlazeSlider: slider element not found');
            }

            const track = blazeSliderEl.querySelector('.blaze-track');

            // Defensive check: ensure the track exists
            if (!track) {
                throw new Error('BlazeSlider: .blaze-track element not found within slider');
            }

            const slides = track.children;

            // Defensive check: ensure there are slides
            if (!slides || slides.length === 0) {
                console.warn('BlazeSlider: No slides found in .blaze-track');
            }

            const config = blazeConfig
                ? createConfig(blazeConfig)
                : { ...defaultConfig };
            super(slides.length, config);
            this.config = config;
            this.el = blazeSliderEl;
            this.track = track;
            this.slides = slides;
            this.offset = 0;
            this.dragged = 0;
            this.isDragging = false;
            // @ts-ignore - for debugging
            this.el.blazeSlider = this;
            this.passedConfig = blazeConfig;
            const slider = this;
            track.slider = slider;
            construct(config, slider);
            // throttled to refresh every 200ms when resizing
            let ignoreResize = false;
            let width = 0;
            window.addEventListener('resize', () => {
                if (width === 0) {
                    width = window.innerWidth;
                    return;
                }
                const newWidth = window.innerWidth;
                // ignore height change - only refresh if the width is changed
                if (width === newWidth)
                    return;
                width = newWidth;
                if (!ignoreResize) {
                    ignoreResize = true;
                    setTimeout(() => {
                        slider.refresh();
                        ignoreResize = false;
                    }, 200);
                }
            });
            
            console.log('BlazeSlider initialized with', { 
                slidesCount: slides.length, 
                isStatic: this.isStatic 
            });
        }
        next(count) {
            console.log('next called with count:', count);
            
            if (this.isTransitioning) {
                console.log('next - Blocked: isTransitioning is true');
                return;
            }
            const transition = super.next(count);
            if (!transition) {
                isTransitioning(this);
                return;
            }
            const [prevStateIndex, slideCount] = transition;
            handleStateChange(this, prevStateIndex);
            isTransitioning(this);
            scrollNext(this, slideCount);
        }
        prev(count) {
            console.log('prev called with count:', count);
            
            if (this.isTransitioning) {
                console.log('prev - Blocked: isTransitioning is true');
                return;
            }
            const transition = super.prev(count);
            if (!transition) {
                isTransitioning(this);
                return;
            }
            const [prevStateIndex, slideCount] = transition;
            handleStateChange(this, prevStateIndex);
            isTransitioning(this);
            scrollPrev(this, slideCount);
        }
        stopAutoplay() {
            clearInterval(this.autoplayTimer);
        }
        destroy() {
            console.log('destroy called');
            
            // remove side effects that won't be overridden by construct()
            // remove old drag event handler
            this.track.removeEventListener(isTouch() ? 'touchstart' : 'pointerdown', 
            // @ts-expect-error
            handlePointerDown);
            // stop autoplay
            this.stopAutoplay();
            // remove pagination buttons
            this.paginationButtons?.forEach((button) => button.remove());
            // remove classes
            this.el.classList.remove('static');
            this.el.classList.remove(START);
        }
        refresh() {
            console.log('refresh called');
            
            const newConfig = this.passedConfig
                ? createConfig(this.passedConfig)
                : { ...defaultConfig };
            this.destroy();
            construct(newConfig, this);
        }
        /**
         * Subscribe for slide change event
         * Returns a function to unsubscribe from slide change event
         */
        onSlide(cb) {
            if (!this.onSlideCbs)
                this.onSlideCbs = new Set();
            this.onSlideCbs.add(cb);
            return () => this.onSlideCbs.delete(cb);
        }
    }
    function handleStateChange(slider, prevStateIndex) {
        const classList = slider.el.classList;
        const stateIndex = slider.stateIndex;
        const buttons = slider.paginationButtons;
        if (!slider.config.loop) {
            if (stateIndex === 0) {
                classList.add(START);
            }
            else {
                classList.remove(START);
            }
            if (stateIndex === slider.states.length - 1) {
                classList.add(END);
            }
            else {
                classList.remove(END);
            }
        }
        if (buttons && slider.config.enablePagination) {
            buttons[prevStateIndex].classList.remove('active');
            buttons[stateIndex].classList.add('active');
        }
    }
    function construct(config, slider) {
        console.log('construct - Config:', config);
        
        const track = slider.track;
        slider.slides = track.children;
        slider.offset = 0;
        slider.config = config;
        constructAutomata(slider, slider.totalSlides, config);
        // if a side effect is in condition - make sure to add it for both conditions - so it gets cleaned up
        // when refresh is called
        if (!config.loop) {
            slider.el.classList.add(START);
        }
        if (config.enableAutoplay && !config.loop) {
            {
                console.warn('enableAutoplay:true is not consistent with loop:false, auto-fixing with enableAutoplay:false');
            }
            config.enableAutoplay = false;
        }
        track.style.transitionProperty = 'transform';
        track.style.transitionTimingFunction = slider.config.transitionTimingFunction;
        track.style.transitionDuration = `${slider.config.transitionDuration}ms`;
        const { slidesToShow, slideGap } = slider.config;
        slider.el.style.setProperty('--slides-to-show', slidesToShow + '');
        slider.el.style.setProperty('--slide-gap', slideGap);
        if (!slider.isStatic) {
            if (config.draggable) {
                dragSupport(slider);
            }
        }
        else {
            slider.el.classList.add('static');
        }
        handlePagination(slider);
        handleAutoplay(slider);
        handleNavigation(slider);
        updateTransform(slider);
        
        console.log('construct - Complete', { 
            isStatic: slider.isStatic, 
            totalStates: slider.states.length 
        });
    }
  
    return BlazeSlider;
  
  })();

// Add this helper function to the global scope
window.initializeBlazeSlider = function(elementSelector, config) {
    console.log(`Initializing BlazeSlider for element: ${elementSelector}`);
    const el = document.querySelector(elementSelector);
    if (!el) {
        console.warn(`BlazeSlider: Element with selector "${elementSelector}" not found. Slider will not be initialized.`);
        return null;
    }

    // Check if the element has a .blaze-track child
    const track = el.querySelector('.blaze-track');
    if (!track) {
        console.warn(`BlazeSlider: Element "${elementSelector}" does not contain a .blaze-track element. Slider will not be initialized.`);
        return null;
    }

    // Check if there are any slides
    if (!track.children || track.children.length === 0) {
        console.warn(`BlazeSlider: No slides found in "${elementSelector}" .blaze-track. Slider will not be initialized.`);
        return null;
    }

    try {
        const slider = new BlazeSlider(el, config);
        console.log(`Successfully initialized slider for ${elementSelector}`);
        return slider;
    } catch (error) {
        console.error(`Error initializing slider for ${elementSelector}:`, error);
        return null;
    }
};