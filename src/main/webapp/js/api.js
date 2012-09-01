var User = {
	login : function(username, password) {
		var res = false;
		if(username == undefined)
			username = $("#loginUsername").val();
		
		if(password == undefined)
			password = $("#loginPassword").val();
		
		if(
			username == $("#loginUsername").attr('hint') || 
			password == $("#loginPassword").attr('hint')
		)
			return res;		//default username & password :(
		
		showSpinner();	
		broadcast({
			attempt: Command.ATTEMPT_LOGIN,
			options: {
				username: username,
				password: password
			}
		});
	},
	logout : function() {
		// whatever broadcast we need to send...
		showSpinner();
		broadcast({
			attempt: Command.LOGOUT,
			options: {
				_id: currentUser._id,
				_rev: currentUser._rev
			}
		});
	},
	changePassword : function(oldPassword, newPassword, confirmPassword) {
		if(newPassword == confirmPassword) {
			showSpinner();
			broadcast({
				attempt: Command.CHANGE_PASSWORD,
				options: {
					_id: currentUser._id,
					_rev: currentUser._rev,
					oldPassword: oldPassword,
					newPassword: newPassword
				}
			});
		} else {
			showAlert(Alert_STR.Error.MAIN_TITLE, Alert_STR.Error.CHANGE_PASSWORD_MISMATCH, false, null, null);
		}
	},
	loadSession: function(userData) {
		currentUser = userData;
		updateLoginUi();
	},
	unloadSession: function() {
		currentUser = null;
		updateLoginUi();
	},
	reloadSession : function() {
		User.unloadSession();
		User.loadSession(currentUser);
	},
	isLoggedIn : function() {
		var res = false;
		if(currentUser != undefined && currentUser != null)
			res = true;
		
		return res;
	}
};

var Search = {
	query : {
		init : function() {
			searchQuery = new SearchBuilder();
			searchQuery.setOptions(getOptions('search_refine_options'));
			var s = searchQuery.build();
			
			if(!isEmptyObject(s)) {			
				showSpinner();
				broadcast({
					attempt: Command.SEARCH,
					options: s
				});
			} else
				showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.EMPTY_SEARCH, false, null, null);
		},
		callback: function(searchResults) {
			removeSpinner();
		}
	},
	getSavedSearches : function() {
		if(currentUser.savedSearches != undefined && currentUser.savedSearches != null) {
			showPopup(Alert_STR.Search.SavedSearches.MAIN_TITLE, formatSavedSearchesForList());
		} else
			showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.NO_SAVED_SEARCHES, false, null, null);
	},
	loadSearch: function(id) {
		setOptions("search_refine_options", currentUser.savedSearches[id].parameters);
		currentUser.searchBasedOffOfExistingSearch = id;
		removePopup();
	},
	prompt: function() {
		if(currentUser.searchBasedOffOfExistingSearch == undefined || currentUser.searchBasedOffOfExistingSearch === null) {
			showAlert(Alert_STR.Search.Prompt.MAIN_TITLE, 
				Alert_STR.Search.Prompt.TEXT + '<input type="text" id="savedSearchAlias" />',
				true, null, 
				[
					{
						label: Alert_STR.Basic.OK,
						action: function() {
							Search.saveSearch.init();
						}
					},
					{
						label: Alert_STR.Basic.CANCEL,
						action: function() {
							removeAlert();
						}
					}
				]);
		} else {
			searchQuery = new SearchBuilder();
			searchQuery.setOptions(getOptions('search_refine_options'));
			Search.saveSearch.init(currentUser.savedSearches[currentUser.searchBasedOffOfExistingSearch].alias);
		}
	},
	saveSearch : {
		init : function(alias) {
			if(alias == undefined || alias == null)
				alias = $("#savedSearchAlias").val();
				
			showSpinner();
			broadcast({
				attempt: Command.SAVE_SEARCH,
				options: {
					alias: alias,
					parameters: searchQuery.build()
				}
			});
		},
		callback: function() {
		
		}
	}
}

var Media = {
	getAll : {
		init: function() {
			window.location = '#submissions/';
			showSpinner();
			broadcast({
				attempt: Command.VIEW_DERIVATIVES
			});	
		},
		callback: function(derivatives, target) {
			if(derivatives != null) {
				populateTable(formatSubmissionsForTable(derivatives), target);
				removeSpinner();
			} else {
				var opts = [
					{
						label: Alert_STR.Basic.OK,
						action: removeAlert()
					}
				];
				showAlert(Alert_STR.Submissions.MAIN_TITLE, Alert_STR.Submissions.NO_NEW_SUBMISSIONS, true, null, opts);
			}
		}
	},
	load : {
		init : function(id) {
			showSpinner();
			console.info("loading " + id);
			broadcast({
				attempt: Command.LOAD_MEDIA,
				options: {
					_id: id
				}
			});
		},
		callback: function(data) {
			removeSpinner();
			entity = new MediaEntity(data);
		}
	},
	annotate : {
		init: function(timeIn, timeOut, content) {
		
		},
		callback: function() {
		
		}
	},
	sendMessage : {
		init: function(content) {
		
		},
		callback: function() {
		
		}
	}
}

var Source = {
	view : function(id) {
		var source = null;
		
		return source;
	},
	addDetail : function(id, key, value) {
		var res = false;
		
		return res;
	}
}