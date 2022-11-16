"use strict";

//cssVars(); // css variables polyfill call
// breakpoints object, approximate values should be the same as in variables.less
var breakpoints = {
  mobile__portrait: 320,
  mobile__landscape: 480,
  tablet__portrait: 768,
  desktop__minimum: 960,
  tablet__landscape: 1024,
  content: 1080,
  content__wide: 1200,
  desktop: 1366,
  desktop__medium: 1600
};

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;

    var later = function later() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

var sacsGlobals = {
  youtubeAPIKey: "AIzaSyAAH_WLyeIGyalKrINKwCCXzIWhQDbno_g",
  youTubePlayerIDs: [],
  youTubePlayers: [],
  breakpoints: {
    small: 480,
    medium: 768,
    large: 1025
  },
  currentPage: 1
};
var ugGlobals = {
  youtubeAPIKey: "AIzaSyAAH_WLyeIGyalKrINKwCCXzIWhQDbno_g",
  courseData: [],
  courseAccordionsPopulated: false,
  searchResultsPopulated: false,
  searchOptions: {
    id: "id",
    shouldSort: true,
    findAllMatches: true,
    includeScore: true,
    threshold: 0.1,
    location: 0,
    distance: 50000,
    maxPatternLength: 32,
    minMatchCharLength: 3,
    keys: [{
      name: "id",
      weight: 1
    }, {
      name: "title",
      weight: 0.9
    }, {
      name: "keywords",
      weight: 0.9
    }, {
      name: "qualificiation",
      weight: 0.8
    }, {
      name: "classification",
      weight: 0.6
    }, {
      name: "secondaryclassification",
      weight: 0.5
    }, {
      name: "description",
      weight: 0.4
    }, {
      name: "courseintro",
      weight: 0.4
    }]
  }
};
$(document).ready(function () {
  navigation().init();
  articleGrid().init();
  eventsFeed().init();
  accordion(); //getCourseData();

  addNavClass();
  initSlickSlider();
  initVideos();
  initDropdowns();
  initInfogram();
  scrollToLinks(); // HACK: if not on a course page init the universal code for tabs

  if ($(".course-content-block").length == 0) {
    var $tabs = $(".tabs");
    initTabs().init($tabs);
  }

  var $body = $("body");
  $body.mousedown(function () {
    $(this).removeClass("tabHighlight");
    $(".videoOverlay").attr("tabIndex", 0);
    $(".videoGallery .slick-arrow").show();
  });
  $body.keydown(function (e) {
    if (e.which === 9) {
      // the tab key
      $(this).addClass("tabHighlight");
      $(".videoOverlay").attr("tabIndex", -1);
      $(".videoGallery .slick-arrow").hide();
    }
  });
  initRelatedPeople();
  dualPanelBreakoutImage();
  responsiveTables.init();
  dataWidgets().init();
});
/*= =================================
    Navigation
================================== */

var navigation = function navigation() {
  // data stores
  var store = {
    container: $("#js-navigation"),
    viewportMode: windowValues.width >= breakpoints.desktop__minimum ? "desktop" : "mobile",
    menuOpened: false,
    searchOpened: false
  }; // utility functions

  var util = {
    findAllParentsOfElement: function findAllParentsOfElement(parent, target) {
      return parent.parents(target);
    },
    findParentElement: function findParentElement(parent, target) {
      return parent.closest(target);
    },
    findChildElement: function findChildElement(parent, target) {
      return parent.find(target);
    },
    findSiblingElement: function findSiblingElement(parent, target) {
      return parent.siblings(target);
    },
    checkViewportMode: function checkViewportMode() {
      // initialise variable with a value, then run check on resize
      requestResizeAnimation(function () {
        store.viewportMode = windowValues.width >= breakpoints.desktop__minimum ? "desktop" : "mobile";
      });
    }
  }; // primary functions

  var fn = {
    setDataAttributes: function setDataAttributes(parent) {
      var $primary = parent.find(".primary");
      fn.getHeightOfElements($primary);
      fn.getChildrenOfElements($primary);
      fn.getDropdownChildrenOfElements($primary);
      fn.getDepthOfElements($primary);
      fn.cloneSecondary(store.container);
      fn.attachMenuButtonHandlers($primary);
      fn.attachTouchHandlers($primary);
      requestResizeAnimation(function () {
        var $parentRefresh = $(".primary");
        fn.getHeightOfElements($parentRefresh);

        if (store.viewportMode === "desktop" && (store.menuOpened === true || store.searchOpened === true)) {
          fn.resetAllNavigation($parentRefresh);
        }
      });
      window.addEventListener("orientationchange", function () {
        var $parentRefresh = $(".primary");
        fn.getHeightOfElements($parentRefresh);

        if (Math.abs(window.orientation) === 90) {
          fn.resetAllNavigation($parentRefresh);
        }
      }, false);
    },
    getHeightOfElements: function getHeightOfElements(parent) {
      var $menu = parent.find(".dropdown ul");
      $.each($menu, function () {
        var $this = $(this);
        var $height = $this.actual("outerHeight");
        return $this.attr("data-height", $height);
      });
    },
    getChildrenOfElements: function getChildrenOfElements(parent) {
      var $elements = parent.find("li");
      $.each($elements, function () {
        var $this = $(this);
        var $child = util.findChildElement($this, "> ul");

        if ($child.length !== 0) {
          var $button = util.findChildElement($this, "> a");
          $this.addClass("has-child");
          $button.append('<span class="child-toggle"><span class="arrow"></span></span>');
          fn.attachDropdownMenuEventHandlers($this);
          return fn.attachHoverEventHandlers($button);
        }
      });
    },
    getDropdownChildrenOfElements: function getDropdownChildrenOfElements(parent) {
      var $elements = parent.find("li");
      $.each($elements, function () {
        var $this = $(this);
        var $child = util.findChildElement($this, "> .dropdown");

        if ($child.length !== 0) {
          $this.addClass("has-dropdown");
          fn.attachTopLevelEventHandlers($this);
        }
      });
      return fn.attachBackButtonEventHandler(parent);
    },
    getDepthOfElements: function getDepthOfElements(parent) {
      var $menu = util.findChildElement(parent, ".dropdown ul");
      $.each($menu, function () {
        var $this = $(this);
        var $depth = util.findAllParentsOfElement($this, "ul:not(.menu-toplevel)");
        $this.attr("data-depth", $depth.length);
      });
      return fn.getDefaultHeightOfDropdown(parent);
    },
    getDefaultHeightOfDropdown: function getDefaultHeightOfDropdown(parent) {
      var $menu = util.findChildElement(parent, ".dropdown ul");
      $.each($menu, function () {
        var $this = $(this);

        if ($this.attr("data-depth") === "0") {
          var $dropdown = util.findParentElement($this, ".dropdown");
          var $defaultHeight = $this.attr("data-height");
          $dropdown.attr("data-defaultheight", $defaultHeight);
          return $dropdown.attr("data-currentheight", $defaultHeight);
        }
      });
    },
    setDropdownReset: function setDropdownReset(parent) {
      var $menu = util.findChildElement(parent, ".dropdown");
      var $topLevel = util.findChildElement(parent, 'ul[data-depth="0"]');
      $.each($menu, function () {
        var $this = $(this);
        $this.on({
          mouseleave: function mouseleave() {
            var $defaultHeight = $(this).attr("data-defaultheight");
            $this.removeAttr("style").attr("data-currentheight", $defaultHeight);
            $topLevel.removeAttr("style");
          }
        });
      });
    },
    cloneSecondary: function cloneSecondary(parent) {
      var $secondary = util.findChildElement(parent, ".secondary ul").clone();
      var $wrapper = util.findChildElement(parent, ".primary .menu-wrapper");
      $wrapper.append($secondary);
    },
    adjustMenuSize: function adjustMenuSize(target) {
      var $dropdown = util.findParentElement(target, ".dropdown");
      var $topLevel = util.findParentElement(target, 'ul[data-depth="0"]');
      var $currentHeight = parseInt($dropdown.attr("data-currentheight"));
      var $child = util.findSiblingElement(target, "ul");
      var $childHeight = parseInt($child.attr("data-height"));

      if ($childHeight >= $currentHeight) {
        $dropdown.css("height", $childHeight).attr("data-currentheight", $childHeight);
        $topLevel.css("height", $childHeight);
      }
    },
    attachHoverEventHandlers: function attachHoverEventHandlers(target) {
      return target.on({
        "mouseover focus": function mouseoverFocus() {
          var $this = $(this);
          fn.adjustMenuSize($this);
        }
      });
    },
    attachTopLevelEventHandlers: function attachTopLevelEventHandlers(target) {
      var $list = target;
      var $anchor = util.findChildElement($list, "> a");
      var $menu = util.findParentElement($list, ".menu");
      var $wrapper = util.findParentElement($list, ".menu-wrapper");
      var $back = util.findSiblingElement($wrapper, ".menu-back");
      var $toggle = util.findChildElement($list, ".highlight");
      var $dropdown = util.findChildElement($list, ".dropdown");
      $toggle.on({
        click: function click(e) {
          e.stopPropagation();
          e.preventDefault();
          var $label = $anchor.text();
          var $index = $list.prevAll().length + 1;
          $back.find(".menu-back-arrow").css({
            backgroundColor: "var(--column" + $index + "-accent)"
          });
          $menu.addClass("active");
          $wrapper.css({
            transform: "translateX(-100vw)"
          }).attr({
            "data-translatex": -100,
            "data-menulevel": 1
          });
          $dropdown.addClass("selected");
          $back.addClass("active").find(".menu-back-label").text($label);
        }
      });
    },
    attachDropdownMenuEventHandlers: function attachDropdownMenuEventHandlers(target) {
      var $list = target;
      var $menu = util.findParentElement($list, ".menu");
      var $wrapper = util.findParentElement($list, ".menu-wrapper");
      var $back = util.findSiblingElement($wrapper, ".menu-back");
      var $toggle = util.findChildElement($list, ".child-toggle");
      var $anchor = util.findChildElement($list, "> a");
      $toggle.on({
        click: function click(e) {
          if (store.viewportMode === "mobile") {
            e.stopPropagation();
            e.preventDefault();
            var $label = $anchor.text();
            var $currentLevel = parseInt($wrapper.attr("data-menulevel"));
            var $currentOffset = parseInt($wrapper.attr("data-translatex")) - 100; // 100 is viewport width

            $list.addClass("selected");
            $menu.scrollTop(0);
            $back.find(".menu-back-label").text($label);
            $wrapper.css({
              transform: "translateX(" + $currentOffset + "vw)"
            }).attr({
              "data-translatex": $currentOffset,
              "data-menulevel": $currentLevel + 1
            });
          }
        }
      });
    },
    attachBackButtonEventHandler: function attachBackButtonEventHandler(target) {
      var $wrapper = util.findChildElement(target, ".menu-wrapper");
      var $back = util.findChildElement(target, ".menu-back");
      $back.on({
        click: function click(e) {
          e.stopPropagation();
          var $this = $(this);
          var $menu = util.findChildElement(target, ".menu");
          var $currentLevel = $wrapper.attr("data-menulevel");
          var $currentOffset = parseInt($wrapper.attr("data-translatex")) + 100; // 100 is viewport width

          var $selected = util.findChildElement($wrapper, ".selected:last");
          var $previous = $selected.parent().closest(".selected");
          var $element, $newLabel;

          if ($currentLevel === "1") {
            var $dropdown = $wrapper.find(".dropdown.selected");
            $this.removeClass("active");
            $menu.removeClass("active");
            $dropdown.removeClass("selected");
          }

          if ($previous.hasClass("has-child")) {
            $element = util.findChildElement($previous, "> a");
            $newLabel = $element.text();
            $this.find(".menu-back-label").text($newLabel);
          } else if ($previous.hasClass("dropdown")) {
            $element = util.findSiblingElement($previous, "a");
            $newLabel = $element.text();
            $this.find(".menu-back-label").text($newLabel);
          }

          $selected.removeClass("selected");
          $menu.scrollTop(0);
          $wrapper.css({
            transform: "translateX(" + $currentOffset + "vw)"
          }).attr({
            "data-translatex": $currentOffset,
            "data-menulevel": $currentLevel - 1
          });
        }
      });
    },
    attachMenuButtonHandlers: function attachMenuButtonHandlers(target) {
      var $body = $("body");
      var $menu = util.findChildElement(target, ".menu");
      var $search = util.findChildElement(target, ".search-inline");
      var $menuOpen = util.findChildElement(target, ".menu-toggle");
      var $menuClose = util.findChildElement(target, ".menu-close");
      var $searchOpen = util.findChildElement(target, ".search-toggle");
      var $searchClose = util.findChildElement(target, ".search-close");
      $menuOpen.on({
        click: function click(e) {
          e.preventDefault();
          var $this = $(this);
          store.menuOpened = true;
          $body.addClass("menu-opened");
          $menu.addClass("open");

          if ($search.hasClass("active")) {
            store.searchOpened = false;
            $search.removeClass("active");
            $searchOpen.removeClass("hidden");
            $searchClose.addClass("hidden");
          }

          $this.addClass("hidden");
          $menuClose.removeClass("hidden");
        }
      });
      $menuClose.on({
        click: function click(e) {
          e.preventDefault();
          var $this = $(this);
          store.menuOpened = false;
          $body.removeClass("menu-opened");
          $menu.removeClass("open index-adjust");
          $this.addClass("hidden");
          $menuOpen.removeClass("hidden");
        }
      });
      $searchOpen.on({
        click: function click(e) {
          e.preventDefault();
          var $this = $(this);
          store.searchOpened = true;
          $body.addClass("search-opened");
          $search.addClass("active");

          if ($menu.hasClass("open")) {
            store.menuOpened = false;
            $menu.removeClass("open");
            $menuOpen.removeClass("hidden");
            $menuClose.addClass("hidden");
          }

          $this.addClass("hidden");
          $searchClose.removeClass("hidden");
        }
      });
      $searchClose.on({
        click: function click(e) {
          e.preventDefault();
          var $this = $(this);
          store.searchOpened = false;
          $body.removeClass("search-opened");
          $search.removeClass("active index-adjust");
          $this.addClass("hidden");
          $searchOpen.removeClass("hidden");
        }
      });
    },
    attachTouchHandlers: function attachTouchHandlers(target) {
      var $links = util.findChildElement(target, "a");
      var $tapped = false;

      if (store.viewportMode === "desktop") {
        $links.on({
          touchstart: function touchstart(e) {
            var $this = $(this);

            if (!$tapped) {
              //if tap is not set, set up single tap
              $tapped = setTimeout(function () {
                $tapped = null; //insert things you want to do when single tapped

                var $parent = $this.closest("li");

                if ($parent.hasClass("has-dropdown") || $parent.hasClass("has-child")) {
                  // clear all 'touch-selected' classes from anything that has it currently
                  $(".has-dropdown, .has-child").removeClass("touch-selected"); // apply 'touch-selected' to this and all parent li

                  var $li = $this.parents("li");
                  $li.addClass("touch-selected");
                  fn.adjustMenuSize($this);
                }
              }, 250); //wait 250ms then run single click code
            } else {
              //tapped within 250ms of last tap. double tap
              clearTimeout($tapped); //stop single tap callback

              $tapped = null; // insert things you want to do when double tapped
              // on dbltap change window.location to assigned href

              var $url = $this.attr("href");
              window.location = $url;
            }

            e.preventDefault();
          }
        }); // clear all 'touch-selected' if tap outside navigation

        $(document).on({
          "click touchstart": function clickTouchstart(e) {
            if (!$(e.target).closest(".menu").length) {
              return $(".has-dropdown, .has-child").removeClass("touch-selected");
            }
          }
        });
      }
    },
    resetAllNavigation: function resetAllNavigation(target) {
      var $menu = util.findChildElement(target, ".menu");
      var $back = util.findChildElement(target, ".menu-back");
      var $wrapper = util.findChildElement(target, ".menu-wrapper");
      var $search = util.findChildElement(target, ".search-inline");
      var $selected = util.findChildElement(target, ".selected");
      $menu.removeClass("open index-adjust active");
      $back.removeClass("active");
      $search.removeClass("active index-adjust");
      $wrapper.attr({
        "data-translatex": 0,
        "data-menulevel": 0
      }).removeAttr("style");

      if ($selected.length !== 0) {
        $.each($selected, function () {
          $(this).removeClass("selected");
        });
      }

      store.menuOpened = false;
      store.searchOpened = false;
    }
  }; // return closures

  return {
    init: function init(parent) {
      if (store.container.length !== 0) {
        util.checkViewportMode();
        fn.setDataAttributes(store.container);
        fn.setDropdownReset(store.container);
      }
    }
  };
};
/*= =================================
    Article List & Filters
================================== */


var articleGrid = function articleGrid() {
  var $component = $("#js-articleGrid");
  var $viewportMode = windowValues.width >= breakpoints.desktop__minimum ? "desktop" : "mobile";
  var $filters;
  var $filtersToggle;
  var $articlesWrapper;
  var $itemWrapper;
  var $itemList;
  var $paginationWrappers;
  var $pageLength = 9;
  var $featuredWrapper = $("#js-articleGrid .featured");
  var $itemMap = {
    filteredAll: [],
    featured: []
  };
  var fn = {
    checkViewportMode: function checkViewportMode() {
      // initialise variable with a value, then run check on resize
      requestResizeAnimation(function () {
        $viewportMode = windowValues.width >= breakpoints.desktop__minimum ? "desktop" : "mobile";
      });
    },
    setVariables: function setVariables() {
      $filters = $component.find(".filters");
      $filtersToggle = $component.find(".filter-by");
      $articlesWrapper = $component.find(".articles");
      $itemWrapper = $component.find(".list");
      $itemList = $itemWrapper.find(".item");
      $paginationWrappers = $component.find(".pagination");
    },
    createItemList: function createItemList() {
      // get the filter list
      var $filterList = $filters.find("li"); // loop and create arrays in $itemMap

      $.each($filterList, function () {
        var $value = $(this).find("label").text().toLowerCase();

        if (typeof $itemMap[$value] === "undefined") {
          $itemMap[$value] = [];
        }
      }); // pass final object to fn.mapItemList

      fn.mapItemList($itemList);
    },
    mapItemList: function mapItemList(element) {
      if (element.length > 0) {
        $.each(element, function (index, obj) {
          // fetch the filter text
          var $label = $(obj).find(".labelText").text().toLowerCase();
          var $featured = $(obj).hasClass("item-featured"); // unshift (add to end of array) to 'all' by default

          $itemMap.all.unshift(obj); // if the item has a listed filter, add it to it's filter category

          if (typeof $itemMap[$label] !== "undefined") {
            // add element to categories where required
            $itemMap.filteredAll.unshift(obj);
            $itemMap[$label].unshift(obj);
          } // if item is featured, send to featured array


          if ($featured === true) {
            $itemMap.featured.unshift(obj);
          }
        });
      }
    },
    clearInlineStyles: function clearInlineStyles() {
      requestResizeAnimation(function () {
        if ($viewportMode === "desktop") {
          if ($filters.hasClass("open")) {
            $filters.removeClass("open");
          }
        }
      });
    },
    toggleFilterVisibility: function toggleFilterVisibility() {
      $filtersToggle.on({
        click: function click() {
          if ($viewportMode === "mobile") {
            $filters.toggleClass("open");
          }
        }
      }); // remove all open menus on click outside of navigation

      $(document).click(function (e) {
        if ($viewportMode === "mobile" && !$(e.target).closest(".filters").length) {
          $(".filters").removeClass("open");
        }
      });
    },
    checkSelectedFilter: function checkSelectedFilter() {
      $filters.on({
        click: function click() {
          var $this = $(this);
          var $label = $this.find("label").text().toLowerCase();
          var $radio = $this.find('input[type="radio"]');

          if (!$radio.is(":checked")) {
            if ($label === "all") {
              fn.resetContent($itemMap.filteredAll);
            } else {
              fn.resetContent($itemMap[$label]);
            }
          }
        }
      }, "li");
      $filters.on({
        focus: function focus() {
          var $this = $(this);
          var $label = $this.siblings("label").text().toLowerCase();

          if ($label === "all") {
            fn.resetContent($itemMap.filteredAll);
          } else {
            fn.resetContent($itemMap[$label]);
          }
        }
      }, 'input[type="radio"]');
    },
    changeSelectedFilter: function changeSelectedFilter(value) {
      var $filterList = $filters.find("li");
      $.each($filterList, function () {
        var $this = $(this);
        var $label = $this.find("label").text().toLowerCase();
        var $radio = $this.find('input[type="radio"]');

        if ($label === value) {
          $radio.prop("checked", true);
        }
      });
    },
    checkSelectedLabel: function checkSelectedLabel() {
      $articlesWrapper.on({
        click: function click(e) {
          e.preventDefault();
          var $this = $(this);
          var $value = $this.text().toLowerCase();
          fn.changeSelectedFilter($value);
          fn.resetContent($itemMap[$value]);
        }
      }, ".labelLink");
    },
    resetContent: function resetContent(contentList) {
      $itemWrapper.empty();
      $.each($paginationWrappers, function () {
        var $this = $(this); // remove all pagination buttons

        $this.empty();
      }); // move to next function step

      fn.addContent(contentList);
    },
    addContent: function addContent(contentList) {
      if (contentList.length !== 0) {
        $.each(contentList, function () {
          $itemWrapper.append($(this));
        }); // move to last function step

        fn.buildPagination(contentList);
      } else {
        $itemWrapper.append($('<div class="page"><div class="item noContent">There is no content available for this category to display. Please select another category from the filters provided, or <a href="#" class="js-viewAll">click here to view all available articles.</a></div></div>'));
      }
    },
    buildPagination: function buildPagination(contentList) {
      // run only if there at least one item in the list, and it's longer than the page length
      if (contentList.length !== 0 && contentList.length > $pageLength) {
        var $counter = 0;
        var $content = [];
        var $temp = []; // create pages arrays

        $.each(contentList, function (index, obj) {
          // push this item to $temp regardless
          $temp.push(obj); // if counter is lower than page length, increment
          // else reset all and send the $temp to $content

          if ($counter < $pageLength - 1) {
            $counter++;
          } else {
            $counter = 0;
            $content.push($temp);
            $temp = [];
          } // if the item is the last item, send the final $temp to $content


          if (index === contentList.length - 1) {
            $content.push($temp);
          }
        }); // use pages arrays to generate wrapping markup

        $.each($content, function (i) {
          var $this = $(this);
          var $page = i + 1; // set correct page numbers

          if ($page === 1) {
            $this.wrapAll($('<div class="page" data-pagenumber="' + $page + '" data-selected="true" />'));
          } else {
            $this.wrapAll($('<div class="page" data-pagenumber="' + $page + '" data-selected="false" />'));
          }
        }); // generate pagination elements

        $.each($paginationWrappers, function () {
          var $this = $(this);
          var $pages = $content.length; // attach previous button

          $this.prepend('<button class="paginationButton paginationButtonPrev disabled" data-type="prev">&lt;</button>'); // add a numbered button for each page

          for (var i = 1; i <= $pages; i++) {
            var $button = $('<button class="paginationButton paginationButtonNumber" data-page="' + i + '">' + i + "</button>");

            if (i === 1) {
              $button.addClass("disabled").attr("data-type", "first");
            } else if (i === $pages) {
              $button.attr("data-type", "last");
            } else {
              $button.attr("data-type", "number");
            }

            $this.append($button);
          } // attach next button


          $this.append('<button class="paginationButton paginationButtonNext " data-type="next">&gt;</button>');
        }); // build button mapping object

        var $buttons = {
          all: $(".paginationButton"),
          previous: $('.paginationButton[data-type="prev"]'),
          first: $('.paginationButton[data-type="first"]'),
          last: $('.paginationButton[data-type="last"]'),
          next: $('.paginationButton[data-type="next"]')
        };
        var $list = $("#js-articleGrid .list");
        var $pages = $list.find(".page");
        $.each($buttons.all, function () {
          var $this = $(this); // previous buttons

          if ($this.attr("data-type") === "prev") {
            $this.on("click", function () {
              if (!$this.hasClass("disabled")) {
                var $current = $('#js-articleGrid .page[data-selected="true"]');
                var $prev = $current.prev();
                var $checkIfLast = $prev.prev().length;
                var $pageNumber = $prev.attr("data-pagenumber"); // -1 for correct calculations

                fn.removeSelectedPage($pages);
                fn.addSelectedPage($prev);
                fn.enableButtons($buttons.all);

                if ($checkIfLast === 0) {
                  fn.disableButtons($buttons.previous);
                  fn.disableButtons($buttons.first);
                } else {
                  fn.disableButtons($('.paginationButton[data-page="' + $pageNumber + '"]'));
                }
              }
            });
          } // back to first page buttons
          else if ($this.attr("data-type") === "first") {
              $this.on("click", function () {
                if (!$this.hasClass("disabled")) {
                  fn.removeSelectedPage($pages);
                  fn.addSelectedPage($pages.first());
                  fn.enableButtons($buttons.all);
                  fn.disableButtons($buttons.previous);
                  fn.disableButtons($buttons.first);
                }
              });
            } // go to last page buttons
            else if ($this.attr("data-type") === "last") {
                $this.on("click", function () {
                  if (!$this.hasClass("disabled")) {
                    fn.removeSelectedPage($pages);
                    fn.addSelectedPage($pages.last());
                    fn.enableButtons($buttons.all);
                    fn.disableButtons($buttons.next);
                    fn.disableButtons($buttons.last);
                  }
                });
              } // go to next page buttons
              else if ($this.attr("data-type") === "next") {
                  $this.on("click", function () {
                    if (!$this.hasClass("disabled")) {
                      var $current = $('#js-articleGrid .page[data-selected="true"]');
                      var $next = $current.next();
                      var $checkIfLast = $next.next().length;
                      var $pageNumber = $next.attr("data-pagenumber"); // -1 for correct calculations

                      fn.removeSelectedPage($pages);
                      fn.addSelectedPage($next);
                      fn.enableButtons($buttons.all);

                      if ($checkIfLast === 0) {
                        fn.disableButtons($buttons.next);
                        fn.disableButtons($buttons.last);
                      } else {
                        fn.disableButtons($('.paginationButton[data-page="' + $pageNumber + '"]'));
                      }
                    }
                  });
                } // numbered page jump buttons
                else {
                    $this.on("click", function () {
                      if (!$this.hasClass("disabled")) {
                        var $pageNumber = $(this).attr("data-page");
                        var $target = $('#js-articleGrid .page[data-pagenumber="' + $pageNumber + '"]');
                        fn.removeSelectedPage($pages);
                        fn.addSelectedPage($target);
                        fn.enableButtons($buttons.all);
                        fn.disableButtons($('.paginationButton[data-page="' + $pageNumber + '"]'));
                      }
                    });
                  }
        });
      } // run only if there at least one item in the list, and there's only one page worth of items


      if (contentList.length !== 0 && contentList.length <= $pageLength) {
        $itemWrapper.children().wrapAll($('<div class="page" />'));
      }
    },
    setCurrentFeatured: function setCurrentFeatured() {
      if ($itemMap.featured.length !== 0) {
        // clone and append just the first (most recent) featured to wrapper
        var $clone = $($itemMap.featured[0]).clone();
        $featuredWrapper.append($clone);
      }
    },
    setRandomFeatured: function setRandomFeatured() {
      if ($itemMap.featured.length !== 0) {
        // get random number using featured array length, adjusted for zero index
        var $randomNumber = fn.getRandom(0, $itemMap.featured.length - 1);
        var $clone = $($itemMap.featured[$randomNumber]).clone();
        $featuredWrapper.append($clone);
      }
    },
    disableButtons: function disableButtons(elements) {
      $.each(elements, function () {
        var $elem = $(this);
        $elem.addClass("disabled");
      });
    },
    enableButtons: function enableButtons(elements) {
      $.each(elements, function () {
        var $elem = $(this);
        $elem.removeClass("disabled");
      });
    },
    removeSelectedPage: function removeSelectedPage(elements) {
      $.each(elements, function () {
        var $this = $(this);
        $this.attr("data-selected", false);
      });
    },
    addSelectedPage: function addSelectedPage(elements) {
      elements.attr("data-selected", true);
    },
    enableViewAllLink: function enableViewAllLink() {
      $("#js-articleGrid").on({
        click: function click(e) {
          e.preventDefault();
          fn.changeSelectedFilter("all");
          fn.resetContent($itemMap.filteredAll);
        }
      }, ".js-viewAll");
    },
    getRandom: function getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  };
  return {
    init: function init() {
      if ($component.length !== 0) {
        fn.checkViewportMode();
        fn.setVariables();
        fn.createItemList();
        fn.clearInlineStyles();
        fn.toggleFilterVisibility();
        fn.resetContent($itemMap.filteredAll);
        fn.setCurrentFeatured();
        fn.checkSelectedFilter();
        fn.checkSelectedLabel();
        fn.enableViewAllLink();
      }
    }
  };
};
/*= =================================
    Slick Carousel Initialisation
================================== */


function initSlickSlider() {
  var $slider = $(".slickSlider");

  if ($slider.length !== 0) {
    $.each($slider, function () {
      var $this = $(this);
      var $slides = $this.find(".slide");

      if ($slides.length > 2) {
        $this.on("init", function () {
          var $thisSlider = $(this);

          if ($thisSlider.find(".videoSlide").length === 0) {
            setTimeout(function () {
              $thisSlider.removeClass("loading");
            }, 3000);
          }
        }).slick({
          centerMode: true,
          slidesToShow: 3,
          variableWidth: true,
          draggable: false
        });
      }
    });
  }
}
/*= =================================
    Video-handing Functions
================================== */


function initVideos() {
  initYouTube();
  initVideoOverlays();
}

function initInfogram() {
  // if there's an infogram available on the page
  if ($(".infogram-embed").length) {
    // check the window size by default
    if ($(window).width() <= breakpoints.mobile__landscape) {
      $(".infogram-mobile").css("display", "block");
      $(".infogram-desktop").css("display", "none");
    } else {
      $(".infogram-desktop").css("display", "block");
      $(".infogram-mobile").css("display", "none");
    } // if window is resized do the following.


    $(window).resize(function () {
      if ($(window).width() <= breakpoints.mobile__landscape) {
        $(".infogram-desktop").hide();
        $(".infogram-mobile").show();
      } else {
        $(".infogram-desktop").show();
        $(".infogram-mobile").hide();
      }
    });
  }
}
/**
 * Initilises the YoueTube API aysync
 * */


function initYouTube() {
  var tag = document.createElement("script");
  tag.src = "//www.youtube.com/iframe_api?apiKey=" + ugGlobals.youtubeAPIKey;
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); // ensure that the div the iframe replaces has a unique id

  $(".js-youtubeVid").each(function (index) {
    var id = "video";
    $(this).attr("id", id + "_" + index);
  });
} // keeps a records of the youtube videos that have been initialised


var youTubePlayerIDs = [];
var youTubePlayers = [];
/**
 * Called when the YouTube player API is ready
 * */

function onYouTubeIframeAPIReady() {
  var $videos = $(".youtubeVid");

  if ($videos.length !== 0) {
    initYouTubeVideos(".js-youtubeVid");
    $videos.fitVids();
  }
}
/**
 * initialises any YouTube videos on the page
 * */


function initYouTubeVideos(selector) {
  $(selector).each(function () {
    var div = $(this);
    var id = div.data("youtubeid");
    var width = div.attr("width");
    var height = div.attr("height");
    var divId = div.attr("id");

    if ($.inArray(divId, youTubePlayerIDs) === -1) {
      try {
        var player = new YT.Player(divId, {
          videoId: id,
          width: width,
          height: height,
          playerVars: {
            rel: 0,
            enablejsapi: 1
          },
          events: {
            onReady: onPlayerReady
          }
        });
        player.__divId = divId;
        youTubePlayers.push(player);
        youTubePlayerIDs.push(divId);
      } catch (ex) {
        div.html("<p class='error'>Unable to load YouTube video with ID " + id + "</p>");
      }
    }
  });
}

function initVideoOverlays() {
  $(".gallery, .videoGallery, .mediaGallery").on("click", '[data-buttonfunction="playYoutube"]', function (e) {
    e.preventDefault();
    var $overlayClicked = $(this);
    var $videoDiv = $overlayClicked.parent();
    var $videoCaption = $videoDiv.find(".caption");

    if (window.innerWidth >= 1200) {
      $videoCaption.addClass("hidden");
    }

    if ($videoDiv.hasClass("slick-current")) {
      var $videoWrapper = $videoDiv.find(".fluid-width-video-wrapper");
      handleVideoOverlayClick($overlayClicked);
      $overlayClicked.addClass("videoPlayed");
      $videoWrapper.addClass("visible");
    }
  });
  $(".mediaBlock, .slickSlider:not(.slick-initialized) .videoSlide").on("click", '[data-buttonfunction="playYoutube"]', function (e) {
    e.preventDefault();
    handleVideoOverlayClick($(this));
  });
}

function handleVideoOverlayClick($overlayClicked) {
  playYoutubePlayerByDivID($overlayClicked.parent().find(".js-youtubeVid").first().attr("id"));
  $overlayClicked.addClass("videoPlayed");
}

function playYoutubePlayerByDivID(id) {
  var player = getYouTubePlayerByDivID(id);
  player.playVideo();
}

function getYouTubePlayerByDivID(divId) {
  var youtubePlayer = null;
  youTubePlayers.forEach(function (player) {
    if (player.__divId === divId) {
      youtubePlayer = player;
      return true;
    }

    return false;
  });
  return youtubePlayer;
}

function onPlayerReady(player) {
  $(".slickSlider").removeClass("loading");
  $(".slick-arrow").on("click", function () {
    $(".videoOverlay").removeClass("videoPlayed");
    $(".fluid-width-video-wrapper").removeClass("visible");
    $(".caption").removeClass("hidden");
    $(youTubePlayers).each(function () {
      if (player.target.getPlayerState() === 1) {
        player.target.pauseVideo();
      }
    });
  });
}
/* ---------------------------------------------
Accordion
----------------------------------------------*/


function accordion() {
  /*
    Add a class to an accordion if it's not followed immediately by another.
    */
  var $accordions = $(".dropDowns");
  $accordions.each(function () {
    var $accordion = $(this);

    if ($accordion.next().hasClass("dropDowns") === false) {
      $accordion.addClass("lastDropDown");
    }
  });
  /*
    Add an event listener to the accordion headings.
    */

  $(".dropDowns").on("click", ".dropDownHeading", function (e) {
    e.preventDefault();
    var $dropDownHeading = $(this);

    if ($dropDownHeading.parents(".dropDowns").hasClass("loading") === false) {
      var $summary = $dropDownHeading.next();
      toggleAccordion($dropDownHeading, $summary);
    }
  });
  /*
    Check to see if we have any accordions that need to be opened by default.
    */

  openAccordions($accordions);
}

function openAccordions($accordions) {
  $accordions.each(function () {
    var $accordion = $(this);

    if ($accordion.hasClass("courseDropDowns") === false && $accordion.hasClass("loading") === false && $accordion.data("open") === "show") {
      var $dropDownHeading = $accordion.find(".dropDownHeading");
      var $summary = $accordion.find(".dropDownSummary");
      toggleAccordion($dropDownHeading, $summary);
    }
  });
}

function toggleAccordion($accordion, $summary) {
  if ($accordion.hasClass("dropDownOpen")) {
    $accordion.removeClass("dropDownOpen");
    $summary.slideUp();
  } else {
    $accordion.addClass("dropDownOpen");
    $summary.slideDown();
    lazyloadAccordionImages($accordion.next());
  }
}

function lazyloadAccordionImages($summary) {
  $summary.find("img").each(function () {
    var $img = $(this);

    if ((typeof $img.attr("src") === "undefined" || $img.attr("src") === "#") && typeof $img.data("imgSrc") !== "undefined") {
      $img.attr("src", $img.data("imgSrc"));
    }
  });
}
/* ---------------------------------------------
Course Accordion
----------------------------------------------*/

/*
function initCourseAccordions() {
  var $courseAccordions = $(".courseDropDowns");

  if ($courseAccordions.length > 0) {
    populateCourseAccordions($courseAccordions);

    $(".dropDownSummary").on(
      "click",
      ".courseMore, .courseLess, .toggle",
      function (e) {
        e.preventDefault();

        toggleCourseAccordion($(this).parents(".course"));
      }
    );
  }
}

function populateCourseAccordions($courseAccordions) {
  var classifications = [];
  var courses = ugGlobals.courseData;
  var filteredCourses = {};

  $courseAccordions.each(function () {
    var $courseAccordion = $(this);

    classifications.push($courseAccordion.data("subjectArea"));
  });

  classifications.forEach(function (val) {
    var $array = [];

    courses.forEach(function (subject) {
      var $course = subject;
      var $classification = subject.classification;

      if ($classification.search(val) !== -1) {
        return $array.push($course);
      }
    });

    filteredCourses[val] = $array;
  });
  var $coursePlaceholders = $courseAccordions.find(".course.placeholder");
  var $coursePlaceholder = $coursePlaceholders.first();
  $coursePlaceholders.remove();
  for (var key in filteredCourses) {
    for (var obj in filteredCourses[key]) {
      $('.dropDowns[data-subject-area="' + key + '"]')
        .find(".dropDownSummary")
        .append(
          createCourseElement($coursePlaceholder, filteredCourses[key][obj])
        );
    }
  }

  $courseAccordions
    .removeClass("loading")
    .find(".dropDownSummary")
    .removeClass("loading");

  ugGlobals.courseAccordionsPopulated = true;
  openCourseAccordions($courseAccordions);
}

function openCourseAccordions($accordions) {
  $accordions.each(function () {
    var $accordion = $(this);
    if (
      $accordion.hasClass("courseDropDowns") === true &&
      $accordion.hasClass("loading") === false &&
      $accordion.data("open") === "show"
    ) {
      var $dropDownHeading = $accordion.find(".dropDownHeading");
      var $summary = $accordion.find(".dropDownSummary");

      toggleAccordion($dropDownHeading, $summary);
    }
  });
}

function createCourseElement($coursePlaceholder, course) {
  var $course = $coursePlaceholder.clone();

  $course.removeClass("placeholder");
  $course.find(".courseImage").first().data("imgSrc", course.thumbnail).attr({
    alt: course.title,
    src: "#",
  });
  $course.find(".ucasCode").first().text(course.id);
  $course.find(".courseName").first().text(course.title);
  $course.find(".courseQual").first().text(course.qualification);
  $course
    .find(".courseSummary")
    .first()
    .text(decodeURIComponent(course.description));
  $course
    .find(".courseEntryRequirements")
    .first()
    .text(decodeURIComponent(course.entryrequirements));
  $course
    .find(".courseOpportunities")
    .first()
    .text(course.coursetypecheckboxes);
  $course
    .find(".courseUcasCodes")
    .first()
    .text("NEWC, " + course.id);
  $course.find(".courseDuration").first().text(course.length);
  $course
    .find(".courseDescription")
    .first()
    .html(decodeURIComponent(course.courseintro));
  $course
    .find(".courseDownload a")
    .first()
    .attr("href", "https://" + course.shorturl);

  return $course;
}

function toggleCourseAccordion($course) {
  var $courseDetails = $course.find(".courseDetails");
  var $courseButtons = $course.find(".courseMore");

  $courseButtons.toggleClass("hidden");
  $courseDetails.slideToggle(400);
}
/*
/* ---------------------------------------------
    Dual Panel
 */
// function to identify if the dual panel has a breakout image


function dualPanelBreakoutImage() {
  $(".dualPanel").each(function () {
    var parent = $(this);

    if (parent.find(".image-container").length > 0) {
      parent.addClass("breakout-container");
    }
  });
}
/* ---------------------------------------------
Search Results
----------------------------------------------*/


function initCourseSearch($courseSearch) {
  var $form = $courseSearch.find("form");
  var fuse = new Fuse(ugGlobals.courseData, ugGlobals.searchOptions);
  $form.on("submit", function (e) {
    e.preventDefault();
  });
  $(".searchSubmit").on("click", function (e) {
    e.preventDefault();
    var $searchButton = $(this);
    var $input = $searchButton.prev();
    var value = $input.val();
    var hideResults = $searchButton.hasClass("close");
    handleFormSearch($input, value, hideResults, fuse);
  });
  $("#js-searchBoxInput, .search.heroSearch").on("keyup", function (e) {
    if (e.keyCode === 13) {
      /*
            Prevent the course search form from submitting on Enter press.
            */
      e.preventDefault();
      return false;
    }

    var $input = $(this);
    var value = $input.val();
    var hideResults = false;
    handleFormSearch($input, value, hideResults, fuse);
  });
}

function handleFormSearch($input, value, hideResults, fuse) {
  var $results = getResultsContainer($input);
  var $searchButton = $results.parent().find(".searchSubmit");

  if (hideResults === true) {
    clearSearchResults($results);
    $input.val("");
  } else if (ugGlobals.searchResultsPopulated === false) {
    populateSearchResults();

    if (value.length >= 3) {
      filterSearchResults(getResultsContainer($input), value, fuse);
    }
  } else if (ugGlobals.searchResultsPopulated === true && value.length >= 3) {
    filterSearchResults($results, value, fuse);
  } else {
    clearSearchResults($results);
  }

  if ($input.val().length >= 1) {
    $searchButton.addClass("close");
  }
}

function getResultsContainer($input) {
  var $results = "";

  if ($input.hasClass("heroSearch")) {
    $results = $input.parent().find(".results");
  } else {
    $results = $input.parents(".courseSearch").find(".results");
  }

  return $results;
}

function populateSearchResults() {
  var courses = ugGlobals.courseData;
  var $form = $(".courseSearch form");
  var $searchResults = "";
  var $headerSearchForm = $(".search.heroSearch").parent();
  var $headerSearchResults = "";

  if ($form.length === 1) {
    if ($form.next(".results").length === 0) {
      $form.after('<div class="results hidden loading"><ul></ul></div>');
    }

    $searchResults = $form.next(".results").find("ul");
    $searchResults.empty();
  }

  if ($headerSearchForm.length === 1) {
    if ($headerSearchForm.find(".results").length === 0) {
      $headerSearchForm.append('<div class="results resultsHeader hidden loading"><ul></ul></div>');
    }

    $headerSearchResults = $headerSearchForm.find(".results ul");
    $headerSearchResults.empty();
  }

  courses.forEach(function (course) {
    var courseHtml = '<li class="result hidden" data-course-id="' + course.id + '">' + '<div class="details">' + '<a class="resultLink" href="https://' + course.shorturl + '">' + course.title + " - " + course.qualification + " (" + course.id + ")" + "</a>" + "</div>" + "</li>";

    if ($searchResults.length === 1) {
      $searchResults.append(courseHtml);
    }

    if ($headerSearchResults.length === 1) {
      $headerSearchResults.append(courseHtml);
    }
  });
  ugGlobals.searchResultsPopulated = true;
}

function filterSearchResults($resultsContainer, value, fuse) {
  var $results = $resultsContainer.find(".result");
  var results = fuse.search(value);
  var resultIds = [];
  var $searchButton = $resultsContainer.parent().find(".searchSubmit");
  results.forEach(function (result) {
    if (result.item !== "No Code") {
      resultIds.push(result.item);
    }
  });
  $resultsContainer.addClass("loading");
  $results.addClass("hidden");

  if (resultIds.length > 0) {
    $results.each(function () {
      var $result = $(this);
      var id = $result.data("courseId");

      if (resultIds.indexOf(id) !== -1) {
        $result.removeClass("hidden");
      }
    });
    $resultsContainer.removeClass("hidden loading");
    $searchButton.addClass("close");
  } else {
    $resultsContainer.addClass("hidden loading");
    $searchButton.removeClass("close");
  }
}

function clearSearchResults($results) {
  var $searchWrapper = $results.parent();
  var $searchButton = $searchWrapper.find(".searchSubmit");
  $results.addClass("hidden loading");
  $searchButton.removeClass("close");
}
/* ---------------------------------------------
Course Data
----------------------------------------------*/

/*function getCourseData() {
  var $search = $("#searchBox, .heroSearch");
  var $courseAccordions = $(".courseDropDowns");

  if (
    ($search.length !== 0 || $courseAccordions.length !== 0) &&
    ugGlobals.courseData.length === 0
  ) {
    
    $.getJSON("/data/mobile/ugcoursedata/json/index.json")
      .done(function (data) {
        ugGlobals.courseData = data.courses.sort(function (a, b) {
        
          if (a.title > b.title) {
            return 1;
          } else if (a.title < b.title) {
            return -1;
          } else if (a.title === b.title) {
            if (a.qualification > b.qualification) {
              return 1;
            } else if (a.qualification < b.qualification) {
              return -1;
            }
            return 0;
          }
          return 0;
        });
        getCourseDataCallback();
      })
      .fail(function () {
        //console.error('error loading course data!');
      });
  }
}*/

/*function getCourseDataCallback() {
  var $courseSearch = $(".courseSearch, .search.heroSearch");
  if (
    ugGlobals.searchResultsPopulated === false &&
    $courseSearch.length !== 0
  ) {
    initCourseSearch($courseSearch);
  }
  var $courseAccordions = $(".courseDropDowns");
  if (
    ugGlobals.courseAccordionsPopulated === false &&
    $courseAccordions.length !== 0
  ) {
    initCourseAccordions();
  }
}*/

/* ---------------------------------------------
DROPDOWN: Dropdown Content Blocks
----------------------------------------------*/


function initDropdowns() {
  var dropdownToOpen = window.location.hash;
  var dropdownDiv = $(dropdownToOpen);
  var dropDownToggle = $('[data-buttonfunction="toggleDropdown"]', dropdownDiv);
  var dropDownSummary = dropDownToggle.next();
  dropDownToggle.addClass("dropdownOpen");
  dropDownSummary.slideDown();
  $('[data-buttonfunction="toggleDropdown"]').click(function (e) {
    e.preventDefault();
    dropDownToggle = $(this);
    dropDownSummary = dropDownToggle.next();

    if (dropDownToggle.hasClass("dropdownOpen")) {
      dropDownToggle.removeClass("dropdownOpen");
      dropDownSummary.slideUp();
    } else {
      dropDownToggle.addClass("dropdownOpen");
      dropDownSummary.slideDown();
    }
  });
}
/* ---------------------------------------------
RELATED PEOPLE: Related People Pagination
----------------------------------------------*/


function initRelatedPeople() {
  var $relatedPeople = $("#js-relatedPeopleContainer");
  var $paginationContainer = $("#js-relatedPeoplePagination");

  if ($relatedPeople.length === 1) {
    var $people = $relatedPeople.find(".relatedPerson");
    var totalPeople = $people.length;
    var totalPeoplePerPage = 5;
    var previousTotalPeoplePerPage = 5;
    var totalNumPages = 1;

    var updatePage = function updatePage(page) {
      /*
            Update the current page depending on which pagination button was
            clicked.
            */
      if (sacsGlobals.currentPage < totalNumPages && page === "next") {
        sacsGlobals.currentPage += 1;
      } else if (sacsGlobals.currentPage > 1 && page === "prev") {
        sacsGlobals.currentPage -= 1;
      } else if (typeof page === "number") {
        sacsGlobals.currentPage = page;
      }
      /*
            Update the disabled pagination buttons.
            */


      $paginationContainer.find(".paginationButtonNumber").removeClass("disabled");
      $paginationContainer.find('.paginationButtonNumber[data-page="' + sacsGlobals.currentPage + '"]').addClass("disabled");

      if (sacsGlobals.currentPage === totalNumPages) {
        $paginationContainer.find(".paginationButtonNext").addClass("disabled");
      } else {
        $paginationContainer.find(".paginationButtonNext").removeClass("disabled");
      }

      if (sacsGlobals.currentPage === 1) {
        $paginationContainer.find(".paginationButtonPrev").addClass("disabled");
      } else {
        $paginationContainer.find(".paginationButtonPrev").removeClass("disabled");
      }
      /*
            Update which people are visible.
            */


      updateVisiblePeople();
    };

    var updateVisiblePeople = function updateVisiblePeople() {
      /*
            Loop through each person and hide/show the relevant blocks;
            */
      $people.each(function (index) {
        var personIndex = index + 1;
        var page = sacsGlobals.currentPage;

        if (page === 1 && personIndex > totalPeoplePerPage) {
          /*
                    If first page is selected hide anything after that page.
                    */
          $(this).addClass("hidden");
        } else if (page > 1 && personIndex <= (page - 1) * totalPeoplePerPage || personIndex > page * totalPeoplePerPage) {
          /*
                    Hides people before the current page
                    */
          $(this).addClass("hidden");
        } else if (page > 1 && personIndex > (page - 1) * totalPeoplePerPage && personIndex <= page * totalPeoplePerPage) {
          /*
                    Shows people on the current page
                    */
          $(this).removeClass("hidden");
        } else {
          /*
                    Show all remaining pages
                    */
          $(this).removeClass("hidden");
        }
      });
    };

    var updatePerPage = function updatePerPage() {
      /*
            Updated the amount of people to show on each page depending on the
            browser width.
            */
      var perPage = 5;

      if (window.innerWidth < sacsGlobals.breakpoints.large) {
        if (window.innerWidth < sacsGlobals.breakpoints.medium) {
          perPage = 2;
        } else {
          perPage = 4;
        }
      }

      return perPage;
    };

    var updateTotalPages = function updateTotalPages(people, perPage) {
      /*
            Updated the total number of pages required.
            */
      return Math.ceil(people / perPage);
    };

    var updatePaginationButtons = function updatePaginationButtons() {
      /*
            Remove any old buttons in the container.
            */
      $paginationContainer.html("");
      /*
            Add the prev button.
            */

      var buttonClass = sacsGlobals.currentPage === 1 ? "disabled" : "";
      $paginationContainer.append('<button class="paginationButton paginationButtonPrev ' + buttonClass + '" data-page="prev"><</button>');
      /*
            Add a button for each page.
            */

      for (var i = 1; i <= totalNumPages; i += 1) {
        buttonClass = sacsGlobals.currentPage === i ? "disabled" : "";
        $paginationContainer.append('<button class="paginationButton paginationButtonNumber ' + buttonClass + '" data-page="' + i + '">' + i + "</button>");
      }
      /*
            Add the next button.
            */


      buttonClass = sacsGlobals.currentPage === totalNumPages ? "disabled" : "";
      $paginationContainer.append('<button class="paginationButton paginationButtonNext ' + buttonClass + '" data-page="next">></button>');
    };
    /*
        Get the total number of people and pages.
        */


    totalPeoplePerPage = updatePerPage();
    totalNumPages = updateTotalPages(totalPeople, totalPeoplePerPage);
    /*
        Only run the logic if we have more than one page of items.
        */

    if (totalNumPages > 1) {
      /*
            Update the pages which are visible and append the pagination buttons
            to the page.
            */
      updateVisiblePeople();
      updatePaginationButtons();
      /*
            Add an event listener to the pagination buttons.
            */

      $paginationContainer.on("click", ".paginationButton:not(.disabled)", function (e) {
        e.preventDefault();
        updatePage($(this).data("page"));
      });
    }
    /*
        Remove loading class from the relatedPeople container.
        */


    $relatedPeople.removeClass("loading");
    /*
        Pagination also needs updating on the window resizing so we need to add
        update everything when the window resizes.
        */

    $(window).resize(function () {
      totalPeoplePerPage = updatePerPage();
      /*
            Check to see if the total people per page has changed from the last
            resize. If it hasn't changed we don't need to update anything.
            */

      if (previousTotalPeoplePerPage !== totalPeoplePerPage) {
        /*
                Set the pagination back to the first page.
                */
        sacsGlobals.currentPage = 1;
        totalNumPages = updateTotalPages(totalPeople, totalPeoplePerPage);

        if (totalNumPages > 1) {
          updatePaginationButtons();
        } else {
          /*
                    Remove the pagination buttons if we only have one page.
                    */
          $paginationContainer.html("");
        }

        updateVisiblePeople();
        /*
                Update the prev value so that we can check against it on the
                next resize event.
                */

        previousTotalPeoplePerPage = totalPeoplePerPage;
      }
    });
  }
}
/* ---------------------------------------------
Get Data URL for Image
----------------------------------------------*/


function getImageDataUrl(url, callback) {
  var xhr = new XMLHttpRequest();

  xhr.onload = function () {
    var reader = new FileReader();

    reader.onloadend = function () {
      callback(reader.result);
    };

    reader.readAsDataURL(xhr.response);
  };

  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}
/* ---------------------------------------------
Responsive Tables
----------------------------------------------*/

/*
A simple solution for making tables responsive. Adds a container div to any
tables and applys scrolling if there's more than one column. It also collects
row, column, and header data about each table so if in the future any more
advanced solutions are needed the applyScroll function can be expanded where
necessary.
*/


var responsiveTables = {
  tables: [],
  init: function init() {
    responsiveTables.setup();
    responsiveTables.applyScroll();
  },

  /*
    Loop through each table and store the following data: row count, column
    count, is there a header row, and is there a column row.
    */
  setup: function setup() {
    $(".textArea table").each(function (index) {
      var $table = $(this);
      $table.wrap('<div id="responsiveTable' + index + '" class="responsiveTable"></div>');
      responsiveTables.tables["responsiveTable" + index] = {
        columns: responsiveTables.getColumns($table),
        headerColumn: responsiveTables.isHeaderColumn($table),
        headerRow: responsiveTables.isHeaderRow($table),
        rows: responsiveTables.getRows($table)
      };
    });
  },

  /*
    Returns the number of rows in a table.
    *** Currently it doesn't take into account any rowspan attributes ***
    */
  getRows: function getRows($table) {
    return $table.find("tr").length;
  },

  /*
    Returns the number of columns in a table.
    *** Currently it doesn't take into account any colspan attributes ***
    */
  getColumns: function getColumns($table) {
    return $table.find("tr:last td").length;
  },

  /*
    Checks to see if the table has a header row at the top.
    */
  isHeaderRow: function isHeaderRow($table) {
    if ($table.find("tr:first th").length && !$table.find("tr:first td").length) {
      return true;
    }

    return false;
  },

  /*
    Checks to see if the table has a header column on the left.
    */
  isHeaderColumn: function isHeaderColumn($table) {
    var isTableHeader = true;
    $table.find("tr").each(function () {
      if (!$(this).children("th").length) {
        isTableHeader = false;
      }
    });

    if (isTableHeader === true) {
      return true;
    }

    return false;
  },

  /*
    Applys the scroll class to a table container to allow horizontal scrolling.
    Also adds some accessible attributes so that the container can be scrolled
    using the keyboard.
    */
  applyScroll: function applyScroll() {
    Object.keys(responsiveTables.tables).forEach(function (key) {
      /*
            Only apply the scrolling if the table has more than one column or if
            the table has the headers on the left column.
            */
      if (responsiveTables.tables[key].columns > 1 || responsiveTables.tables[key].headerColumn) {
        $("#" + key).addClass("scroll").attr({
          "aria-label": "Table",
          role: "region",
          tabindex: "0"
        });
      }
    });
  }
};

var dataWidgets = function dataWidgets() {
  var store = {};
  var fn = {
    // function to get course code from <meta> in head
    getFilterValue: function getFilterValue(name) {
      var $meta = $('meta[name="' + name + '"]');
      if ($meta.length !== 0) return $meta.attr("content");
    },
    fetchSingle: function fetchSingle(url, dataStore, parent, selectWrap) {
      $.getJSON(url).done(function (data) {
        data.options.forEach(function (elem) {
          dataStore.push(elem);
        });

        if (parent !== null) {
          return fn.buildOptionList(dataStore, parent);
        }
      }).fail(function (e) {
        $(selectWrap).empty().append("<p>There was an error accessing the data API: " + e.statusText + "</p>");
      });
    },
    fetchFiltered: function fetchFiltered(array, filterCode, parent, selectWrap) {
      return fn.fetchFilterCode(array.temp, array.filtered, filterCode, parent, selectWrap);
    },
    fetchFilterCode: function fetchFilterCode(arr, nextarr, filterCode, parent, selectWrap) {
      var $filter = [];
      $.getJSON(arr.api).done(function (data) {
        data.options.forEach(function (elem) {
          arr.array.push(elem);
        });
        $filter = arr.array.filter(function (elem) {
          if (elem.name === filterCode) return elem;
        });
        if ($filter.length !== 0) return fn.fetchFilteredData(nextarr, $filter[0].filter, parent, selectWrap);
      }).fail(function (e) {
        $(selectWrap).empty().append("<p>There was an error accessing the data API: " + e.statusText + "</p>");
      });
    },
    fetchFilteredData: function fetchFilteredData(arr, filter, parent, selectWrap) {
      var $bands = [];
      $.getJSON(arr.api).done(function (data) {
        data.options.forEach(function (elem) {
          $bands.push(elem);
        });
        $bands.forEach(function (elem) {
          if (elem.filter === filter) arr.array.push(elem);
        });
        return fn.buildOptionList(arr.array, parent);
      }).fail(function (e) {
        $(selectWrap).empty().append("<p>There was an error accessing the data API: " + e.statusText + "</p>");
      });
    },
    buildOptionList: function buildOptionList(arr, parent) {
      var $select = parent.find("select");
      arr.forEach(function (elem) {
        $('<option value="' + elem.name + '">' + elem.name + "</option>").appendTo($select);
      });
      return fn.initSelect(arr, parent);
    },
    initSelect: function initSelect(arr, parent) {
      var $select = parent.find("select:not(.ignore)");
      var $info = parent.find(".infoWrapper");
      $select.niceSelect();
      $select.on("change", function () {
        var $this = $(this);
        var $value = $this.find(":selected").attr("value");

        if ($value !== undefined) {
          var $data = arr.filter(function (itm) {
            if (itm.name === $value) return itm;
          });
          return $info.empty().append($data[0].value).css("display", "block");
        }

        return $info.empty().attr("style", "");
      });
      $select.each(function () {
        fn.initKeyboardNavigation(parent);
      });
    },
    initKeyboardNavigation: function initKeyboardNavigation(parent) {
      var $parent = parent;
      var $select = $parent.find(".nice-select");
      var $list = $parent.find(".list");
      var $listScroll = util.checkScrollBars($list.get(0));
      var $listHeight = $list.outerHeight();
      var $listScrollHeight = $list.get(0).scrollHeight;
      $select.on({
        blur: function blur() {
          util.removeFocusState($list);
          util.setSelectedPosition($list);
          util.setSelectedState($list);
        },
        keydown: function keydown(e) {
          var $this = $(this);
          var $selected;

          if (e.which === 9) {
            // tab
            var $focus = $('a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])');
            var $f;
            $.each($focus, function (index) {
              if ($focus[index] === $select.get(0)) {
                $f = $focus[index];
              }
            });
            util.removeFocusState($list);
            util.setSelectedPosition($list);
            $select.removeClass("open");
            $f.focus();
          } else if (e.which === 27) {
            // escape
            util.removeFocusState($list);
            util.setSelectedPosition($list);
            util.setSelectedState($list);
          } else if (e.which === 38) {
            // up
            if ($listScroll.vert) {
              $selected = $this.find(".focus").prev(); // .prev() accounts for delay in appending .focus class

              util.keyUpScroll($selected, $list, $listHeight, $listScrollHeight);
            }
          } else if (e.which === 40) {
            // down
            if ($listScroll.vert) {
              $selected = $this.find(".focus").next(); // .next() accounts for delay in appending .focus class

              util.keyDownScroll($selected, $list, $listHeight);
            }
          }
        }
      });
    }
  };
  var util = {
    checkScrollBars: function checkScrollBars(element) {
      return {
        hori: element.scrollWidth > element.clientWidth,
        vert: element.scrollHeight > element.clientHeight
      };
    },
    keyDownScroll: function keyDownScroll(selected, list, listHeight) {
      if (selected.length !== 0) {
        // calculate actual offset including margins
        var $offset = -selected.get(0).offsetTop; // get element height

        var $elementHeight = selected.outerHeight() + parseInt(selected.css("margin-top")) + parseInt(selected.css("margin-bottom")); // get minimum value to start scrolling, which is (list height - height of one item)

        var $minScrollStartValue = -listHeight + $elementHeight; // get current scroll pushdown value

        var $currentScrollValue = -(list.get(0).scrollTop - $minScrollStartValue); // set the new data attribute

        list.attr("data-scrolltop", $offset);

        if ($offset < $currentScrollValue) {
          list.animate({
            // subtract minimum scroll value from item's actual offset to set scroll position so list item is at the bottom
            scrollTop: Math.abs($offset - $minScrollStartValue)
          }, 50);
        }
      } else {
        list.attr("data-scrolltop", 0);
      }
    },
    keyUpScroll: function keyUpScroll(selected, list, listHeight, listScrollHeight) {
      if (selected.length !== 0) {
        // calculate actual offset including margins
        var $offset = -selected.get(0).offsetTop; // // get current scroll pushup value

        var $currentScrollValue = -list.get(0).scrollTop; // set the new data attribute

        list.attr("data-scrolltop", $offset);

        if ($offset > -listScrollHeight && $offset > $currentScrollValue) {
          list.animate({
            scrollTop: Math.abs($offset)
          }, 50);
        }
      } else {
        list.attr("data-scrolltop", 0);
      }
    },
    setSelectedState: function setSelectedState(element) {
      var $selected = element.find(".selected");
      return $selected.focus();
    },
    setSelectedPosition: function setSelectedPosition(element) {
      var $selected = element.find(".selected");
      $offset = $selected.get(0).offsetTop;
      return element.scrollTop($offset);
    },
    removeFocusState: function removeFocusState(element) {
      var $focus = element.find(".focus");
      return $focus.removeClass("focus");
    }
  };
  return {
    init: function init() {
      var $widgets = $(".dataWidget");

      if ($widgets.length !== 0) {
        $widgets.each(function (index) {
          var $this = $(this);
          var $type = $this.attr("data-type");
          var $selectWrapper = $this.find(".selectWrapper");

          if ($type === "single") {
            var $api = $this.attr("data-api");
            store["single" + index] = []; // set new array in the data store using type + index

            if ($api) {
              fn.fetchSingle($api, store["single" + index], $this, $selectWrapper);
            } else {
              $selectWrapper.empty().append("<p>The data attributes for this widget are incorrect and the data could not be accessed.</p>");
            }
          }

          if ($type === "filtered") {
            var $meta = $this.attr("data-filtername");
            var $filters = $this.attr("data-filterapi");
            var $data = $this.attr("data-mainapi");
            var $course = fn.getFilterValue($meta);
            store["temp" + index] = []; // set new array in the data store for temp filter data + index

            store["filtered" + index] = []; // set new array in the data store for filtered data + index

            if ($course && $filters && $data) {
              fn.fetchFiltered({
                temp: {
                  api: $filters,
                  array: store["temp" + index]
                },
                filtered: {
                  api: $data,
                  array: store["filtered" + index]
                }
              }, $course, $this, $selectWrapper);
            } else {
              $selectWrapper.empty().append("<p>The data attributes for this widget are incorrect and the data could not be accessed.</p>");
            }
          }
        });
        FastClick.attach(document.body);
      }
    }
  };
};
/* ---------------------------------------------
Events Feed
----------------------------------------------*/


var eventsFeed = function eventsFeed() {
  var $component = $("#js-eventsFeed");
  var viewportMode = windowValues.width >= breakpoints.desktop__minimum ? "desktop" : "mobile";
  var desktopMode = windowValues.width >= breakpoints.desktop__medium ? "max" : "min";
  var pageNumber = 1;
  var rowsPerPage = $component.data("rowsPerPage") || 0;
  var showAllItems = rowsPerPage === 0; // If rowsPerPage is set to 0 show all events

  var itemsPerRow = {
    max: 5,
    min: 3
  };
  var pageLength = itemsPerRow[desktopMode] * rowsPerPage;
  var showLoadMore = $component.data("showMore");
  var $loadMore;
  var $filters;
  var $filtersToggle;
  var monthSelected = false;
  var categorySelected = false;
  var $itemsWrapper;
  var $items;
  var itemMap = {
    category: {},
    months: {}
  };
  var currentItems;
  var fn = {
    checkViewportMode: function checkViewportMode() {
      requestResizeAnimation(function () {
        viewportMode = windowValues.width >= breakpoints.desktop__minimum ? "desktop" : "mobile";
      });
    },
    setVariables: function setVariables() {
      $filters = $component.find(".filters");
      $filtersToggle = $component.find(".filter-by");
      $loadMore = $component.find("#js-loadMoreEvents");
      $itemsWrapper = $component.find(".eventsContainer");
      $items = $itemsWrapper.find(".event");
    },
    createItemList: function createItemList() {
      var $filterList = $filters.find("li");
      $filterList.each(function () {
        var label = $(this).find("label").text();

        if (typeof itemMap.category[label] === "undefined") {
          itemMap.category[label.toLowerCase()] = [];
        }
      });
      var $monthFilters = $filters.find(".filter-months label");
      $monthFilters.each(function () {
        var month = $(this).data("month");

        if (typeof month !== "undefined" && typeof itemMap.months[month] === "undefined") {
          itemMap.months[month] = [];
        }
      });
      fn.mapItemList($items);
    },
    mapItemList: function mapItemList() {
      $items.each(function () {
        var $item = $(this);
        var item = this;
        var category = $item.data("category");
        var date = $item.data("date");
        /*
                Add to 'all' by default.
                */

        itemMap.category.all.push(item);

        if (typeof category !== "undefined") {
          /*
                    If the item has a listed filter, add it to it's filter
                    category.
                    */
          if (typeof itemMap.category[category.toLowerCase()] !== "undefined") {
            /*
                        Add element to categories where required.
                        */
            itemMap.category[category.toLowerCase()].push(item);
          }
        }

        if (typeof date !== "undefined") {
          var parsedDate = new Date(date);

          if (!isNaN(parsedDate)) {
            var month = parsedDate.getMonth() + 1;
            /*
                        If the item has a listed filter, add it to it's filter
                        category.
                        */

            if (typeof itemMap.months[month] !== "undefined") {
              /*
                           Add element to categories where required.
                           */
              itemMap.months[month].push(item);
            }
          }
        }
      });
    },
    resetContent: function resetContent(items) {
      pageNumber = 1;
      $itemsWrapper.empty();
      $loadMore.addClass("hidden");
      currentItems = items;
      fn.addContent(items);
    },
    addContent: function addContent(items) {
      var numberOfItems = items.length;

      if (numberOfItems !== 0) {
        items.forEach(function (item) {
          $itemsWrapper.append($(item));
        });
        /*
                Build the pagination.
                */

        fn.buildPagination(items);
      } else {
        var label = "There are currently no events.";

        if (monthSelected === true && categorySelected === false) {
          label = "There are currently no events for this month. Please select another month from the filters provided.";
        } else if (monthSelected === false && categorySelected === true) {
          label = "There are currently no events for this category. Please select another category from the filters provided.";
        } else if (monthSelected === true && categorySelected === true) {
          label = "There are currently no events for the selected category and month. Please try selecting another month or category from the filters provided.";
        }

        $itemsWrapper.append($('<div class="event">' + label + "</div>"));
      }

      if (numberOfItems < itemsPerRow[desktopMode]) {
        $itemsWrapper.addClass("isCentered");
      } else {
        $itemsWrapper.removeClass("isCentered");
      }
    },
    buildPagination: function buildPagination(items) {
      if (!showAllItems && items.length !== 0 && items.length > pageLength) {
        $(items).each(function (index) {
          if (index >= pageLength) {
            $(this).addClass("hidden");
          } else {
            $(this).removeClass("hidden");
          }
        });
        /*
                Show the load more button if it's enabled.
                */

        if (showLoadMore) {
          $loadMore.removeClass("hidden");
        }
      } else {
        /*
                If we have less items to show than the page length then show all
                items and hide the load more button.
                */
        $(items).removeClass("hidden");
        $loadMore.addClass("hidden");
      }
    },
    initLoadMore: function initLoadMore() {
      $loadMore.on("click", function (e) {
        e.preventDefault();
        fn.loadMoreItems();
      });
    },
    loadMoreItems: function loadMoreItems() {
      /*
            Mark the next row of items as visible
            */
      $(currentItems).each(function (index) {
        if (index < pageLength + itemsPerRow[desktopMode] * pageNumber) {
          $(this).removeClass("hidden");
        }
      });
      /*
            If we've loaded all of the items hide the load more button
            */

      if (currentItems.length <= pageLength + itemsPerRow[desktopMode] * pageNumber) {
        $loadMore.addClass("hidden");
      }
      /*
            Increment the page number.
            */


      pageNumber += 1;
    },
    initFilters: function initFilters() {
      fn.buildMonthDropdown();
      $filters.on("change", "input", function () {
        var $filter = $(this).parent().find("label");
        var itemsByMonth = [];
        var label = $filter.text().toLowerCase();

        if ($filter.hasClass("filter-months-labels")) {
          /*
                    If the user changed the month filter we need to filter items
                    by month.
                    */
          label = $filter.data("month");
          var selectedFilter = fn.getSelectedFilter();

          if (typeof label === "undefined") {
            monthSelected = false;
            /*
                        If we select 'all' from the months dropdown then we just
                        show all events for that category.
                        */

            fn.resetContent(itemMap.category[selectedFilter]);
          } else if (selectedFilter === "all") {
            monthSelected = true;
            /*
                        If the category filter is set to 'all' just display all
                        events from the selected month.
                        */

            fn.resetContent(itemMap.months[label]);
          } else {
            monthSelected = true;
            /*
                        If a category is selected we need to filter items in
                        that category by month.
                        */

            itemsByMonth = fn.getCategoryItemsByMonth(label, selectedFilter);
            fn.resetContent(itemsByMonth);
          }
          /*
                    Update the text on the month dropdown so that it makes it
                    clearer if there are any months selected.
                    */


          if (monthSelected) {
            fn.updateMonthDropdownText("Month: " + $filter.text());
          } else {
            fn.updateMonthDropdownText("Month");
          }
        } else if (typeof label !== "undefined") {
          var selectedMonth = fn.getSelectedMonth();

          if (label === "all") {
            categorySelected = false;
          } else {
            categorySelected = true;
          }

          if (selectedMonth === "all") {
            /*
                        If the month filter is set to 'all' just display all
                        events from the selected category.
                        */
            fn.resetContent(itemMap.category[label]);
          } else {
            /*
                        If a month is selected we need to filter items in
                        that month by the category.
                        */
            itemsByMonth = fn.getCategoryItemsByMonth(selectedMonth, label);
            fn.resetContent(itemsByMonth);
          }
        }
      });
      $filters.on("click", "input", function (e) {
        if (e.type === "click" && e.clientX !== 0 && e.clientY !== 0) {
          fn.toggleFilterDropdown($(this).parents(".filter-items").parent().find(".filter-button"));
        }
      });
    },
    buildMonthDropdown: function buildMonthDropdown() {
      var date = new Date();
      var currentMonth = date.getMonth();
      var $monthTemplate = $('<div class="filter-item filter-months-item"> <input type="radio" name="articleFilters" /> <label class="filter-months-labels filter-labels"></label></div>');
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

      for (var index = 1; index <= 12; index++) {
        var month = months[currentMonth];
        var $month = $monthTemplate.clone();
        $month.find("input").attr({
          id: "filters-months-" + month.toLowerCase(),
          value: month.toLowerCase()
        });
        $month.find("label").attr({
          "for": "filters-months-" + month.toLowerCase(),
          "data-month": currentMonth + 1
        }).text(month);
        $(".filter-months-dropdown form").append($month);
        currentMonth += 1;

        if (currentMonth > 11) {
          currentMonth = 0;
        }
      }
    },
    updateMonthDropdownText: function updateMonthDropdownText(selectedMonth) {
      $(".filter-months-button").text(selectedMonth);
    },
    getSelectedMonth: function getSelectedMonth() {
      var $label = $filters.find(".filter-months input:checked").parent().find("label");
      return $label.data("month") || $label.text().toLowerCase();
    },
    getSelectedFilter: function getSelectedFilter() {
      return $filters.find("li input:checked").parent().find("label").text().toLowerCase();
    },
    getCategoryItemsByMonth: function getCategoryItemsByMonth(month, category) {
      return itemMap.months[month].filter(function (item) {
        return itemMap.category[category].indexOf(item) !== -1;
      });
    },
    initFilterDropdowns: function initFilterDropdowns() {
      $component.on("click", ".filter-button", function (e) {
        e.preventDefault();
        var $button = $(this);
        fn.toggleFilterDropdown($button);
      });
    },
    toggleFilterDropdown: function toggleFilterDropdown($button) {
      if ($button.hasClass("open") === false) {
        $button.next(".filter-items").addClass("open");
        $button.addClass("open");
      } else {
        $button.next(".filter-items").removeClass("open");
        $button.removeClass("open");
      }
    },
    toggleFilterVisibility: function toggleFilterVisibility() {
      $filtersToggle.on({
        click: function click() {
          if (viewportMode === "mobile") {
            $filters.toggleClass("open");
          }
        }
      }); // remove all open menus on click outside of navigation

      $(document).click(function (e) {
        if (viewportMode === "mobile" && !$(e.target).closest(".filters").length) {
          $(".filters").removeClass("open");
        }
      });
    }
  };
  return {
    init: function init() {
      if ($component.length !== 0) {
        fn.checkViewportMode();
        fn.setVariables();
        fn.initFilters();
        fn.initFilterDropdowns();
        fn.toggleFilterVisibility();
        fn.createItemList();
        fn.resetContent(itemMap.category.all);
        fn.initLoadMore();
      }
    }
  };
};
/* ---------------------------------------------
Tabs - taken from course pages / modified / simplified for opt
----------------------------------------------*/


var initTabs = function initTabs() {
  var fn = {
    setClickHandlers: function setClickHandlers() {
      $(document).on("click", ".tabLinks", function (e) {
        e.preventDefault();
        var tabName = $(this)[0]["href"].split("/").pop();
        fn.openTab(tabName);
      });
    },
    openTab: function openTab(tabName) {
      var tabContainer = $(".tabLinks[href=" + tabName + "]").closest(".tabs");
      var tabLinks = $(tabContainer).children(".tabButtons").children(".tabLinks");
      var tabContent = $(tabContainer).children(".tabContent");
      /* Toggle active class to tab toggle
            ------------------------------------------- */

      $(tabLinks).each(function () {
        if ($(this).attr("href") != tabName) {
          $(this).removeClass("active");
        } else {
          $(this).addClass("active");
        }
      });
      /* Toggle open class on tab content
            ------------------------------------------- */

      $(tabContent).each(function () {
        if ($(this).attr("tab-title") != tabName) {
          $(this).hide();
        } else {
          $(this).fadeIn("200ms");
        }
      });
    }
  };
  return {
    init: function init(tabs) {
      if (tabs.length !== 0 && tabs.length !== 0) {
        fn.setClickHandlers(tabs);
      }
    }
  };
};
/* ---------------------------------------------
Staff List Code
----------------------------------------------*/


function displayStaff(list) {
  // remove alert if showing from previous search
  $(".alert").hide();
  $(".staffCount").html("");
  $(".relatedPerson").addClass("hide");

  if (list.length > 0) {
    list.forEach(function (item) {
      item.classList.remove("hide");
    }); // sort staff results alpabetically

    sortStaff();

    if (list.length > 1) {// staff filter remove
      //$(".staffPositions").show();
      //formulateCheckboxes(list);
    } else {
      $(".staffPositions").hide();
    } // show count value of staff found


    $(".staffCount").show();
    $(".staffCount").append("<p>Staff Members found by name: <span>" + list.length + "</span></p>");
  } else {
    $(".alert").show();
    $(".relatedPerson").removeClass("selected");
    $(".relatedPositions").hide();
  }
}

function formulateCheckboxes(staffList) {
  $(".positionsContainer").find("ul").html("");
  $(".relatedPositions").show();
  var positions = []; // get all staff positions

  if (staffList.length > 0) {
    $(staffList).each(function () {
      positions.push($(this).find(".relatedPersonPosition").text());
    });
  } // array of unique positions created


  var uniquePositions = uniqueStaffItems(positions); // loop through each position and formulate the checkboxes

  $.each(uniquePositions, function (index, value) {
    // replace the strings spaces with -
    var val = value.replace(/\s+/g, "-");
    var checkboxElem = "<li><input type='checkbox' name='position' id=" + val + " value=" + val + " class='checkbox'><label for=" + val + ">" + value + "</label></li>";
    $(".positionsContainer").find("ul").append(checkboxElem);
  });
  $(".checkbox").on('change', function () {
    $(this).next().toggleClass("selected");
    var category_list = [];
    $('#positionFilters :input:checked').each(function () {
      var selectedPostitions = $(this).val().replace(/\-/g, " ");
      category_list.push(selectedPostitions);
    });

    if (category_list.length > 0) {
      $(staffList).each(function () {
        var title = $(this).find(".relatedPersonPosition").text();

        if ($.inArray(title, category_list) > -1) {
          $(this).removeClass("hide");
          $(this).addClass("selected");
        } else {
          $(this).removeClass("selected");
          $(this).addClass("hide");
        }
      });
    } else {
      $(staffList).each(function () {
        $(this).removeClass("hide");
        $(this).removeClass("selected");
      });
    }
  });
}

function uniqueStaffItems(mainArray) {
  var uniqueArray = [];
  var count = 0;
  var start = false;

  for (var j = 0; j < mainArray.length; j++) {
    for (var k = 0; k < uniqueArray.length; k++) {
      if (mainArray[j] == uniqueArray[k]) {
        start = true;
      }
    }

    count++;

    if (count == 1 && start == false) {
      uniqueArray.push(mainArray[j]);
    }

    start = false;
    count = 0;
  }

  return uniqueArray;
}

function searchStaff(searchValue, defaultList) {
  $(".relatedPerson").addClass("hide");
  $(".relatedPerson").removeClass("selected"); // nodelist to array

  var staffArray = [];

  for (var i = 0; i < defaultList.length; i++) {
    staffArray.push(defaultList[i]);
  }

  ;
  var filteredArray = staffArray.filter(function (i) {
    return i.getElementsByTagName("h4")[0].textContent.toLowerCase().indexOf(searchValue.toLowerCase()) != -1;
  });
  displayStaff(filteredArray);
}

$(document).ready(function () {
  // remove staff which do not have useful information to display
  removeEmptyStaff();

  if ($(".relatedPeopleList").length) {
    // get the associated groupings links
    $(".menu-toplevel > li.has-dropdown").each(function () {
      if ($(this).text().match(/People/i)) {
        var menuItem = $(this);
        var linksList = menuItem.find('ul li'); // init obj to hold specific elements of the list elements from nav

        var arr = []; // loop through each sub menu of staff

        linksList.each(function (i) {
          // get specific elements needed from elem / remove white space etc
          var href = $(this)[0].firstChild.href;
          var text = $(this)[0].innerText.replace('\n', '').replace(/\s+/g, ' ').trim(); // create arrays of href and text for each link and add to array

          arr[i] = [href, text];
        }); // call grouping function

        displayStaffGroupings(arr);
      }
    });
    var defaultArrayList = new Array();
    var staffListItems = document.getElementsByClassName("relatedPerson");

    for (var i = 0; i < staffListItems.length; i++) {
      var x = staffListItems[i].getElementsByClassName("relatedPersonPosition")[0].textContent; // remove line breaks and - characters

      var desired = x.replace(/-/g, ' ').replace(/(\n|\r)/g, ' '); // split string into array and remove empty array items

      desired = desired.split(" ");
      var split = desired.filter(function (item) {
        return item;
      }); // join the array items back into a string

      var concat = split.join(" ");
      staffListItems[i].getElementsByClassName("relatedPersonPosition")[0].textContent = concat;
      defaultArrayList.push(staffListItems[i]);
    }

    ; // auto-alphabetically sort list

    sortStaff(); // load checkbox for all staff by default
    // staff filter remove
    //formulateCheckboxes(defaultArrayList);

    $("#staffQueryForm").submit(function (e) {
      e.preventDefault();
      var queryVal = $("#staffQuery").val();
      searchStaff(queryVal, defaultArrayList);
    });
  }
});

function displayStaffGroupings(arr) {
  // display the staff page links into the sidebar
  arr.forEach(function (entry) {
    $('.staffGroupings').find('ul').append('<li><a href="' + entry[0] + '">' + entry[1] + '</a></li>');
  }); // get current url

  var url = document.URL; // get the last url folder by slash

  var lastIndex = url.substr(url.lastIndexOf('/') + 1);
  $('.staffGroupings li a').each(function () {
    // split apart groupings hrefs
    var linkURL = $(this).attr('href').split('/'); // remove all empty strings fromm array

    var i = linkURL.filter(function (item) {
      return item;
    }); // get the last element

    var lastElement = i.pop(); // if the end of the url matches the groupped url add a class of active for styling

    if (lastElement == lastIndex) {
      $(this).addClass('active');
    }
  });
}

function removeEmptyStaff() {
  $(".relatedPeopleList .relatedPerson").each(function () {
    var findPosition = $(this).find(".relatedPersonPosition").text();

    if (findPosition === "") {
      $(this).remove();
    }
  });
}

function sortStaff() {
  $(".relatedPerson").sort(function (a, b) {
    var aRes = a.innerText.split("\n")[0].split(" ");
    var bRes = b.innerText.split("\n")[0].split(" ");
    var aLastname = aRes[aRes.length - 1].toLowerCase();
    var bLastname = bRes[bRes.length - 1].toLowerCase();

    if (aLastname < bLastname) {
      return -1;
    }

    if (aLastname > bLastname) {
      return 1;
    }

    return 0;
  }).appendTo(".relatedPeopleList");
}
/* ---------------------------------------------
Global Alert Banner
----------------------------------------------*/


function addNavClass() {
  if (document.body.contains(document.getElementById("globalAlertBanner"))) {
    document.getElementById("js-navigation").classList.add("globalAlert");
  }
}
/* ---------------------------------------------
Global Nav Banner Items check - if no items are present then add a class to the row which sets new padding
----------------------------------------------*/


if ($(".menu-toplevel").length === 0) {
  $(".navigation").find(".primary .row").addClass("no-items");
}
/* --------------------------------------------
Global scroll to links - checks to see if a scroll link is present by class and then links it together with related section
/* -------------------------------------------*/


function scrollToLinks() {
  if ($(".smooth-scroll").length > 0) {
    $(".smooth-scroll").click(function (event) {
      // stop the button from doing default purpose
      event.preventDefault(); // split the href apart into array values by /

      var hrefParts = event.target.href.split("/"); // get the last element for use with scroll link

      var hrefJumpLink = hrefParts[hrefParts.length - 1].replace("#", ""); // find the related target based on the hrefjumplink variable

      var jumpLinkTarget = $('a[name="' + hrefJumpLink + '"]'); // scroll to the relative a tag via the name specified

      $("html, body").animate({
        scrollTop: $(jumpLinkTarget).offset().top
      }, 600);
    });
  }
}
/* ------------------------------------------------------
Global MODAL - 1 per page only
--------------------------------------------------------*/


var selectors = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]";
var modal = document.querySelector(".modal");
var openModalBtn = document.querySelector(".openModal");
var closeButtonBtn = document.querySelector(".close-button");
var video = document.querySelector(".modalVid");
var sections = document.querySelectorAll(".row");

function openModal() {
  // show the modal
  modal.classList.add("show-modal");
  modal.style.display = "flex"; // Focus the first element within the modal. Make sure the element is visible and doesnt have focus disabled (tabindex=-1);

  modal.querySelector(selectors).focus();
  sections.forEach(function (section, index) {
    // Trap the tab focus by disable tabbing on all elements outside of your modal.  Because the modal is a sibling of main, this is easier. Make sure to check if the element is visible, or already has a tabindex so you can restore it when you untrap.
    var focusableElements = section.querySelectorAll(selectors);
    focusableElements.forEach(function (el) {
      el.setAttribute("tabindex", "-1");
    }); // Trap the screen reader focus as well with aria roles. This is much easier as our main and modal elements are siblings, otherwise you'd have to set aria-hidden on every screen reader focusable element not in the modal.

    modal.removeAttribute("aria-hidden");
    section.setAttribute("aria-hidden", "true");
  });
}

function closeModal() {
  video.pause(); // hide the modal

  modal.style.display = "none";
  sections.forEach(function (section, index) {
    // Untrap the tab focus by removing tabindex=-1. You should restore previous values if an element had them.
    var focusableElements = section.querySelectorAll(selectors);
    focusableElements.forEach(function (el) {
      el.removeAttribute("tabindex");
    }); // Untrap screen reader focus

    modal.setAttribute("aria-hidden", "true");
    section.removeAttribute("aria-hidden");
  }); // restore focus to the triggering element

  openModalBtn.focus();
}

function windowOnClick(event) {
  // remove modal if user clicks 'off' it
  if (event.target === modal) {
    closeModal();
  }
}

if ($(".modalWindow").length > 0) {
  openModalBtn.addEventListener("click", openModal);
  closeButtonBtn.addEventListener("click", closeModal);
  window.addEventListener("click", windowOnClick); // associated video play / pause controls

  $(".videoWrapper").click(function () {
    if ($(".modalVid").get(0).paused) {
      $(".playpause").fadeOut();
      $(".modalVid").get(0).play();
    } else {
      $(".modalVid").get(0).pause();
      $(".playpause").fadeIn();
    }
  });
}
/* ------------------------------------------------------
END - MODAL
--------------------------------------------------------*/


(function () {
  // select all elements of class youtube
  var youtube = document.querySelectorAll(".youtube-container"); // loop through each yt video on page

  var _loop = function _loop(i) {
    // get the source videos thumbnail image
    var source = "https://img.youtube.com/vi/" + youtube[i].dataset.embed + "/sddefault.jpg"; // image obj instance

    var image = new Image();
    image.src = source; // on load of instance pass through each yt videos img

    image.addEventListener("load", function () {
      youtube[i].appendChild(image);
    }(i)); // event listener added to each click 

    youtube[i].addEventListener("click", function () {
      // create iframe element for containing youtube video
      var iframe = document.createElement("iframe");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("allow", "autoplay");
      iframe.setAttribute("src", "https://www.youtube.com/embed/" + this.dataset.embed + "?autoplay=1");
      this.innerHTML = "";
      this.appendChild(iframe);
    });
  };

  for (var i = 0; i < youtube.length; i++) {
    _loop(i);
  }

  ;
})();