var _ = window._;

(function () {

    window.com = window.com || {};

    var SCROLLJACK_TIMEOUT = 500,
        PERCENT_REQUIRED_TO_SCROLL = 0.60;

    var elementInViewport = function (el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        while (el.offsetParent) {
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
        interval: 50,
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

        $('.videoWrapper').each(function () {

            $el = $(this);
            $v = $(this).find('.ambientVideo, .ambientVideo--half-screen');

            console.log($v.data('poster'));

            $el.css('background-image', "url('" + $v.data('poster') + "')");
            $el.css('background-size', 'cover');
            $el.css('background-position', 'center center');

            $v.css('display', 'none');
            $v.attr('src', '');

        });

        // Manually fire tracking:
        ga('send',
            'event',
            'Videos',
            'Failure to Load',
            "RC-2",
            {
                nonInteraction: true
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
            if (this.videoState.lastPlayPos === this.videoState.currentPlayPos) {
                this.videoState.timeDelayed++;
            } else {
                this.videoState.timeDelayed = 0;
            }
        }

        this.videoState.lastPlayPos = this.videoState.currentPlayPos;

        if (this.videoState.timeDelayed * this.videoState.interval / 1000 > 2.5) {

            clearInterval(this.checkPlayingInterval);
            console.warn('showing fail-over images');
            this.showStaticImage();

        } else if (this.videoState.currentPlayPos > 1.5) {

            console.warn('ambient video playing');
            app.$currentVideo.attr('data-video-started', true);
            clearInterval(this.checkPlayingInterval);

        }

    };

    app.closeHeader = function () {
        $('.header-nav-item > a.menuItemm').removeClass('open');
        $('.header-nav-option').css('display', 'none');
        $('header .innerWrapper').css('display', '');
        $('.header-hamburger').removeClass('open');
        $('.secondaryHeaderContent-close').hide();
    };

    app.initAudio = function () {

        /*
        $('.header-audioControl').bind('click', function (e) {

            e.stopPropagation();
            e.preventDefault();

            var $b = $(e.target);

            $b.toggleClass('playing');

            if ($b.hasClass('playing')) {
                app.soundCloudPlayer.play();
                // Manually fire tracking:
                ga('send', 'event', {
                    eventCategory: 'Audio Play Pressed',
                    eventAction: 'click',
                    eventLabel: 'Audio'
                });
            } else {
                app.soundCloudPlayer.pause();
                // Manually fire tracking:
                ga('send', 'event', {
                    eventCategory: 'Audio Pause Pressed',
                    eventAction: 'click',
                    eventLabel: 'Audio'
                });
            }

        });

        app.soundCloudPlayer = SC.Widget('SoundCloudPlayer');

        app.soundCloudPlayer.bind(SC.Widget.Events.PLAY, function () {
            console.warn('SoundCloud PLAY');
            $('.header-audioControl')
                .addClass('playing online');
        });

        app.soundCloudPlayer.bind(SC.Widget.Events.FINISH, function () {
            console.warn('SoundCloud FINISH');
            $('.header-audioControl').removeClass('playing');
        });

        app.soundCloudPlayer.bind(SC.Widget.Events.READY, function () {
            console.warn('SoundCloud READY');
        });

        app.soundCloudPlayer.bind(SC.Widget.Events.ERROR, function (e) {
            console.warn('SoundCloud ERROR');
            console.log(e)
        });

        */

        return app;
    };

    app.initHeader = function () {

        $('.header-nav-item > a.menuItem').on('click', function (e) {

            e.preventDefault();

            var $eventTarget = $(e.target),
                leftEdge = $eventTarget.offset().left,
                targetAction = $eventTarget.data('nav-action');

            $('.header-nav-item>a.menuItem').filter(function () {
                return $(this).data('nav-action') != targetAction;
            }).removeClass('open');

            $eventTarget.toggleClass('open');

            // Close all:
            $('.header-nav-option').slideUp('fast')
                .attr('data-open', '');

            if ($eventTarget.hasClass('open')) {

                // Open the target area:
                var $targetEl = $('.header-nav-option[data-nav-target=' + targetAction + ']'),
                    css = {},
                    callback = function () {
                    };

                // Check if we're in the mobile/shrunken state:
                if ($('.header-hamburger').hasClass('open')) {

                    css = {
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 60
                    };

                    newTop = $('.innerWrapper').offset().top + $('.innerWrapper').height();

                    callback = function () {
                        $('.secondaryHeaderContent-close').show();
                    }

                } else {

                    css = {
                        position: 'absolute',
                        left: targetAction === "join" ? leftEdge - (($targetEl.width() - ($eventTarget.width() * 0.5)) * 0.5) : leftEdge,
                        top: $('header').height(),
                        zIndex: 999
                    };

                }

                // Manually fire tracking:
                ga('send', 'event', {
                    eventCategory: 'Open ' + targetAction,
                    eventAction: 'click',
                    eventLabel: 'Header Navigation'
                });

                $targetEl.css(css)
                    .slideDown('slow', function () {
                        callback();
                    })
                    .attr('data-open', true);

            }

        });

        $('.header-hamburger').on('click', function (e) {

            e.stopPropagation();
            e.preventDefault();

            var $el = $(e.target);

            $el.toggleClass('open');

            if ($el.hasClass('open')) {
                $('header .innerWrapper').slideDown();
            } else {
                $('header .innerWrapper').slideUp();
                $('#JoinEmail, #FormSuccess, #FormError').val('');
            }

        });

        $('.secondaryHeaderContent-close').on('click', function ()  {
            $(this).hide();
            $('.header-nav-option[data-open="true"]').slideUp('fast');
            $('.header-nav-item>a.menuItem').removeClass('open');
            $('#JoinEmail, #FormSuccess, #FormError').val('');
        });

        var clearFeedback = function(e){
            e.preventDefault();
            e.stopPropagation();
            $('#FormSuccess, #FormError').html('');
            void(0);
            return false;
        };

        $('#JoinEmail')
            .change(clearFeedback)
            .focus(clearFeedback);

        $('#JoinButton').on('click', function (e) {

            e.preventDefault();
            e.stopPropagation();

            var $el = $(e.target);

            if($el.hasClass('inactive')){
                return;
            }

            var sanitizeField = function (html) {

                var tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

                var tagOrComment = new RegExp(
                    '<(?:' +
                    '!--(?:(?:-*[^->])*--+|-?)' +
                    '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*' +
                    '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*' +
                    '|/?[a-z]' +
                    tagBody +
                    ')>',
                    'gi');

                var oldHtml;

                do {
                    oldHtml = html;
                    html = html.replace(tagOrComment, '');
                } while (html !== oldHtml);

                return html.replace(/</g, '&lt;');
            },
                validateEmail = function (email) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            },
                email = sanitizeField($('#JoinEmail').val());

            if(!validateEmail(email)){
                $('#FormError').html('Please enter a valid email address.');
                return;
            }

            var url = "http://southerngroundnashville.com/sir-rosevelt-mail.php";

            $el.addClass('inactive');

            $.post(url, {
                email: $('#JoinEmail').val()
            }, function (data) {
                if(data && data.status && data.status === 200){
                    // Success:
                    $('#FormSuccess').html('Success! Thanks for signing up.');
                    $el.removeClass('inactive');
                }else{
                    // Error:
                    $('#FormError').html('An error occurred. Please try again later.');
                    console.warn(data);
                    $el.removeClass('inactive');
                }
            });

            $('#JoinEmail').val('');

        });

        // Handle disabled purchase links:
        $('.purchase-link').on('click', function(e){
            if($(e.currentTarget).attr('disabled')){
                e.preventDefault();
                e.stopPropagation();
                void(0);
                return false;
            }
        });

        $('.top-logo').on('click', function(e){

            e.preventDefault();

            ga('send', 'event', {
                eventCategory: 'Header Logo Clicked',
                eventAction: 'click',
                eventLabel: 'Scroll Control'
            });

            app.scrollToTop();

        });

        return this;
    };

    app.initPurchaseLinks = function () {

        var $purchaseEl = $('.purchase-links');

        $('#purchaseToggle').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('open');
            if ($(this).hasClass('open')) {
                $purchaseEl.slideDown('slow');

                // Manually fire tracking:
                ga('send', 'event', {
                    eventCategory: 'Open Purchase Links',
                    eventAction: 'click',
                    eventLabel: 'Header Navigation'
                });

            } else {
                $purchaseEl.slideUp('fast');
            }
        });

        $('.purchase-links').css('display', 'none');

        return this;
    };

    app.initScroll = function () {

        this.$scrollNext = $('.scroll-next');

        $('.scroll-first').click(function (e) {
            clearTimeout(app.scrollToTimeout);
            app.ignoreScrollEvents = true;

            // Manually fire tracking:
            ga('send', 'event', {
                eventCategory: 'Scroll First Clicked',
                eventAction: 'click',
                eventLabel: 'Scroll Control'
            });

            $('html,body')
                .clearQueue()
                .animate({
                    scrollTop: $(e.target)
                        .closest('section')
                        .next()
                        .offset().top
                }, 'slow', function () {
                    app.ignoreScrollEvents = false;
                });
            return false;
        });

        $('.scroll-next').click(function (e) {
            // $('html,body').animate({ scrollTop: $(e.target).closest('section').next().offset().top }, 'slow');
            var scrollTop = $(window).scrollTop();

            // Manually fire tracking:
            ga('send', 'event', {
                eventCategory: 'Scroll Next Clicked',
                eventAction: 'click',
                eventLabel: 'Scroll Control'
            });

            $('section').each(function () {
                if ($(this).offset().top > scrollTop) {
                    clearTimeout(app.scrollToTimeout);
                    app.ignoreScrollEvents = true;
                    $('html,body')
                        .clearQueue()
                        .animate({
                            scrollTop: $(this)
                                .offset()
                                .top
                        }, 'slow', function () {
                            console.log('Scrolling complete');
                            app.ignoreScrollEvents = false;
                        });
                    return false;
                }
            });
            return false;
        });

        $('.scroll-to-top').click(function (e) {

            // Manually fire tracking:
            ga('send', 'event', {
                eventCategory: 'Scroll To Top Clicked',
                eventAction: 'click',
                eventLabel: 'Scroll Control'
            });

            app.scrollToTop();

        });

        window.addEventListener("scroll", _.debounce(app.updateScroll, 100));

        this.updateScroll();

    };

    app.scrollToTop = function(){

        $('.scroll-next').fadeOut();

        clearTimeout(app.scrollToTimeout);

        app.ignoreScrollEvents = true;

        $('html,body')
            .clearQueue()
            .animate({
                scrollTop: 0
            }, 'slow', function () {
                console.log('Scrolling complete');
                app.ignoreScrollEvents = false;
            });

        return false;

    };

    app.startVideo = function ($video) {

        $video.attr('src', $video.data('src'));
        $video.attr('muted', 'muted'); // Most videos shouldn't have audio.

        var videoEl = $video.get(0);

        //if (this.isMobile) { console.warn('Attempting to play video mobile');

        makeVideoPlayableInline(videoEl, false);

        app.currentVideo = videoEl;
        app.$currentVideo = $video;
        app.videos.push(videoEl);

        // Only try and monitor progress on mobile devices:
        clearInterval(app.checkPlayingInterval);

        app.checkPlayingInterval = setInterval(function () {
            app.checkVideoPlaying();
        }, app.videoState.interval);

        //}

    };

    app.initVideo = function () {

        console.log('app::initVideo');

        var $v;

        this.videos = [];

        $('.ambientVideo, .ambientVideo--half-screen').each(function () {

            $v = $(this);

            if (elementInViewport($v.get(0))) {
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

        $('.ambientVideo').each(function () {

            $v = $(this);

            videoW = $v.data('src-width') || 1920;
            videoH = $v.data('src-height') || 1080;

            scale = (Math.max(w / videoW, h / videoH) * 10000 | 1) / 10000,
                newW = videoW * scale | 1,
                newH = videoH * scale | 1;

            $(this).css({
                top: ((h - newH) * 0.5) | 1 + "px", //top: 0,
                left: ((w - newW) * 0.5) | 1 + 'px',
                width: newW + 'px',
                height: newH + 'px'
            });
        });

        // Half-width Videos:
        var w = window.innerWidth * 0.5,
            h = window.innerHeight,
            videoW, videoH, scale, newW, newH,
            $v;

        $('.ambientVideo--half-screen').each(function () {

            $v = $(this);

            videoW = $v.data('src-width') || 1920 * 0.5;
            videoH = $v.data('src-height') || 1080;

            scale = (Math.max(w / videoW, h / videoH) * 10000 | 1) / 10000,
                newW = videoW * scale | 1,
                newH = videoH * scale | 1;

            $(this).css({
                top: ((h - newH) * 0.5) | 1 + "px", //top: 0,
                left: ((w - newW) * 0.5) | 1 + 'px',
                width: newW + 'px',
                height: newH + 'px'
            });
        });

    };

    app.updateLyrics = function (top) {

        // Adjust the opacity on any lyric text on the screen:

        $('.section-lyric').each(function () {

            if (elementInViewport($(this).get(0))) {

                // $(this).find('h1.glitch').delay(1500).fadeIn('slow', 'easeOutBounce');

                var opacity = 1 - (($(this).offset().top - top) / ($(window).height() * 0.3));

                if (opacity > 1) {
                    opacity -= 2;
                    opacity *= -1;
                }

                $(this).find('.glitch').css('opacity', opacity);

            } else {

                // $(this).find('h1.glitch').fadeOut();

                $(this).find('.glitch').css('opacity', 0);

            }

        });

    };

    app.updateScrollNag = function () {

        // Update the scroll nag position if necessary:

        if (elementInViewport(document.getElementById('CoverAnimation'))
            || elementInViewport(document.getElementById('Members'))
            || elementInViewport(document.getElementById('EndCard'))) {
            // At the top or bottom; hide the scroll control on the side.
            app.$scrollNext.clearQueue().fadeOut();
        } else {
            app.$scrollNext.clearQueue().delay(1500).fadeIn();
        }

    };

    app.updateScroll = function (e) {

        // Function is called w/in the Window scope.

        var doc = document.documentElement,
            top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
            winH = $(window).height();

        app.isScrollingDown = app.prevScrollTop - top < 0 ? true : false;
        app.prevScrollTop = top;

        // Clear any possible scrollToTimeouts
        clearTimeout(app.scrollToTimeout);

        app.updateVideos();

        app.updateLyrics(top);

        app.updateScrollNag();

        /*if(!elementInViewport(document.getElementById('Members')) &&
         !elementInViewport(document.getElementById('EndCard'))){*/

        if (!app.ignoreScrollEvents) {

            var inView = [],
                directionalScrollJacking = false;

            $('.sticky').each(function () {

                if (elementInViewport($(this).get(0))) {
                    if (directionalScrollJacking) {
                        inView.push($(this));
                    } else {
                        var myTop = $(this).offset().top;

                        var percFromTopOfViewport = Math.abs(top - myTop) / winH;

                        if (percFromTopOfViewport < PERCENT_REQUIRED_TO_SCROLL) {

                            // Snap to!

                            // Stop any animations running or queued.
                            $('html,body').clearQueue();

                            app.scrollToTimeout = setTimeout(function () {
                                $('html,body').animate({scrollTop: myTop}, 'slow', 'easeOutQuad');
                            }, SCROLLJACK_TIMEOUT);

                            return;
                        }
                    }
                }

            });

            if (directionalScrollJacking) {

                var newTop = 0;

                if (elementInViewport($('#CoverAnimation').get(0))
                    || elementInViewport($('.section-band').get(0))) {
                    return;
                }

                if (inView.length === 1) {
                    newTop = inView[0].offset().top;
                } else if (inView.length > 1) {
                    if (app.isScrollingDown) {
                        newTop = inView[inView.length - 1].offset().top;
                    } else {
                        newTop = inView[0].offset().top;
                    }
                } else {
                    // Nothing?
                }

                if (newTop > 0) {
                    scrollToTimeout = setTimeout(function () {
                        $('html,body').animate({scrollTop: newTop}, 'slow', 'easeOutQuad');
                    }, SCROLLJACK_TIMEOUT);
                }
            }

        }
        /*}*/

    };

    app.updateVideos = function () {

        // Check all the videos and pause as necessary:

        $('.ambientVideo').each(function () {

            var $videoRef = $(this),
                videoElement = $(this).get(0),
                videoHasPreviouslyPlayed = $videoRef.data('video-started');

            if (elementInViewport(videoElement)) {

                // Video is on-screen.

                if (videoHasPreviouslyPlayed) {

                    // Video has previously been started before
                    if (videoElement.paused) {
                        videoElement.play();
                    }

                } else {

                    // Video hasn't played yet:
                    app.startVideo($videoRef);

                }

            } else {

                if (videoHasPreviouslyPlayed && !videoElement.paused) {
                    videoElement.pause();
                }

            }

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
        this.initAudio();

        window.addEventListener("resize", _.debounce(this.resizeVideo, 500));
        window.addEventListener("resize", _.debounce(this.closeHeader, 10));


    };

    app.init();

})();
