//http://getbootstrap.com/javascript/#tabs
$(document).ready(function() {
  $('#navTabs a').click(function (e) {
    e.preventDefault();
    console.log(e);
    $(this).tab('show');
  })
});
