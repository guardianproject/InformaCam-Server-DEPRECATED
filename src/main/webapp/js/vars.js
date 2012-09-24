var cometd;
var dc = '/service/desktopConnection';
var mcast = '/multicast';

var Command = {
	CHOOSE_MEDIA: 99,
	LOAD_MEDIA: 100,
	WAIT_FOR_PROCESS: 101,
	VIEW_DERIVATIVES: 102,
	SEARCH: 103,
	SAVE_SEARCH: 104,
	LOAD_SEARCH: 105,
	ATTEMPT_LOGIN: 106,
	LOGOUT: 107,
	RENAME_MEDIA: 108,
	ADD_ANNOTATION: 109,
	APPEND_TO_ANNOTATION: 110,
	UPDATE_DERIVATIVES: 111
};

var entity, mcxAnnotation;
var MediaTypes = {
	VIDEO: 401,
	IMAGE: 400,
	Names: {
		401: MediaTypes_STR.VIDEO,
		400: MediaTypes_STR.IMAGE
	},
	UnaliasedTitle: {
		401: Derivative_STR.UnaliasedTitle.VIDEO,
		400: Derivative_STR.UnaliasedTitle.IMAGE
	}
};

var annotation_move_offset;

var MediaPaths = {
	LOCAL: 200,
	REDACTED: 201,
	UNREDACTED: 202
};

var Display = {
	REDACTED: 200,
	UNREDACTED: 201,
	Names: {
		200: Display_STR.REDACTED,
		201: Display_STR.UNREDACTED
	}
};

var View = {
	NORMAL : 300,
	MAP: 301,
	MOTION: 302,
	NETWORK: 303,
	Names: {
		300: View_STR.NORMAL,
		301: View_STR.MAP,
		302: View_STR.MOTION,
		303: View_STR.NETWORK
	}
};

var OwnershipTypes = {
	INDIVIDUAL: 400,
	ORGANIZATION: 401,
	Names: {
		400: Metadata_STR.Intent.OwnershipTypes.INDIVIDUAL,
		401: Metadata_STR.Intent.OwnershipTypes.ORGANIZATION
	}
};

var ImageRegions = {
	IDENTIFY: {
		name: "org.witness.ssc.image.filters.InformaTagger",
		label: Metadata_STR.Data.ImageRegions.Filters.IDENTIY
	},
	PIXELATE: {
		name: "org.witness.ssc.image.filters.PixelizeObscure",
		label: Metadata_STR.Data.ImageRegions.Filters.PIXELATE
	},
	BACKGROUND_PIXELATE: {
		name: "org.witness.ssc.image.filters.CrowdPixelizeObscure",
		label: Metadata_STR.Data.ImageRegions.Filters.BACKGROUND_PIXELATE
	},
	REDACT: {
		name: "org.witness.ssc.image.filters.SolidObscure",
		label: Metadata_STR.Data.ImageRegions.Filters.REDACT
	}
};

var Styles = {
	Color: {
		ACTIVE: "#C6FF00",
		INACTIVE: "#999999",
		DRAWING: "#ffffff"
	}
};

var searchQuery, searchAlias;
var SearchParameters = {
	KEYWORDS: 299,
	Type: {
		IMAGE: MediaTypes.IMAGE,
		VIDEO: MediaTypes.VIDEO
	},
	Timeframe: {
		PAST_24_HOURS: 300,
		PAST_WEEK: 301,
		PAST_MONTH: 302,
		PAST_YEAR: 303,
		CUSTOM_RANGE: 304,
		Names: {
			300: Search_STR.By_Timeframe.Fields.PAST_24_HOURS,
			301: Search_STR.By_Timeframe.Fields.PAST_WEEK,
			302: Search_STR.By_Timeframe.Fields.PAST_MONTH,
			303: Search_STR.By_Timeframe.Fields.PAST_YEAR,
			304: Search_STR.By_Timeframe.Fields.CUSTOM_RANGE
		}
	},
	Location: {
		RADIUS: 305,
		LATLNG: 306
	}
}

var currentUser;

var ic, ui;
var header, nav, footer, main, alert_holder, popup_holder, spinner_holder;
var metadata_readout, media_options, media_options_menu, media_frame, media_overlay, mcx, annotation_holder;
var frameRatio;
var regionsTraced = true;

function isArray(object) {
	if(typeof object == 'object') {
		var test = object.constructor.toString().match(/array/i);
		return(test != null);
	}
	return false;
}

function getNameByValue(group, value) {
	var name;
	for(var key in group) {
		if(key == value)
			name = group[key]
	}
	return group[value];
}

function parseDate(millis) {
	var date = new Date(millis).toString().split(" ");;
	var dstr = new Array();
	dstr.push(date[0]);
	dstr.push(date[1]);
	dstr.push(date[2] + ",");
	dstr.push(date[3]);
	dstr.push("(" + date[4]);
	dstr.push(date[5] + ")");
	
	return dstr.join(" ");
}