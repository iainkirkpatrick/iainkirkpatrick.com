//http://getbootstrap.com/javascript/#tabs
$('#myTabs a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
})
