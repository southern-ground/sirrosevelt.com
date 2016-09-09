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

    app.localizeSocial = function () {
        $('.social').each(function () {
            $(this).css('background', 'url(' + $(this).data('asset-path') + ')');
        });
        $('.instagram').css('background-position', '-48px 0');
        $('.twitter').css('background-position', '-96px 0');
        $('.youtube').css('background-position', '-144px 0');
    };

    app.showStaticImage = function(){
        var $el = $('#ambient-video'),
            $video = $('#ambient-video video');

        $el.css('background-image', "url('"+$el.data('background-image')+"')");
        $el.css('background-size', 'cover');
        $el.css('background-position', 'center center');

        $video.css('display', 'none');
        $video.attr('src', '');
    };

    app.videoStarted = function(){
        app.videoPlaying = true;
        clearInterval(app.checkInterval);
        (function(scope){
            scope.video.removeEventListener('playing', scope.videoStarted);
        })(app);
    };

    app.initVideo = function () {
        console.log('app::initVideo');

        var $video = $('#ambient-video video');

        this.video = $video.get(0);

        this.checkInterval = setTimeout(function(){
            console.warn('checkInterval');
            // Clean up the listener:
            app.video.removeEventListener('playing', app.videoPlaying);
            if(!app.videoPlaying){
                // We can guess that the video ain't playing.
                // If it hasn't started yet, it probably won't.
                app.showStaticImage();
            }
        }, 2000);

        $video.attr('poster', $video.data('poster'));

        if (this.isMobile && !this.isiMobile) {
            console.warn('Suppressing video init');
            this.showStaticImage();
            return;
        }

        $video.attr('src', $video.data('src'))
            .attr('autoplay', 'true')
            .attr('loop', 'true');

        (function(scope){
            scope.video.addEventListener('playing', scope.videoStarted);
        })(this);

        if(this.isMobile && this.isiMobile) {
            console.warn('Attempting video play on iOS');
            $video.attr('muted', 'true');
            makeVideoPlayableInline(this.video, false);
        }

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
            scale = (Math.max(w/VIDEO.width, h/VIDEO.height) * 10000|1)/10000,
            newW = VIDEO.width * scale,
            newH = VIDEO.height * scale,
            $video = $('#ambient-video video');

        // console.log(newH, h);
        // console.log(newW, w);

        $video.css({
            top: ((h - newH) * 0.5)|1 + "px",
            left: ((w - newW) * 0.5)|1 + 'px',
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

        window.addEventListener("resize", _.debounce(this.resizeVideo, 500));

    };

    app.init();

})();