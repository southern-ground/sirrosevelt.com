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

    app.localizeSocial = function () {
        $('.social').each(function () {
            $(this).css('background', 'url(' + $(this).data('asset-path') + ')');
        });

        $('.twitter').css('background-position', '48px 0');
        $('.instagram').css('background-position', '-48px 0');
    };

    app.initVideo = function () {
        console.log('app::initVideo');
        if (app.isMobile) {
            console.log('\tSuppressing video init');
            var $el = $('#ambient-video');
            $el.css('background-image', 'url(' + $el.data('background-image') + ')');
            $el.css('background-size', 'cover');
            $el.css('background-position', 'center center');
            return;
        }
        var $video = $('#ambient-video video');
         $video.attr('poster', $video.data('poster'))
             .attr('src', $video.data('src'))
             .attr('autoplay', 'true')
             .attr('loop', 'true');
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

        if (h > VIDEO.height) {
            console.log(' too tall');

        } else if (w > VIDEO.width) {
            console.log(' too wide');
        } else {
            console.log('looks all right here');
        }

        var $video = $('#ambient-video video');
        $video.css({
            top: ((h - VIDEO.height) * 0.5) + "px",
            left: ((w - VIDEO.width) * 0.5) + 'px',
            width: VIDEO.width + 'px',
            height: VIDEO.height + 'px'
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