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
		var d = new Date();
		var now = d.getTime();
		d.setTime(now + (3600 * 1000)); // an hour
		document.cookie="username=" + username + ";expires=" + d.toUTCString();
		document.cookie="password=" + password + ";expires=" + d.toUTCString();
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
		var d = new Date();
		var now = d.getTime();
		d.setTime(now - (3600 * 1000)); // an hour ago
		document.cookie="username=;expires=" + d.toUTCString();
		document.cookie="password=;expires=" + d.toUTCString();
		
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
		clearUi();
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
		else {
			var i, c = document.cookie.split("; ");
			
			var username = "";
			var	password = "";
			
			if(c.length > 0) {
				for(i=0;i<c.length;i++) {
					var cName = c[i].substr(0,c[i].indexOf("="));
					var cVal = c[i].substr(c[i].indexOf("=") + 1);
					
					if(cName == "username")
						username = cVal;
					
					if(cName == "password")
						password = cVal;	
				}
				
				
				if(username != "" && password != "") {
					User.login(username, password);
					
					if(currentUser != null)
						res = true;
				}
			}
		}

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
			$("#search_results").empty();
			$("#search_results").append(formatSearchResultsForList(searchResults));
			$("#search_results_holder").css('visibility','visible');
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
		Search.clear();
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
					parameters: searchQuery.build(),
					_id: currentUser._id,
					_rev: currentUser._rev
				}
			});
		},
		callback: function(savedSearchResult) {
			removeAlert();
			currentUser.savedSearches = savedSearchResult.savedSearches;
			currentUser._rev = savedSearchResult._rev;
			showAlert(Alert_STR.Search.SavedSearches.MAIN_TITLE, Alert_STR.Basic.OK, false, null, null);
		}
	},
	clear: function() {
		if(searchQuery != undefined && searchQuery != null)
			delete searchQuery;
		if(currentUser.searchBasedOffOfExistingSearch != undefined)
			delete currentUser.searchBasedOffOfExistingSearch;

		clearOptions('search_refine_options');
		$("#search_results").empty();
		$("#search_results_holder").css('visibility','hidden');
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
	},
	rename: {
		prompt: function() {
			showAlert(Alert_STR.Media.Prompt.MAIN_TITLE, 
				Alert_STR.Media.Prompt.TEXT + '<input type="text" id="mediaAlias" />',
				true, null, 
				[
					{
						label: Alert_STR.Basic.OK,
						action: function() {
							Media.rename.init();
						}
					},
					{
						label: Alert_STR.Basic.CANCEL,
						action: function() {
							removeAlert();
						}
					}
				]);
		},
		init : function() {				
			showSpinner();
			alert($("#mediaAlias").val());
			broadcast({
				attempt: Command.RENAME_MEDIA,
				options: {
					alias: $("#mediaAlias").val(),
					_id: entity._id,
					_rev: entity._rev
				}
			});
		},
		callback: function(data) {
			if(data.result == true) {
				$("#media_title").html(data.newAlias);
				entity.title = newAlias;
			} else
				showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.RENAME_FAIL, false, null, null);
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