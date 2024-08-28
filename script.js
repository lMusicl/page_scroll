jQuery(document).ready(function ($) {
    let $sliderBar = $('.slider-bar');
    let $sliderHandle = $('.slider-handle');
    let $sliderContent = $('.slider-content');
    let $scrollPercentage = $('.scroll-percentage');
    let $videoElement = $('.video-item');
    let $videoBlock = $('.video-block');
    let $viewPort = $('body');
    let $scrollBlock = $('.scroll-block');

    let containerWidth = $('.container').width();
    let contentHeight = $sliderContent.height();
    let contentWidth = $sliderContent.width();
    let sliderMax = $sliderBar.width() - $sliderHandle.width();
    let viewportWidth = $viewPort.width();
    let heightDifference = 0;
    let isInertiaActive = false;

    $scrollBlock.css("height", contentHeight);

    function adaptiveFunc() {
        let newSliderContentWidth = 0;
        let videoCount = 0;

        $videoElement.each(function (index, value) {
            let childrenText = $(value).children('.video-item-text');
            let childrenVideo = $(value).find('.video-block-content');
            let currentVideoWidth = 0;

            if (viewportWidth >= 1 && viewportWidth <= 599) {
                currentVideoWidth = containerWidth - 30;
            } else if (viewportWidth >= 600) {
                currentVideoWidth = containerWidth - 60;
            }
            $(value).css("max-width", containerWidth);
            $(childrenText).css("width", containerWidth);
            $(childrenVideo).css("width", currentVideoWidth);
            videoCount += 1;
        });

        let videoElementWidth = $videoElement.width();

        if (viewportWidth >= 1024 && viewportWidth <= 1279) {
            newSliderContentWidth += videoElementWidth * videoCount + 150 * (videoCount - 1);
        } else if (viewportWidth >= 960 && viewportWidth <= 1023) {
            newSliderContentWidth += videoElementWidth * videoCount + 100 * (videoCount - 1);
        } else if (viewportWidth > 1 && viewportWidth <= 959) {
            newSliderContentWidth += videoElementWidth * videoCount + 50 * (videoCount - 1);
        }

        contentWidth = newSliderContentWidth;
        $sliderContent.css("max-width", newSliderContentWidth);
    }

    if (viewportWidth < 1279) {
        adaptiveFunc();
    }

    function updateScrollPercentage(handlePosition) {
        let percentage = Math.round((handlePosition / sliderMax) * 100);
        $scrollPercentage.text('[ ' + percentage + '% ]');
    }

    function startDrag(startX) {
        let startLeft = $sliderHandle.position().left;
        isInertiaActive = false;

        $sliderContent.css('transition', 'none');
        $sliderHandle.css('transition', 'none');

        function moveDrag(e) {
            let currentX = e.type === 'mousemove' ? e.pageX : e.originalEvent.touches[0].pageX;
            let newLeft = startLeft + (currentX - startX);
            newLeft = Math.max(0, Math.min(sliderMax, newLeft));

            $sliderHandle.css({left: newLeft + 'px'});

            let contentShift = -newLeft / sliderMax * (contentWidth - containerWidth);
            $sliderContent.css({left: contentShift + 'px'});

            updateScrollPercentage(newLeft);
        }

        function endDrag(e) {
            $(document).off('.slider');
            let endX = e.type === 'mouseup' ? e.pageX : e.originalEvent.changedTouches[0].pageX;
            let swipeDistance = endX - startX;

            if (Math.abs(swipeDistance) > 50) {
                let swipeSpeed = swipeDistance / (e.timeStamp - e.originalEvent.timeStamp);
                let momentum = swipeSpeed * 500; // чем больше это число, тем сильнее инерция
                applyInertia(momentum);
            }

            $sliderContent.css('transition', '');
            $sliderHandle.css('transition', '');
        }

        $(document).on('mousemove.slider touchmove.slider', moveDrag);
        $(document).on('mouseup.slider touchend.slider', endDrag);
    }

    function applyInertia(momentum) {
        if (isInertiaActive) return;

        let currentLeft = $sliderHandle.position().left;
        let targetLeft = currentLeft + momentum;
        targetLeft = Math.max(0, Math.min(sliderMax, targetLeft));

        function inertiaScroll() {
            if (isInertiaActive) {
                return;
            }

            currentLeft += momentum * 0.1;
            momentum *= 0.95; // коэффициент затухания инерции

            if (Math.abs(momentum) < 0.5) {
                momentum = 0;
                isInertiaActive = false;
                return;
            }

            currentLeft = Math.max(0, Math.min(sliderMax, currentLeft));

            $sliderHandle.css({left: currentLeft + 'px'});
            let contentShift = -currentLeft / sliderMax * (contentWidth - containerWidth);
            $sliderContent.css({left: contentShift + 'px'});

            updateScrollPercentage(currentLeft);

            requestAnimationFrame(inertiaScroll);
        }

        isInertiaActive = true;
        requestAnimationFrame(inertiaScroll);
    }

    $sliderHandle.on('mousedown', function (e) {
        startDrag(e.pageX);
        e.preventDefault();
    });

    $sliderHandle.on('touchstart', function (e) {
        startDrag(e.originalEvent.touches[0].pageX);
        e.preventDefault();
    });

    $sliderBar.on('mousewheel DOMMouseScroll', function (e) {
        e.preventDefault();
        let delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
        let handlePosition = $sliderHandle.position().left;

        $sliderContent.css('transition', 'left .7s ease');
        $sliderHandle.css('transition', 'left .7s ease');

        if (delta > 0) {
            handlePosition -= 200;
        } else {
            handlePosition += 200;
        }

        handlePosition = Math.max(0, Math.min(sliderMax, handlePosition));

        $sliderHandle.css({left: handlePosition + 'px'});

        let contentShift = -handlePosition / sliderMax * (contentWidth - containerWidth);
        $sliderContent.css({left: contentShift + 'px'});

        updateScrollPercentage(handlePosition);
    });

    $videoBlock.on('touchstart', function (e) {
        let startX = e.originalEvent.touches[0].pageX;
        let startLeft = $sliderContent.position().left;
        let startTime = e.timeStamp;

        function moveContent(e) {
            let currentX = e.originalEvent.touches[0].pageX;
            let newLeft = startLeft + (currentX - startX);

            newLeft = Math.max(containerWidth - contentWidth, Math.min(0, newLeft));

            $sliderContent.css({left: newLeft + 'px'});

            let handlePosition = -newLeft / (contentWidth - containerWidth) * sliderMax;
            $sliderHandle.css({left: handlePosition + 'px'});

            updateScrollPercentage(handlePosition);
        }

        function endContentDrag(e) {
            $(document).off('touchmove.sliderContent touchend.sliderContent');
            let endX = e.originalEvent.changedTouches[0].pageX;
            let swipeDistance = endX - startX;
            let swipeSpeed = swipeDistance / (e.timeStamp - startTime);

            if (Math.abs(swipeDistance) > 50) {
                let momentum = swipeSpeed * 500;
                applyInertia(momentum);
            }
        }

        $(document).on('touchmove.sliderContent', moveContent);
        $(document).on('touchend.sliderContent', endContentDrag);

        e.preventDefault();
    });

    const maxLength = 300;
    const maxFullLength = 2000;

    $videoElement.each(function () {
        const $videoItem = $(this);
        const $videoItemText = $videoItem.find('.video-item-review-bottom_text');
        const fullText = $videoItemText.text().trim();
        let truncatedText = fullText;

        if (fullText.length > maxFullLength) {
            truncatedText = fullText.substring(0, maxFullLength);
        }

        if (truncatedText.length > maxLength) {
            const displayedText = truncatedText.substring(0, maxLength) + '...';
            $videoItemText.text(displayedText);

            function toggleReviewText() {
                const initialScrollBlockHeight = $scrollBlock.height();
                let initialSliderContentHeight = $sliderContent.height();

                if ($videoItemText.hasClass('expanded')) {
                    $videoItemText.removeClass('expanded').text(displayedText);
                    $(this).text('mehr');

                    let updateSliderContentHeight = $sliderContent.height();
                    heightDifference = initialSliderContentHeight - updateSliderContentHeight;
                    $scrollBlock.css('height', initialScrollBlockHeight - heightDifference + 'px');
                } else {
                    $videoItemText.addClass('expanded').text(truncatedText);
                    $(this).text('weniger');
                    let updateSliderContentHeight = $sliderContent.height();

                    heightDifference = updateSliderContentHeight - initialSliderContentHeight;

                    const newScrollBlockHeight = initialScrollBlockHeight + heightDifference;
                    $scrollBlock.css('height', newScrollBlockHeight + 'px');
                }
            }

            $(this).find('.video-item-review-bottom_btn').on('click touchstart', function (e) {
                toggleReviewText.call(this);
                e.preventDefault();
            });
        } else {
            $(this).find('.video-item-review-bottom_btn').hide();
        }
    });
});
