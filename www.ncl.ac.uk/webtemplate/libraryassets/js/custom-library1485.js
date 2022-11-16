
$("document").ready(function(){
    
    ////////////////////////////////////////////////////////////
    ////////// HOMEPAGE & VISITING PAGE OPENING HOURS //////////
    //////////////////////////////////////////////////////////// 
    
    if($("div.librariesLocationsContainer").length>0){
        
        // add loading class to each library box
        $("div.librariesLocationsContainer div.locationBox").addClass("times-loading ssa-loading");
        
        // get opening hours from libcal
        $.ajax({
            type:"get",
            cache:false,
            url:"https://www.ncl.ac.uk/webtemplate/libraryassets/scripts/get-opening-hours.php",
            dataType:"json",
            error:function(request,error){
                console.log("Error retrieving opening times - "+error);
                $("div.locationBox p.locationBoxTimesBuilding").text("Opening times unavailable");
                $("div.locationBox p.locationBoxTimesDesk").remove();
                $("div.librariesLocationsContainer div.locationBox").removeClass("times-loading");
            },
            success:function(data){                
                // get default text (assume theyre all the same) to detect later if any havent loaded
                var default_building_times_text=$(".locationBoxTimesBuilding").first().text();
                var default_desk_times_text=$(".locationBoxTimesDesk").first().text();
                
                $("div.librariesLocationsContainer div.locationBox").removeClass("times-loading");
                
                $.each(data.locations, function(id,location){
                    
                    if(location.building){
                        
                        if(location.building.current_status=="open"){
                            
                            // add the times
                            $(".locationBox#location_"+id+" .locationBoxTimesBuilding").text("Open "+location.building.times);
                            
                            // do desk times / self-service
                            if(typeof location.desk!="undefined"){
                                if(location.desk.current_status=="open" || location.desk.open_later_today){
                                    $(".locationBox#location_"+id+" .locationBoxTimesDesk").text("Desk services - "+location.desk.times);
                                }else{
                                   $(".locationBox#location_"+id+" .locationBoxTimesDesk").text("Self-service only"); 
                                }
                            }
                        
                        }else if(location.building.current_status=="custom"){
                            
                            // add the times
                            $(".locationBox#location_"+id+" .locationBoxTimesBuilding").text(location.building.times);
                            
                            // hide the desk status
                            //$(".locationBox#location_"+id+" .locationBoxTimesDesk").remove();
                            
                            // temp copied from above
                            
                            // do desk times / self-service
                            if(typeof location.desk!="undefined"){
                                if(location.desk.current_status=="open" || location.desk.open_later_today){
                                    $(".locationBox#location_"+id+" .locationBoxTimesDesk").text("Desk services - "+location.desk.times);
                                }else{
                                   $(".locationBox#location_"+id+" .locationBoxTimesDesk").text("Self-service only"); 
                                }
                            }
                            
                        }else{
                            
                            if(location.building.open_later_today){
                                
                                // opens later today
                                $(".locationBox#location_"+id+" .locationBoxTimesBuilding").text("Open from "+location.building.opens_at+" - "+location.building.closes_at);
                                
                                // also show desk services
                                if(typeof location.desk!="undefined"){
                                    if(location.desk.open_later_today){
                                        $(".locationBox#location_"+id+" .locationBoxTimesDesk").text("Desk services - "+location.desk.times);
                                    }else{
                                        $(".locationBox#location_"+id+" .locationBoxTimesDesk").text("Self-service only");
                                    }
                                }
                                
                            }else if(location.building.closes_at){
                                
                                // closed earlier
                                $(".locationBox#location_"+id+" .locationBoxTimesBuilding").text("Closed at "+location.building.closes_at);
                                
                                // hide the desk status
                                $(".locationBox#location_"+id+" .locationBoxTimesDesk").remove();
                                
                            }else{
                                
                                // closed today
                                $(".locationBox#location_"+id+" .locationBoxTimesBuilding").text("Closed today");
                                
                                // hide the desk status
                                $(".locationBox#location_"+id+" .locationBoxTimesDesk").remove();
                                
                            }
                            
                        }
                        
                        // colour indication
                        $(".locationBox#location_"+id).addClass("times-"+location.building.current_status); 
                        
                    }
                    
                });
                
                // at the end check to see if any have been missed
                
                $(".locationBoxTimesBuilding").each(function(){
                    if($(this).text()==default_building_times_text){
                        $(this).text("Opening times unavailable");
                    }
                });
                
                $(".locationBoxTimesDesk").each(function(){
                    if($(this).text()==default_desk_times_text){
                        $(this).text("Desk times unavailable");
                    }
                });
                
                
            }
        });
        
        ////////////////////////////////////////////////////////////
        ///// HOMEPAGE & VISITING PAGE STUDY SPACE AVAILABILITY ////
        ////////////////////////////////////////////////////////////
        
        // temporarily disabled due to COVID (remove instead)
        /*$("div.locationBox p.locationBoxSSA").remove();
        $("div.librariesLocationsContainer div.locationBox").removeClass("ssa-loading");
        $("div.librariesLocationsContainer div.locationBox").addClass("ssa-unavailable");*/
        
        $.ajax({
            type:"get",
            cache:false,
            url:"https://internal.ncl.ac.uk/library/ssa-public/get_ssa/",
            dataType:"json",
            error:function(request,error){
                console.log("Error retrieving study space availability - "+error);
                $("div.locationBox p.locationBoxSSA").remove();
                $("div.librariesLocationsContainer div.locationBox").removeClass("ssa-loading");
                $("div.librariesLocationsContainer div.locationBox").addClass("ssa-unavailable");
            },
            success:function(data){
                
                $("div.librariesLocationsContainer div.locationBox").removeClass("ssa-loading");
                
                // get default text (assume theyre all the same) to detect later if any havent loaded
                var default_ssa_text=$(".locationBoxSSA").first().text();
                
                $.each(data.locations, function(id,location){
                    
                    var ssa_status;
                    
                    if(location.colour=="green"){
                        ssa_status="Quiet at the moment";
                    }else if(location.colour=="amber"){
                        ssa_status="Fairly busy now";
                    }else if(location.colour=="red"){
                        ssa_status="Very busy now";
                    }
                    
                    $("div.librariesLocationsContainer div.locationBox#location_"+id+" p.locationBoxSSA").text(ssa_status);
                    $("div.librariesLocationsContainer div.locationBox#location_"+id).addClass("ssa-"+location.colour);
                    
                }); // end each
                
                // at the end check to see if any have been missed
                $(".locationBoxSSA").each(function(){
                    if($(this).text()==default_ssa_text){
                        $("div.librariesLocationsContainer div.locationBox#"+$(this).parent().attr("id")).addClass("ssa-unavailable");
                        $(this).remove();
                    }
                });
            }// end success        
        });
        
        
    }// end if location container
    
    ////////////////////////////////////////////////////////////
    ////////// LIBRARY SEARCH HEADER HIDE/REVEAL ///////////////
    ////////////////////////////////////////////////////////////
    
    // move it outside of header element
    if($("div.libsearch_header_hidden").length>0){
        $("main.container header.header").after($("#library_search_reveal"));
    }else{
        $("#library_search_reveal").remove();
    }
  
    // reveal click behaviour
    $("#library_search_reveal").click(function(){
        $("header .libsearch_header_hidden .search").slideDown();
        $(this).slideUp();
        return false;
    });    
    
    ////////////////////////////////////////////////////////////
    ////////// MY ACCOUNT BUTTON TOP OF HEADER /////////////////
    ////////////////////////////////////////////////////////////
    
    $(".overlayImage.headerHero").after("<div class=\"row content\"><div id=\"library_my_account_button\"><a href=\"http://library.ncl.ac.uk/go/myaccount/\" title=\"My Account\">My Account</a></div></div>");
    
    ////////////////////////////////////////////////////////////
    ////////// MOVE ZEPHYR WWW SEARCH INTO BLUE BAR ////////////
    ////////////////////////////////////////////////////////////
    
    $("#js-navigation .secondary ul").after("<div class=\"search-inline\" id=\"moved_search_box\">"+$("div.search-inline").html()+"</div>");
    
    ////////////////////////////////////////////////////////////
    /////////// USER INTERFACE TWEAKS FOR MOBILE ///////////////
    ////////////////////////////////////////////////////////////
    
    windowResize(); // run on document load
    $(window).resize(windowResize); // listen for window resizing
    
    // store some things to remember
    var header_libsearch_placeholder_text=$("header .search .searchBoxInput").attr("placeholder");
    
    function windowResize(){
        
        // add/remove "mobile class"
        if($(window).width()<750){
            $("body").addClass("mobile");
        }else{
           $("body").removeClass("mobile"); 
        }
        
        // header library search - shorter placeholder text
        if($("body").hasClass("mobile")){
            $("header .search .searchBoxInput").attr("placeholder","Search for books and more...");
        }else{
           $("header .search .searchBoxInput").attr("placeholder",header_libsearch_placeholder_text);
        }
        
        // add hyperlink to the "University Library" on mobile
        $("div.primary div.row div.logo div.school-name div.school-name").html("<a href=\"/library\">"+$("div.primary div.row div.logo div.school-name div.school-name").text()+"</a>");
        
    }
    
    ////////////////////////////////////////////////////////////
    //////////////// BROWSER-SPECIFIC TWEAKS ///////////////////
    ////////////////////////////////////////////////////////////
    
    if(detectIE()!==false){
		$("html").addClass("browser-ie");
    }
    
    function detectIE() {
    
        var ua = window.navigator.userAgent;

        // Test values; Uncomment to check result...

        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
        
    }
    
    ////////////////////////////////////////////////////////////
    ////////// TEMPORARY WWWSTAGE HYPERLINK FIXES //////////////
    ////////////////////////////////////////////////////////////
    
    // IF were on stage right now
    if(window.location.hostname=="wwwstage.ncl.ac.uk"){
        $("a[href='/']").attr("href","https://www.ncl.ac.uk");
        $("a[href='https://www.ncl.ac.uk/library/']").attr("href","https://wwwstage.ncl.ac.uk/library");
    }
    
    
    ////////////////////////////////////////////////////////////
    ////////// GET SUBJECT GUIDES DROPDOWN BOXES ///////////////
    ////////////////////////////////////////////////////////////
    
    $("#guides_dropdown_container").each(function(){
        
        var guide_filter=$(this).attr("rel");
        var guides_dropdown_container=$(this);
        
        if(guide_filter){
        
            $.ajax({
                    type:"get",
                    cache:false,
                    url:"https://www.ncl.ac.uk/webtemplate/libraryassets/scripts/get-guides.php?return="+guide_filter,
                    dataType:"json",
                    error:function(request,error){
                        console.log("Error: unable to retrieve guides for dropdown box. "+error);
                    },
                    success:function(data){
                        
                        $(guides_dropdown_container).append("<form onchange=\"window.location=this.guides_dropdown.value\"><select name=\"guides_dropdown\"><option value=\"default\" disabled selected>Select a guide</option><option disabled>-----------------</option></select></form>"); 
                        
                        // hide via CSS thens slide down
                        
                        $(data).each(function(i,guide){
                            $("select",guides_dropdown_container).append("<option value=\""+guide.friendly_url+"\">"+guide.name+"</option>");
                        });
                        
                    }

            });
            
        }
        
        
    });
    
    
    ////////////////////////////////////////////////////////////
    ////////// WHOLE-SITE ACCESSIBILITY TWEAKS /////////////////
    ////////////////////////////////////////////////////////////
    
    // add missing link text
    $(".section-tabs.hidden>.row>a.tab").text("Top");
    
    
});








