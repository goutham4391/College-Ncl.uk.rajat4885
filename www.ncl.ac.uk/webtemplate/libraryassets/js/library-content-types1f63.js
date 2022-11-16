
$("document").ready(function(){
    
 
    ////////////////////////////////////////////////////////////
    ////////// BLOG CAROUSEL CONTENT TYPE //////////////////////
    ////////////////////////////////////////////////////////////

    var carousel_delay=5; // in seconds

    // there may be multiple blogCarousel sections on the page
    $("section.blogCarousel").each(function(){

        var i=0;
        var parent_id=$(this).attr("id");

        // give IDs to each list item
        $("ul li",this).each(function(){
            i++;
            $(this).hide();
            $(this).attr("id",parent_id+"_item_"+i);
        });

        // only show first, then rotate
        $("ul li",this).first().show();
        setInterval(function(){rotateCarousel(parent_id);},carousel_delay*1000);

    });
    
    function rotateCarousel(carousel_id){
        
        var carousel_items_suffix="_item_"; // list item suffix, so we can select them later
        var current_item=parseInt($("section.blogCarousel#"+carousel_id+" ul li:visible").attr("id").split("_").pop());
        var total_items=$("section.blogCarousel#"+carousel_id+" ul li").length;
        var next_item;
        
        if(current_item==total_items){
			next_item=1;
		}else{
			next_item=current_item+1;
		}
        
        // hide all first
        $("section.blogCarousel#"+carousel_id+" ul li").hide();
        
        // up next...
        $("section.blogCarousel#"+carousel_id+" ul li#"+carousel_id+carousel_items_suffix+next_item).show();        
        
    }
    
    ////////////////////////////////////////////////////////////
    //////// ANNOUNCEMENT BANNER DISMISS AND REMEMBER //////////
    ////////////////////////////////////////////////////////////
    
    $("section#announcement a").click(function(){
        
        // calculate 1 month from today
        var today=new Date;
        var new_date = new Date(today.setMonth(today.getMonth()+2));
        var new_date_string = new Date(new_date.getFullYear()+"-"+new_date.getMonth()+"-"+new_date.getDate()).toGMTString();
        
        //store this in a cookie
		document.cookie="announcement_banner_dismiss=true; expires="+new Date(new_date_string).toGMTString()+"; path=/;";
		$("section#announcement").slideUp();
        
	});
    
    // hide the banner if cookie has already been set
    if(document.cookie.search("announcement_banner_dismiss")>=0){
        $("section#announcement").remove();
    }
    
    // if library searh reveal button is visible
    // then stop the dismiss button from right floating
    if($("section#library_search_reveal:visible").length>0){
		$("section#announcement a#announcement_dismiss").addClass("announcement_no_float");
	}
    
    ////////////////////////////////////////////////////////////
    /////// KEY MESSAGE BOXES COLOURED TAGS BENEATH ////////////
    ////////////////////////////////////////////////////////////
    
    // replaces **tag1,tag2,tag3** and ##tag4,tag5,tag6##
    // with non-clickable coloured tas (blue then red)
    // from the key message descriptions
    
    // add div wrappers
    $("section.promoPanels a.promoLink p").each(function(){
        
        // replace ** with div and class
        $(this).html($(this).html().replace(/\*{2}([^)]+)\*{2}/g, "<div class=\"promoTags promoTagsOne\">$1</div>"));
        
        // replace ## with div and class
        $(this).html($(this).html().replace(/\#{2}([^)]+)\#{2}/g, "<div class=\"promoTags promoTagsTwo\">$1</div>"));
        
        // move them outside of the <p>
        $(".promoTags",this).insertAfter(this);
        
    });
    
    // do individual spans within the wrappers
    $("section.promoPanels a.promoLink div.promoTags").each(function(){
        
        var pieces=$(this).text().split(",");
        var new_html="";
        
        $(pieces).each(function(){
            new_html+="<span>"+this+"</span>";
        });
        
        $(this).html(new_html);
        
    });
    
 
});








