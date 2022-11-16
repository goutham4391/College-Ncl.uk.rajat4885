var dataLayerEvents = function() {
    // dataLayer structure
    var event = 'click';
    var eventCategory = '2018-refresh-events';
    var eventAction;
    var label;
    var searchTerm;
    var searchArea;
    var checked;

    var fn = {
        dropdownClick: function($obj, $caller) {
            if ($caller.hasClass('dropDownHeading')) {
                if ($obj.hasClass('dropdown')) {
                    // standard accordion
                    eventAction = 'accordion-expand-full';
                } else {
                    // course accordion
                    eventAction = 'accordion-expand-partial';
                }

                label = $caller.text().trim();
            } else if ($caller.hasClass('toggle') || $caller.hasClass('courseMore')) {
                eventAction = 'accordion-expand-full';
                var courseName = $caller
                    .parents('.course')
                    .find('.courseTitle .courseName')
                    .first()
                    .text()
                    .trim();
                label = courseName;
            } else {
                var heading = $caller
                    .parents('.dropDownBlock')
                    .children('.dropDownHeading')
                    .text()
                    .trim();
                label = 'accordion:' + heading + ':' + $caller.text().trim();
                eventAction = 'cta-click';
            }

            fn.pushData();
        },
        gallery: function($obj, $caller) {
            if ($caller.hasClass('slick-arrow')) {
                label =
                    'media-gallery:' +
                    $caller
                        .text()
                        .trim()
                        .toLowerCase();
                eventAction = 'on-page-elements';
                fn.pushData();
            } else if ($caller.hasClass('btn')) {
                label = 'media-gallery: cta-click:' + $caller.text().trim();
                eventAction = 'on-page-elements';
                fn.pushData();
            } else if ($caller.hasClass('videoOverlay')) {
                label = 'media-gallery: video-play';
                eventAction = 'on-page-elements';
                fn.pushData();
            }
        },
        linkClick: function($obj, $caller) {
            if ($obj.hasClass('articleList')) {
                label = $caller
                    .find('h4')
                    .text()
                    .trim();
            } else {
                label = $caller.text().trim();
            }
            eventAction = 'link-click';
            fn.pushData();
        },
        ctaClick: function($obj, $caller) {
            label = $caller.text().trim();
            eventAction = 'cta-click';
            fn.pushData();
        },
        media: function() {
            eventAction = 'cta-click';
            label = 'video-play';
            fn.pushData();
        },
        courseSearch: function($obj) {
            searchTerm = $obj.find('.searchBoxInput').val();
            checked = $('.search input[name=filterBy]:checked').val();
            searchArea = checked;
            eventAction = 'course-search';
            fn.pushDataCourseSearch();
        },
        search: function($obj) {
            searchTerm = $obj.find('.searchBoxInput').val();
            eventAction = 'top-nav-search';
            fn.pushDataSearch();
        },
        relatedPeople: function($obj, $caller) {
            var name = '';
            var linkType = '';

            if ($caller.hasClass('relatedPersonLinkTel') || $caller.hasClass('relatedPersonLinkMail')) {
                name = $caller
                    .parents('.relatedPerson')
                    .find('h4')
                    .text()
                    .trim();
                linkType = $caller.hasClass('relatedPersonLinkTel') ? 'telephone-link' : 'email-link';

                label = name + ':' + linkType;

                eventAction = 'people-carousel';
                fn.pushData();
            }
        },
        widgetClick: function(obj, caller) {
            var $type = obj.attr('data-type');
            eventAction = $type + '-widget-selection';
            label = caller.val();
            
            fn.pushData();
        },
        pushData: function() {
            dataLayer.push({
                event: event,
                eventCategory: eventCategory,
                eventAction: eventAction,
                label: label,
            });
        },
        pushDataCourseSearch: function() {
            dataLayer.push({
                event: event,
                eventCategory: eventCategory,
                eventAction: eventAction,
                searchTerm: searchTerm,
                searchArea: searchArea,
            });
        },
        pushDataSearch: function() {
            dataLayer.push({
                event: event,
                eventCategory: eventCategory,
                eventAction: eventAction,
                searchTerm: searchTerm,
            });
        },
    };

    return {
        init: function() {
            $('body').on(
                {
                    click: function() {
                        var $caller = $(this);
                        var $obj = $caller.closest('section, .header, .footer');

                        /*
                        If for some reason we don't have an object don't run
                        through any of the tracking logic below.
                        */
                        if ($obj.length === 1) {
                            /*
                            Get all classes from the object and add them to an
                            array so that we can check them easily.
                            */
                            var objClassList = $obj[0].className.split(' ');

                            /*
                            Store the relevant class names for linkPanels,
                            ctaButtons, and dropdowns.
                            */
                            var linkPanels = [
                                'dualPanel',
                                'fullWidthBanner',
                                'promoBanner',
                                'promoPanels',
                                'relatedProjects',
                                'articleList',
                            ];
                            var isLinkPanel = false;

                            var ctaButtons = ['introPanel', 'individualCTA', 'ctaBlock', 'mediaWidget', 'newsFeed'];
                            var isCtaButton = false;

                            var dropdowns = ['dropdown', 'courseDropDowns'];
                            var isDropdown = false;

                            /*
                            Check through the list of classes on the object to
                            see if the object is a dropdown, cta, or link panel.
                            */
                            objClassList.forEach(function(className) {
                                if (dropdowns.indexOf(className) !== -1) {
                                    isDropdown = true;
                                } else if (ctaButtons.indexOf(className) !== -1) {
                                    isCtaButton = true;
                                } else if (linkPanels.indexOf(className) !== -1) {
                                    isLinkPanel = true;
                                }
                            });

                            /*
                            Fire the relevant tracking function.
                            */
                            if (isDropdown === true) {
                                fn.dropdownClick($obj, $caller);
                            } else if (isCtaButton === true) {
                                fn.ctaClick($obj, $caller);
                            } else if (
                                isLinkPanel === true &&
                                $caller.hasClass('labelLink') === false &&
                                $caller.hasClass('paginationButton') === false
                            ) {
                                fn.linkClick($obj, $caller);
                            } else if ($obj.hasClass('videoBlock')) {
                                fn.media($obj, $caller);
                            } else if ($obj.hasClass('gallery')) {
                                fn.gallery($obj, $caller);
                            } else if ($obj.hasClass('relatedPeople')) {
                                fn.relatedPeople($obj, $caller);
                            }
                        }
                    },
                },
                'a, button'
            );

            $('body').on('click', 'input.searchSubmit', function() {
                var $caller = $(this);
                var $obj = $caller.closest('section, .headerSearchBox');

                if ($obj.hasClass('search')) {
                    fn.courseSearch($obj);
                } else if ($obj.hasClass('headerSearchBox')) {
                    fn.search($obj);
                }
            });

            $('body').on({
                change: function() {
                    var $caller = $(this);
                    var $obj = $caller.closest('section, .header, .footer');

                    if ($obj.length === 1) {
                        var objClassList = $obj[0].className.split(' ');

                        var widgets = ['dataWidget'];
                        var isWidget = false;

                        /*
                        Check through the list of classes on the object to
                        see if the object is a dropdown, cta, or link panel.
                        */
                        objClassList.forEach(function(className) {
                            if (widgets.indexOf(className) !== -1) {
                                isWidget = true;
                            }
                        });

                        if (isWidget === true) {
                            fn.widgetClick($obj, $caller);
                        }
                    }
                }
            }, 'select');
        },
    };
};
$(document).ready(function() {
    dataLayerEvents().init();
});
