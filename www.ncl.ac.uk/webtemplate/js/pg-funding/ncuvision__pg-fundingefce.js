function getQuals() {
  $.ajax({
    url: "https://mci.ncl.ac.uk/public/qualifications?ug_pg=pg",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      let qualsData = data.data;

      qualsData.forEach(function(el){

        if (el.code === "MRes (Primary care pathway (Health Education England non-contract)" 
        || el.code === "MSc (Imagine with non-ionising radiation)"
        || el.code === "MSc with prelimninary year"
        || el.code === "MSc, MSc (Dual Award)" 
        || el.code === "PGCE (Secondary Science with Chemistry Specialism)"){
            return false;
        }

        let qualsList = `<div class="checkbox">
                <input type="checkbox" value="${el.code}" class="filterCheckbox">
                <label for="">${el.code}</label>
                </div>`;

        $(".qualifications").append(qualsList);
      });
    },
    fail: function (jqxhr, textStatus, error) {
      console.log("quals endpoint fail", textStatus, data);
    },
  });
}

function getCountries() {
  $.ajax({
    url: "https://mci.ncl.ac.uk/public/countries",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      let countryData = data.data;
      countryData.forEach(function(el){
        let countryList = `<div class="checkbox">
                <input type="checkbox" value="${el.code}" class="filterCheckbox">
                <label for="">${el.name}</label>
                </div>`;

        $(".countries").append(countryList);
      });
    },
    fail: function (jqxhr, textStatus, error) {
      console.log("countries endpoint fail", textStatus, data);
    },
  });
}

function getFaculties() {
  $.ajax({
    url: "https://mci.ncl.ac.uk/public/faculties?ug_pg=pg&academic_year=2021",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      let facultyData = data.data;
      facultyData.forEach(function(el){
        let facultyList = `<div class="checkbox">
                <input type="checkbox" value="${el.faculty_code}" class="filterCheckbox">
                <label for="">${el.faculty_name}</label>
                </div>`;

        $(".faculties").append(facultyList);
      });
    },
    fail: function (jqxhr, textStatus, error) {
      console.log("faculties endpoint fail", textStatus, data);
    },
  });
}

function getSchools() {
  $.ajax({
    url: "https://mci.ncl.ac.uk/public/schools?ug_pg=pg&academic_year=2021",
    dataType: "json",
    contentType: "application/json",
    success: function (data) {
      let schoolData = data.data;
      schoolData.forEach(function(el){
        schoolList = `<div class="checkbox">
                <input type="checkbox" value="${el.school_code}" class="filterCheckbox">
                <label for="">${el.school_name}</label>
                </div>`;

        $(".schools").append(schoolList);
      });
    },
    fail: function (jqxhr, textStatus, error) {
      console.log("schools endpoint fail", textStatus, data);
    },
  });
}
async function fetchFunding(code) {
  // assign code if one is passed through to function
  let idvCode = code ? code : "";

  showSpinner();
  const response = await fetch(
    "https://mci.ncl.ac.uk/public/pagefunding?code=" + idvCode + ""
  );
  const results = await response.json();

  if (idvCode) {
    displayIdvFundingInfo(results.pgFundingPageData);
  } else {
    let fundingList = results.pgFundingPageData;
    return fundingList;
  }
}

function displayIdvFundingInfo(list) {
  $(".courseSearch").hide();
  $(".desktopSidebar").hide();
  $(".filterToggle").hide();

  if (list.length !== 0) {
    for (let i in list) {
      //remove unwanted keys from array
      delete list[i].award_start_date;
      delete list[i].advert_start_date;
      delete list[i].review_or_end_date;
      delete list[i].review_type;
      delete list[i].award_value;
      delete list[i].number_of_awards;
      delete list[i].alumni_only;
      delete list[i].list_of_country_codes;
      delete list[i].list_of_courses;
      delete list[i].list_of_faculties;
      delete list[i].list_of_schools;
      delete list[i].list_of_qualifications;
      delete list[i].list_of_pg_full;
      delete list[i].code;

      var fundingCard = `<div class="fundingListContainer">`;

      for (let j in list[i]) {
        let sectionTitle = j.replace(/_/g, " ").replace(/web text/g, " ");

        if (list[i][j] !== null && list[i][j] !== "") {
          if (sectionTitle === "title") {
            sectionTitle = "";
            list[i][j] = `<h3>${list[i][j]}</h3>`;
          }

          fundingCard += `<p class="fundingListTitles">${titleCase(
            sectionTitle
          )}</p>${list[i][j]}`;
        }
      }

      fundingCard += `
                    <div class="ctaContainer back">
                        <div class="ctaColumn"><a href="${window.location.href.split("?")[0]}" class="cta link back">Back to search results</a></div>
                    </div>
                </div>`;
      $("#fundingResults").append(fundingCard);
    }
  } 
}

function displayFundingInfo(results) {

  if ($(window).width() >= breakpoints.mobile__landscape) {
    $(".desktopSidebar").show();
  }

  $('.count span').html("");
  $('.count span').append('Results: ' + results.length);

  $("#fundingResults").html("");
  $(".fundingError").hide();

  if (results.length !== 0) {
    results.forEach((element, index, array) => {
      /* helpers */
      let title = element.title;
      let overview = element.overview ? element.overview : "";

      if (
        element.award_summary !== "" &&
        typeof element.award_summary !== "undefined"
      ) {
        var award = `<div class="fundingBorder">
                <p class="title"><strong>Value of funding</strong></p>
                    ${element.award_summary}
                </div>`;
      } else {
        award = "";
      }
      if (element.number_of_awards > 0) {
        var opportunity = `<div class="fundingBorder">
                <p class="title"><strong>Funding opportunities</strong></p>
                    ${element.number_of_awards_web_text}
                </div>`;
      } else {
        opportunity = "";
      }

      let code = element.code;
      let courseType = element.list_of_pg_full.join(" ");
      let courseCountry = element.list_of_country_codes.join(" ");
      let courseQuals = element.list_of_qualifications.join(" ").replace(",","");
      let courseFaculties = element.list_of_faculties.join(" ");
      let courseSchools = element.list_of_schools.join(" ");

      let cta = `<div class="ctaContainer">
      <div class="ctaColumn"><a href="${window.location.href}?code=${code}" class="cta full">View funding details</a></div>
  </div>`;

      let fundingList = `<div class="courseSearchResults__box" data-info="${courseType} ${courseQuals} ${courseCountry} ${courseFaculties} ${courseSchools}">
            <h3>${title}</h3>
            <div class="fundingOverview">${overview}</div>
            ${award}
            ${opportunity}
            ${cta}
        </div>`;

      // append results to container div
      $("#fundingResults").append(fundingList);
    });
  } else {
    $(".fundingError").show();
    $(".sidebar").hide();
  }
}

// search funding
function searchFunding(query, data) {
  var filteredData = [];
  query = query.toLowerCase();

  data.forEach((element, index, array) => {

    // remove funding without overviews from search
    if (element.overview === null){
        return;
    }

    // create arr of course titles to search over
    let courseWebTitles = element.list_of_courses.map(el => el.web_course_title.toLowerCase());
    // search by title
    let title = element.title.toLowerCase();
    // search by overview
    let overview = element.overview.toLowerCase();
    // search by how to apply
    let apply = element.how_to_apply ? element.how_to_apply.toLowerCase() : "";
    // sponsor search
    let sponsor = element.sponsor ? element.sponsor.toLowerCase() : "";
    // supervisors search
    let supervisors = element.supervisors ? element.supervisors.toLowerCase() : "";

    // whatever the query look through all the above search parameters
    if (courseWebTitles.includes(query) || title.includes(query) || overview.includes(query) || apply.includes(query) || sponsor.includes(query) || supervisors.includes(query)) {
        filteredData.push(element);
    }

  });
  return filteredData;
}

function getUrlVars() {
  var vars = [],
    hash;
  var hashes = window.location.href
    .slice(window.location.href.indexOf("?") + 1)
    .split("&");
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split("=");
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

function showSpinner() {
  $(".spinnerBox").show();
}

function titleCase(str) {
  str = str.replace(/_/g, " ");
  str = str.toLowerCase().split(" ");

  let final = [];

  for (let x = 0; x < str.length; x++) {
    final.push(str[x].charAt(0).toUpperCase() + str[x].slice(1));
  }

  let x = final.join(" ");
  return x;
}

function reloadSearch(){
    window.location = window.location.href.split("?")[0];
}

$(document).ready(function () {

  // handle querystring search parameter
  var sQueryStrParam = getUrlVars()["code"];
  if (sQueryStrParam !== undefined && sQueryStrParam.length > 0) {
    var fundingCode = sQueryStrParam;
  }
  // handle asyc fetched data
  fetchFunding(fundingCode).then((funding) => {
    $(".spinnerBox").hide();
    $(".fundingSearch").css("opacity", "1");

    // call display func on
    if (typeof funding !== "undefined") {
      displayFundingInfo(funding);
    }

    // filter array based on users query
    $("#fundingQueryForm").submit(function (e) {
      e.preventDefault();
      $('.filterCheckbox').removeAttr('checked');
      let query = $("#searchQuery").val().trim();

      let refinedData = searchFunding(query, funding);
      // re-init display
      displayFundingInfo(refinedData);
    });

    $(".filterCheckbox").change(function () {
        // reset UI
        $(".count span").html("");
        $(".fundingError").hide();
        $('.courseSearchResults__box').removeClass("show");

        // declare useful vals
        let lis = $('.courseSearchResults__box');
        let listCount = $('.courseSearchResults__box').length;
        let checked = $('.filterCheckbox:checked');

        if (checked.length){							
            var selector = '';
            $(checked).each(function(index, element){        
                // assign values
                let value = element.value;

                // find all selectors that match the data attr value
                selector += "[data-info~='" + value + "']";                            
            });         
            
            // hide all ads
            lis.fadeOut();                        
            
            // count and add show class to relevant funding ads
            $('.courseSearchResults__box').filter(selector).addClass('show').fadeIn();
            
            // apply count value to div
            let count = $(".courseSearchResults__box.show").length;
            $(".count span").append('Results: ' + count);
            
            // show Error msg
            if (count === 0){
                $(".fundingError").show();
            }
            
        } else {
            // show default ads count value
            $(".count span").append('Results: ' + listCount);
            // show all ads
            lis.fadeIn();
        }
    });
});
  // call the sidebar data APIs
  getQuals();
  getCountries();
  getFaculties();
  getSchools();

  // toggle dropdowns on click
  $(".dropdown__btn").click(function() { 
    $(this).closest('.dropdown').toggleClass("is-open");
  });
  
  // mobile refine event listener
  $(".refineBtn").click(function() {
    $(".mobileSidebar").toggle();
  });
});
