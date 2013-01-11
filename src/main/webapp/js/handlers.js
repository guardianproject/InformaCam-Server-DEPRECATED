function handleMulticast(data) {
	console.info(data);
	if(data.attempt) {
		switch(data.attempt) {
			case Command.UPDATE_DERIVATIVES:
				var entityId = data.entity._id;
				if(entity._id == entityId) {
					entity.refresh(
						data.entity._rev,
						data.entity.discussions,
						data.entity.messages
					);
				}
				break;
		}
	}
}

function handleDesktopServiceMessage(data) {
	if(data.command) {
		switch(data.command) {
			case Command.VIEW_DERIVATIVES:
				Media.getAll.callback(data.metadata, $("#submissions_holder"));
				break;
			case Command.CHOOSE_MEDIA:
				if(data.metadata != null) {
					removeSpinner();
					showPopup(
						Submissions.CHOOSER_TITLE,
						formatSubmissionMini(data.metadata)
					);
				} else {
					var opts = [
						{
							label: Alert_STR.Basic.OK,
							action: removeAlert()
						}
					];
					showAlert(Alert_STR.Submissions.MAIN_TITLE, Alert_STR.Submissions.NO_NEW_SUBMISSIONS, true, null, opts);
				}
				break;
			case Command.LOAD_MEDIA:
				if(data.metadata != null) {
					if(!isEmptyObject(data.metadata)) {
						Media.load.callback(data.metadata);
						placeMedia();
					}
				} else {
					console.info("MEDIA IS NULL");
					var opts = [
						{
							label: Alert_STR.Basic.YES,
							action: media.displayOnScreen()
						},
						{
							label: Alert_STR.Basic.No,
							action: removeAlert()
						}
					];
					showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.NO_METADATA, true, null, opts);
				}

				break;
			case Command.SEARCH:
				if(data.metadata != null) {
					Search.query.callback(data.metadata);
				}
				break;
			case Command.ATTEMPT_LOGIN:
				removeSpinner();

				if(data.metadata != null) {
					User.loadSession(data.metadata);
					ic.refresh();
				}
				else {
					currentUser = null;
					showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.LOGIN_FAILURE, false, null, null);
				}
				break;
			case Command.LOGOUT:
				removeSpinner();
				User.unloadSession();
				window.location = '#submissions/';
				break;
			case Command.RENAME_MEDIA:
				removeSpinner();
				if(data.metadata != null)
					Media.rename.callback(data.metadata);
				break;
			case Command.SAVE_SEARCH:
				removeSpinner();
				if(data.metadata != null) {
					console.info(data.metadata);
					Search.saveSearch.callback(data.metadata);

				}
				break;
			case Command.APPEND_TO_ANNOTATION:
				removeSpinner();
				if(data.metadata != null)
					Media.appendToAnnotation.callback(data.metadata);
				break;
			case Command.SEND_MESSAGE:
				removeSpinner();
				if(data.metadata != null)
					Media.sendMessage.callback(data.metadata);
				break;
			case Command.ADD_ANNOTATION:
				removeSpinner();
				if(data.metadata != null)
					Media.addAnnotation.callback(data.metadata);
				break;
			case Command.EDIT_ANNOTATION:
				removeSpinner();
				movingAnnotation = null;
				if(data.metadata != null)
					Media.editAnnotation.callback(data.metadata);
				break;
			case Command.IMPORT_MEDIA:
				if(data.metadata != null)
					Media.doImport.callback(data.metadata);
				break;
			case Command.LOAD_MODULES:
				if(data.metadata != null)
					Admin.loadModules.callback(data.metadata);
				else
					removeSpinner();
				break;
			case Command.LOAD_CLIENTS:
				removeSpinner();
				if(data.metadata != null)
					Admin.listClients.callback(data.metadata);
				break;
			case Command.INIT_NEW_CLIENT:
				if(data.metadata != null) {
					console.info("CLIENT INITED>>");
					Admin.registerClient.callback(data.metadata);
				}
				break;
			case Command.DOWNLOAD_CLIENT_CREDENTIALS:
				if(data.metadata != null && data.metadata.result == 1)
					Admin.downloadClientCredentials.callback(data.metadata);
				else {
					removeSpinner();
					showAlert(Alert_STR.Errors.MAIN_TITLE, Alert_STR.Errors.EXPORT_ICTD_FAIL, false, null, null);
				}
				break;
		}
	}
}

function broadcast(obj) {
	cometd.publish(dc, obj);
}

function multicast(obj) {
	cometd.publish(mcast, obj);
}

function isEmptyObject(obj) {
	return Object.keys(obj).length === 0;
}