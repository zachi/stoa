(function ($, undefined) {

  $.widget("ui.stoa", {

  options: { // default options
      numberOfThumbnails: 40,
      thumbnailsFolderName: 'none',
      direction: 'ltr',
      scrollerUpText: 'scroll up',
      scrollerDownText: 'scroll down',
      rightButtonText: 'next',
      leftButtonText: 'previous',
      thumbnailsOpacityHoverEffect: true

    },

    _create: function () {
      var self = this;
      var scrollContinuousIntervalID = 0;

      self.initDirectionDefaults();
      self.initDOMStracture();
      self.initThumbnails();
      self.initThumbnailsOpacityHoverEffect();
      self.initThumbnailsWheelScroll();
      self.initNavigationControllers();
    },

    initDirectionDefaults: function () {
      var self = this;
      if (self.options.direction == 'rtl') {
        self.options.scrollerUpText = 'גלול מעלה';
        self.options.scrollerDownText = 'גלול מטה';
        self.options.rightButtonText = 'תמונה קודמת';
        self.options.leftButtonText = 'תמונה הבאה';
      }
    },

    initThumbnailsWheelScroll: function () {
      var self = this;
      $('#stoa-navbar-thumbnails-container').bind('mousewheel', function (event, delta) {
        
		var scrollDelta = self.normalizeDelta(delta);
		
        self.scrollDelta(scrollDelta);
        return false;
      });
    },

    initDOMStracture: function () {
      var self = this;
      self.element.addClass('stoa');
      self.element.append(self.getGalleryHtml());
    },

    initNavigationControllers: function () {
      var self = this;
      $('#stoa-navbar-scroller-up').bind('mousedown', function () {
        self.scrollContinuousStart(self.scrollUp);
      });
      $('#stoa-navbar-scroller-up').bind('mouseup', function () {
        self.scrollContinuousStop();
      });

      $('#stoa-navbar-scroller-down').bind('mousedown', function () {
        self.scrollContinuousStart(self.scrollDown);
      });
      $('#stoa-navbar-scroller-down').bind('mouseup', function () {
        self.scrollContinuousStop();
      });

      $('#stoa-navbar-controllers-right').bind('click', function () {
        if (self.options.direction == 'ltr') self.selectNextImage();
        else self.selectPreviousImage();
      });

      $('#stoa-navbar-controllers-left').bind('click', function () {
        if (self.options.direction == 'ltr') self.selectPreviousImage();
        else self.selectNextImage();

      });

      $('img#stoa-main-image').bind('click', function () {
        self.selectNextImage();
      });
    },

    selectNextImage: function () {
      var selected = $('img.stoa-navbar-thumbnail-image-selected');
      var next = selected.next();
      if (next.length == 0) {
        next = selected.parent().parent().parent().next().find('img:first')
      }
      next.trigger('click')
    },

    selectPreviousImage: function () {

      var selected = $('img.stoa-navbar-thumbnail-image-selected');
      var prev = selected.prev();
      if (prev.length == 0) {
        prev = selected.parent().parent().parent().prev().find('img:last')
      }
      if (prev.length == 0) return;
      prev.trigger('click')
    },

    getGalleryHtml: function () {
      var self = this;
      return '<div class="stoa-navbar">' + '  <div id="stoa-navbar-thumbnails-container" class="stoa-navbar-thumbnails-container">' + '  </div>' + '  <div class="stoa-navbar-controllers">' + '    <a id="stoa-navbar-scroller-up" title="' + self.options.scrollerUpText + '"  class="stoa-navbar-scroller-up FadeOnHover">▲</a>' + '    <a id="stoa-navbar-controllers-right" title="' + self.options.rightButtonText + '" class="stoa-navbar-controllers-right FadeOnHover">►</a>&nbsp;&nbsp;&nbsp;' + '    <a id="stoa-navbar-controllers-left" title="' + self.options.leftButtonText + '" class="stoa-navbar-controllers-left FadeOnHover">◄</a>' + '    <a id="stoa-navbar-scroller-down" title="' + self.options.scrollerDownText + '" class="stoa-navbar-scroller-down FadeOnHover">▼</a>' + '  </div>' + '</div>' + '<div id="stoa-main" class="stoa-main">' + '  <img id="stoa-main-image" class="stoa-main-image" src="/Images/1.jpg" runat="server" />' + '</div>' + '<div style="clear:both;"></div>';


    },

    initThumbnails: function () {
      var self = this;
      if (self.options.thumbnailsFolderName == 'none') self.initThumbnailsFromMarkup();
      else self.initThumbnailsWithFolderName();
    },

    initThumbnailsWithFolderName: function () {
      var self = this;
      var thumbnails = $('<ul id="stoa-navbar-thumbnails-list"  />');
      var nNumberOfRows = self.getNumberOfRows(self.options.numberOfThumbnails);
      for (var r = 0; r <= nNumberOfRows; r++) {
        var row = $('<li><ul>');
        for (var c = 1; c <= 2; c++) {
          var imgSrc = self.options.thumbnailsFolderName + '/Thumbnails/' + ((r * 2) + c) + '.jpg';
          var img = self.createThumbnailImg(imgSrc);
          var thumbnailContainer = $('<li class="stoa-navbar-thumbnail-container" >');
          thumbnailContainer.append(img)
          row.find('ul').append(thumbnailContainer);
        }
        row.appendTo(thumbnails);
      }

      var thumbnailsContainer = $('#stoa-navbar-thumbnails-container');
      thumbnailsContainer.empty();
      thumbnails.appendTo(thumbnailsContainer);

      //select first thumbnail as DisplayedImage
      $('#stoa-navbar-thumbnails-list img:first').trigger('click')

    },

    initThumbnailsFromMarkup: function () {
      var self = this;
      var thumbnails = $('<ul id="stoa-navbar-thumbnails-list"  />');
      var images = self.element.children('img,a');
      for (var i = 0; i < images.length; i = i + 2) {
        var row = $('<li><ul>');
        var img1 = self.createThumbnailImg(images[i]);
        var img2 = self.createThumbnailImg(images[i + 1]);
        var thumbnailContainer = $('<li class="stoa-navbar-thumbnail-container" >');
        thumbnailContainer.append(img1);
        thumbnailContainer.append(img2);
        row.find('ul').append(thumbnailContainer);
        row.appendTo(thumbnails);
        $(images[i]).remove();
        $(images[i + 1]).remove();
      }

      var thumbnailsContainer = $('#stoa-navbar-thumbnails-container');
      thumbnailsContainer.empty();
      thumbnails.appendTo(thumbnailsContainer);

      //select first thumbnail as DisplayedImage
      $('#stoa-navbar-thumbnails-list img:first').trigger('click')
    },

    getThumbnailImgSrc: function (imgElement) {
      var JQelement = $(imgElement);
      if (JQelement.attr('tagName').toLowerCase() == 'a') return JQelement.attr('href');
      return JQelement.attr('src');
    },

    getImgSrc: function (imgElement) {
      var JQelement = $(imgElement);
      if (JQelement.attr('tagName').toLowerCase() == 'a') return JQelement.find('img').attr('src');
      return JQelement.attr('src');
    },

    getThumbnailImgTitle: function (imgElement) {
      var JQelement = $(imgElement);
      if (JQelement.attr('tagName').toLowerCase() == 'a') return JQelement.find('img').attr('alt');
      return JQelement.attr('alt');
    },

    createThumbnailImg: function (imgElement) {
      var self = this;
      var thumbnailSrc = self.getThumbnailImgSrc(imgElement);
      var imgSrc = self.getImgSrc(imgElement);
      var imgTitle = self.getThumbnailImgTitle(imgElement);

      var newImg = $('<img class="stoa-navbar-thumbnail-image" id="thumbnail-' + thumbnailSrc + '" src="' + thumbnailSrc + '" />');
      newImg.attr('imgSrc', imgSrc);
      if (imgTitle != null) newImg.attr('title', imgTitle).attr('alt', imgTitle);


      newImg.click(function (event) {
        self.thumbnailClicked(event)
      });
      return newImg;
    },

    thumbnailClicked: function (event) {
      var self = this;
      var eventElement = event.srcElement != null ? event.srcElement : event.target;
      var prevSelectedImg = jQuery('img.stoa-navbar-thumbnail-image-selected');
      
      prevSelectedImg.removeClass('stoa-navbar-thumbnail-image-selected');
      jQuery(eventElement).addClass('stoa-navbar-thumbnail-image-selected');
      
	 //I know its a shame that we handle opacityHoverEffect also here(and not in a single place), 
	 //but trying to avoid it created some performance issues... maybe one day...
	 if (self.options.thumbnailsOpacityHoverEffect){
		  self.bindHoverEffect(prevSelectedImg.get(0));
		  self.unbindHoverEffect(eventElement);
	  }
	  
      self.changeMainImage(eventElement);
    },

    getNumberOfRows: function (numberOfFiles) {
      return (numberOfFiles / 2) - 1;
    },

    changeMainImage: function (eventSrc) {
      var src = $(eventSrc).attr('imgSrc');
      var title = $(eventSrc).attr('alt');
      $('img.stoa-main-image').hide().load(function () {
        $(this).fadeIn();
      }).attr('src', src).attr('title', title).attr('alt', title);


    },

    scrollContinuousStart: function (scrollFunc) {
      var self = this;
      self.scrollContinuousIntervalID = setInterval(scrollFunc, 30)
      //scrollFunc();
    },

    scrollContinuousStop: function () {
      var self = this;
      window.clearInterval(self.scrollContinuousIntervalID);
    },

    normalizeDelta: function (delta) {
      return delta > 0 ? -43 : 43;
    },

    scrollDown: function () {
      var thumbnailsContainer = jQuery('#stoa-navbar-thumbnails-container');
      var nCurrentScroll = thumbnailsContainer.scrollTop();
      var nContentHeight = parseInt(jQuery('#stoa-navbar-thumbnails-list').css('height').replace('px', ''));
      var nContainerHeight = parseInt(thumbnailsContainer.css('height').replace('px', ''));
      var nMaxScroll = nContentHeight - nContainerHeight;
      var nAdditionalScrollSize = 10;

      if (nCurrentScroll >= nMaxScroll) return;
      if ((nCurrentScroll + nAdditionalScrollSize) > nMaxScroll) nAdditionalScrollSize = nMaxScroll - nCurrentScroll;
      thumbnailsContainer.scrollTop(nCurrentScroll + nAdditionalScrollSize);
    },

    scrollUp: function () {

      var thumbnailsContainer = jQuery('#stoa-navbar-thumbnails-container');
      var nCurrentScroll = thumbnailsContainer.scrollTop();
      var nAdditionalScrollSize = 15;
      if (nCurrentScroll <= 0) return;
      else if ((nCurrentScroll - nAdditionalScrollSize) < 0) nAdditionalScrollSize = nCurrentScroll;
      thumbnailsContainer.scrollTop(nCurrentScroll - nAdditionalScrollSize);
    },

    scrollDelta: function (scrollDeltaInPixels) {
      
	  if (scrollDeltaInPixels == 0) return;
      var thumbnailsContainer = jQuery('#stoa-navbar-thumbnails-container');
      var nCurrentScroll = thumbnailsContainer.scrollTop();
      thumbnailsContainer.scrollTop(nCurrentScroll + scrollDeltaInPixels);
    },

    scrollDownEase: function () {
      var thumbnailsTableContainer = jQuery('#ThumbnailsTableContainer');
      var nCurrentScroll = thumbnailsTableContainer.scrollTop();
      var nContentHeight = parseInt(jQuery('#ThumbnailsTable').css('height').replace('px', ''));
      var nContainerHeight = parseInt(thumbnailsTableContainer.css('height').replace('px', ''));
      var nMaxScroll = nContentHeight - nContainerHeight;
      var nAdditionalScrollSize = 15;

      if (nCurrentScroll >= nMaxScroll) return;
      if ((nCurrentScroll + nAdditionalScrollSize) > nMaxScroll) nAdditionalScrollSize = nMaxScroll - nCurrentScroll;
      thumbnailsTableContainer.animate({
        scrollTop: nCurrentScroll + nAdditionalScrollSize
      }, 200);
    },

    initThumbnailsOpacityHoverEffect: function () {
      var self = this;
      if (!self.options.thumbnailsOpacityHoverEffect) return;
      $('div#stoa-navbar-thumbnails-container ul li ul li img').each(function () {
        self.bindHoverEffect(this);
      });
	  self.unbindHoverEffect($('img.stoa-navbar-thumbnail-image-selected').get(0));
    },

    unbindHoverEffect: function (element) {
      $(element).css("opacity", "1");
      $(element).unbind('mouseover');
      $(element).unbind('mouseout');
    },

    bindHoverEffect: function (element) {
      $(element).css("opacity", "0.7");
      $(element).bind('mouseover', function () {
        //$(this).parents('#stoa-navbar-thumbnails-container').find('img').not(this).animate({ "opacity": "0.3" }, 200);
        $(element).animate({
          "opacity": "1"
        }, 200);
      });
      $(element).bind('mouseout', function () {
        $(element).animate({
          "opacity": "0.7"
        }, 200);
      });
    }

  });

})(jQuery);