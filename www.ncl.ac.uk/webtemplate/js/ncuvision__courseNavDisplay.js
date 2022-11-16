$(document).ready(function () {
    navigation.highlightAllParents = function (currentLink) {
      currentLink.css('font-weight', 'bold');
      while (currentLink && currentLink.data('level') > 0) {
          let parentId = currentLink.data('parent');
          if (parentId) {
              currentLink = $('.menu-toplevel').find('a[data-id="'+parentId+'"]').css('font-weight', 'bold');
          } else {
              currentLink = undefined; 
          }
      }
            currentLink.find('span.highlight').addClass('active-section');
        return currentLink;
    }
    navigation.displayCurrentTabLink = function (linkTitle, linkURI) {
      if (!$('body').hasClass('unit') && linkTitle.length > 0 && linkURI.length > 0) {
          $('.section-tabs a.tab:first-child').text(linkTitle).attr('href', linkURI);
          $('.section-tabs').removeClass('hidden');
          // change colour of tab depending on parent section
          switch (linkTitle) {
            case 'Undergraduate' :
                $('.section-tabs .tab').css('background-color','#16726d'); 
                break;
            case 'Postgraduate' :
                $('.section-tabs .tab').css('background-color','#9511c5');
                break;
          }
      }
  }
});