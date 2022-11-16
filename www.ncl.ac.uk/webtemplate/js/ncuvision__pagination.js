function Pager(listName,pageEl,itemEl) {
    this.listName = listName;
    this.pageEl = pageEl;
    this.itemEl = itemEl;
    let itemsPerPage = 6;
    this.currentPage = 0;
    this.pages = 0;
    this.inited = false;

    this.showRecords = function (from, to) {
        var items = $(this.listName).find(this.pageEl).find(this.itemEl);

        for (var i = 0; i < items.length; i++) {
            if (i < from || i > to) $(items[i]).hide();
            else $(items[i]).show();
        }
    }

    this.showPage = function (pageNumber) {
        if (!this.inited) {
            alert("not inited");
            return;
        }

        $('#pg' + this.currentPage).removeClass('disabled');

        this.currentPage = pageNumber;
        $('#pg' + this.currentPage).addClass('disabled');

        (this.currentPage > 1) ? $('.paginationButtonPrev').removeClass('disabled') : $('.paginationButtonPrev').addClass('disabled');
        (this.currentPage < this.pages) ? $('.paginationButtonNext').removeClass('disabled') : $('.paginationButtonNext').addClass('disabled');

        var from = (pageNumber - 1) * itemsPerPage;
        var to = from + itemsPerPage - 1;
        this.showRecords(from, to);
    }

    this.prev = function () {
        if (this.currentPage > 1) this.showPage(this.currentPage - 1);
    }

    this.next = function () {
        if (this.currentPage < this.pages) {
            this.showPage(this.currentPage + 1);
        }
    }

    this.init = function () {
        var items = $(this.listName).find(this.pageEl).find(this.itemEl);
        var records = (items.length);
        this.pages = Math.ceil(records / itemsPerPage);
        this.inited = true;
    }

    this.showPageNav = function (pagerName, paginationEl) {
        if (!this.inited) {
            return;
        }

        if (this.pages > 1) {
            var element = $(paginationEl);
            var pagerHtml = '';

            pagerHtml += '<button class="paginationButton paginationButtonPrev disabled" onclick="' + pagerName + '.prev();">&lt;</button>';
            for (var page = 1; page <= this.pages; page++) {
                pagerHtml += '<button class="paginationButton paginationButtonNumber" id="pg' + page + '" onclick="' + pagerName + '.showPage(' + page + ');">' + page + '</button>';
            }
            var nextState = '';
            (this.currentPage < this.pages) ? nextState = '' : nextState = 'disabled';
            pagerHtml += '<button class="paginationButton paginationButtonNext '+nextState+'" onclick="' + pagerName + '.next();">&gt;</button>';

            element.html(pagerHtml);
        }
    }
}