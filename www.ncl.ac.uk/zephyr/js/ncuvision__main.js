// breakpoints object, approximate values should be the same as in variables.less
var breakpoints = {
    mobile__portrait: 320,
    mobile__landscape: 480,
    tablet__portrait: 768,
    desktop__minimum: 960,
    tablet__landscape: 1024,
    content: 1080,
    desktop: 1366,
    desktop__medium: 1600,
};

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this;
        var args = arguments;
        var later = function() {
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
    youtubeAPIKey: 'AIzaSyAAH_WLyeIGyalKrINKwCCXzIWhQDbno_g',
    youTubePlayerIDs: [],
    youTubePlayers: [],
    breakpoints: {
        small: 480,
        medium: 768,
        large: 1025,
    },
    currentPage: 1,
};

var ugGlobals = {
    youtubeAPIKey: 'AIzaSyAAH_WLyeIGyalKrINKwCCXzIWhQDbno_g',
    courseData: [],
    courseAccordionsPopulated: false,
    searchResultsPopulated: false,
    searchOptions: {
        id: 'id',
        shouldSort: true,
        findAllMatches: true,
        includeScore: true,
        threshold: 0.1,
        location: 0,
        distance: 50000,
        maxPatternLength: 32,
        minMatchCharLength: 3,
        keys: [
            {
                name: 'id',
                weight: 1,
            },
            {
                name: 'title',
                weight: 0.9,
            },
            {
                name: 'keywords',
                weight: 0.9,
            },
            {
                name: 'qualificiation',
                weight: 0.8,
            },
            {
                name: 'classification',
                weight: 0.6,
            },
            {
                name: 'secondaryclassification',
                weight: 0.5,
            },
            {
                name: 'description',
                weight: 0.4,
            },
            {
                name: 'courseintro',
                weight: 0.4,
            },
        ],
    },
};

$(document).ready(function() {
    navigation().init();
    articleList().init();
    eventsFeed().init();

    accordion();

    getCourseData();

    initSlickSlider();
    initVideos();

    initDropdowns();

    var $body = $('body');

    $body.mousedown(function() {
        $(this).removeClass('tabHighlight');

        $('.videoOverlay').attr('tabIndex', 0);
        $('.videoGallery .slick-arrow').show();
    });

    $body.keydown(function(e) {
        if (e.which === 9) {
            // the tab key
            $(this).addClass('tabHighlight');

            $('.videoOverlay').attr('tabIndex', -1);
            $('.videoGallery .slick-arrow').hide();
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

var navigation = function() {
    // primary navigation variables
    var $navigation = $('#js-navigation');
    var $allButtons = $navigation.find('.btn');
    var $primaryNav = $navigation.find('.navigation.primary');
    var $primaryOverflow = $navigation.find('.navigation.overflow'); // overflow container
    var $primaryList = $primaryNav.find('ul');
    var $primaryListItems = $primaryList.children('li');
    var $sectionLabel = $navigation.find('.menu-label');
    var $showPrimary = $navigation.find('.btn-more');
    var $hidePrimary = $navigation.find('.btn-less');
    var $currentHeight = $primaryList.innerHeight();
    var $hiddenHeight = $primaryList.prop('scrollHeight');
    var $viewportMode = windowValues.width >= breakpoints.tablet__landscape ? 'desktop' : 'mobile';
    var minNumberNavItems = 5;

    // secondary navigation variables
    var $secondaryNav = $navigation.find('.navigation.secondary'); // required to check existence
    var $secondaryTopLevel;
    var $secondaryMenuOffset;
    var $secondaryAllLists;
    var $showSecondary;
    var $hideSecondary;
    var $backButton;
    var $accessedLevel = 0; // used to track navigation position

    var fn = {
        checkViewportMode: function() {
            // initialise variable with a value, then run check on resize
            requestResizeAnimation(function() {
                $viewportMode = windowValues.width >= breakpoints.tablet__landscape ? 'desktop' : 'mobile';
            });
        },
        setSecondaryNavVariables: function() {
            $secondaryTopLevel = $secondaryNav.find('.menu-wrapper > ul');
            $secondaryAllLists = $secondaryNav.find('ul');
            $showSecondary = $navigation.find('.btn-open');
            $hideSecondary = $navigation.find('.btn-close');
            $backButton = $navigation.find('.btn-back');
        },
        checkSecondaryMenuOffset: function() {
            $secondaryMenuOffset = $secondaryTopLevel.offset().left;
            requestResizeAnimation(function() {
                $secondaryMenuOffset = $secondaryTopLevel.offset().left;
            });
        },
        checkBackButtonVisibility: function() {
            requestResizeAnimation(function() {
                var $buttonVisible = !!$('.btn-back').hasClass('visible');
                var $menuOpen = !!$('.menu-back').attr('style');
                if ($viewportMode === 'mobile' && $buttonVisible && !$menuOpen) {
                    fn.showBackButton();
                }
                if ($viewportMode === 'desktop' && $buttonVisible && $menuOpen) {
                    $('.menu-back').removeAttr('style');
                }
            });
        },
        disableButtons: function() {
            $.each($allButtons, function() {
                var $this = $(this);
                $this.on('click', function(e) {
                    e.preventDefault();
                });
            });
        },
        primaryMenuToggle: function() {
            $showPrimary.on('click', function() {
                fn.closeAllMenus();
                $navigation.addClass('primary-open');
                fn.unlockScrolling();

                if ($viewportMode === 'mobile') {
                    var $overflowHeight = $('#js-navoverflow').prop('scrollHeight');
                    $primaryOverflow.animate(
                        {
                            height: $overflowHeight,
                        },
                        200,
                        function() {
                            $(this).css('height', 'auto');
                        }
                    );
                }
                if ($viewportMode === 'desktop') {
                    $primaryList.animate(
                        {
                            height: $hiddenHeight,
                        },
                        200,
                        function() {
                            $(this).css('height', 'auto');
                        }
                    );
                }
            });

            $hidePrimary.on('click', function() {
                $navigation.removeClass('primary-open');
                if ($viewportMode === 'mobile') {
                    fn.closeOverflowList();
                }
                if ($viewportMode === 'desktop') {
                    fn.openPrimaryList();
                }
            });
        },
        secondaryMenuToggle: function() {
            $showSecondary.on('click', function() {
                if ($viewportMode === 'mobile') {
                    fn.closeOverflowList();
                }
                if ($viewportMode === 'desktop') {
                    if ($navigation.hasClass('primary-open')) {
                        fn.openPrimaryList();
                    }
                }
                fn.closeAllMenus();
                fn.lockScrolling();
                $navigation.addClass('secondary-open');
            });

            $hideSecondary.on('click', function() {
                fn.unlockScrolling();
                $navigation.removeClass('secondary-open');
            });
        },
        searchPanelToggle: function() {
            var $searchPanel = $('#js-search-panel');
            var $searchOpen = $('#js-search-icon');

            $searchOpen.on('click', function() {
                fn.lockScrolling();
                $searchPanel.addClass('fadeIn').animate(
                    {
                        opacity: 1,
                    },
                    200
                );
            });

            $searchPanel.on('click', function(e) {
                if (e.target === this) {
                    fn.unlockScrolling();
                    $searchPanel.animate(
                        {
                            opacity: 0,
                        },
                        200,
                        function() {
                            $searchPanel.removeClass('fadeIn').removeAttr('style');
                        }
                    );
                }
            });
        },
        openPrimaryList: function() {
            $primaryList.animate(
                {
                    height: $currentHeight,
                },
                200
            );
        },
        closeOverflowList: function() {
            $primaryOverflow.animate(
                {
                    height: 0,
                },
                200,
                function() {
                    $(this).removeAttr('style');
                }
            );
        },
        initialiseLabels: function() {
            var $labelsSetOn;
            if ($viewportMode === 'desktop') {
                // change the label of the close and menu buttons to match current section
                fn.changeMenuButtonText(fn.getSectionTitle() + ' Menu');
                fn.changeCloseButtonText(fn.getSectionTitle() + ' Menu');
                $labelsSetOn = 'desktop';
            } else if ($viewportMode === 'mobile') {
                // change the label of the close and menu buttons to match current section
                fn.changeMenuButtonText('Menu');
                fn.changeCloseButtonText('Menu');
                $labelsSetOn = 'mobile';
            }
        },
        menuEnhancements: function() {
            var $lists = $secondaryNav.find('li');

            fn.initialiseLabels();
            requestResizeAnimation(function() {
                fn.initialiseLabels();
            });

            fn.changeMobileSectionLabelText(fn.getSectionTitle());

            // add an attribute to the topmost level so we can track our menu position properly
            $secondaryNav.find('ul:first').attr({
                'data-toplevel': 'true',
                'data-selected': 'true',
            });

            $.each($lists, function() {
                var $this = $(this);
                var $children = $this.find('> ul');

                if ($children.length > 0) {
                    $this.attr('data-hasChild', 'true');
                    $this
                        .find('a')
                        .first()
                        .append($('<span class="childToggle"></span>'));
                }
            });

            var $toggles = $('.childToggle');

            $.each($toggles, function() {
                var $toggle = $(this);

                $toggle.on('click', function(e) {
                    e.preventDefault();
                    $accessedLevel++;
                    var $this = $(this);
                    var $target = $this.closest('li').children('ul:first');
                    var $offset = $target.width() * $accessedLevel;
                    $target.addClass('visible');
                    fn.attachCurrentTo($target);
                    fn.showBackButton();
                    $secondaryTopLevel.animate(
                        {
                            scrollTop: 0,
                            scrollLeft: $offset,
                        },
                        200
                    );
                });
            });
        },
        backButtonSetup: function() {
            $backButton.on('click', function() {
                var $current = $('ul[data-selected]');
                $current.removeClass('visible');

                if ($accessedLevel !== 0) {
                    $accessedLevel--;
                    var $parent = fn.findParentMenu($current);
                    var $offset = $parent.width() * $accessedLevel;
                    if ($accessedLevel === 0) {
                        fn.hideBackButton();
                    }
                    fn.attachCurrentTo($parent);
                    $secondaryTopLevel.animate(
                        {
                            scrollLeft: $offset,
                        },
                        200
                    );
                }
            });
        },
        attachCurrentTo: function(target) {
            $secondaryAllLists.removeAttr('data-selected');
            return target.attr('data-selected', true);
        },
        closeAllMenus: function() {
            return $navigation.removeClass('primary-open secondary-open');
        },
        findParentMenu: function(target) {
            if (target.attr('data-toplevel')) {
                return $secondaryTopLevel;
            }
            return target.parent().closest('ul'); // parent() required to skip checking self
        },
        showBackButton: function() {
            if ($viewportMode === 'mobile') {
                var $wrapper = $('.menu-back');
                var $height = $wrapper.prop('scrollHeight');
                $wrapper.animate(
                    {
                        height: $height,
                    },
                    200
                );
            }
            if (!$backButton.hasClass('visible')) {
                return $backButton.addClass('visible');
            }
        },
        hideBackButton: function() {
            if ($viewportMode === 'mobile') {
                var $wrapper = $('.menu-back');
                $wrapper.animate(
                    {
                        height: 0,
                    },
                    200,
                    function() {
                        $wrapper.removeAttr('style');
                    }
                );
            }
            if ($backButton.hasClass('visible')) {
                return $backButton.removeClass('visible');
            }
        },
        changeMobileSectionLabelText: function(data) {
            return $sectionLabel.text(data);
        },
        changeMenuButtonText: function(data) {
            return $showSecondary.text(data);
        },
        changeCloseButtonText: function(data) {
            return $hideSecondary.text(data);
        },
        lockScrolling: function() {
            var $document = $('html, body');
            if (!$document.hasClass('noScroll')) {
                return $('html, body').addClass('noScroll');
            }
        },
        unlockScrolling: function() {
            return $('html, body').removeClass('noScroll');
        },
        getSectionTitle: function() {
            return $('.headerSecondaryLink a').text();
        },
        createOverflowNavigation: function() {
            var $mainList = $('#js-navigation .navigation.primary').find('ul');
            var $numOfItems = 0;
            var $totalSpace = 0;
            var $breakWidths = [];
            var $mobileSized = false;
            var $timer = 50;
            var $availableSpace;
            var $numOfVisibleItems;
            var $requiredSpace;

            var measure = function() {
                if ($viewportMode === 'mobile' && $mobileSized === false) {
                    setTimeout(function() {
                        $mobileSized = true;
                        var $list = $('#js-navigation .navigation.primary').find('ul');
                        var $children = $list.children();
                        $totalSpace = 0; // reset counter
                        $numOfItems = 0; // reset counter
                        $breakWidths = []; // reset array

                        $.each($children, function() {
                            var $this = $(this);
                            $totalSpace += $this.outerWidth();
                            $numOfItems += 1;
                            $breakWidths.push($totalSpace);
                        });
                    }, $timer); // delay required to recalculate after redraw
                }
                if ($viewportMode === 'desktop' && $mobileSized === true) {
                    $mobileSized = false;
                    setTimeout(function() {
                        reset();
                    }, 250); // delay required to recalculate after redraw
                }
            };

            var check = function() {
                if ($viewportMode === 'mobile') {
                    setTimeout(function() {
                        var $list = $('#js-navigation .navigation.primary').find('ul');
                        var $overflow = $('#js-navigation .navigation.overflow').find('> ul');
                        var $elements =
                            $('.headerLogo').outerWidth() +
                            $('.btn-more').outerWidth() +
                            parseInt($('.headerLogo').css('left'));
                        $availableSpace = windowValues.width - $elements;
                        $numOfVisibleItems = $list.children().length;
                        $requiredSpace = $breakWidths[$numOfVisibleItems - 1];

                        if ($requiredSpace > $availableSpace) {
                            $list
                                .children()
                                .last()
                                .prependTo($overflow);
                            $numOfVisibleItems -= 1;
                            check();
                        } else if ($availableSpace > $breakWidths[$numOfVisibleItems]) {
                            $overflow
                                .children()
                                .first()
                                .appendTo($list);
                            $numOfVisibleItems += 1;
                            check();
                        }
                    }, $timer); // delay required to recalculate after redraw
                }
            };

            var reset = function() {
                var $children = $('#js-navigation .navigation.overflow')
                    .find('> ul')
                    .children();
                var count = $children.length - 1; // adjusted for zero index
                $.each($children, function(i) {
                    var $this = $(this);
                    $this.appendTo($mainList);
                    if (count === i) {
                        $currentHeight = $primaryList.innerHeight();
                        $hiddenHeight = $primaryList.prop('scrollHeight');
                    }
                });
            };

            measure();
            check();
            requestResizeAnimation(measure);
            requestResizeAnimation(check);
        },
    };
    return {
        init: function() {
            fn.checkViewportMode();
            fn.disableButtons();

            if ($viewportMode === 'mobile' || $primaryListItems.length >= minNumberNavItems) {
                $primaryList.removeClass('fullWidthNav');
                $showPrimary.removeClass('hidden');

                fn.primaryMenuToggle();
                fn.createOverflowNavigation();
            } else {
                $primaryList.addClass('fullWidthNav');
                $showPrimary.addClass('hidden');
            }

            fn.searchPanelToggle();

            if ($secondaryNav.length !== 0) {
                fn.setSecondaryNavVariables();
                fn.checkSecondaryMenuOffset();
                fn.menuEnhancements();
                fn.secondaryMenuToggle();
                fn.backButtonSetup();
                fn.checkBackButtonVisibility();
            }
        },
    };
};

/*= =================================
    Article List & Filters
================================== */

var articleList = function() {
    var $component = $('#js-articleList');
    var $viewportMode = windowValues.width >= breakpoints.desktop__minimum ? 'desktop' : 'mobile';
    var $filters;
    var $filtersToggle;
    var $articlesWrapper;
    var $itemWrapper;
    var $itemList;
    var $paginationWrappers;
    var $pageLength = 9;
    var $featuredWrapper = $('#js-articleList .featured');

    var $itemMap = {
        filteredAll: [],
        featured: [],
    };

    var fn = {
        checkViewportMode: function() {
            // initialise variable with a value, then run check on resize
            requestResizeAnimation(function() {
                $viewportMode = windowValues.width >= breakpoints.desktop__minimum ? 'desktop' : 'mobile';
            });
        },
        setVariables: function() {
            $filters = $component.find('.filters');
            $filtersToggle = $component.find('.filter-by');
            $articlesWrapper = $component.find('.articles');
            $itemWrapper = $component.find('.list');
            $itemList = $itemWrapper.find('.item');
            $paginationWrappers = $component.find('.pagination');
        },
        createItemList: function() {
            // get the filter list
            var $filterList = $filters.find('li');

            // loop and create arrays in $itemMap
            $.each($filterList, function() {
                var $value = $(this)
                    .find('label')
                    .text()
                    .toLowerCase();
                if (typeof $itemMap[$value] === 'undefined') {
                    $itemMap[$value] = [];
                }
            });

            // pass final object to fn.mapItemList
            fn.mapItemList($itemList);
        },
        mapItemList: function(element) {
            if (element.length > 0) {
                $.each(element, function(index, obj) {
                    // fetch the filter text
                    var $label = $(obj)
                        .find('.labelText')
                        .text()
                        .toLowerCase();
                    var $featured = $(obj).hasClass('item-featured');

                    // unshift (add to end of array) to 'all' by default
                    $itemMap.all.unshift(obj);

                    // if the item has a listed filter, add it to it's filter category
                    if (typeof $itemMap[$label] !== 'undefined') {
                        // add element to categories where required
                        $itemMap.filteredAll.unshift(obj);
                        $itemMap[$label].unshift(obj);
                    }

                    // if item is featured, send to featured array
                    if ($featured === true) {
                        $itemMap.featured.unshift(obj);
                    }
                });
            }
        },
        clearInlineStyles: function() {
            requestResizeAnimation(function() {
                if ($viewportMode === 'desktop') {
                    if ($filters.hasClass('open')) {
                        $filters.removeClass('open');
                    }
                }
            });
        },
        toggleFilterVisibility: function() {
            $filtersToggle.on({
                click: function() {
                    if ($viewportMode === 'mobile') {
                        $filters.toggleClass('open');
                    }
                },
            });

            // remove all open menus on click outside of navigation
            $(document).click(function(e) {
                if ($viewportMode === 'mobile' && !$(e.target).closest('.filters').length) {
                    $('.filters').removeClass('open');
                }
            });
        },
        checkSelectedFilter: function() {
            $filters.on(
                {
                    click: function() {
                        var $this = $(this);
                        var $label = $this
                            .find('label')
                            .text()
                            .toLowerCase();
                        var $radio = $this.find('input[type="radio"]');
                        if (!$radio.is(':checked')) {
                            if ($label === 'all') {
                                fn.resetContent($itemMap.filteredAll);
                            } else {
                                fn.resetContent($itemMap[$label]);
                            }
                        }
                    },
                },
                'li'
            );

            $filters.on(
                {
                    focus: function() {
                        var $this = $(this);
                        var $label = $this
                            .siblings('label')
                            .text()
                            .toLowerCase();
                        if ($label === 'all') {
                            fn.resetContent($itemMap.filteredAll);
                        } else {
                            fn.resetContent($itemMap[$label]);
                        }
                    },
                },
                'input[type="radio"]'
            );
        },
        changeSelectedFilter: function(value) {
            var $filterList = $filters.find('li');
            $.each($filterList, function() {
                var $this = $(this);
                var $label = $this
                    .find('label')
                    .text()
                    .toLowerCase();
                var $radio = $this.find('input[type="radio"]');
                if ($label === value) {
                    $radio.prop('checked', true);
                }
            });
        },
        checkSelectedLabel: function() {
            $articlesWrapper.on(
                {
                    click: function(e) {
                        e.preventDefault();
                        var $this = $(this);
                        var $value = $this.text().toLowerCase();
                        fn.changeSelectedFilter($value);
                        fn.resetContent($itemMap[$value]);
                    },
                },
                '.labelLink'
            );
        },
        resetContent: function(contentList) {
            $itemWrapper.empty();

            $.each($paginationWrappers, function() {
                var $this = $(this);
                // remove all pagination buttons
                $this.empty();
            });

            // move to next function step
            fn.addContent(contentList);
        },
        addContent: function(contentList) {
            if (contentList.length !== 0) {
                $.each(contentList, function() {
                    $itemWrapper.append($(this));
                });

                // move to last function step
                fn.buildPagination(contentList);
            } else {
                $itemWrapper.append(
                    $(
                        '<div class="page"><div class="item noContent">There is no content available for this category to display. Please select another category from the filters provided, or <a href="#" class="js-viewAll">click here to view all available articles.</a></div></div>'
                    )
                );
            }
        },
        buildPagination: function(contentList) {
            // run only if there at least one item in the list, and it's longer than the page length
            if (contentList.length !== 0 && contentList.length > $pageLength) {
                var $counter = 0;
                var $content = [];
                var $temp = [];

                // create pages arrays
                $.each(contentList, function(index, obj) {
                    // push this item to $temp regardless
                    $temp.push(obj);

                    // if counter is lower than page length, increment
                    // else reset all and send the $temp to $content
                    if ($counter < $pageLength - 1) {
                        $counter++;
                    } else {
                        $counter = 0;
                        $content.push($temp);
                        $temp = [];
                    }

                    // if the item is the last item, send the final $temp to $content
                    if (index === contentList.length - 1) {
                        $content.push($temp);
                    }
                });

                // use pages arrays to generate wrapping markup
                $.each($content, function(i) {
                    var $this = $(this);
                    var $page = i + 1; // set correct page numbers

                    if ($page === 1) {
                        $this.wrapAll($('<div class="page" data-pagenumber="' + $page + '" data-selected="true" />'));
                    } else {
                        $this.wrapAll($('<div class="page" data-pagenumber="' + $page + '" data-selected="false" />'));
                    }
                });

                // generate pagination elements
                $.each($paginationWrappers, function() {
                    var $this = $(this);
                    var $pages = $content.length;

                    // attach previous button
                    $this.prepend(
                        '<button class="paginationButton paginationButtonPrev disabled" data-type="prev">&lt;</button>'
                    );
                    // add a numbered button for each page
                    for (var i = 1; i <= $pages; i++) {
                        var $button = $(
                            '<button class="paginationButton paginationButtonNumber" data-page="' +
                                i +
                                '">' +
                                i +
                                '</button>'
                        );
                        if (i === 1) {
                            $button.addClass('disabled').attr('data-type', 'first');
                        } else if (i === $pages) {
                            $button.attr('data-type', 'last');
                        } else {
                            $button.attr('data-type', 'number');
                        }
                        $this.append($button);
                    }
                    // attach next button
                    $this.append(
                        '<button class="paginationButton paginationButtonNext " data-type="next">&gt;</button>'
                    );
                });

                // build button mapping object
                var $buttons = {
                    all: $('.paginationButton'),
                    previous: $('.paginationButton[data-type="prev"]'),
                    first: $('.paginationButton[data-type="first"]'),
                    last: $('.paginationButton[data-type="last"]'),
                    next: $('.paginationButton[data-type="next"]'),
                };

                var $list = $('#js-articleList .list');
                var $pages = $list.find('.page');

                $.each($buttons.all, function() {
                    var $this = $(this);

                    // previous buttons
                    if ($this.attr('data-type') === 'prev') {
                        $this.on('click', function() {
                            if (!$this.hasClass('disabled')) {
                                var $current = $('#js-articleList .page[data-selected="true"]');
                                var $prev = $current.prev();
                                var $checkIfLast = $prev.prev().length;
                                var $pageNumber = $prev.attr('data-pagenumber'); // -1 for correct calculations

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
                    }

                    // back to first page buttons
                    else if ($this.attr('data-type') === 'first') {
                        $this.on('click', function() {
                            if (!$this.hasClass('disabled')) {
                                fn.removeSelectedPage($pages);
                                fn.addSelectedPage($pages.first());

                                fn.enableButtons($buttons.all);
                                fn.disableButtons($buttons.previous);
                                fn.disableButtons($buttons.first);
                            }
                        });
                    }

                    // go to last page buttons
                    else if ($this.attr('data-type') === 'last') {
                        $this.on('click', function() {
                            if (!$this.hasClass('disabled')) {
                                fn.removeSelectedPage($pages);
                                fn.addSelectedPage($pages.last());

                                fn.enableButtons($buttons.all);
                                fn.disableButtons($buttons.next);
                                fn.disableButtons($buttons.last);
                            }
                        });
                    }

                    // go to next page buttons
                    else if ($this.attr('data-type') === 'next') {
                        $this.on('click', function() {
                            if (!$this.hasClass('disabled')) {
                                var $current = $('#js-articleList .page[data-selected="true"]');
                                var $next = $current.next();
                                var $checkIfLast = $next.next().length;
                                var $pageNumber = $next.attr('data-pagenumber'); // -1 for correct calculations

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
                    }

                    // numbered page jump buttons
                    else {
                        $this.on('click', function() {
                            if (!$this.hasClass('disabled')) {
                                var $pageNumber = $(this).attr('data-page');
                                var $target = $('#js-articleList .page[data-pagenumber="' + $pageNumber + '"]');

                                fn.removeSelectedPage($pages);
                                fn.addSelectedPage($target);

                                fn.enableButtons($buttons.all);
                                fn.disableButtons($('.paginationButton[data-page="' + $pageNumber + '"]'));
                            }
                        });
                    }
                });
            }

            // run only if there at least one item in the list, and there's only one page worth of items
            if (contentList.length !== 0 && contentList.length <= $pageLength) {
                $itemWrapper.children().wrapAll($('<div class="page" />'));
            }
        },
        setCurrentFeatured: function() {
            if ($itemMap.featured.length !== 0) {
                // clone and append just the first (most recent) featured to wrapper
                var $clone = $($itemMap.featured[0]).clone();
                $featuredWrapper.append($clone);
            }
        },
        setRandomFeatured: function() {
            if ($itemMap.featured.length !== 0) {
                // get random number using featured array length, adjusted for zero index
                var $randomNumber = fn.getRandom(0, $itemMap.featured.length - 1);
                var $clone = $($itemMap.featured[$randomNumber]).clone();
                $featuredWrapper.append($clone);
            }
        },
        disableButtons: function(elements) {
            $.each(elements, function() {
                var $elem = $(this);
                $elem.addClass('disabled');
            });
        },
        enableButtons: function(elements) {
            $.each(elements, function() {
                var $elem = $(this);
                $elem.removeClass('disabled');
            });
        },
        removeSelectedPage: function(elements) {
            $.each(elements, function() {
                var $this = $(this);
                $this.attr('data-selected', false);
            });
        },
        addSelectedPage: function(elements) {
            elements.attr('data-selected', true);
        },
        enableViewAllLink: function() {
            $('#js-articleList').on(
                {
                    click: function(e) {
                        e.preventDefault();
                        fn.changeSelectedFilter('all');
                        fn.resetContent($itemMap.filteredAll);
                    },
                },
                '.js-viewAll'
            );
        },
        getRandom: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
    };

    return {
        init: function() {
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
        },
    };
};

/*= =================================
    Slick Carousel Initialisation
================================== */
function initSlickSlider() {
    var $slider = $('.slickSlider');

    if ($slider.length !== 0) {
        $.each($slider, function() {
            var $this = $(this);
            var $slides = $this.find('.slide');
            if ($slides.length > 2) {
                $this
                    .on('init', function() {
                        var $thisSlider = $(this);
                        if ($thisSlider.find('.videoSlide').length === 0) {
                            setTimeout(function() {
                                $thisSlider.removeClass('loading');
                            }, 3000);
                        }
                    })
                    .slick({
                        centerMode: true,
                        slidesToShow: 3,
                        variableWidth: true,
                        draggable: false,
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

/**
 * Initilises teh YoueTube API aysync
 * */
function initYouTube() {
    var tag = document.createElement('script');
    tag.src = '//www.youtube.com/iframe_api?apiKey=' + ugGlobals.youtubeAPIKey;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // ensure that the div the iframe replaces has a unique id
    $('.js-youtubeVid').each(function(index) {
        var id = 'video';
        $(this).attr('id', id + '_' + index);
    });
}

// keeps a records of the youtube videos that have been initialised
var youTubePlayerIDs = [];
var youTubePlayers = [];

/**
 * Called when the YouTube player API is ready
 * */
function onYouTubeIframeAPIReady() {
    var $videos = $('.youtubeVid');

    if ($videos.length !== 0) {
        initYouTubeVideos('.js-youtubeVid');
        $videos.fitVids();
    }
}

/**
 * initialises any YouTube videos on the page
 * */
function initYouTubeVideos(selector) {
    $(selector).each(function() {
        var div = $(this);
        var id = div.data('youtubeid');
        var width = div.attr('width');
        var height = div.attr('height');
        var divId = div.attr('id');

        if ($.inArray(divId, youTubePlayerIDs) === -1) {
            try {
                var player = new YT.Player(divId, {
                    videoId: id,
                    width: width,
                    height: height,
                    playerVars: {
                        rel: 0,
                        enablejsapi: 1,
                    },
                    events: {
                        onReady: onPlayerReady,
                    },
                });

                player.__divId = divId;

                youTubePlayers.push(player);
                youTubePlayerIDs.push(divId);
            } catch (ex) {
                div.html("<p class='error'>Unable to load YouTube video with ID " + id + '</p>');
            }
        }
    });
}

function initVideoOverlays() {
    $('.gallery, .videoGallery, .mediaGallery').on('click', '[data-buttonfunction="playYoutube"]', function(e) {
        e.preventDefault();

        var $overlayClicked = $(this);
        var $videoDiv = $overlayClicked.parent();
        var $videoCaption = $videoDiv.find('.caption');

        if (window.innerWidth >= 1200) {
            $videoCaption.addClass('hidden');
        }

        if ($videoDiv.hasClass('slick-current')) {
            var $videoWrapper = $videoDiv.find('.fluid-width-video-wrapper');

            handleVideoOverlayClick($overlayClicked);

            $overlayClicked.addClass('videoPlayed');
            $videoWrapper.addClass('visible');
        }
    });

    $('.mediaBlock, .slickSlider:not(.slick-initialized) .videoSlide').on(
        'click',
        '[data-buttonfunction="playYoutube"]',
        function(e) {
            e.preventDefault();
            handleVideoOverlayClick($(this));
        }
    );
}

function handleVideoOverlayClick($overlayClicked) {
    playYoutubePlayerByDivID(
        $overlayClicked
            .parent()
            .find('.js-youtubeVid')
            .first()
            .attr('id')
    );
    $overlayClicked.addClass('videoPlayed');
}

function playYoutubePlayerByDivID(id) {
    var player = getYouTubePlayerByDivID(id);
    player.playVideo();
}

function getYouTubePlayerByDivID(divId) {
    var youtubePlayer = null;

    youTubePlayers.forEach(function(player) {
        if (player.__divId === divId) {
            youtubePlayer = player;
            return true;
        }

        return false;
    });

    return youtubePlayer;
}

function onPlayerReady(player) {
    $('.slickSlider').removeClass('loading');

    $('.slick-arrow').on('click', function() {
        $('.videoOverlay').removeClass('videoPlayed');
        $('.fluid-width-video-wrapper').removeClass('visible');
        $('.caption').removeClass('hidden');

        $(youTubePlayers).each(function() {
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
    var $accordions = $('.dropDowns');
    $accordions.each(function() {
        var $accordion = $(this);

        if ($accordion.next().hasClass('dropDowns') === false) {
            $accordion.addClass('lastDropDown');
        }
    });

    /*
    Add an event listener to the accordion headings.
    */
    $('.dropDowns').on('click', '.dropDownHeading', function(e) {
        e.preventDefault();

        var $dropDownHeading = $(this);
        if ($dropDownHeading.parents('.dropDowns').hasClass('loading') === false) {
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
    $accordions.each(function() {
        var $accordion = $(this);
        if (
            $accordion.hasClass('courseDropDowns') === false &&
            $accordion.hasClass('loading') === false &&
            $accordion.data('open') === 'show'
        ) {
            var $dropDownHeading = $accordion.find('.dropDownHeading');
            var $summary = $accordion.find('.dropDownSummary');

            toggleAccordion($dropDownHeading, $summary);
        }
    });
}

function toggleAccordion($accordion, $summary) {
    if ($accordion.hasClass('dropDownOpen')) {
        $accordion.removeClass('dropDownOpen');
        $summary.slideUp();
    } else {
        $accordion.addClass('dropDownOpen');
        $summary.slideDown();
        lazyloadAccordionImages($accordion.next());
    }
}

function lazyloadAccordionImages($summary) {
    $summary.find('img').each(function() {
        var $img = $(this);

        if (
            (typeof $img.attr('src') === 'undefined' || $img.attr('src') === '#') &&
            typeof $img.data('imgSrc') !== 'undefined'
        ) {
            $img.attr('src', $img.data('imgSrc'));
        }
    });
}

/* ---------------------------------------------
Course Accordion
----------------------------------------------*/
function initCourseAccordions() {
    var $courseAccordions = $('.courseDropDowns');

    /*
    If we have some course accordions on the page we need to fetch the course
    data.
    */
    if ($courseAccordions.length > 0) {
        populateCourseAccordions($courseAccordions);

        /*
        Add an event listener to the accordion toggles.
        */
        $('.dropDownSummary').on('click', '.courseMore, .courseLess, .toggle', function(e) {
            e.preventDefault();

            toggleCourseAccordion($(this).parents('.course'));
        });
    }
}

function populateCourseAccordions($courseAccordions) {
    var classifications = [];
    var courses = ugGlobals.courseData;
    var filteredCourses = {};

    /*
    Get a list of all course subject areas that we have on the page.
    */
    $courseAccordions.each(function() {
        var $courseAccordion = $(this);

        classifications.push($courseAccordion.data('subjectArea'));
    });

    /*
    Filter all of the courses to just those which match the subject areas we're
    looking for.
    */

    classifications.forEach(function(val) {
        var $array = [];

        courses.forEach(function(subject) {
            var $course = subject;
            var $classification = subject.classification;

            if ($classification.search(val) !== -1) {
                return $array.push($course);
            }
        });

        filteredCourses[val] = $array;
    });

    /*
    Find the course placeholder element, clone it, and then remove it.
    */
    var $coursePlaceholders = $courseAccordions.find('.course.placeholder');
    var $coursePlaceholder = $coursePlaceholders.first();
    $coursePlaceholders.remove();

    /*
    Loop through the filtered courses and append the data to the relevant course
    accordion dropdown.
    */

    for (var key in filteredCourses) {
        for (var obj in filteredCourses[key]) {
            $('.dropDowns[data-subject-area="' + key + '"]')
                .find('.dropDownSummary')
                .append(createCourseElement($coursePlaceholder, filteredCourses[key][obj]));
        }
    }

    /*
    Once all of the course data has been added to the page we can remove the
    loading classes from the course accordions.
    */
    $courseAccordions
        .removeClass('loading')
        .find('.dropDownSummary')
        .removeClass('loading');

    /*
    Set a flag to say accordions have all been populated to prevent it being
    populated again if another call to the api is made.
    */
    ugGlobals.courseAccordionsPopulated = true;

    /*
    Check to see if we have any course accordions to be opened by default.
    */
    openCourseAccordions($courseAccordions);
}

function openCourseAccordions($accordions) {
    $accordions.each(function() {
        var $accordion = $(this);
        if (
            $accordion.hasClass('courseDropDowns') === true &&
            $accordion.hasClass('loading') === false &&
            $accordion.data('open') === 'show'
        ) {
            var $dropDownHeading = $accordion.find('.dropDownHeading');
            var $summary = $accordion.find('.dropDownSummary');

            toggleAccordion($dropDownHeading, $summary);
        }
    });
}

function createCourseElement($coursePlaceholder, course) {
    var $course = $coursePlaceholder.clone();

    /*
    Remove the placeholder class.
    */
    $course.removeClass('placeholder');

    /*
    Update the course image.
    */
    $course
        .find('.courseImage')
        .first()
        .data('imgSrc', course.thumbnail)
        .attr({
            alt: course.title,
            src: '#',
        });

    /*
    Update the course UCAS code.
    */
    $course
        .find('.ucasCode')
        .first()
        .text(course.id);

    /*
    Update the course name.
    */
    $course
        .find('.courseName')
        .first()
        .text(course.title);

    /*
    Update the course qualification.
    */
    $course
        .find('.courseQual')
        .first()
        .text(course.qualification);

    /*
    Update the course summary.
    */
    $course
        .find('.courseSummary')
        .first()
        .text(decodeURIComponent(course.description));

    /*
    Update the course entry requirements.
    */
    $course
        .find('.courseEntryRequirements')
        .first()
        .text(decodeURIComponent(course.entryrequirements));

    /*
    Update the course opportunities.
    */
    $course
        .find('.courseOpportunities')
        .first()
        .text(course.coursetypecheckboxes);

    /*
    Update the course UCAS details.
    */
    $course
        .find('.courseUcasCodes')
        .first()
        .text('NEWC, ' + course.id);

    /*
    Update the course duration.
    */
    $course
        .find('.courseDuration')
        .first()
        .text(course.length);

    /*
    Update the course description.
    */
    $course
        .find('.courseDescription')
        .first()
        .html(decodeURIComponent(course.courseintro));

    /*
    Update the course download.
    */
    $course
        .find('.courseDownload a')
        .first()
        .attr('href', 'https://' + course.shorturl);

    return $course;
}

function toggleCourseAccordion($course) {
    var $courseDetails = $course.find('.courseDetails');
    var $courseButtons = $course.find('.courseMore');

    $courseButtons.toggleClass('hidden');
    $courseDetails.slideToggle(400);
}

/* ---------------------------------------------
    Dual Panel
 */
// function to identify if the dual panel has a breakout image
function dualPanelBreakoutImage() {
    $('.dualPanel').each(function() {
        var parent = $(this);
        if (parent.find('.image-container').length > 0) {
            parent.addClass('breakout-container');
        }
    });
}
/* ---------------------------------------------
Search Results
----------------------------------------------*/
function initCourseSearch($courseSearch) {
    var $form = $courseSearch.find('form');
    var fuse = new Fuse(ugGlobals.courseData, ugGlobals.searchOptions);

    $form.on('submit', function(e) {
        e.preventDefault();
    });

    $('.searchSubmit').on('click', function(e) {
        e.preventDefault();

        var $searchButton = $(this);
        var $input = $searchButton.prev();
        var value = $input.val();
        var hideResults = $searchButton.hasClass('close');

        handleFormSearch($input, value, hideResults, fuse);
    });

    $('#js-searchBoxInput, .search.heroSearch').on('keyup', function(e) {
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
    var $searchButton = $results.parent().find('.searchSubmit');

    if (hideResults === true) {
        clearSearchResults($results);

        $input.val('');
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
        $searchButton.addClass('close');
    }
}

function getResultsContainer($input) {
    var $results = '';

    if ($input.hasClass('heroSearch')) {
        $results = $input.parent().find('.results');
    } else {
        $results = $input.parents('.courseSearch').find('.results');
    }

    return $results;
}

function populateSearchResults() {
    var courses = ugGlobals.courseData;
    var $form = $('.courseSearch form');
    var $searchResults = '';
    var $headerSearchForm = $('.search.heroSearch').parent();
    var $headerSearchResults = '';

    if ($form.length === 1) {
        if ($form.next('.results').length === 0) {
            $form.after('<div class="results hidden loading"><ul></ul></div>');
        }

        $searchResults = $form.next('.results').find('ul');
        $searchResults.empty();
    }

    if ($headerSearchForm.length === 1) {
        if ($headerSearchForm.find('.results').length === 0) {
            $headerSearchForm.append('<div class="results resultsHeader hidden loading"><ul></ul></div>');
        }

        $headerSearchResults = $headerSearchForm.find('.results ul');
        $headerSearchResults.empty();
    }

    courses.forEach(function(course) {
        var courseHtml =
            '<li class="result hidden" data-course-id="' +
            course.id +
            '">' +
            '<div class="details">' +
            '<a class="resultLink" href="https://' +
            course.shorturl +
            '">' +
            course.title +
            ' - ' +
            course.qualification +
            ' (' +
            course.id +
            ')' +
            '</a>' +
            '</div>' +
            '</li>';

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
    var $results = $resultsContainer.find('.result');
    var results = fuse.search(value);
    var resultIds = [];
    var $searchButton = $resultsContainer.parent().find('.searchSubmit');

    results.forEach(function(result) {
        if (result.item !== 'No Code') {
            resultIds.push(result.item);
        }
    });

    $resultsContainer.addClass('loading');
    $results.addClass('hidden');

    if (resultIds.length > 0) {
        $results.each(function() {
            var $result = $(this);
            var id = $result.data('courseId');

            if (resultIds.indexOf(id) !== -1) {
                $result.removeClass('hidden');
            }
        });

        $resultsContainer.removeClass('hidden loading');
        $searchButton.addClass('close');
    } else {
        $resultsContainer.addClass('hidden loading');
        $searchButton.removeClass('close');
    }
}

function clearSearchResults($results) {
    var $searchWrapper = $results.parent();
    var $searchButton = $searchWrapper.find('.searchSubmit');

    $results.addClass('hidden loading');
    $searchButton.removeClass('close');
}

/* ---------------------------------------------
Course Data
----------------------------------------------*/
function getCourseData() {
    var $search = $('#searchBox, .heroSearch');
    var $courseAccordions = $('.courseDropDowns');

    if (($search.length !== 0 || $courseAccordions.length !== 0) && ugGlobals.courseData.length === 0) {
        /*
        Get course data from JSON endpoint.
        */
        $.getJSON('/data/mobile/ugcoursedata/json/index.json')
            .done(function(data) {
                ugGlobals.courseData = data.courses.sort(function(a, b) {
                    /*
                    Sort course data by title and qualification.
                    */
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
            .fail(function() {
                console.error('error loading course data!');
            });
    }
}

function getCourseDataCallback() {
    /*
    Populate the course search results dropdown if they haven't already been
    populated.
    */
    var $courseSearch = $('.courseSearch, .search.heroSearch');
    if (ugGlobals.searchResultsPopulated === false && $courseSearch.length !== 0) {
        initCourseSearch($courseSearch);
    }

    /*
    Populate course accordions if we have some on the page and they haven't
    already been populated.
    */
    var $courseAccordions = $('.courseDropDowns');
    if (ugGlobals.courseAccordionsPopulated === false && $courseAccordions.length !== 0) {
        initCourseAccordions();
    }
}
/* ---------------------------------------------
DROPDOWN: Dropdown Content Blocks
----------------------------------------------*/
function initDropdowns() {
    var dropdownToOpen = window.location.hash;
    var dropdownDiv = $(dropdownToOpen);
    var dropDownToggle = $('[data-buttonfunction="toggleDropdown"]', dropdownDiv);
    var dropDownSummary = dropDownToggle.next();

    dropDownToggle.addClass('dropdownOpen');
    dropDownSummary.slideDown();

    $('[data-buttonfunction="toggleDropdown"]').click(function(e) {
        e.preventDefault();

        dropDownToggle = $(this);
        dropDownSummary = dropDownToggle.next();

        if (dropDownToggle.hasClass('dropdownOpen')) {
            dropDownToggle.removeClass('dropdownOpen');
            dropDownSummary.slideUp();
        } else {
            dropDownToggle.addClass('dropdownOpen');
            dropDownSummary.slideDown();
        }
    });
}

/* ---------------------------------------------
RELATED PEOPLE: Related People Pagination
----------------------------------------------*/
function initRelatedPeople() {
    var $relatedPeople = $('#js-relatedPeopleContainer');
    var $paginationContainer = $('#js-relatedPeoplePagination');

    if ($relatedPeople.length === 1) {
        var $people = $relatedPeople.find('.relatedPerson');
        var totalPeople = $people.length;
        var totalPeoplePerPage = 5;
        var previousTotalPeoplePerPage = 5;
        var totalNumPages = 1;

        var updatePage = function(page) {
            /*
            Update the current page depending on which pagination button was
            clicked.
            */
            if (sacsGlobals.currentPage < totalNumPages && page === 'next') {
                sacsGlobals.currentPage += 1;
            } else if (sacsGlobals.currentPage > 1 && page === 'prev') {
                sacsGlobals.currentPage -= 1;
            } else if (typeof page === 'number') {
                sacsGlobals.currentPage = page;
            }

            /*
            Update the disabled pagination buttons.
            */
            $paginationContainer.find('.paginationButtonNumber').removeClass('disabled');
            $paginationContainer
                .find('.paginationButtonNumber[data-page="' + sacsGlobals.currentPage + '"]')
                .addClass('disabled');

            if (sacsGlobals.currentPage === totalNumPages) {
                $paginationContainer.find('.paginationButtonNext').addClass('disabled');
            } else {
                $paginationContainer.find('.paginationButtonNext').removeClass('disabled');
            }

            if (sacsGlobals.currentPage === 1) {
                $paginationContainer.find('.paginationButtonPrev').addClass('disabled');
            } else {
                $paginationContainer.find('.paginationButtonPrev').removeClass('disabled');
            }

            /*
            Update which people are visible.
            */
            updateVisiblePeople();
        };

        var updateVisiblePeople = function() {
            /*
            Loop through each person and hide/show the relevant blocks;
            */
            $people.each(function(index) {
                var personIndex = index + 1;
                var page = sacsGlobals.currentPage;

                if (page === 1 && personIndex > totalPeoplePerPage) {
                    /*
                    If first page is selected hide anything after that page.
                    */
                    $(this).addClass('hidden');
                } else if (
                    (page > 1 && personIndex <= (page - 1) * totalPeoplePerPage) ||
                    personIndex > page * totalPeoplePerPage
                ) {
                    /*
                    Hides people before the current page
                    */
                    $(this).addClass('hidden');
                } else if (
                    page > 1 &&
                    personIndex > (page - 1) * totalPeoplePerPage &&
                    personIndex <= page * totalPeoplePerPage
                ) {
                    /*
                    Shows people on the current page
                    */
                    $(this).removeClass('hidden');
                } else {
                    /*
                    Show all remaining pages
                    */
                    $(this).removeClass('hidden');
                }
            });
        };

        var updatePerPage = function() {
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

        var updateTotalPages = function(people, perPage) {
            /*
            Updated the total number of pages required.
            */
            return Math.ceil(people / perPage);
        };

        var updatePaginationButtons = function() {
            /*
            Remove any old buttons in the container.
            */
            $paginationContainer.html('');

            /*
            Add the prev button.
            */
            var buttonClass = sacsGlobals.currentPage === 1 ? 'disabled' : '';
            $paginationContainer.append(
                '<button class="paginationButton paginationButtonPrev ' + buttonClass + '" data-page="prev"><</button>'
            );

            /*
            Add a button for each page.
            */
            for (var i = 1; i <= totalNumPages; i += 1) {
                buttonClass = sacsGlobals.currentPage === i ? 'disabled' : '';
                $paginationContainer.append(
                    '<button class="paginationButton paginationButtonNumber ' +
                        buttonClass +
                        '" data-page="' +
                        i +
                        '">' +
                        i +
                        '</button>'
                );
            }

            /*
            Add the next button.
            */
            buttonClass = sacsGlobals.currentPage === totalNumPages ? 'disabled' : '';
            $paginationContainer.append(
                '<button class="paginationButton paginationButtonNext ' + buttonClass + '" data-page="next">></button>'
            );
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
            $paginationContainer.on('click', '.paginationButton:not(.disabled)', function(e) {
                e.preventDefault();
                updatePage($(this).data('page'));
            });
        }

        /*
        Remove loading class from the relatedPeople container.
        */
        $relatedPeople.removeClass('loading');

        /*
        Pagination also needs updating on the window resizing so we need to add
        update everything when the window resizes.
        */
        $(window).resize(function() {
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
                    $paginationContainer.html('');
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
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        };
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
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

    init: function() {
        responsiveTables.setup();
        responsiveTables.applyScroll();
    },

    /*
    Loop through each table and store the following data: row count, column
    count, is there a header row, and is there a column row.
    */
    setup: function() {
        $('.textArea table').each(function(index) {
            var $table = $(this);
            $table.wrap('<div id="responsiveTable' + index + '" class="responsiveTable"></div>');

            responsiveTables.tables['responsiveTable' + index] = {
                columns: responsiveTables.getColumns($table),
                headerColumn: responsiveTables.isHeaderColumn($table),
                headerRow: responsiveTables.isHeaderRow($table),
                rows: responsiveTables.getRows($table),
            };
        });
    },

    /*
    Returns the number of rows in a table.
    *** Currently it doesn't take into account any rowspan attributes ***
    */
    getRows: function($table) {
        return $table.find('tr').length;
    },

    /*
    Returns the number of columns in a table.
    *** Currently it doesn't take into account any colspan attributes ***
    */
    getColumns: function($table) {
        return $table.find('tr:last td').length;
    },

    /*
    Checks to see if the table has a header row at the top.
    */
    isHeaderRow: function($table) {
        if ($table.find('tr:first th').length && !$table.find('tr:first td').length) {
            return true;
        }

        return false;
    },

    /*
    Checks to see if the table has a header column on the left.
    */
    isHeaderColumn: function($table) {
        var isTableHeader = true;
        $table.find('tr').each(function() {
            if (!$(this).children('th').length) {
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
    applyScroll: function() {
        Object.keys(responsiveTables.tables).forEach(function(key) {
            /*
            Only apply the scrolling if the table has more than one column or if
            the table has the headers on the left column.
            */
            if (responsiveTables.tables[key].columns > 1 || responsiveTables.tables[key].headerColumn) {
                $('#' + key)
                    .addClass('scroll')
                    .attr({
                        'aria-label': 'Table',
                        role: 'region',
                        tabindex: '0',
                    });
            }
        });
    },
};

var dataWidgets = function() {
    var store = {};

    var fn = {
        // function to get course code from <meta> in head
        getFilterValue: function(name) {
            var $meta = $('meta[name="' + name + '"]');
            if ($meta.length !== 0) return $meta.attr('content');
        },
        fetchSingle: function(url, dataStore, parent, selectWrap) {
            $.getJSON(url)
                .done(function(data) {
                    data.options.forEach(function(elem) {
                        dataStore.push(elem);
                    });
                    if (parent !== null) {
                        return fn.buildOptionList(dataStore, parent);
                    }
                })
                .fail(function(e) {
                    $(selectWrap)
                        .empty()
                        .append('<p>There was an error accessing the data API: ' + e.statusText + '</p>');
                });
        },
        fetchFiltered: function(array, filterCode, parent, selectWrap) {
            return fn.fetchFilterCode(array.temp, array.filtered, filterCode, parent, selectWrap);
        },
        fetchFilterCode: function(arr, nextarr, filterCode, parent, selectWrap) {
            var $filter = [];

            $.getJSON(arr.api)
                .done(function(data) {
                    data.options.forEach(function(elem) {
                        arr.array.push(elem);
                    });

                    $filter = arr.array.filter(function(elem) {
                        if (elem.name === filterCode) return elem;
                    });

                    if ($filter.length !== 0)
                        return fn.fetchFilteredData(nextarr, $filter[0].filter, parent, selectWrap);
                })
                .fail(function(e) {
                    $(selectWrap)
                        .empty()
                        .append('<p>There was an error accessing the data API: ' + e.statusText + '</p>');
                });
        },
        fetchFilteredData: function(arr, filter, parent, selectWrap) {
            var $bands = [];

            $.getJSON(arr.api)
                .done(function(data) {
                    data.options.forEach(function(elem) {
                        $bands.push(elem);
                    });

                    $bands.forEach(function(elem) {
                        if (elem.filter === filter) arr.array.push(elem);
                    });

                    return fn.buildOptionList(arr.array, parent);
                })
                .fail(function(e) {
                    $(selectWrap)
                        .empty()
                        .append('<p>There was an error accessing the data API: ' + e.statusText + '</p>');
                });
        },
        buildOptionList: function(arr, parent) {
            var $select = parent.find('select');
            arr.forEach(function(elem) {
                $('<option value="' + elem.name + '">' + elem.name + '</option>').appendTo($select);
            });
            return fn.initSelect(arr, parent);
        },
        initSelect: function(arr, parent) {
            var $select = parent.find('select:not(.ignore)');
            var $info = parent.find('.infoWrapper');
            $select.niceSelect();

            $select.on('change', function() {
                var $this = $(this);
                var $value = $this.find(':selected').attr('value');

                if ($value !== undefined) {
                    var $data = arr.filter(function(itm) {
                        if (itm.name === $value) return itm;
                    });

                    return $info
                        .empty()
                        .append($data[0].value)
                        .css('display', 'block');
                }
                return $info.empty().attr('style', '');
            });

            $select.each(function() {
                fn.initKeyboardNavigation(parent);
            });
        },
        initKeyboardNavigation: function(parent) {
            var $parent = parent;
            var $select = $parent.find('.nice-select');
            var $list = $parent.find('.list');
            var $listScroll = util.checkScrollBars($list.get(0));
            var $listHeight = $list.outerHeight();
            var $listScrollHeight = $list.get(0).scrollHeight;

            $select.on({
                blur: function() {
                    util.removeFocusState($list);
                    util.setSelectedPosition($list);
                    util.setSelectedState($list);
                },

                keydown: function(e) {
                    var $this = $(this);

                    if (e.which === 9) {
                        // tab

                        var $focus = $(
                            'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])'
                        );
                        var $f;
                        $.each($focus, function(index) {
                            if ($focus[index] === $select.get(0)) {
                                $f = $focus[index];
                            }
                        });

                        util.removeFocusState($list);
                        util.setSelectedPosition($list);
                        $select.removeClass('open');
                        $f.focus();
                    } else if (e.which === 27) {
                        // escape

                        util.removeFocusState($list);
                        util.setSelectedPosition($list);
                        util.setSelectedState($list);
                    } else if (e.which === 38) {
                        // up

                        if ($listScroll.vert) {
                            var $selected = $this.find('.focus').prev(); // .prev() accounts for delay in appending .focus class
                            util.keyUpScroll($selected, $list, $listHeight, $listScrollHeight);
                        }
                    } else if (e.which === 40) {
                        // down

                        if ($listScroll.vert) {
                            var $selected = $this.find('.focus').next(); // .next() accounts for delay in appending .focus class
                            util.keyDownScroll($selected, $list, $listHeight);
                        }
                    }
                },
            });
        },
    };

    var util = {
        checkScrollBars: function(element) {
            return {
                hori: element.scrollWidth > element.clientWidth,
                vert: element.scrollHeight > element.clientHeight,
            };
        },
        keyDownScroll: function(selected, list, listHeight) {
            if (selected.length !== 0) {
                // calculate actual offset including margins
                var $offset = -selected.get(0).offsetTop;
                // get element height
                var $elementHeight =
                    selected.outerHeight() +
                    parseInt(selected.css('margin-top')) +
                    parseInt(selected.css('margin-bottom'));
                // get minimum value to start scrolling, which is (list height - height of one item)
                var $minScrollStartValue = -listHeight + $elementHeight;
                // get current scroll pushdown value
                var $currentScrollValue = -(list.get(0).scrollTop - $minScrollStartValue);

                // set the new data attribute
                list.attr('data-scrolltop', $offset);

                if ($offset < $currentScrollValue) {
                    list.animate(
                        {
                            // subtract minimum scroll value from item's actual offset to set scroll position so list item is at the bottom
                            scrollTop: Math.abs($offset - $minScrollStartValue),
                        },
                        50
                    );
                }
            } else {
                list.attr('data-scrolltop', 0);
            }
        },
        keyUpScroll: function(selected, list, listHeight, listScrollHeight) {
            if (selected.length !== 0) {
                // calculate actual offset including margins
                var $offset = -selected.get(0).offsetTop;
                // // get current scroll pushup value
                var $currentScrollValue = -list.get(0).scrollTop;

                // set the new data attribute
                list.attr('data-scrolltop', $offset);

                if ($offset > -listScrollHeight && $offset > $currentScrollValue) {
                    list.animate(
                        {
                            scrollTop: Math.abs($offset),
                        },
                        50
                    );
                }
            } else {
                list.attr('data-scrolltop', 0);
            }
        },
        setSelectedState: function(element) {
            var $selected = element.find('.selected');
            return $selected.focus();
        },
        setSelectedPosition: function(element) {
            var $selected = element.find('.selected');
            $offset = $selected.get(0).offsetTop;
            return element.scrollTop($offset);
        },
        removeFocusState: function(element) {
            var $focus = element.find('.focus');
            return $focus.removeClass('focus');
        },
    };

    return {
        init: function() {
            var $widgets = $('.dataWidget');

            if ($widgets.length !== 0) {
                $widgets.each(function(index) {
                    var $this = $(this);
                    var $type = $this.attr('data-type');
                    var $selectWrapper = $this.find('.selectWrapper');

                    if ($type === 'single') {
                        var $api = $this.attr('data-api');
                        store['single' + index] = []; // set new array in the data store using type + index

                        if ($api) {
                            fn.fetchSingle($api, store['single' + index], $this, $selectWrapper);
                        } else {
                            $selectWrapper
                                .empty()
                                .append(
                                    '<p>The data attributes for this widget are incorrect and the data could not be accessed.</p>'
                                );
                        }
                    }
                    if ($type === 'filtered') {
                        var $meta = $this.attr('data-filtername');
                        var $filters = $this.attr('data-filterapi');
                        var $data = $this.attr('data-mainapi');
                        var $course = fn.getFilterValue($meta);

                        store['temp' + index] = []; // set new array in the data store for temp filter data + index
                        store['filtered' + index] = []; // set new array in the data store for filtered data + index

                        if ($course && $filters && $data) {
                            fn.fetchFiltered(
                                {
                                    temp: {
                                        api: $filters,
                                        array: store['temp' + index],
                                    },
                                    filtered: {
                                        api: $data,
                                        array: store['filtered' + index],
                                    },
                                },
                                $course,
                                $this,
                                $selectWrapper
                            );
                        } else {
                            $selectWrapper
                                .empty()
                                .append(
                                    '<p>The data attributes for this widget are incorrect and the data could not be accessed.</p>'
                                );
                        }
                    }
                });
                FastClick.attach(document.body);
            }
        },
    };
};

/* ---------------------------------------------
Events Feed
----------------------------------------------*/
var eventsFeed = function() {
    var $component = $('#js-eventsFeed');

    var viewportMode = windowValues.width >= breakpoints.desktop__minimum ? 'desktop' : 'mobile';
    var desktopMode = windowValues.width >= breakpoints.desktop__medium ? 'max' : 'min';
    var pageNumber = 1;
    var rowsPerPage = $component.data('rowsPerPage') || 0;
    var showAllItems = rowsPerPage === 0; // If rowsPerPage is set to 0 show all events
    var itemsPerRow = {
        max: 5,
        min: 3,
    };
    var pageLength = itemsPerRow[desktopMode] * rowsPerPage;
    var showLoadMore = $component.data('showMore');
    var $loadMore;

    var $filters;
    var $filtersToggle;

    var monthSelected = false;
    var categorySelected = false;

    var $itemsWrapper;
    var $items;
    var itemMap = { category: {}, months: {} };
    var currentItems;

    var fn = {
        checkViewportMode: function() {
            requestResizeAnimation(function() {
                viewportMode = windowValues.width >= breakpoints.desktop__minimum ? 'desktop' : 'mobile';
            });
        },

        setVariables: function() {
            $filters = $component.find('.filters');
            $filtersToggle = $component.find('.filter-by');
            $loadMore = $component.find('#js-loadMoreEvents');
            $itemsWrapper = $component.find('.eventsContainer');
            $items = $itemsWrapper.find('.event');
        },

        createItemList: function() {
            var $filterList = $filters.find('li');

            $filterList.each(function() {
                var label = $(this)
                    .find('label')
                    .text();

                if (typeof itemMap.category[label] === 'undefined') {
                    itemMap.category[label.toLowerCase()] = [];
                }
            });

            var $monthFilters = $filters.find('.filter-months label');

            $monthFilters.each(function() {
                var month = $(this).data('month');

                if (typeof month !== 'undefined' && typeof itemMap.months[month] === 'undefined') {
                    itemMap.months[month] = [];
                }
            });

            fn.mapItemList($items);
        },

        mapItemList: function() {
            $items.each(function() {
                var $item = $(this);
                var item = this;
                var category = $item.data('category');
                var date = $item.data('date');

                /*
                Add to 'all' by default.
                */
                itemMap.category.all.push(item);

                if (typeof category !== 'undefined') {
                    /*
                    If the item has a listed filter, add it to it's filter
                    category.
                    */
                    if (typeof itemMap.category[category.toLowerCase()] !== 'undefined') {
                        /*
                        Add element to categories where required.
                        */
                        itemMap.category[category.toLowerCase()].push(item);
                    }
                }

                if (typeof date !== 'undefined') {
                    var parsedDate = new Date(date);

                    if (!isNaN(parsedDate)) {
                        var month = parsedDate.getMonth() + 1;
                        /*
                        If the item has a listed filter, add it to it's filter
                        category.
                        */
                        if (typeof itemMap.months[month] !== 'undefined') {
                            /*
                           Add element to categories where required.
                           */
                            itemMap.months[month].push(item);
                        }
                    }
                }
            });
        },

        resetContent: function(items) {
            pageNumber = 1;
            $itemsWrapper.empty();
            $loadMore.addClass('hidden');
            currentItems = items;

            fn.addContent(items);
        },

        addContent: function(items) {
            var numberOfItems = items.length;

            if (numberOfItems !== 0) {
                items.forEach(function(item) {
                    $itemsWrapper.append($(item));
                });

                /*
                Build the pagination.
                */
                fn.buildPagination(items);
            } else {
                var label = 'There are currently no events.';

                if (monthSelected === true && categorySelected === false) {
                    label =
                        'There are currently no events for this month. Please select another month from the filters provided.';
                } else if (monthSelected === false && categorySelected === true) {
                    label =
                        'There are currently no events for this category. Please select another category from the filters provided.';
                } else if (monthSelected === true && categorySelected === true) {
                    label =
                        'There are currently no events for the selected category and month. Please try selecting another month or category from the filters provided.';
                }

                $itemsWrapper.append($('<div class="event">' + label + '</div>'));
            }

            if (numberOfItems < itemsPerRow[desktopMode]) {
                $itemsWrapper.addClass('isCentered');
            } else {
                $itemsWrapper.removeClass('isCentered');
            }
        },

        buildPagination: function(items) {
            if (!showAllItems && items.length !== 0 && items.length > pageLength) {
                $(items).each(function(index) {
                    if (index >= pageLength) {
                        $(this).addClass('hidden');
                    } else {
                        $(this).removeClass('hidden');
                    }
                });

                /*
                Show the load more button if it's enabled.
                */
                if (showLoadMore) {
                    $loadMore.removeClass('hidden');
                }
            } else {
                /*
                If we have less items to show than the page length then show all
                items and hide the load more button.
                */
                $(items).removeClass('hidden');
                $loadMore.addClass('hidden');
            }
        },

        initLoadMore: function() {
            $loadMore.on('click', function(e) {
                e.preventDefault();

                fn.loadMoreItems();
            });
        },

        loadMoreItems: function() {
            /*
            Mark the next row of items as visible
            */
            $(currentItems).each(function(index) {
                if (index < pageLength + itemsPerRow[desktopMode] * pageNumber) {
                    $(this).removeClass('hidden');
                }
            });

            /*
            If we've loaded all of the items hide the load more button
            */
            if (currentItems.length <= pageLength + itemsPerRow[desktopMode] * pageNumber) {
                $loadMore.addClass('hidden');
            }

            /*
            Increment the page number.
            */
            pageNumber += 1;
        },

        initFilters: function() {
            fn.buildMonthDropdown();

            $filters.on('change', 'input', function() {
                var $filter = $(this)
                    .parent()
                    .find('label');

                var itemsByMonth = [];
                var label = $filter.text().toLowerCase();

                if ($filter.hasClass('filter-months-labels')) {
                    /*
                    If the user changed the month filter we need to filter items
                    by month.
                    */
                    label = $filter.data('month');

                    var selectedFilter = fn.getSelectedFilter();

                    if (typeof label === 'undefined') {
                        monthSelected = false;
                        /*
                        If we select 'all' from the months dropdown then we just
                        show all events for that category.
                        */
                        fn.resetContent(itemMap.category[selectedFilter]);
                    } else if (selectedFilter === 'all') {
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
                        fn.updateMonthDropdownText('Month: ' + $filter.text());
                    } else {
                        fn.updateMonthDropdownText('Month');
                    }
                } else if (typeof label !== 'undefined') {
                    var selectedMonth = fn.getSelectedMonth();

                    if (label === 'all') {
                        categorySelected = false;
                    } else {
                        categorySelected = true;
                    }

                    if (selectedMonth === 'all') {
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

            $filters.on('click', 'input', function(e) {
                if (e.type === 'click' && e.clientX !== 0 && e.clientY !== 0) {
                    fn.toggleFilterDropdown(
                        $(this)
                            .parents('.filter-items')
                            .parent()
                            .find('.filter-button')
                    );
                }
            });
        },

        buildMonthDropdown: function() {
            var date = new Date();
            var currentMonth = date.getMonth();

            var $monthTemplate = $(
                '<div class="filter-item filter-months-item"> <input type="radio" name="articleFilters" /> <label class="filter-months-labels filter-labels"></label></div>'
            );

            var months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];

            for (var index = 1; index <= 12; index++) {
                var month = months[currentMonth];

                var $month = $monthTemplate.clone();

                $month.find('input').attr({
                    id: 'filters-months-' + month.toLowerCase(),
                    value: month.toLowerCase(),
                });

                $month
                    .find('label')
                    .attr({ for: 'filters-months-' + month.toLowerCase(), 'data-month': currentMonth + 1 })
                    .text(month);

                $('.filter-months-dropdown form').append($month);

                currentMonth += 1;
                if (currentMonth > 11) {
                    currentMonth = 0;
                }
            }
        },

        updateMonthDropdownText: function(selectedMonth) {
            $('.filter-months-button').text(selectedMonth);
        },

        getSelectedMonth: function() {
            var $label = $filters
                .find('.filter-months input:checked')
                .parent()
                .find('label');

            return $label.data('month') || $label.text().toLowerCase();
        },

        getSelectedFilter: function() {
            return $filters
                .find('li input:checked')
                .parent()
                .find('label')
                .text()
                .toLowerCase();
        },

        getCategoryItemsByMonth: function(month, category) {
            return itemMap.months[month].filter(function(item) {
                return itemMap.category[category].indexOf(item) !== -1;
            });
        },

        initFilterDropdowns: function() {
            $component.on('click', '.filter-button', function(e) {
                e.preventDefault();

                var $button = $(this);

                fn.toggleFilterDropdown($button);
            });
        },

        toggleFilterDropdown: function($button) {
            if ($button.hasClass('open') === false) {
                $button.next('.filter-items').addClass('open');
                $button.addClass('open');
            } else {
                $button.next('.filter-items').removeClass('open');
                $button.removeClass('open');
            }
        },

        toggleFilterVisibility: function() {
            $filtersToggle.on({
                click: function() {
                    if (viewportMode === 'mobile') {
                        $filters.toggleClass('open');
                    }
                },
            });

            // remove all open menus on click outside of navigation
            $(document).click(function(e) {
                if (viewportMode === 'mobile' && !$(e.target).closest('.filters').length) {
                    $('.filters').removeClass('open');
                }
            });
        },
    };

    return {
        init: function() {
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
        },
    };
};
