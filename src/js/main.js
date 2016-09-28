var _ = window._;

(function () {

    window.com = window.com || {};

    var elementInViewport = function(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        while(el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
            top < (window.pageYOffset + window.innerHeight) &&
            left < (window.pageXOffset + window.innerWidth) &&
            (top + height) > window.pageYOffset &&
            (left + width) > window.pageXOffset
        );
    }

    var updateScroll = function(e){
        var doc = document.documentElement,
            top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

        // Update the scroll nag position if necessary:
        if(elementInViewport(document.getElementById('SundayVideo')) || elementInViewport(document.getElementById('EndCard'))){
            // At the top or bottom; hide the scroll control on the side.
            app.$scrollNext.clearQueue().fadeOut();
        }else{
            app.$scrollNext.clearQueue().delay(1500).fadeIn();
        }

        var $video, video;

        // Check all the videos and pause as necessary:

        $('.ambientVideo').each(function(){

            $videoRef = $(this);
            videoElement = $(this).get(0);

            if(elementInViewport(videoElement)){
                // Video is on-screen.
                if($videoRef.data('started')) {
                    // Video has previously been started before
                    if (videoElement.paused) {
                        videoElement.play();
                    }
                }else{
                    // Video hasn't played yet:
                    app.startVideo($videoRef);
                }
            }else{
                if($videoRef.data('started') && !videoElement.paused){
                    videoElement.pause();
                }
            }

        });

    };

    var app = window.com.sirrosevelt || {};

    app.videoPlaying = false;

    app.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent);

    app.isIE = function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
    };

    app.isIEOld = app.isIE() && app.isIE() < 9;
    app.isiPad = navigator.userAgent.match(/iPad/i);
    app.isiMobile = navigator.userAgent.match(/(iPhone|iPad)/i);

    app.videoState = {
        interval: 50.0,
        lastPlayPos: 0,
        currentPlayPos: 0,
        bufferingDetected: false,
        timeDelayed: 0
    };

    app.localizeSocial = function () {
        $('.social').each(function () {
            $(this).css('background', 'url(' + $(this).data('asset-path') + ')');
        });
        $('.instagram').css('background-position', '-48px 0');
        $('.twitter').css('background-position', '-96px 0');
        $('.youtube').css('background-position', '-144px 0');
    };

    app.showStaticImage = function () {

        var $el, $v;

        $('.videoWrapper').each(function(){
            $el = $(this);
            $v = $(this).find('.ambientVideo');

            $el.css('background-image', "url('" + $el.data('background-image') + "')");
            $el.css('background-size', 'cover');
            $el.css('background-position', 'center center');

            $v.css('display', 'none');
            $v.attr('src', '');

        });

    };

    app.checkVideoPlaying = function () {

        this.videoState.currentPlayPos = this.currentVideo.currentTime;

        var offset = 1 / this.videoState.interval;

        if (
            !this.videoState.bufferingDetected
            && this.videoState.currentPlayPos < (this.videoState.lastPlayPos + offset)
            && !this.currentVideo.paused
        ) {
            console.warn('ambient video is buffering');
            this.videoState.bufferingDetected = true;
        }

        if (
            this.videoState.bufferingDetected
            && this.videoState.currentPlayPos > (this.videoState.lastPlayPos + offset)
            && !this.currentVideo.paused
        ) {
            this.videoState.bufferingDetected = false;
        }

        if (this.videoState.bufferingDetected) {
            this.videoState.timeDelayed++;
        } else {
            if(this.videoState.lastPlayPos === this.videoState.currentPlayPos){
                this.videoState.timeDelayed++;
            }else{
                this.videoState.timeDelayed = 0;
            }
        }

        this.videoState.lastPlayPos = this.videoState.currentPlayPos;

        if (this.videoState.timeDelayed * this.videoState.interval / 1000 > 2.5) {
            clearInterval(this.checkPlayingInterval);
            this.showStaticImage();
        }else if(this.videoState.currentPlayPos > 1.5){
            console.warn('ambient video playing');
            clearInterval(this.checkPlayingInterval);
        }

    };

    app.closeHeader = function(){
        $('.header-nav-item > a').removeClass('open');
        $('.header-nav-option').css('display', 'none');
    };

    app.initHeader = function(){

        $('.header-nav-item > a').on('click', function(e){

            e.preventDefault();

            var $eventTarget = $(e.target),
                leftEdge = $eventTarget.offset().left,
                targetAction = $eventTarget.data('nav-action');

            $('.header-nav-item>a').filter(function(){
                return $(this).data('nav-action') != targetAction;
            }).removeClass('open');

            $eventTarget.toggleClass('open');

            // Close all:
            $('.header-nav-option').slideUp('fast');

            if($eventTarget.hasClass('open')){

                // Open the target area:
                var $targetEl = $('.header-nav-option[data-nav-target='+targetAction+']');

                var newCSS = {
                    position: 'absolute',
                    left: targetAction === "join" ? leftEdge - (($targetEl.width() - ($eventTarget.width() * 0.5)) * 0.5) : leftEdge,
                    top: $('header').height(),
                    zIndex:999
                };

                $targetEl.css(newCSS)
                    .slideDown('slow');
            }

        });
        return this;
    };

    app.initPurchaseLinks = function(){

        var $purchaseEl = $('.purchase-links');

        $('#purchaseToggle').on('click', function(e){
            e.preventDefault();
            $(this).toggleClass('open');
            $(this).hasClass('open') ? $purchaseEl.slideDown('slow') : $purchaseEl.slideUp('fast');
        });

        $('.purchase-links').css('display', 'none');

        return this;
    };

    app.initScroll = function(){

        this.$scrollNext = $('.scroll-next');

        var _this = this;

        $('.scroll-first').click(function(e){
            $('html,body').animate({ scrollTop: $(e.target).closest('section').next().offset().top }, 'slow');
            return false;
        });

        $('.scroll-next').click(function(e){
            // $('html,body').animate({ scrollTop: $(e.target).closest('section').next().offset().top }, 'slow');
            var scrollTop = $(window).scrollTop();
            $('section').each(function(){
                if($(this).offset().top > scrollTop){
                    $('html,body').animate({ scrollTop: $(this).offset().top }, 'slow');
                    return false;
                }
            });
            return false;
        });

        $('.scroll-to-top').click(function(e){
            $('.scroll-next').fadeOut();
            $('html,body').animate({ scrollTop: 0 }, 'slow');
            return false;
        });

        window.addEventListener("scroll", _.debounce(updateScroll, 25));

        updateScroll();

    };

    app.startVideo = function($video){

        $video.attr('src', $video.data('src'));
        $video.attr('muted', 'muted'); // Most videos shouldn't have audio.
        $video.data('started', true);

        var videoEl = $video.get(0);

        if(this.isMobile){
            console.warn('Attempting to play video on mobile');
            makeVideoPlayableInline(videoEl, false);

            app.currentVideo = videoEl;
            app.videos.push(videoEl);

            // Only try and monitor progress on mobile devices:
            clearInterval(app.checkPlayingInterval);
            app.checkPlayingInterval = setInterval(function () {
                app.checkVideoPlaying();
            }, app.videoState.interval);
        }

    };

    app.initVideo = function () {

        console.log('app::initVideo');
        console.log(this);

        this.videos = [];

        var $v, videoEl;

        $('.ambientVideo').each(function(){

            $v = $(this);

            if(elementInViewport($v.get(0))){
                app.startVideo($v);
            }

        });

    };

    app.resizeVideo = function () {

        console.log('app::resizeVideo');

        if (app.isIEOld || app.isiPad) {
            console.log('\tSuppress video resize');
            return;
        }

        var w = window.innerWidth,
            h = window.innerHeight,
            videoW, videoH, scale, newW, newH,
            $v;

        $('.ambientVideo').each(function(){

            $v = $(this);

            videoW = $v.data('src-width') || 1920;
            videoH = $v.data('src-height') || 1080;

            scale = (Math.max(w / videoW, h / videoH) * 10000 | 1) / 10000,
                newW = videoW * scale | 1,
                newH = videoH * scale | 1;

            $(this).css({
                top: 0,
                left: ((w - newW) * 0.5) | 1 + 'px',
                width: newW + 'px',
                height: newH + 'px'
            });
        });

    };

    app.init = function () {

        console.log('app::init');

        // Update the styles for the social icons:

        this.initHeader();
        this.localizeSocial();
        this.resizeVideo();
        this.initVideo();
        this.initPurchaseLinks();
        this.initScroll();

        window.addEventListener("resize", _.debounce(this.resizeVideo, 500));
        window.addEventListener("resize", _.debounce(this.closeHeader, 10));

    };

    app.init();

})();