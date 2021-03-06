var PlayVideo_STR = {
		label: '<span>This is no error</span><br>and something else again'
};

var TimeAndDate_STR = {
	Days: {
		SHORT: [
			"Mon",
			"Tue",
			"Wed",
			"Thu",
			"Fri",
			"Sat",
			"Sun"
		],
		LONG: [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday"
		]
	},
	Months: {
		SHORT: [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec"
		],
		LONG: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"December"
		]
	}
};

var Alert_STR = {
	Errors: {
		MAIN_TITLE: "Error",
		SELECTED_VIEW: "Sorry.  %view is not an available view.",
		NO_METADATA: "There is no informa-styled metadata attached to this image.  Load anyway?",
		LOGIN_FAILURE: "Sorry, I could not log you in.  Please try again.",
		CHANGE_PASSWORD_MISMATCH: "Your passwords don't match.  Please try again.",
		NO_SAVED_SEARCHES: "You don't have any saved searches yet.",
		EMPTY_SEARCH: "Please refine your search. If you'd like to see all submissions, visit the \"Submissions\" tab instead.",
		LOGIN_PROMPT: "Please log in at the bottom of the screen to continue.",
		RENAME_FAIL: "Could not change the media object's title.",
		EMPTY_ANNOTATION: "Please enter some text for your annotation.",
		EMPTY_MESSAGE_CONTENT: "Please enter a message to send.",
		INIT_CLIENT_FAIL: "Sorry, I could not initiate this new client.  Please try again.",
		EXPORT_ICTD_FAIL: "Sorry, I could not find an ICTD file for this client.  Please try again."
	},
	MediaLoading: {
		MAIN_TITLE: "Media Loading...",
		SELECT_MEDIA: "Please select your media",
		WAITING: "Please wait.  Your media is being processed."
	},
	Admin: {
		ClientDownload: {
			MAIN_TITLE: "Download Client Credentials",
			CLICK_TO_DOWNLOAD: "Click below to download as an .ictd file.  How you distribute this file to users is up to you."	
		}	
	},
	Basic: {
		YES: "Yes",
		NO: "No",
		OK: "OK",
		CANCEL: "Cancel",
		DOWNLOAD: "Download"
	},
	Submissions: {
		MAIN_TITLE: "No Submissions",
		NO_NEW_SUBMISSIONS: "There are no submissions for you to view."
	},
	Search: {
		Prompt: {
			MAIN_TITLE: "Save this search query",
			TEXT: "Please give a title to your search query. It will be available to you every time you are logged in."
		},
		SavedSearches: {
			MAIN_TITLE: "Saved Searches"
		}
	},
	Media: {
		Prompt: {
			MAIN_TITLE: "Rename this media object",
			TEXT: "New name: "
		}
	},
	Region: {
		Delete: {
			MAIN_TITLE: "Delete Region",
			TEXT: "Do you wish to delete this region?"
		}
	}
};

var Derivative_STR = {
	MAIN_TITLE: "Submissions",
	CHOOSER_TITLE: "Please choose an image/video...",
	Fields: {
		FILENAME: "Filename",
		MEDIA_TYPE: "Media Type",
		SIZE: "Size",
		TIME_SUBMITTED: "Time Submitted",
		TIME_CREATED: "Time Created",
		TIME_RECEIVED: "Time Received",
		SUBMITTED: "Submitted on",
		SUBMITTED_BY: "Submitted by",
		UNKNOWN: "unknown",
		N_A: "n/a"
	},
	UnaliasedTitle: {
		IMAGE: "Image by ",
		VIDEO: "Video by "
	},
	UnaliasedSource: "User ID "
};

var Source_STR = {
	MAIN_TITLE: "Sources",
	EXPORT_PROMPT: "Export ICTD File",
	Fields: {
		ALIAS: "Name/Alias",
		NUMBER_OF_SUBMISSIONS: "No. of Submissions",
		DATE_OF_LAST_SUBMISSION: "Last Submission"
	}
};

var Menu_STR = {
	Media: {
		Image: {
			SHARE_IMAGE: "Export Image"
		},
		Video: {
			SHARE_VIDEO: "Export Video"
		},
		RENAME: "Rename File",
		EXPORT_METADATA: "Export Metadata As...",
		VIEW_MESSAGES: "View Messages..."
	},
	Main: {
		SEARCH: "SEARCH",
		SUBMISSIONS: "Submissions",
		ADMIN: "Admin",
		HELP: "Help"
	}
};

var Display_STR = {
	REDACTED: "Redacted",
	UNREDACTED: "Unredacted"
}

var View_STR = {
	NORMAL: "Normal View",
	MAP: "Map View",
	MOTION: "Motion View",
	NETWORK: "Network View"
}

var MediaTypes_STR = {
	IMAGE: "Image",
	VIDEO: "Video"
}

var EditTypes_STR = {
	MOVE: "Move",
	DELETE: "Delete"
}

var ImageRegion_STR = {
	ON: "On",
	OFF: "Off"
}

var Metadata_STR = {
	Locations: {
		LABEL: "Location History",
		ON_SAVE: "Saved at this location: ",
		EDITS: "Edited at the following locations:",
		Markers: {
			ON_SAVE: "Location on Save",
			EDITED: "Edits made at this location"
		}
	},
	Intent: {
		label: "Intent",
		SUBMITTED_BY: "Submitted by: %=sigKeyId",
		OWNERSHIP_TYPE: "(Ownership type: %=ownershipType)",
		OwnershipTypes: {
			INDIVIDUAL: "Individual",
			ORGANIZATION: "Organization"
		}
	},
	Genealogy: {
		label: "Genealogy",
		DATE_CREATED: "Media created on: %=dateCreated",
		DATE_ACQUIRED: "Acquired by submitting device on: %=dateAcquired",
		ChainOfCustody: {
			label: "Chain of Custody Advisory",
			IS_IMPORT: "This media was imported into the system.  It's chain of custody could be contested. %=importFlag"
		}
	},
	Data: {
		label: "Data",
		Device: {
			label: "About the device submitting this media:",
			DEVICE_BLUETOOTH_NAME: "Bluetooth Name: %=deviceBTName",
			DEVICE_BLUETOOTH_ADDRESS: "Bluetooth Address: %=deviceBTAddress",
			DEVICE_IMEI: "Handset IMEI: %=imei",
			Integrity: {
				label: "Device Integrity",
				RATING: "InformaCam is %=deviceIntegrityRating % certain that this media was captured by the device indicated by its handset IMEI."
			}
		},
		ImageRegions: {
			label: "Image Regions",
			Filters: {
				IDENTIFY: "Identify",
				PIXELATE: "Pixelate",
				BACKGROUND_PIXELATE: "Background Pixelate",
				REDACT: "Redact"
			}
		}
	}
};

var Search_STR = {
	MAIN_TITLE: "Search",
	REFINE: "Refine",
	RESET: "Reset",
	By_Saved_Search: {
		LABEL: "Load"
	},
	By_Keyword:  {
		LABEL: "By Keyword"
	},
	By_Type: {
		LABEL: "By Type",
		Fields: {
			IMAGE: MediaTypes_STR.IMAGE,
			VIDEO: MediaTypes_STR.VIDEO
		}
	},
	By_Timeframe: {
		LABEL: "By Timeframe",
		Fields: {
			PAST_24_HOURS: "Past 24 hours",
			PAST_WEEK: "Past week",
			PAST_MONTH: "Past month",
			PAST_YEAR: "Past year",
			CUSTOM_RANGE: "Custom range..."
		}
	},
	By_Location: {
		LABEL: "By Location",
		Fields: {
			HINT: "enter coordinates, city, or country",
			MAP: "Map..."
		},
		Map: {
			LABEL: "Refine your search by location..."
		}
	},
	Results: {
		LABEL: "Results",
		Fields: {

		}
	},
	SavedSearches: {
		LABEL: "Saved Searches",
		Fields: {
			Name: "Name",
			Keywords: "Keywords",
			Locations: "Locations",
			MediaType: "Media Types",
			Timeframe: "Timeframe"
		}
	}
};

var Misc_STR = {
	LEARN_MORE: "Learn more..."
}