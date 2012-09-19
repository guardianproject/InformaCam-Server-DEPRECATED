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

function doGet(el) {
	var keyValPair = {};
	switch($(el).get(0).tagName.toLowerCase()) {
		case "input":
			if($(el).val() != '') {
				keyValPair[$(el).attr('optionKey')] = $(el).val();
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
		console.info(option + " = " + options[option]);

		if(options[option].constructor.toString().match(/Array/i)) {
			var listHolder = "#" + option + "_holder";
			console.info(listHolder);
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
	if(entity.mediaType == 401) {
		setVideo();
		$('#video_file').css('display','block');
		$('#active_anno').css('display','inline');
		$("#video_annotations").css('display','block');
		$("#media_overlay").css('display','none');
	}
	else {
		setImageRatio();
		$('#media_overlay').css('display','block');
		$('#video_file').css('display','none');
		$('#active_anno').css('display','none');
		$("#video_annotations").css('display','none');
	}
}

function setVideo() {
	representationsURL = entity.derivative.representation;
	representations = '';
	for(i=0; i<representationsURL.length; i++) {
		representations = representations + '<source src="images/session_cache/' + representationsURL[i] + '">';
	}
	$('#video_file').html(representations);
	//just dummy, set width/height when entity contains size info
	$('#video_file').css({'width': '480', 'height': '320'});
	//firstLoadAnnotations();
}

function setImageRatio() {
	var ratio = entity.imageDimensions[0]/entity.imageDimensions[1];
	var displayWidth, displayHeight;
	var maxWidth = media_frame.width() * 0.9;
	var maxHeight = media_frame.height() * 0.9;

	if(
		entity.imageDimensions[0] > entity.imageDimensions[1] &&
		ratio <= 1
	) {
		displayWidth = maxWidth;
		displayHeight = displayWidth * ratio;
	} else if(entity.imageDimensions[1] >= maxHeight) {
		displayHeight = maxHeight;
		displayWidth = displayHeight/ratio;
	} else if(entity.imageDimensions[0] == entity.imageDimensions[1]) {
		displayHeight = displayWidth = maxHeight;
	}

	entity.frameRatio = displayWidth/maxWidth;
	

	entity.displayBounds = {
		displayWidth: displayWidth,
		displayHeight: displayHeight
	}

	
	console.info("frameRatio is supposedly: " + entity.frameRatio);
	console.info("displayBounds is ");
	console.info(entity.displayBounds);

	entity.margLeft = (parseInt(maxWidth) - parseInt(displayWidth)) * 0.5;
	entity.margTop = (parseInt(maxHeight) - parseInt(displayHeight)) * 0.5;

	console.info("max width: " + media_frame.width());
	console.info("max height: " + media_frame.height());

	console.info("width: " + displayWidth);
	console.info("height: " + displayHeight);

	console.info("marLeft: " + entity.margLeft);
	console.info("margTop: " + entity.margTop);

	media_overlay.prop({
			'width' : displayWidth,
			'height' : displayHeight
	});

	media_overlay.css({
		'margin-left': entity.margLeft,
		'margin-top': entity.margTop,
		'background-image': "url('images/session_cache/" + entity.derivative.representation[0] + "')",
		'background-repeat': 'no-repeat',
		'background-size': 'contain',
		'background-position': 'center'
	});

}

function placeRegions() {
	$.each(entity.derivative.discussions, function(idx, item) {
		var _left = (item.regionBounds.regionCoordinates.region_left * entity.displayBounds.displayWidth)/entity.imageDimensions[1];
		var _top = (item.regionBounds.regionCoordinates.region_top * entity.displayBounds.displayHeight)/entity.imageDimensions[0];
		var _right = _left + ((item.regionBounds.regionDimensions.region_width * entity.displayBounds.displayWidth)/entity.imageDimensions[1]);
		var _bottom = _top + ((item.regionBounds.regionDimensions.region_height * entity.displayBounds.displayHeight)/entity.imageDimensions[0]);
		
		console.info("region placed at: [" + _left + ", " + _top + ", " + _right + ", " + _bottom + "]");
		
		entity.regions.push(new InformaRegion(_left, _top, _right, _bottom, idx, false));
	});
	
}

function placeMedia() {
	$("#media_title").html(entity.title);
	setMedia();
	loadMediaOptions();
	setMetadata();
	placeRegions();
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
}

function moveAnnotationHolder(e) {
	$("#annotation_holder").css({
		'top':  (e.clientY - annotation_move_offset),
		'left': (e.clientX - $("#annotation_holder").width())
	});
	
	
}

function hideRegions() {
	regionsTraced = false;
	mcx.clearRect(0, 0, $(media_overlay).width(), $(media_overlay).height());
}

function setMetadata() {
	$("#metadata_readout").empty();
	$.each(entity.informa, function() {
		console.info(this);
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

function showAnnotationHolder() {
	$("#annotation_content").empty();
	annotation_holder.css('display','block');
}

function removeAnnotationHolder() {
	annotation_holder.css('display','none');
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
			tab: $(nav.children()[2])
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
		console.info(annotation_move_offset);
		$("#annotation_move").live('mousedown', function() {
			console.info("moving !");
			$(document).bind('mousemove', moveAnnotationHolder);
		});
		
		$("#annotation_move").live('mouseup', function() {
			console.info("not moving...");
			$(document).unbind('mousemove', moveAnnotationHolder);
		});

	});

	ic.run('#submissions/');
	updateLoginUi();
}

$(document).ready(function() {
	initLayout();
	loadAnnotationButtons();
});