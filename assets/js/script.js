
/*!--------------------------------*\
   3-Jekyll Theme
   @author Peiwen Lu (P233)
   https://github.com/P233/3-Jekyll
\*---------------------------------*/

// cnzz
var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");
document.write(unescape("%3Cspan id='cnzz_stat_icon_1256860805'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s4.cnzz.com/z_stat.php%3Fid%3D1256860805%26show%3Dpic' type='text/javascript'%3E%3C/script%3E"));

// Variables
var sidebar    = $('#sidebar'),
    container  = $('#post'),
    content    = $('#pjax'),
    button     = $('#icon-arrow');
    scrollTop  = $('#icon-arrow-up');
    tocbar     = $('#post__toc-trigger');

// Detect window size, if less than 1280px add class 'mobile' to sidebar therefore it will be auto hide when trigger the pjax request in small screen devices.
if ($(window).width() < 1280) {
  sidebar.addClass('mobile');
}

// Tags switcher
var clickHandler = function(id) {
  return function() {
    $(this).addClass('active').siblings().removeClass('active');
    $('.pl__all').hide();
    $('.' + id).delay(50).fadeIn(350);
  }
};

$('#tags__ul li').each(function(index){
  $('#' + $(this).attr('id')).on('click', clickHandler($(this).attr('id')));
});

// If sidebar has class 'mobile', hide it after clicking.
$('.pl__all').on('click', function() {
  $(this).addClass('active').siblings().removeClass('active');
  if (sidebar.hasClass('mobile')) {
    $('#sidebar, #pjax, #icon-arrow').addClass('fullscreen');
  }
});

// Enable fullscreen.
$('#js-fullscreen').on('click', function() {
  if (button.hasClass('fullscreen')) {
    sidebar.removeClass('fullscreen');
    button.removeClass('fullscreen');
    tocbar.removeClass('fullscreen');
    content.delay(300).queue(function(){
      $(this).removeClass('fullscreen').dequeue();
    });
  } else {
    sidebar.addClass('fullscreen');
    button.addClass('fullscreen');
    tocbar.addClass('fullscreen');
    content.delay(200).queue(function(){
      $(this).addClass('fullscreen').dequeue();
    });
  }
});

$('#scroll-top').on('click', function() {
  container.animate({
    scrollTop: 0
  }, 200);
});

$('#mobile-avatar').on('click', function(){
  $('#sidebar, #pjax, #icon-arrow').addClass('fullscreen');
});

// Pjax
$(document).pjax('#avatar, #mobile-avatar, .pl__all', '#pjax', { fragment: '#pjax', timeout: 10000 });
$(document).on({
  'pjax:click': function() {
    content.removeClass('fadeIn').addClass('fadeOut');
    NProgress.start();
  },
  'pjax:start': function() {
    content.css({'opacity':0});
  },
  'pjax:end': function() {
    NProgress.done();
    container.scrollTop(0);
    content.css({'opacity':1}).removeClass('fadeOut').addClass('fadeIn');
    afterPjax();
  }
});

// Re-run scripts for post content after pjax
function afterPjax() {
  // Open links in new tab
  $('#post__content a').attr('target','_blank');

  // Generate post TOC for h1 and h2
  var toc = $('#post__toc-ul');
  // Empty TOC and generate an entry for post title
  var title = $('#post__title').text()
  toc.empty().append('<li class="post__toc-li post__toc-h1"><a href="#post__title" class="js-anchor-link">' + title + '</a></li>');

  // Generate entries for h1 and h2
  $('#post__content').children('h1,h2,h3').each(function() {
    // Skip post title
    if ($(this).attr('id') == 'post__title') {
      return;
    }

    // Generate random ID for each heading
    $(this).attr('id', function() {
      var ID = "",
          alphabet = "abcdefghijklmnopqrstuvwxyz";

      for(var i=0; i < 5; i++) {
        ID += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      return ID;
    });

    // Add each chapter to TOC
    if ($(this).prop("tagName") == 'H2') {
      toc.append('<li class="post__toc-li post__toc-h2"><a href="#' + $(this).attr('id') + '" class="js-anchor-link">' + $(this).text() + '</a></li>');
    } else if ($(this).prop("tagName") == 'H3') {
      toc.append('<li class="post__toc-li post__toc-h3"><a href="#' + $(this).attr('id') + '" class="js-anchor-link">' + $(this).text() + '</a></li>');
    }
  });

  // Smooth scrolling
  $('.js-anchor-link').on('click', function() {
    var target = $(this.hash);
    container.animate({scrollTop: target.offset().top + container.scrollTop() - 70}, 500, function() {
      target.addClass('flash').delay(700).queue(function() {
        $(this).removeClass('flash').dequeue();
      });
    });
  });

  // Lazy Loading Disqus
  // http://jsfiddle.net/dragoncrew/SHGwe/1/
  // var ds_loaded = false,
  //     top = $('#disqus_thread').offset().top;
  // window.disqus_shortname = $('#disqus_thread').attr('name');
  // function check() {
  //   var currentScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
  //   currentScrollTop = container.scrollTop();
  //   if ( !ds_loaded && currentScrollTop + container.height() > top ) {
  //     $.ajax({
  //       type: 'GET',
  //       url: 'http://' + disqus_shortname + '.disqus.com/embed.js',
  //       dataType: 'script',
  //       cache: true
  //     });
  //     ds_loaded = true;
  //   }
  //   if (currentScrollTop > 400) {
  //     $('#scroll-top').fadeIn(200);
  //   } else {
  //     $('#scroll-top').fadeOut(200);
  //   }
  // }
  // check();
  // container.scroll(check);

  if (sidebar.hasClass('mobile')) {
    $('#sidebar, #pjax, #icon-arrow').addClass('fullscreen');
  }

}afterPjax();
