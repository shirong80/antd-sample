// start
$(function() {
  lnbControl();
});

// lnb 컨트롤
function lnbControl() {
  var lnb = $('#lnb');
  var lnbControlBtn = $('#lnb .btn-control');
  var contents = $('#contents');
  var time = 800;
  lnbControlBtn.click(function(e) {
    e.preventDefault();
    if(lnb.hasClass('minify') === true) {
      lnb.stop().animate({
        left : "0px"
      }, time);
      contents.stop().animate({
        "margin-left" : "240px"
      }, time);
      lnb.removeClass('minify');
      $(this).removeClass('active');
    } else {
      lnb.stop().animate({
        left : "-220px"
      }, time);
      contents.stop().animate({
        "margin-left" : "20px"
      }, time);
      lnb.addClass('minify');
      $(this).addClass('active');
    }
  });
};
