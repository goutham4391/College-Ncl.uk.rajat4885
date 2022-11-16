$( document ).ready(function() 
{

var boxWrapper=$('<div class="sectionCol triplegrid">');
$(".tripleColAlt").addClass("processing");

var i=0;

while($(".processing").length>0 && ++i <= 33)
{
var three = $(".processing:lt(3)");
$(three).removeClass("processing");
three.wrapAll(boxWrapper);
}
$(".dualColAlt").addClass("processing");

var i=0;

while($(".processing").length>0 && ++i <= 33)
{
var two = $(".processing:lt(2)");
$(two).removeClass("processing");
two.wrapAll(boxWrapper);
}
$(".quadColAlt").addClass("processing");

var i=0;

while($(".processing").length>0 && ++i <= 33)
{
var four = $(".processing:lt(4)");
$(four).removeClass("processing");
four.wrapAll(boxWrapper);
}
$(".hexaColAlt").addClass("processing");

var i=0;

while($(".processing").length>0 && ++i <= 33)
{
var six = $(".processing:lt(6)");
$(six).removeClass("processing");
six.wrapAll(boxWrapper);
}

$(".sectionCol img").addClass("imgColFW");

// PAGINATION.

$(".currentpage").wrap($('<a href="#">'));

var nextprevboxes = $(".pagination ul li a:first-child").nextAll();
$(nextprevboxes.get().reverse()).each(function() {
$( this ).insertAfter( $(this).parent());
$(this).wrap('<li>');
});

$("div.newsList").wrapAll('<div class="sectionCol triplegrid">');
$(".newsList").after(" "); // *sigh*
$(".tripleColAlt").after(" "); // *sigh*
$(".boxList").after(" "); // *sigh*

if(document.documentElement.clientWidth>767){
$(".grid-toptask").each(function( index ) {
var boxHeight=0;
var colHeight=0;
var col2Height=0;

  $(this).children().each(function( index ) {
          boxHeight=Math.max(boxHeight,$(this).height());
  });
  $(this).children().height(boxHeight);

  $(this).find(".colourColBkg span.title a,.colourColBkgRev span.title a").each(function( index ) {
          colHeight=Math.max(colHeight,$(this).height());
  });
  $(this).find(".colourColBkg span.title a,.colourColBkgRev span.title a").height(colHeight);

  $(this).find(".colourColBkg").each(function( index ) {
          col2Height=Math.max(col2Height,$(this).height());
  });
  $(this).find(".colourColBkg").height(col2Height);
});
}

});