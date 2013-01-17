function parseLiveUpdate(liveUpdateHolder) {
	switch(parseInt($(liveUpdateHolder).attr('liveupdate'))) {
		case Command.LOAD_CLIENTS:
			Admin.listClients.init();
			break;
	}
}

function getExchange(url, callback) {
	$.ajax({
		type:"GET",
		url:url,
		crossDomain:true,
		dataType:'json',
		success: function(data) {
			callback(data);
		}
	});
}

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

var Admin = {
	loadModules: {
		init: function() {
			showSpinner();
			broadcast({
				attempt: Command.LOAD_MODULES,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					}
				}
			});
		},
		callback: function(modules) {
			loadAdminModules(modules.availableModules);
		}
	},
	listClients: {
		init: function() {
			console.info("getting client list...");
			showSpinner();
			broadcast({
				attempt: Command.LOAD_CLIENTS
			});
		},
		callback: function(clientList) {
			console.info(clientList);
			$.each(formatClientListForTable(clientList.clientList), function() {
				$("#list_clients_holder").append(this);
			});
		}
	},
	downloadClientCredentials: {
		init: function(sourceId) {
			showSpinner();
			broadcast({
				attempt: Command.DOWNLOAD_CLIENT_CREDENTIALS,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					},
					sourceId: sourceId
				}
			});
		},
		callback: function(downloadData) {
			removeSpinner();

			var opts = [
				{
					label: Alert_STR.Basic.DOWNLOAD,
					action: function() {
						// init the iframe...
						importer_holder.empty();
						importer_holder.append($(document.createElement('iframe'))
							.prop('src', downloadData.containerURL + "?fileData=" + downloadData.fileData + "&sourceId=" + downloadData.sourceId)
							.load(function() {
								console.info("hello importer");
								removeAlert();
							})
						);
						showImporter();
					}
				},
				{
					label: Alert_STR.Basic.CANCEL,
					action: removeAlert
				}
			];
			showAlert(Alert_STR.Admin.ClientDownload.MAIN_TITLE, Alert_STR.Admin.ClientDownload.CLICK_TO_DOWNLOAD, true, null, opts);

		}
	},
	registerClient: {
		init: function(newClientHolder) {
			var newClient = gatherFormInput(newClientHolder);
			if(newClient == null)
				return;

			showSpinner();
			broadcast({
				attempt: Command.INIT_NEW_CLIENT,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					},
					newClient: newClient
				}
			});
		},
		callback: function(newClient) {
			// returns fingerprint, which is also the root dir
			console.info(newClient);
			removeSpinner();
			if(newClient.newClient != null && newClient.newClient != undefined) {
				doClear("#newClientName");
				doClear("#newClientEmail");
				doClear("#newClientKey");

				Admin.downloadClientCredentials.init(newClient.newClient);
			} else {
				showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.INIT_CLIENT_FAIL, false, null, null);
			}
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
						action: removeAlert
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
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					},
					_id: id
				}
			});
		},
		callback: function(data) {
			// get j3m, get representations
			var blob_cache = new Array;
			var expected = data.asset_requests.length;
			var completed = 0;
			var cb_timer = window.setInterval(function() {
				if(completed == expected) {
					window.clearInterval(cb_timer);
					entity.derivative.representation = blob_cache;
					placeMedia();
					
				}
			}, 10);
			
			$.each(data.asset_requests, function() {
				var url = this;
				getExchange(data.media_token + url, function() {
					var res = arguments[0]['res'];
					if(res.asset_type == "j3m")
						entity = new MediaEntity(res.j3m);
					else if(res.asset_type == "media") {
						var bb = new (
							window.BlobBuilder ||
							window.MozBlobBuilder || 
							window.WebKitBlobBuilder || 
							window.OBlobBuilder || 
							window.msBlobBuilder
						)();
						bb.append(res.asset);
						var blob = bb.getBlob(res.mimeType);
						blob_cache.push(window.URL.createObjectURL(blob));
					}
					
					completed++;
				});
				
			});
			
				
		}
	},
	annotate : {
		init: function(region) {
			showSpinner();
			broadcast({
				attempt: Command.ADD_ANNOTATION,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					},
					entity: {
						_id: entity._id,
						_rev: entity._rev,
						annotation: region
					}
				}
			});
		},
		callback: function(updatedMedia) {
			console.info(updatedMedia);
			entity._rev = updatedMedia.result._rev;
			entity.derivative.discussions = updatedMedia.result.discussions;
			entity.reloadAnnotation(updatedMedia.discussionId);
			multicast({
				attempt: Command.UPDATE_DERIVATIVES,
				entity: {
					_id: entity._id,
					_rev: entity._rev,
					discussions: entity.derivative.discussions
				}
			});
		}
	},
	editAnnotation: {
		init: function(discussionId, editType, region) {
			showSpinner();
			broadcast({
				attempt: Command.EDIT_ANNOTATION,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					},
					entity: {
						_id: entity._id,
						_rev: entity._rev,
						discussionId: discussionId,
						editType: editType,
						annotation: region
					}
				}
			});
		},
		callback: function(updatedMedia) {
			entity._rev = updatedMedia.result._rev;
			entity.derivative.discussions = updatedMedia.result.discussions;
			entity.reloadAnnotation(updatedMedia.discussionId);
			multicast({
				attempt: Command.UPDATE_DERIVATIVES,
				entity: {
					_id: entity._id,
					_rev: entity._rev,
					discussions: entity.derivative.discussions
				}
			});
		}
	},
	appendToAnnotation: {
		init: function(discussionId) {
			if($("#annotation_append_content").val() != "") {
				showSpinner();
				broadcast({
					attempt: Command.APPEND_TO_ANNOTATION,
					options: {
						user: {
							_id: currentUser._id,
							_rev: currentUser._rev
						},
						entity: {
							_id: entity._id,
							_rev: entity._rev,
							discussionId: discussionId,
							content: $("#annotation_append_content").val()
						}
					}
				});
				$("#annotation_append_content").val("");
			} else {
				showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.EMPTY_ANNOTATION, null, null, false);
			}
		},
		callback: function(updatedMedia) {
			entity._rev = updatedMedia.result._rev;
			entity.derivative.discussions = updatedMedia.result.discussions;
			entity.reloadAnnotation(updatedMedia.discussionId);
			multicast({
				attempt: Command.UPDATE_DERIVATIVES,
				entity: {
					_id: entity._id,
					_rev: entity._rev,
					discussions: entity.derivative.discussions
				}
			});
		}
	},
	sendMessage : {
		init: function() {
			if($("#messages_append_content").val() != "") {
				showSpinner();
				broadcast({
					attempt: Command.SEND_MESSAGE,
					options: {
						user: {
							_id: currentUser._id,
							_rev: currentUser._rev
						},
						entity: {
							_id: entity._id,
							_rev: entity._rev,
							messageContent: $("#messages_append_content").val()
						}
					}
				});
			} else {
				showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.EMPTY_MESSAGE_CONTENT, null, null, false);
			}
		},
		callback: function(updatedMedia) {
			entity._rev = updatedMedia.result._rev;
			entity.derivative.discussions = updatedMedia.result.discussions;
			entity.messages = updatedMedia.result.messages;
			entity.loadMessages(entity.messages);
			multicast({
				attempt: Command.UPDATE_DERIVATIVES,
				entity: {
					_id: entity._id,
					_rev: entity._rev,
					discussions: entity.derivative.discussions,
					messages: entity.messages
				}
			});
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
	},
	doImport: {
		init: function() {
			showSpinner();
			broadcast({
				attempt: Command.IMPORT_MEDIA,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					}
				}
			});
		},
		callback: function(newSubmission) {
			importer_holder.empty();
			importer_holder.append($(document.createElement('iframe'))
				.load(function() {
					removeSpinner();
					showImporter();
				})
				.prop('src', newSubmission.newSubmissionUrl + '?doImport=' + newSubmission.newSubmissionId + '&authToken=' + newSubmission.newSubmissionRev + '&uId=' + currentUser._id)
			);
		}
	},
	getAudioAnnotation: {
		init: function(annotation_path, annotation_id) {
			showSpinner();
			broadcast({
				attempt: Command.GET_AUDIO_ANNOTATION,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					},
					audioAnnotation: {
						annotation_path: "/" + annotation_path,
						annotation_id: annotation_id
					}
				}
			});
		},
		callback: function(data) {
			removeSpinner();
			console.info(data);
			appendBinaryData("#" + data.annotation_id, "data:audio/ogg;base64," + data.binary_data);
		}
	},
	getAvailableForms: {
		init: function() {
			showSpinner();
			broadcast({
				attempt: Command.GET_AVAILABLE_FORMS,
				options: {
					user: {
						_id: currentUser._id,
						_rev: currentUser._rev
					}
				}
			});
		},
		callback: function(data) {
			console.info(data);
			xform_manifests = data;
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

function buildObjectAsString(object) {
	var allProps = new Array;
	for(prop in object) {
		var s = "";
		s += ('"' + prop + '":');
		console.info(object[prop].constructor.toString());
		if(object[prop].constructor == Object) {
			s += buildObjectAsString(object[prop]);
		} else if(object[prop].constructor.toString().match(/String/i)) {
			s += '"' + object[prop] + '"';
		} else if(object[prop].constructor.toString().match(/Array/i)) {
			var sArray = new Array;
			for(a in option[prop]) {
				var aVal = option[prop][a];
				if(aVal.constructor.toString().match(/String/i))
					aVal = '"' + val + '"';
				else if(aVal.constructor == Object)
					aVal = buildObjectAsString(aVal);

				sArray.push(aVal);
			}
			s += "[" + sArray.join(",") + "]";
		} else {
			s += object[prop];
		}
		console.info(prop);
		allProps.push(s);
	}

	return '"{' + allProps.join(",") + '}"';
}