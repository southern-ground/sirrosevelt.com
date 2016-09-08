var _ = window._;

(function () {

    window.com = window.com || {};

    var app = window.com.sirrosevelt || {};

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

        $('.twitter').css('background-position', '48px 0');
        $('.instagram').css('background-position', '-48px 0');
    };

    app.initVideo = function () {
        console.log('app::initVideo');

        var $video = $('#ambient-video video');
        $video.attr('poster', $video.data('poster'));

        if (app.isMobile && !app.isiMobile) {
            console.warn('Suppressing video init');
            // Suppress the video; probably either an unsupported iOS device
            // or Android
            var $el = $('#ambient-video');
            $el.css('background-image', "url('"+$el.data('background-image')+"')");
            $el.css('background-size', 'cover');
            $el.css('background-position', 'center center');
            $video.css('display', 'none');
            return;
        }

        $video.attr('src', $video.data('src'))
            .attr('autoplay', 'true')
            .attr('loop', 'true');

        if(app.isMobile && app.isiMobile){
            console.warn('Attempting video play on iOS')
            makeVideoPlayableInline($video.get(0), false);
        }

    };

    app.resizeVideo = function () {

        console.log('app::resizeVideo');

        if (app.isIEOld || app.isiPad) {
            console.log('\tSuppress video resize');
            return;
        }

        var w = window.innerWidth;
        var h = window.innerHeight;

        var VIDEO = {
            width: 1920,
            height: 1080
        };

        var scale = (Math.max(w/VIDEO.width, h/VIDEO.height) * 10000|1)/10000;


        if(w < VIDEO.width){
            console.log('too wide');
        }
        if(h < VIDEO.height){
            console.log('too tall');
        }

        var newW = VIDEO.width * scale,
            newH = VIDEO.height * scale;

        var $video = $('#ambient-video video');
        console.log(newH, h);
        console.log(newW, w);
        $video.css({
            top: ((h - newH) * 0.5)|1 + "px",
            left: ((w - newW) * 0.5)|1 + 'px',
            width: newW + 'px',
            height: newH + 'px'
        });

        /*var img = $('.ambient-video').data('poster'),
         video = $('.ambient-video').data('video'),
         noVideo = $('.ambient-video').data('src'),
         el = '';

         if(!app.isIEOld && !app.isiPad) {
         console.log('ok to proceed');

         el +=   '<video autoplay loop poster="' + img + '" muted>';
         el +=       '<source src="' + video + '" type="video/mp4">';
         el +=   '</video>';
         } else {
         console.log('no bueno');

         el = '<div class="video-element" style="background-image: url(' + noVideo + ')"></div>';
         }

         $('.ambient-video').prepend(el);

         $('#isMobile').append(app.isMobile ? "true" : "false");*/


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