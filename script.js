jQuery(document).ready(function ($) {
    let $sliderBar = $('.slider-bar');
    let $sliderHandle = $('.slider-handle');
    let $sliderContent = $('.slider-content');
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
        })

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

    function getQueryParam(param) {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Получаем значение параметра id
    let id = getQueryParam('id');
    let itemsGap = 0;

    if (viewportWidth > 1280) {
        itemsGap = 240;
    } else if (viewportWidth >= 1024 && viewportWidth <= 1279) {
        itemsGap = 150;
    } else if (viewportWidth >= 960 && viewportWidth <= 1023) {
        itemsGap = 100;
    } else if (viewportWidth > 1 && viewportWidth <= 959) {
        itemsGap = 50;
    }

    // Выполняем действия в зависимости от значения id
    let currentVideoPosition = $videoElement.width() + itemsGap;
    let initialSliderContentLeft = 0;

    if (id) {
        switch (id) {
            case '1':
                initialSliderContentLeft = 0;
                break;
            case '2':
                initialSliderContentLeft = -currentVideoPosition;
                break;
            case '3':
                initialSliderContentLeft = -currentVideoPosition * 2;
                break;
            case '4':
                initialSliderContentLeft = -currentVideoPosition * 3;
                break;
            default:
                console.log("ID не соответствует ни одному из ожидаемых значений");
                break;
        }
    } else {
        console.log("ID параметр не найден в URL");
    }

    // Устанавливаем начальную позицию для $sliderContent
    $sliderContent.css('left', initialSliderContentLeft + 'px');

    // Вычисляем и устанавливаем соответствующую позицию для $sliderHandle
    let initialHandlePosition = Math.abs(initialSliderContentLeft) / (contentWidth - containerWidth) * sliderMax;
    initialHandlePosition = Math.max(0, Math.min(sliderMax, initialHandlePosition));
    $sliderHandle.css('left', initialHandlePosition + 'px');

    function startDrag(startX) {
        let startLeft = $sliderHandle.position().left;

        $sliderContent.css('transition', 'none');
        $sliderHandle.css('transition', 'none');

        function moveDrag(e) {
            let currentX = e.type === 'mousemove' ? e.pageX : e.originalEvent.touches[0].pageX;
            let newLeft = startLeft + (currentX - startX);
            newLeft = Math.max(0, Math.min(sliderMax, newLeft));

            $sliderHandle.css({left: newLeft + 'px'});

            let contentShift = -newLeft / sliderMax * (contentWidth - containerWidth);
            $sliderContent.css({left: contentShift + 'px'});
        }

        function endDrag() {
            $(document).off('.slider');
            $sliderContent.css('transition', '');
            $sliderHandle.css('transition', '');
        }

        $(document).on('mousemove.slider touchmove.slider', moveDrag);
        $(document).on('mouseup.slider touchend.slider', endDrag);
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
    });

    $videoBlock.on('touchstart', function (e) {
        let startX = e.originalEvent.touches[0].pageX;
        let startLeft = $sliderContent.position().left;

        function moveContent(e) {
            let currentX = e.originalEvent.touches[0].pageX;
            let newLeft = startLeft + (currentX - startX);

            newLeft = Math.max(containerWidth - contentWidth, Math.min(0, newLeft));

            $sliderContent.css({left: newLeft + 'px'});

            let handlePosition = -newLeft / (contentWidth - containerWidth) * sliderMax;
            $sliderHandle.css({left: handlePosition + 'px'});
        }

        function endContentDrag() {
            $(document).off('touchmove.sliderContent touchend.sliderContent');
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

    let inertiaTimeout;
    let isQuickSwipe = false;
    let touchStartTime;

    function applyInertia(e) {
        clearTimeout(inertiaTimeout);
        let startX = e.originalEvent.touches[0].pageX;
        let lastX = startX;
        touchStartTime = Date.now();

        function inertiaMove(e) {
            let currentX = e.originalEvent.touches[0].pageX;
            let deltaX = currentX - lastX;
            lastX = currentX;

            let currentLeft = $sliderContent.position().left;

            // Если движение быстрое, умножаем deltaX на 30
            let newLeft = currentLeft + (isQuickSwipe ? deltaX * 30 : deltaX);

            let maxLeft = 0;
            let minLeft = containerWidth - contentWidth;
            newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));

            let moveTime = Date.now() - touchStartTime;
            isQuickSwipe = moveTime < 200; // Условие быстрого движения

            $sliderContent.css({
                left: newLeft + 'px',
                transition: isQuickSwipe ? 'left 0.5s ease-out' : 'none'
            });

            let handlePosition = -newLeft / (contentWidth - containerWidth) * sliderMax;
            handlePosition = Math.max(0, Math.min(sliderMax, handlePosition));
            $sliderHandle.css({
                left: handlePosition + 'px',
                transition: isQuickSwipe ? 'left 0.5s ease-out' : 'none'
            });
        }

        function inertiaEnd() {
            $(document).off('touchmove.sliderContentInertia touchend.sliderContentInertia');
        }

        $(document).on('touchmove.sliderContentInertia', inertiaMove);
        $(document).on('touchend.sliderContentInertia', inertiaEnd);
    }

    $videoBlock.on('touchstart', applyInertia);


});
