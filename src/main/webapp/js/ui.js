function clearUi() {
	$.each(ui, function(item) {
		this.root.css('display','none');
		if(this.tab)
			this.tab.removeClass("active");
	});

	alert_holder.css('display','none');
	popup_holder.css('display','none');
	spinner_holder.css('display','none');
	annotation_holder.css('display','none');
	messages_holder.css('display','none');
	expandedView_holder.css('display','none');
	importer_holder.css('display','none');
	$("#media_overlay").unbind();
}

function updateLoginUi() {
	if(currentUser != null && currentUser != undefined) {
		$($("#ic_login").children("p")[0]).css('display','block');
		$($("#ic_login").children("p")[1]).css('display','none');

		$("#loginDisplayName").html(currentUser.displayName);

	} else {
		$($("#ic_login").children("p")[0]).css('display','none');
		$($("#ic_login").children("p")[1]).css('display','block');
	}
}

function toggleValue(el, isMulti) {
	var group = $(el).parent();
	var type = $(el).get(0).tagName;
	$(el).addClass('selected');

	if(isMulti == undefined) {
		$.each(group.children(type), function() {
			if(this != el)
				$(this).removeClass('selected');
		});
	}
}

function doClear(el) {
	switch($(el).get(0).tagName.toLowerCase()) {
		case "input":
			$(el).val('');
			break;
		case "li":
			$(el).removeClass('selected');
			break;
		case "a":
			$(el).removeClass('selected');
			break;
		case "div":
			$(el).empty();
			break;
	}
}

function gatherFormInput(elName) {
	var el = "#" + elName;
	var formInput = {};
	var expect = 0;
	var parsed = 0;
	$.each($(el).find("*"), function() {
		if($(this).attr('optionKey') != undefined && $(this).attr('optionKey') != null) {
			var fi = doGet(this);
			if(fi != null) {
				for(var key in fi)
					formInput[key] = fi[key];
				parsed++;
			}

			expect++;
		}
	});
	return expect == parsed ? formInput : null;
}

function doGet(el) {
	var keyValPair = {};
	switch($(el).get(0).tagName.toLowerCase()) {
		case "input":
			if($(el).val() != '') {
				keyValPair[$(el).attr('optionKey')] = $(el).val();
			} else
				keyValPair = null;
			break;
		case "textarea":
			if($(el).val() != '') {
				keyValPair[$(el).attr('optionKey')] = window.btoa($(el).val());
			} else
				keyValPair = null;
			break;
		case "li":
			keyValPair[$(el).attr('optionKey')] = $(el).attr('optionValue');
			break;
		case "a":
			keyValPair[$(el).attr('optionKey')] = $(el).attr('optionValue');
			break;
		case "div":
			var key = $(el).attr('optionKey');
			var vals = new Array;
			$.each($(el).children('a.smallList'), function() {
				vals.push($(this).html().replace(" [x]",""));
			});
			if(vals.length > 0)
				keyValPair[key] = vals;
			else
				keyValPair = null;
			break;
	}

	return keyValPair;
}

function setOptions(elName, options) {
	var el = $("#" + elName);
	for(option in options) {

		if(options[option].constructor.toString().match(/Array/i)) {
			var listHolder = "#" + option + "_holder";
			$.each(options[option], function() {
				val = this;
				$(listHolder).append(
					$(document.createElement('a'))
						.html(val + " [x]")
						.addClass('smallList')
						.click(function() {
							$(this).remove();
						})
				);
			});
		} else if(options[option].constructor.toString().match(/Number/i)) {
			var selectionHolder = "#" + option + "_holder";
			$.each($(selectionHolder).children(), function() {
				if($(this).attr('optionValue') == options[option])
					toggleValue(this);
			});
		}
	}
}

function getOptions(elName) {
	var el = $("#" + elName);
	var targetedClasses = ["ic_smallListInput", "ic_smallListHolder", "selected"];
	var options = new Array;

	$.each($(el).children(), function() {
		var child = this;
		if(jQuery.inArray($(child).attr('class'), targetedClasses) != -1) {
			var returnedOption = doGet(child);
			if(returnedOption != null)
				options.push(returnedOption);
		}
		$.each($(child).children(), function() {
			if(jQuery.inArray($(this).attr('class'), targetedClasses) != -1) {
				var returnedOption = doGet(this);
				if(returnedOption != null)
					options.push(returnedOption);
			}
		});
	});

	return options;
}

function clearOptions(elName) {
	var el = $("#" + elName);
	var targetedClasses = ["ic_smallListInput", "ic_smallListHolder", "selected"];
	$.each($(el).children(), function() {
		var child = this;
		if(jQuery.inArray($(child).attr('class'), targetedClasses) != -1) {
			doClear(child);
		}
		$.each($(child).children(), function() {
			if(jQuery.inArray($(this).attr('class'), targetedClasses) != -1) {
				doClear(this);
			}
		});
	});
}

function listenForDismissal(el) {
	showSpinner();
}

function listenForInputHint(el) {
	if($(el).hasClass('unfocused')) {
		if($(el).val() == $(el).attr('hint'))
			$(el).val('');

		if($(el).hasClass('ic_password'))
			$(el).prop('type','password');

		$(el).removeClass('unfocused');
		$(el).addClass('focused');
	} else {
		if($(el).val() == '')
			$(el).val($(el).attr('hint'));

		if($(el).hasClass('ic_password') && $(el).val() == $(el).attr('hint'))
			$(el).prop('type','text');

		$(el).removeClass('focused');
		$(el).addClass('unfocused');
	}
}

function launchUi(which) {
	clearUi();
	if(User.isLoggedIn()) {
		which.root.css('display','block');
		if(which.tab)
			which.tab.addClass("active");
		if(which.init)
			which.init.call();
	} else
		promptForLogin();
}

function promptForLogin() {
	showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.LOGIN_PROMPT, false, null, null);
}

function showMenu(root, which) {
	if(which == undefined)
		which = 0;
	$($("#" + root).children("ul")[which]).css('display','block');
}

function toggleMediaView(state) {
	if(state) {
		$.each($($("#media_options").children('ul')[0]).children('li'), function(idx) {
			if(idx > 1)
				$(this).css('visibility','visible');
		});
		$.each($("#metadata_holder").children(), function() {
			$(this).css('visibility','visible');
		});
		$("#media_frame").css('visibility','visible');
	} else {
		$.each($($("#media_options").children('ul')[0]).children('li'), function(idx) {
			if(idx > 1)
				$(this).css('visibility','hidden');
		});
		$.each($("#metadata_holder").children(), function() {
			$(this).css('visibility','hidden');
		});
		$("#media_frame").css('visibility','hidden');
	}
}

function setMedia() {
	$("#media_frame").css('visibility','visible');
	//$.each($("#media_frame").children('div'), function() {
	$('.mcxDiv').remove();
	//});

	media_overlay.css({'background-image':'none'});
	setImageRatio();

	if(entity.mediaType == MediaTypes.VIDEO) {
		// sort the regions!
		$.each(entity.derivative.discussions, function(idx, item) {
			if(item['regionBounds'] instanceof Array) {
				// place the first div as a region
				var firstRegion = placeRegion(idx, {
					regionBounds: item['regionBounds'][0]
				});
				firstRegion.timeIn = item['timeIn'];
				firstRegion.timeOut = item['timeOut'];
				firstRegion.videoTrail = sortByTimeline(item['regionBounds']);
				entity.regions.push(firstRegion);
			}
		});

		setVideo();
		if(entity.regions != undefined && entity.regions.length > 0)
			initRegionsVideo();

		removeSpinner();

		$('#video_holder').css('display','block');
		$("#media_overlay").css('display','none');
	} else {
		$.each(entity.derivative.discussions, function(idx, item) {
			entity.regions.push(placeRegion(idx, item));
		});

		setImage();
		$('#media_overlay').css('display','block');
		$('#video_holder').css('display','none');
	}
}

var sortByTimeline = function(arr) {
	arr.sort(function(a,b) {
		if(a.timestamp < b.timestamp)
			return -1;
		else if(a.timestamp > b.timestamp)
			return 1;
		else
			return 0;
	});

	return arr;
}

function setVideo() {
	$("#video_holder").css({
		'margin-left': entity.margLeft,
		'margin-top': entity.margTop,
		'display':'block',
		'position':'absolute'
	});
	$("#video_holder").prop({
			'width' : entity.displayBounds.displayWidth,
			'height' : entity.displayBounds.displayHeight
	});

	$("#video_holder").empty();
	$.each(entity.derivative.representation, function() {
		var representation = this;
		if(!representation.match(/.mkv/i)) {
			$("#video_holder").append(
				$(document.createElement('source'))
					.attr('src', "images/session_cache/" + representation)
			);
		}
	});

	pop = Popcorn("#video_holder");
}

function setImage() {
	media_overlay.css({
		'background-repeat': 'no-repeat',
		'background-size': 'contain',
		'background-position': 'center',
		'margin-left': entity.margLeft,
		'margin-top': entity.margTop,
		'display':'block',
		'position':'absolute'
	});
	media_overlay.prop({
			'width' : entity.displayBounds.displayWidth,
			'height' : entity.displayBounds.displayHeight
	});
	var img = document.createElement('img');
	$(img).prop('src',"images/session_cache/" + entity.derivative.representation[0]);
	$(img).load(function() {
		media_overlay.css('background-image', 'url("' + img.src + '")');
		removeSpinner();
	});
	initRegionsImage();
}

function setImageRatio() {
//	var ratio = entity.imageDimensions[0]/entity.imageDimensions[1];
	var displayWidth, displayHeight;
	var maxWidth = media_frame.width();
	var maxHeight = media_frame.height();
	console.info("width: " + entity.imageDimensions[0]);
	console.info("height: " + entity.imageDimensions[1]);
	console.info("maxWidth: " + maxWidth);
	console.info("maxHeight: " + maxHeight);

	if(entity.mediaType == MediaTypes.IMAGE) {

	if(entity.imageDimensions[0] > entity.imageDimensions[1]) {
		// if it's landscape, let height set the ratio...
		console.info('this width is larger than the height');
		displayHeight = maxHeight;
		displayWidth = ((displayHeight * entity.imageDimensions[0])/entity.imageDimensions[1]);

	} else if(entity.imageDimensions[1] > entity.imageDimensions[0]) {
		// if it's portrait, let width set the ratio... ?
		console.info('this height is larger than the width');
		displayWidth = maxWidth;
		displayHeight = ((displayWidth * entity.imageDimensions[1])/entity.imageDimensions[0]);
	} else if(entity.imageDimensions[0] == entity.imageDimensions[1]) {
		displayHeight = displayWidth = maxHeight;
	}

	if(displayWidth > maxWidth) {
		console.info('still needs to resize');
		displayHeight = (maxWidth * displayHeight)/displayWidth;
		displayWidth = maxWidth;
	} else if(displayHeight > maxHeight) {
		console.info('still needs to resize');
		displayWidth = (maxHeight * displayWidth)/displayHeight;
		displayHeight = maxHeight;
	}

}


	if(entity.mediaType == MediaTypes.VIDEO) {
		frameHeight = $('#media_frame').height();
	frameWidth = $('#media_frame').width();

		if(entity.imageDimensions[0] > entity.imageDimensions[1]) {
		// if it's landscape...
			if (frameHeight >= 1280) {
				displayHeight = 1280;
				displayWidth = 720;
			}
			else if (frameHeight >= 480) {
				displayHeight = 480;
				displayWidth = 360;
			}
			else {
 				displayframeHeight = 176;
				displayWidth = 144;
			}

		}
		else if(entity.imageDimensions[1] > entity.imageDimensions[0]) {
		// if it's portrait...
			if (frameWidth >= 1280) {
				displayWidth = 1280;
				displayHeight = 720;
			}
			else if (frameWidth >= 480) {
				displayWidth = 480;
				displayHeight = 360;
			}
			else {
 				displayWidth = 176;
				displayHeight = 144;
			}

		}
}



	entity.displayBounds = {
		displayWidth: displayWidth,
		displayHeight: displayHeight
	}

	console.info("displayBounds is ");
	console.info(entity.displayBounds);

	entity.margLeft = Math.abs(maxWidth - displayWidth) * 0.5;
	entity.margTop = Math.abs(maxHeight - displayHeight) * 0.5;
	console.info("margeTop: " + entity.margTop);
	console.info("margeLeft: " + entity.margLeft);
}

function placeRegion(idx, item, isNew) {
	console.info(item);
	var _left = (item.regionBounds.regionCoordinates.region_left * entity.displayBounds.displayWidth)/entity.imageDimensions[0];
	var _top = (item.regionBounds.regionCoordinates.region_top * entity.displayBounds.displayHeight)/entity.imageDimensions[1];
	var _right = _left + ((item.regionBounds.regionDimensions.region_width * entity.displayBounds.displayWidth)/entity.imageDimensions[0]);
	var _bottom = _top + ((item.regionBounds.regionDimensions.region_height * entity.displayBounds.displayHeight)/entity.imageDimensions[1]);

	console.info("region placed at: [" + _left + ", " + _top + ", " + _right + ", " + _bottom + "]");

	if(isNew == null || isNew == undefined)
		isNew = false;

	return new InformaRegion(_left, _top, _right, _bottom, idx, isNew);
}

function initRegionsImage() {
	$.each(entity.derivative.discussions, function(idx, item) {
		var container = $(entity.regions[idx].container);
		$(container).addClass("mcxActive");
	});
}

var videoRegionTrails = new Array;
function initRegionsVideo() {
	$.each(entity.derivative.discussions, function(idx, item) {
		try {
			var region = entity.regions[idx];
			var container = $(region.container);
			pop.footnote({
				start: millisToSeconds(region.timeIn),
				end: millisToSeconds(region.timeOut),
				text:"",
				target: container.attr('id'),
				effect: "applyclass",
				applyclass: "mcxActive"
			});

			pop.listen("timeupdate", function() {
				// get regionbounds at about this time
				var time = secondsToMillis(this.currentTime());
				for(var vt=0; vt<region.videoTrail.length; vt++) {
					if(time <= region.videoTrail[vt].timestamp) {
						region.update(region.videoTrail[vt]);
						break;
					}

				}
			});
		} catch(err) {
			console.info(err.message);
		}

	});
}

function placeMedia() {
	$("#media_title").html(entity.title);
	setMedia();
	loadMediaOptions();
	setMetadata();
	toggleMediaView(true);
}

function loadMediaOptions() {
	$("#options_menu").empty();
	$.each(entity.options, function() {
		var opt = this;
		$("#options_menu").append(
			$(document.createElement('li'))
				.html(opt.label)
				.click(function() {opt.action.call();})
				.mouseenter(function() {
					$(this).addClass('hover');
				})
				.mouseleave(function() {
					$(this).removeClass('hover');
				})
		);
	});
}

function traceRegions() {
	regionsTraced = true;
	$(".mcxActive").css('visibility','visible');
}

function moveAnnotationHolder(e) {
	$("#annotation_holder").css({
		'top':  (e.clientY - annotation_move_offset),
		'left': (e.clientX - $("#annotation_holder").width())
	});
}

function moveMessagesHolder(e) {
	$("#messages_holder").css({
		'top':  (e.clientY - messages_move_offset),
		'left': (e.clientX - $("#messages_holder").width())
	});
}

function moveExpandedViewHolder(e) {
	$("#expandedView_holder").css({
		'top':  (e.clientY - expandedView_move_offset),
		'left': (e.clientX - $("#expandedView_holder").width())
	});
}

function hideRegions() {
	regionsTraced = false;
	$(".mcxActive").css('visibility','hidden');
}

function setMetadata() {
	$("#metadata_readout").empty();
	$.each(entity.informa, function() {
		var dataGroup = this;
		var dataPoints = dataGroup.loads;

		$("#metadata_readout").append(
			$(document.createElement('h2'))
				.html(dataGroup.label)
		);

		var readout = document.createElement('ul');
		$.each(dataPoints, function(index, item) {
			$(readout).append(
				$(document.createElement('li'))
					.html(parseForReplacementMetadata(item))
			);
		});

		$("#metadata_readout").append(readout);
	});

	$("#map_view_annotations").empty();
	var ilm = new InformaLocationMarker(entity.location.locationOnSave);
	var newLatLng = new google.maps.LatLng(ilm.lat, ilm.lng);
	mapViewMap.setCenter(newLatLng);
	google.maps.event.trigger(mapViewMap, 'resize');

	var editLocationMarkerHolder = $(document.createElement('ul'));
	$("#map_view_annotations")
		.append(
			$(document.createElement('p'))
				.html(Metadata_STR.Locations.ON_SAVE + " ")
				.append(ilm.build())
		)
		.append($(document.createElement('p')).html(Metadata_STR.Locations.EDITS))
		.append(editLocationMarkerHolder);

	$.each(entity.location.locations, function(idx, item) {
		var eilm = new InformaLocationMarker(item, Metadata_STR.Locations.Markers.EDITED);
		$(editLocationMarkerHolder).append(
			$(document.createElement('li'))
				.append(eilm.build())
		);
	});

}

function showSpinner() {
	spinner_holder.css('display','block');
}

function removeSpinner() {
	spinner_holder.css('display','none');
}

function listenForEscapeButton(el, callback) {
	$(window).keypress(function(key) {
		if(key.which == 0)
			callback.call();
			// TODO PLS! $(window).removeEvent('keypress');
	});
}

function showPopup(title, content) {
	if(title == undefined || title == null) {
		title = $("#popup_title").html();
	}

	$("#popup_title").html(title);
	$("#popup_content").empty();
	$("#popup_content").append(content);

	popup_holder.css('display','block');
	listenForEscapeButton(popup_holder, removePopup);
}

function removePopup() {
	popup_holder.css('display','none');
}

function showAlert(title, txt, isDismissable, replacements, options) {
	if(title == undefined || title == null) {
		title = $("#alert_title").html();
	}

	$('#alert_title').html(title);
	$('#alert_text').html(txt);

	$("#alert_options").empty();
	if(isDismissable) {
		if(options != null && options != undefined ) {
			$.each(options, function() {
				var button = this;
				$("#alert_options").append(
					$(document.createElement('a'))
						.html(button.label)
						.addClass('dismissal')
						.click(function() {button.action.call();})
				);
			});
		} else {
			$("#alert_options").append(
				$(document.createElement('a'))
					.html(Alerts.Basic.OK)
					.addClass('dismissal')
					.click(function() {removeAlert();})
			);
		}
		$("#alert_button").css('display','block');
	} else {
		$("#alert_button").css('display','none');
		setTimeout(removeAlert, 1750);
	}

	if(replacements != undefined && replacements != null) {
		for(var key in replacements) {
			txt = $("#alert_text").html().replace(key, replacements[key]);
			$("#alert_text").html(txt);
		}
	}

	alert_holder.css('display','block');
}

function removeAlert() {
	alert_holder.css('display','none');
}

function showImporter() {
	importer_holder.css('display','block');
}

function removeImporter() {
	importer_holder.empty();
	importer_holder.css('display','none');
}

function showAnnotationHolder() {
	$("#annotation_content").empty();
	leftmargin = media_frame.width() + 'px';
	annotation_holder.css({
		'display':'block',
		'margin-top': '25px',
		'margin-left': leftmargin
	});
	listenForEscapeButton(annotation_holder, removeAnnotationHolder);
}

function showMessagesHolder() {
	$("#messages_content").empty();
	messages_holder.css('display','block');
	listenForEscapeButton(messages_holder, removeMessagesHolder);
}

function showExpandedViewHolder(showAs) {
	expandedView_holder.css('display','block');

	if(showAs != null && showAs != undefined) {
		$("#expandedView_title").html(showAs.label);
		$.each($("#expandedView_content").children('div'), function() {
			$(this).css('display','none');
		});
		$.each(ev, function() {
			if(this.root == showAs.root) {
				$(this.root).css('display','block');

			}

		});
	}
}

function removeAnnotationHolder() {
	annotation_holder.css('display','none');
}

function removeMessagesHolder() {
	messages_holder.css('display','none');
}

function removeExpandedViewHolder() {
	expandedView_holder.css('display','none');
}

function populateTable(data, root) {
	var table = $(root).children("table")[0];
	$.each($($(table).children("tbody")[0]).children("tr"), function() {
		if(!$(this).hasClass("tr_header"))
			$(this).remove();
	});

	$.each(data, function() {
		$(table).append(this);
	});
	$("#ui_submissions").css('display','block');
}

function listenForListInput(el) {
	var listHolderName = $(el).attr('id') + "_holder"
	var listHolder = $("#" + listHolderName);
	$(el).keypress(function(key) {
		if(key.which == 13 && $(el).val() != '') {
			$(listHolder).append(
				$(document.createElement('a'))
					.html($(el).val() + " [x]")
					.addClass('smallList')
					.click(function() {
						$(this).remove();
					})
			);
			$(el).val('');
		}
	});
}

function toggleModule(el) {
	if($(el).hasClass('selected'))
		$(el).removeClass('selected');
	else
		$(el).addClass('selected');

	var sibling = $(el).next(".ic_admin_module_content");
	if($(el).hasClass('selected'))
		$(sibling).css('display','block');
	else
		$(sibling).css('display','none');
}

function loadAdminModules(modules) {
	$("#ic_admin_module_holder").empty();
	var content = 0;

	var waitForLoaded = window.setInterval(function() {
		if(content == modules.length) {
			$.each($(".ic_admin_module_toggle"), function() {
				var toggle = this;
				$(toggle).live('click', function() {
					toggleModule(toggle);
				});
			});

			$.each($(".ic_admin_module_content"), function() {
				var module = this;
				$(module).css('display','none');

				$.each($(module).find(".ic_live_update"), function() {
					parseLiveUpdate(this);
				});
			});


			removeSpinner();
			window.clearInterval(waitForLoaded);
		}
	}, 10);

	$.each(modules, function() {
		var src = this;
		var module = $(document.createElement('li'));

		$.ajax({
			url: "modules/" + src,
			dataType: "html",
			success: function(data) {
				$(module).html(data);
				content++;
			}
		});

		$("#ic_admin_module_holder").append(module);
	});
}

function initLayout() {
	header = $('#ic_header');
	nav = $('#ic_nav');
	footer = $('#ic_footer');
	main = $('#ic_main');

	metadata_readout = $("#metadata_readout");
	media_frame = $("#media_frame");

	main.css('height',(($(window).height() - 100) - (header.height() + footer.height())));

	metadata_readout.css('height',main.height());
	media_frame.css('height', main.height());

	media_overlay = $("#media_overlay");
	mcx = document.getElementById("media_overlay").getContext("2d");

	alert_holder = $("#alert_holder");
	alert_holder.css('margin-top', ($(window).height()/2) -100);

	popup_holder = $("#popup_holder");
	popup_holder.css('margin-top', $(window).height()/4);

	spinner_holder = $("#spinner_holder");
	spinner_holder.css('margin-top', $(window).height()/2 - 100);

	annotation_holder = $("#annotation_holder");
	messages_holder = $("#messages_holder");
	expandedView_holder = $("#expandedView_holder");

	importer_holder = $("#importer_holder");
	importer_holder.css('left', $(window).width() * .3);
	importer_holder.css('margin-top', $(window).height()/2 - 150);

	$("#map_view_readout").css({
		'width': Math.abs(metadata_readout.position().left - $(window).width()) - 60,
		'height': (($(window).height() - 100) - (header.height() + footer.height()))
	});

	$("#search_refine_options").css('height', (($(window).height() - 100) - (header.height() + footer.height())));

	ui = {
		media: {
			root: $('#ui_media'),
			tab: $(nav.children()[0])
		},
		submissions: {
			root: $('#ui_submissions'),
			tab: $(nav.children()[0]),
			init: function() {
				Media.getAll.init();

			}
		},
		admin: {
			root: $('#ui_admin'),
			tab: $(nav.children()[2]),
			init: function() {
				Admin.loadModules.init();
			}
		},
		help: {
			root: $('#ui_help'),
			tab: $(nav.children()[3])
		},
		details: {
			root: $("#ui_details")
		},
		search: {
			root: $("#ui_search"),
			tab: $(nav.children()[1])
		}
	};

	ev = {
		map: {
			label: Search_STR.By_Location.Map.LABEL,
			root: $("#ev_map_holder")
		}
	}

	$.each(ui, function(item) {
		this.root.css({
			'width': main.width(),
			'height': main.height()
		});
	});

	$(".ic_menu_button li").mouseenter(function() {
		if($(this).children('div.ic_dropdown') != undefined) {
			$($(this).children('div.ic_dropdown')[0]).css('display','block');
		}
	});

	$(".ic_menu_button li").mouseleave(function() {
		if($(this).children('div.ic_dropdown') != undefined) {
			$($(this).children('div.ic_dropdown')[0]).css('display','none');
		}
	});

	$(".ic_menu_button li div ul li").mouseenter(function() {
		$(this).addClass('hover');
	});

	$(".ic_menu_button li div ul li").mouseleave(function() {
		$(this).removeClass('hover');
	});

	$("#add_anno").live('click', function() {
		var region;
		switch(entity.mediaType) {
			case MediaTypes.IMAGE:
				region = placeRegion(entity.regions.length, entity.newAnnotation, true);
				entity.regions.push(region);

				var container = entity.regions[entity.regions.length - 1].container;
				$(container).addClass("mcxActive");
				$(container).addClass("mcxEditable");
				Media.annotate.init(entity.newAnnotation);
				break;
			case MediaTypes.VIDEO:
				console.info('adding video region');
				break;
		}

		// Media.annotate.init(entity.newAnnotation);

	});

	$(".tr_header td").click(function() {
		resortListBy($(this).attr('id'));
	});

	toggleMediaView(false);

	ic = Sammy("#ic_main", function() {
		this.get('#/', function() {
			clearUi();
		});

		this.get('#media/', function() {
			launchUi(ui.media);
		});

		this.get('#submissions/', function() {
			launchUi(ui.submissions);
		});

		this.get('#admin/', function() {
			launchUi(ui.admin);
		});

		this.get('#help/', function() {
			launchUi(ui.help);
		});

		this.get('#details/:dType/:dId', function() {
			launchUi(ui.details);
		});

		this.get('#search/', function() {
			launchUi(ui.search);
		});

		$(".ic_toMedia").live('click', function() {
			window.location = '#media/';	//why does sammy.redirect not work?
			Media.load.init($(this).attr('id'));
		});

		$(".ic_smallListInput").live('focus', function() {
			listenForListInput($(this));
		});

		$(".hinted").live('focus', function() {listenForInputHint($(this));});
		$(".hinted").live('blur', function() {listenForInputHint($(this));});
		$.each($(".hinted"), function() {
			$(this).val($(this).attr('hint'));
			if($(this).hasClass('ic_password')) {
				$(this).prop('type','text');
			}
		});

		annotation_move_offset = $("#annotation_move").offset().top;
		$("#annotation_move").live('mousedown', function() {
			$(document).bind('mousemove', moveAnnotationHolder);
		});

		$("#annotation_move").live('mouseup', function() {
			$(document).unbind('mousemove', moveAnnotationHolder);
		});

		messages_move_offset = $("#messages_move").offset().top;
		$("#messages_move").live('mousedown', function() {
			$(document).bind('mousemove', moveMessagesHolder);
		});

		$("#messages_move").live('mouseup', function() {
			$(document).unbind('mousemove', moveMessagesHolder);
		});

		expandedView_move_offset = $("#expandedView_move").offset().top;
		$("#expandedView_move").live('mousedown', function() {
			$(document).bind('mousemove', moveExpandedViewHolder);
		});

		$("#expandedView_move").live('mouseup', function() {
			$(document).unbind('mousemove', moveExpandedViewHolder);
		});

		$(".mcxEditable").live('mousedown', function(e) {
			movingAnnotation = entity.getActiveRegion(e.currentTarget);
			$(document).bind('mousemove', moveAnnotation);
			$(document).bind('mouseup', setAnnotation);
		});
	});

	ic.run('#submissions/');
	updateLoginUi();
	initMapViewMap();
	initExtendedViewMap();
}

function moveAnnotation(e) {
	mcx_move = 1;
	movingAnnotation.move(e);
}

function setAnnotation() {
	$(document).unbind('mousemove', moveAnnotation);

	if(mcx_move == 1) {
		var realRegion = entity.derivative.discussions[movingAnnotation.discussionId];

		realRegion.regionBounds.regionCoordinates = {
			region_left : (movingAnnotation.bounds.left * entity.imageDimensions[0])/entity.displayBounds.displayWidth,
			region_top : (movingAnnotation.bounds.top * entity.imageDimensions[1])/entity.displayBounds.displayHeight
		};

		realRegion.regionBounds.regionDimensions = {
			region_height: (movingAnnotation.bounds.height * entity.imageDimensions[1])/entity.displayBounds.displayHeight,
			region_width: (movingAnnotation.bounds.width * entity.imageDimensions[0])/entity.displayBounds.displayWidth
		};

		Media.editAnnotation.init(movingAnnotation.discussionId, EditTypes.MOVE, realRegion);
		mcx_move = 0;
	}
}

function initMapViewMap() {
	mapViewMap_opts = {
		center: new google.maps.LatLng(0, 0),
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	mapViewMap = new google.maps.Map(document.getElementById("map_view_map"), mapViewMap_opts);
}

function initExtendedViewMap() {
	extendedViewMap_opts = {
		center: new google.maps.LatLng(0, 0),
		zoom: 1,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	extendedViewMap = new google.maps.Map(document.getElementById("ev_map"), extendedViewMap_opts);
}

function zoomOnMap(lat, lng, marker, mainLabel, displayText, mapToUse) {
	var newLatLng = new google.maps.LatLng(lat, lng);
	mapToUse.setCenter(newLatLng);
	if(marker == null || marker == undefined) {
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(lat, lng),
			map: mapToUse,
			title: mainLabel
		});
	}

	var infoWindow = new google.maps.InfoWindow({
		content: displayText
	});
	infoWindow.open(mapToUse, marker);
}

$(document).ready(function() {
	initLayout();
});