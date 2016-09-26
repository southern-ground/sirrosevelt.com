var _ = window._;

(function () {

    window.com = window.com || {};

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
        var $el = $('#ambient-video'),
            $video = $('#ambient-video video');

        $el.css('background-image', "url('" + $el.data('background-image') + "')");
        $el.css('background-size', 'cover');
        $el.css('background-position', 'center center');

        $video.css('display', 'none');
        $video.attr('src', '');
    };

    app.checkVideoPlaying = function () {

        this.videoState.currentPlayPos = this.video.currentTime;

        var offset = 1 / this.videoState.interval;

        if (
            !this.videoState.bufferingDetected
            && this.videoState.currentPlayPos < (this.videoState.lastPlayPos + offset)
            && !this.video.paused
        ) {
            console.warn('ambient video is buffering');
            this.videoState.bufferingDetected = true;
        }

        if (
            this.videoState.bufferingDetected
            && this.videoState.currentPlayPos > (this.videoState.lastPlayPos + offset)
            && !this.video.paused
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

    app.initVideo = function () {
        console.log('app::initVideo');

        var $video = $('#ambient-video video');

        $video.attr('src', $video.data('src'));
        $video.attr('muted', 'muted');

        this.video = $video.get(0);

        if(this.isMobile){
            console.warn('Attempting to play video on mobile');
            makeVideoPlayableInline(this.video, false);
        }

        // Monitor Progress:
        this.checkPlayingInterval = setInterval(function () {
            app.checkVideoPlaying();
        }, this.videoState.interval);
    };

    app.resizeVideo = function () {

        console.log('app::resizeVideo');

        if (app.isIEOld || app.isiPad) {
            console.log('\tSuppress video resize');
            return;
        }

        var w = window.innerWidth,
            h = window.innerHeight,
            VIDEO = {
                width: 1920,
                height: 1080
            },
            scale = (Math.max(w / VIDEO.width, h / VIDEO.height) * 10000 | 1) / 10000,
            newW = VIDEO.width * scale | 1,
            newH = VIDEO.height * scale | 1,
            $video = $('#ambient-video video');

        // console.log(newH, h);
        // console.log(newW, w);

        $video.css({
            top: ((h - newH) * 0.5) | 1 + "px",
            left: ((w - newW) * 0.5) | 1 + 'px',
            width: newW + 'px',
            height: newH + 'px'
        });

    };

    app.init = function () {

        console.log('app::init');

        // Update the styles for the social icons:

        this.localizeSocial();

        this.resizeVideo();

        this.initVideo();

        var $purchaseEl = $('.purchase-links');

        $('#purchaseToggle').on('click', function(e){
            e.preventDefault();
            $(this).toggleClass('open');
            $(this).hasClass('open') ? $purchaseEl.slideDown('slow') : $purchaseEl.slideUp('fast');
        });

        $('.purchase-links').css('display', 'none');

        window.addEventListener("resize", _.debounce(this.resizeVideo, 500));

    };

    app.init();

})();